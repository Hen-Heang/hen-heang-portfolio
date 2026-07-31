-- Schema for the "approved AI knowledge" pipeline: ingested sources (e.g. GitHub
-- repos/articles) get chunked, chunks and derived profile facts go through an
-- owner approval step, and only approved + public rows are ever readable by
-- anonymous visitors. Also adds tables for assistant feedback persistence and
-- sync-run auditing. Purely additive — no existing table/column/policy is
-- touched. Not applied here; review and apply manually (see the verification
-- script alongside this migration).
--
-- Security review of public.portfolio_is_owner() before reuse (unchanged,
-- defined in 20260706010944_portfolio_schema_owner_rls.sql, hardened in
-- 20260706011401_portfolio_advisor_fixes.sql):
--   - `security invoker`, not `security definer` — runs with the caller's
--     privileges, no privilege escalation.
--   - `set search_path = ''` — immune to search_path hijacking; its only
--     reference (`auth.jwt()`) is already schema-qualified.
--   - Compares the JWT's top-level `email` claim, which Supabase Auth (GoTrue)
--     sets from `auth.users.email` at token issuance and only updates after a
--     confirmed email-change flow. This is distinct from `user_metadata` /
--     `app_metadata`, which a signed-in user CAN edit via the client SDK —
--     this function deliberately does not read either of those.
--   - Unauthenticated callers get `auth.jwt()` = null -> coalesced to '' ->
--     never equals the owner email -> safe default-deny.
--   Conclusion: safe to reuse as-is. No changes made to it in this migration.
--
-- No RPC/SECURITY DEFINER functions are created here, so there is no path
-- that could expose owner-only rows through a function that runs with
-- elevated privileges — every table below is gated by RLS policies only.

-- Vector column support for future embedding-based retrieval (retrieval.ts
-- already documents its keyword retriever as swappable for vector search
-- without an API/UI change — this is that seam). 1536 dims matches OpenAI's
-- text-embedding-3-small. Installed into `extensions` per Supabase convention;
-- safe/additive on any Supabase-hosted Postgres. No ANN index is created here
-- — building one before real embeddings exist isn't useful and premature
-- index parameters tend to need re-tuning once there's real data.
create extension if not exists vector with schema extensions;

-- =====================================================================
-- 1. portfolio_ai_sources — things the knowledge pipeline ingests from
--    (a GitHub repo, an article, a manually-entered document, ...).
-- =====================================================================
create table if not exists public.portfolio_ai_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('github_repo', 'article', 'manual', 'site_page')),
  repository_name text,
  title text not null,
  source_url text not null,
  -- 'owner' = only the portfolio owner can see it (e.g. still under review);
  -- 'public' = eligible for visitor-facing retrieval once also approved.
  visibility text not null default 'owner' check (visibility in ('public', 'owner')),
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  -- Git commit SHA, article revision id, or similar — lets a re-sync detect "nothing changed".
  source_revision text,
  metadata jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Upsert key for re-syncing the same source instead of duplicating it.
  unique (source_type, source_url)
);

comment on table public.portfolio_ai_sources is
  'Ingestible sources (repos, articles, manual docs) for the AI knowledge pipeline. Public read requires visibility=public AND approval_status=approved.';

-- =====================================================================
-- 2. portfolio_ai_chunks — retrievable units of content derived from a source.
-- =====================================================================
create table if not exists public.portfolio_ai_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.portfolio_ai_sources(id) on delete cascade,
  -- Stable identifier the sync pipeline computes deterministically (e.g. a
  -- hash of repo+path+section) so re-syncing upserts instead of duplicating.
  chunk_key text not null,
  title text,
  content text not null,
  repository_name text,
  file_path text,
  -- Deep link to this specific chunk (e.g. a GitHub blob URL with line
  -- anchors) — distinct from portfolio_ai_sources.source_url, which points
  -- at the source root.
  source_url text,
  content_hash text not null check (char_length(content_hash) > 0),
  visibility text not null default 'owner' check (visibility in ('public', 'owner')),
  approved boolean not null default false,
  -- Set false by the sync pipeline when a previously-synced chunk no longer
  -- appears in the source, instead of hard-deleting it (see
  -- portfolio_ai_sync_runs.deactivated_count).
  is_active boolean not null default true,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, chunk_key)
);

comment on table public.portfolio_ai_chunks is
  'Retrievable content chunks derived from a portfolio_ai_sources row. Public read requires visibility=public AND approved=true AND is_active=true.';

create index if not exists idx_ai_chunks_source_id on public.portfolio_ai_chunks (source_id);

-- =====================================================================
-- 3. portfolio_ai_profile_facts — discrete, owner-approved facts about
--    Heang, optionally traceable back to a source.
-- =====================================================================
create table if not exists public.portfolio_ai_profile_facts (
  id uuid primary key default gen_random_uuid(),
  -- Mirrors data/knowledge/types.ts's KnowledgeCategory union so these facts
  -- can eventually feed the same retrieval categories the static/live
  -- knowledge base already uses.
  category text not null check (category in (
    'profile', 'positioning', 'experience', 'career', 'projects',
    'skills', 'ai-engineering', 'articles', 'contact', 'faq'
  )),
  fact_text text not null,
  supporting_source_id uuid references public.portfolio_ai_sources(id) on delete set null,
  visibility text not null default 'owner' check (visibility in ('public', 'owner')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, fact_text),
  check (valid_from is null or valid_until is null or valid_until >= valid_from)
);

comment on table public.portfolio_ai_profile_facts is
  'Owner-curated facts, optionally sourced from portfolio_ai_sources. Public read requires visibility=public AND status=approved AND (unexpired).';

