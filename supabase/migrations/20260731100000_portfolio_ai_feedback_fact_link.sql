-- Traces an approved profile fact back to the visitor feedback correction it
-- was promoted from (when applicable — owner-authored facts and ingested
-- facts have no feedback row and simply leave this null). Additive only, no
-- existing column/policy/data touched. No RLS change needed: the existing
-- row-level policies on portfolio_ai_profile_facts already cover every
-- column, including this one.
alter table public.portfolio_ai_profile_facts
  add column if not exists source_feedback_id uuid references public.portfolio_ai_feedback(id) on delete set null;

create index if not exists idx_ai_profile_facts_source_feedback_id
  on public.portfolio_ai_profile_facts (source_feedback_id);
