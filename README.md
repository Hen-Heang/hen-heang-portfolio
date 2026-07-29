<div align="center">

# Hen Heang — Developer Portfolio

**Backend Developer · Java & Spring Boot · Seoul, South Korea 🇰🇷**

Building the systems behind the screen: REST APIs, transaction flows, security boundaries, and data models with Java, Spring Boot, MyBatis, and PostgreSQL/Oracle.

[**🌐 Live Site**](https://henheang.site) · [**📄 Resume**](https://henheang.site/resume) · [**💼 LinkedIn**](https://www.linkedin.com/in/hen-heang) · [**💬 Telegram**](https://t.me/henheang)

![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)

</div>

---

## 👋 About Me

I'm a backend developer with 2+ years of experience in the Korean enterprise sector — currently at **Bizplay** in Seoul, previously at **KOSIGN**, where I built B2B FinTech platforms for billing, payments, and inventory. My day-to-day stack is Java, Spring Boot, MyBatis, and PostgreSQL/Oracle; I extend API contracts into Next.js and TypeScript clients when a product needs it.

- 🌏 Cambodia → Korea: trained at the Korea Software HRD Center, now working in Korean-language enterprise teams
- 🗣️ Khmer (native) · English (professional) · Korean (intermediate)
- 📫 Reach me at **henheang15@gmail.com**

## ✨ What's in This Portfolio

This site is not just a project list — each major project is a full **engineering case study**:

- **Business problem → solution** narrative for every project
- **Architecture flow** (e.g. Next.js → Spring Boot → MyBatis → PostgreSQL) rendered per project
- **Database design** — core tables and data models
- **API showcase** — real endpoint examples with methods and descriptions
- **Challenges & solutions** and **lessons learned** for each build
- **Backend Engineering Lab** — a validated 13-level Java/Spring curriculum with 14 published deep dives and 26 planned topics
- Interactive CV page with print-perfect **PDF download**
- Dark/light theme, per-page SEO metadata, dynamic Open Graph images, sitemap and robots
- Contact form backed by Supabase (server actions, no exposed write API)

## 🚀 Featured Projects

| Project | What it is | Stack |
|---------|-----------|-------|
| [**H-Phsar**](https://henheang.site/projects/h-phsar) ⭐ | B2B marketplace API — distributor/retailer stores, order state machine, OTP auth, real-time notifications | Spring Boot 3, MyBatis, PostgreSQL, WebSocket |
| [**AuthHub**](https://henheang.site/projects/authhub) | Reusable authentication service with JWT revocation, MFA, RBAC, audit logging, rate limiting, and PostgreSQL-backed security state | Spring Boot 3.5, Java 17, Spring Security, Flyway |
| [**We Commerce**](https://henheang.site/projects/we-commerce) | Full-stack multi-vendor marketplace — DB-tracked JWT auth, cart/checkout with simulated ABA Pay & KHQR | Spring Boot 3, Java 21, Next.js, TanStack Query |
| [**Hengo**](https://henheang.site/projects/hengo) ⭐ | AI companion for daily growth — goals, daily missions, and Korean learning with an AI coach and spaced repetition | Next.js, TypeScript, TanStack Query, Spring Boot |

## 🛠️ Tech Stack

**This site:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS · Framer Motion · Supabase · Vercel Analytics & Speed Insights

**What I work with professionally:** Java · Spring Boot · Spring Security · MyBatis · PostgreSQL · Oracle · Redis · eGovFramework · Next.js · TypeScript

## 📁 Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── about/            # About page (experience, education, skills)
│   ├── projects/         # Project list + [slug] case-study pages
│   ├── contact/          # Contact form (Supabase server actions)
│   ├── cv/               # Interactive CV with PDF download
│   ├── lab/backend/      # Backend hub, roadmap, and published [slug] pages
│   ├── sitemap.ts        # Generated sitemap
│   └── opengraph-image.tsx
├── data/                 # Single source of truth for all content
│   ├── profile.ts        # Personal info, links, languages
│   ├── projects.ts       # Project case studies (architecture, APIs, ERD)
│   ├── experience.ts     # Work history
│   ├── lab/backend/      # Static validated catalog, roadmap, sources, and articles
│   └── cv-data.ts        # CV content
├── src/
│   ├── components/       # UI components (sections, dashboard, cv, ui)
│   └── lib/              # Types, Supabase clients, utilities
└── public/               # Images, project previews, CV PDF
```

Most content lives in `data/` — updating the portfolio means editing typed data files, not JSX. Backend Engineering content in `data/lab/backend/**` is parsed with Zod at module load/build time, so malformed metadata, content blocks, roadmap levels, or source records fail validation before deployment.

### Backend Engineering Lab

- [`/lab/backend`](https://henheang.site/lab/backend) is the searchable curriculum and content library.
- [`/lab/backend/roadmap`](https://henheang.site/lab/backend/roadmap) shows all 13 levels, including future topics.
- Published topics generate static detail routes; planned topics retain useful roadmap/search metadata but deliberately do not generate empty pages.
- Progress is stored only in the visitor's browser under `localStorage`; it is not an account or server record.
- The entire backend catalog is static and works without Supabase or production credentials.

See [`data/lab/backend/README.md`](data/lab/backend/README.md) for the content-authoring and promotion workflow.

## 🏁 Getting Started

```bash
# Clone and install
git clone https://github.com/Hen-Heang/hen-heang-porfolio.git
cd hen-heang-porfolio
npm install

# Run the dev server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and fill in what you need — see that file for the full list. None are required to run the site:

- **Supabase** (`NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) — optional. Profile/dashboard/CV/projects/skills/experience/education/achievements are all served from Supabase when configured, and automatically fall back to the typed data in `data/*.ts` when it's absent or a query fails — the public site never renders empty because of a Supabase outage. The contact form specifically needs the service-role key to accept submissions.
- **`OPENAI_API_KEY`** — optional. Without it the AI assistant returns a graceful "not configured" message.
- **`OPENAI_MODEL`** / **`OPENAI_DEEP_MODEL`** / **`OPENAI_FALLBACK_MODEL`** — optional, all have built-in defaults. `src/lib/ai/models.ts` deterministically routes each question to the default model (ordinary Q&A) or the deep model (comparisons, role-fit judgment, architecture trade-offs); the fallback model is only used when a visitor explicitly retries a failed answer.
- **`UPSTASH_REDIS_REST_URL`** / `_TOKEN` — optional. Rate limiting (AI chat + contact form) uses Upstash Redis when configured, which is required for correctness across Vercel's multiple serverless instances; without it, both fall back to an in-memory limiter that's fine for local dev only.
- **`RUN_LIVE_EVALS`** — optional, dev-only. Set to `1` (with a real `OPENAI_API_KEY`) to run the live-model portion of the assistant eval suite (`src/lib/ai/evals/live-model.test.ts`), which makes real, billed OpenAI API calls. Left unset, normal `pnpm test` runs skip it entirely.

### Content workflow

Public content (profile, dashboard, CV, projects, skills, experience, education, achievements, contact messages) is editable at `/admin` by the owner account (gated by Supabase RLS + an email check). Admin-entered JSON is validated against the same Zod schemas (`src/lib/schemas/content.ts`) the public site uses before it's saved, so malformed content can't reach — or break — the live pages. Editing the static files in `data/*.ts` changes only the fallback shown when Supabase is unavailable.

### AI portfolio assistant

The chat widget (`src/components/assistant/`) is a retrieval-grounded assistant, not a general chatbot: `app/api/chat/route.ts` retrieves the most relevant sections from `data/knowledge/*` (backed by the same Supabase-or-static content the rest of the site renders, via `src/lib/ai/live-knowledge.ts`) and answers only from that context, per the rules in `src/lib/ai/system-prompt.ts`. Retrieval (`src/lib/ai/retrieval.ts`) is Unicode-aware and alias-expanded (`src/lib/ai/aliases.ts`) so English, Korean, and Khmer questions all retrieve the right sections. See `src/lib/ai/evals/portfolio-questions.ts` for the assistant's eval dataset.

### Testing

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run test        # Vitest unit tests
npm run test:watch  # Vitest in watch mode
npm run test:e2e    # Playwright E2E tests (starts/reuses the local Next.js server)
```

Install the local E2E browser once with `npx playwright install chromium`. Linux/CI environments can use `npx playwright install --with-deps chromium`. CI (`.github/workflows/ci.yml`) runs lint, typecheck, test, and build first, then runs Playwright in a separate dependent job on every push/PR to `master`.

### Theme

Dark and light themes are both fully supported (`next-themes`), defaulting to dark. Toggle from the header (desktop) or the mobile dock.

## ☁️ Deployment

Deployed on [Vercel](https://vercel.com) with automatic deployments from `master`. Push to deploy:

```bash
npm run build   # verify the production build locally
git push
```

## 📬 Contact

- **Email:** [henheang15@gmail.com](mailto:henheang15@gmail.com)
- **LinkedIn:** [linkedin.com/in/hen-heang](https://www.linkedin.com/in/hen-heang)
- **GitHub:** [github.com/Hen-Heang](https://github.com/Hen-Heang)
- **Telegram:** [t.me/henheang](https://t.me/henheang)

---

<div align="center">
Open to Java / Spring Boot backend opportunities · Based in Seoul 🇰🇷
</div>

<!--
Note: the GitHub repository is currently named `hen-heang-porfolio` (typo).
Recommended rename: `hen-heang-portfolio`. Renaming on GitHub automatically
sets up a redirect from the old name, but any hardcoded references to
`hen-heang-porfolio` in CI badges, deployment configs, or external links
should be updated afterward.
-->