-- =====================================================================
-- 4. portfolio_ai_feedback — persisted "was this helpful?" signal from the
--    chat widget (app/api/assistant-feedback/route.ts currently only logs
--    this; this table is where that route could persist it instead/also).
-- =====================================================================
create table if not exists public.portfolio_ai_feedback (
  id uuid primary key default gen_random_uuid(),
  -- Correlates a vote back to the chat turn it was given on (client- or
  -- server-generated per request; not enforced unique — a request could
  -- reasonably receive an initial vote and a later correction).
  request_id text not null,
  page_context text not null check (page_context in ('home', 'projects-index', 'project-detail', 'resume', 'articles', 'other')),
  vote text not null check (vote in ('up', 'down')),
  correction text check (correction is null or char_length(correction) <= 2000),
  evaluation_status text not null default 'pending' check (evaluation_status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  -- Matches hashClientKey() in app/api/chat/route.ts: sha256, hex, sliced to 24 chars. Never a raw IP or identifier.
  client_hash text not null check (client_hash ~ '^[0-9a-f]{24}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.portfolio_ai_feedback is
  'Privacy-safe assistant feedback (vote + optional correction, never message text). Public can insert only; only the owner can read/review.';

create index if not exists idx_ai_feedback_request_id on public.portfolio_ai_feedback (request_id);

-- =====================================================================
-- 5. portfolio_ai_sync_runs — audit log for a source ingestion/sync pass.
--    Internal operational data — never publicly readable.
-- =====================================================================
create table if not exists public.portfolio_ai_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.portfolio_ai_sources(id) on delete cascade,
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed', 'partial')),
  processed_count integer not null default 0 check (processed_count >= 0),
  inserted_count integer not null default 0 check (inserted_count >= 0),
  updated_count integer not null default 0 check (updated_count >= 0),
  deactivated_count integer not null default 0 check (deactivated_count >= 0),
  -- Deliberately a short, sanitized summary — the ingestion pipeline must
  -- never write raw stack traces, tokens, or file contents here. The length
  -- cap is defense-in-depth, not a substitute for sanitizing at the call site.
  error_summary text check (error_summary is null or char_length(error_summary) <= 2000),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  check (finished_at is null or finished_at >= started_at)
);

comment on table public.portfolio_ai_sync_runs is
  'Audit log for portfolio_ai_sources ingestion runs. Owner-only — never publicly readable, may reference internal repo/path details.';

create index if not exists idx_ai_sync_runs_source_id on public.portfolio_ai_sync_runs (source_id);

-- =====================================================================
-- RLS — enabled on every table; default-deny, narrow public-read grants,
-- owner-only writes via public.portfolio_is_owner(). No unrestricted write
-- policy is created anywhere below.
-- =====================================================================
alter table public.portfolio_ai_sources enable row level security;
alter table public.portfolio_ai_chunks enable row level security;
alter table public.portfolio_ai_profile_facts enable row level security;
alter table public.portfolio_ai_feedback enable row level security;
alter table public.portfolio_ai_sync_runs enable row level security;

-- --- sources: public read only when approved+public; all writes owner-only ---
create policy "public read approved sources" on public.portfolio_ai_sources
  for select using (visibility = 'public' and approval_status = 'approved');
create policy "owner all sources" on public.portfolio_ai_sources
  for all to authenticated using (public.portfolio_is_owner()) with check (public.portfolio_is_owner());

-- --- chunks: public read only when approved+public+active; all writes owner-only ---
create policy "public read approved chunks" on public.portfolio_ai_chunks
  for select using (visibility = 'public' and approved = true and is_active = true);
create policy "owner all chunks" on public.portfolio_ai_chunks
  for all to authenticated using (public.portfolio_is_owner()) with check (public.portfolio_is_owner());

-- --- profile facts: public read only when approved+public+currently valid; all writes owner-only ---
create policy "public read approved facts" on public.portfolio_ai_profile_facts
  for select using (
    visibility = 'public' and status = 'approved'
    and (valid_from is null or valid_from <= now())
    and (valid_until is null or valid_until >= now())
  );
create policy "owner all facts" on public.portfolio_ai_profile_facts
  for all to authenticated using (public.portfolio_is_owner()) with check (public.portfolio_is_owner());

-- --- feedback: anyone may insert (visitor-submitted), tightly scoped by a
-- policy-level check in addition to the column CHECKs, so a client can never
-- pre-mark its own feedback as reviewed/actioned. Only the owner may read,
-- update (e.g. triage), or delete. No one gets a public SELECT — feedback
-- rows are never "approved for public reading" in the way content is.
create policy "public insert feedback" on public.portfolio_ai_feedback
  for insert
  with check (
    vote in ('up', 'down')
    and evaluation_status = 'pending'
    and client_hash ~ '^[0-9a-f]{24}$'
  );
create policy "owner read feedback" on public.portfolio_ai_feedback
  for select to authenticated using (public.portfolio_is_owner());
create policy "owner update feedback" on public.portfolio_ai_feedback
  for update to authenticated using (public.portfolio_is_owner()) with check (public.portfolio_is_owner());
create policy "owner delete feedback" on public.portfolio_ai_feedback
  for delete to authenticated using (public.portfolio_is_owner());

-- --- sync runs: owner-only for every operation, no public policy at all
-- (internal pipeline audit data, not "AI knowledge" content) ---
create policy "owner all sync runs" on public.portfolio_ai_sync_runs
  for all to authenticated using (public.portfolio_is_owner()) with check (public.portfolio_is_owner());
