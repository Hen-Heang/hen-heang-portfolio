import "server-only"

import { getProjects, getExperience, getEducation, getSkills, getSiteContent } from "@/src/lib/db/portfolio"
import { getAICategories, getAIArticles, getAIPrompts, getAISnippets } from "@/src/lib/db/ai-engineering"
import { getApprovedProfileFacts } from "@/src/lib/db/ai-knowledge"
import { projects as staticProjects } from "@/data/projects"
import { experiences as staticExperiences } from "@/data/experience"
import { education as staticEducation } from "@/data/education"
import { skills as staticSkills } from "@/data/skills"
import { buildKnowledgeBase, knowledgeBase, type KnowledgeSection } from "@/data/knowledge"
import type { Project } from "@/src/lib/types"

/**
 * Live knowledge base for the AI assistant.
 *
 * The portfolio's visible content lives in Supabase (portfolio_* tables,
 * edited through the admin panel) with the data/*.ts files as fallback — the
 * assistant must answer from the same source visitors see, or it will
 * contradict the site whenever content is edited. This module rebuilds the
 * knowledge sections from Supabase, merged with the static files, and caches
 * the result briefly.
 *
 * Merge rules per category:
 * - Profile: `getSiteContent("profile")` already falls back to data/profile.ts
 *   internally (see src/lib/db/portfolio.ts), so it's passed straight through
 *   — this is the same source the /about page renders from.
 * - Projects: DB rows win field-by-field, but static-only case-study fields
 *   (businessProblem, architecture, apiEndpoints, lessonsLearned, …) are kept
 *   for projects that exist in both — the DB only stores a subset. DB-only
 *   projects appear with whatever fields they have.
 * - Experience / education / skills: DB replaces static when non-empty.
 * - AI Engineering categories / articles / prompts / snippets: admin-authored
 *   directly in Supabase with no static source at all — passed straight
 *   through so the assistant matches the live /ai-engineering pages exactly
 *   instead of a fixed narrative summary. Each getter already resolves to
 *   `[]` on any Supabase error, so an AI-content outage just omits those
 *   sections rather than breaking the rest of the knowledge base.
 * - Owner-approved correction facts: getApprovedProfileFacts() queries with
 *   the public anon client, so RLS already restricts it to approved+public
 *   rows before this module ever sees them — see src/lib/db/ai-knowledge.ts.
 * - Any empty result or thrown error falls back to the static knowledge base,
 *   so the assistant keeps working if Supabase is down.
 */
const CACHE_TTL_MS = 5 * 60_000

let cached: { sections: KnowledgeSection[]; expiresAt: number } | null = null

const isMissing = (value: unknown): boolean =>
    value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)

function mergeProjects(dbProjects: Project[]): Project[] {
    if (dbProjects.length === 0) return staticProjects
    const staticBySlug = new Map(staticProjects.map((p) => [p.slug, p]))
    return dbProjects.map((dbProject) => {
        const staticProject = staticBySlug.get(dbProject.slug)
        if (!staticProject) return dbProject
        const merged: Record<string, unknown> = { ...staticProject }
        for (const [key, value] of Object.entries(dbProject)) {
            if (!isMissing(value)) merged[key] = value
        }
        return merged as unknown as Project
    })
}

export async function getLiveKnowledgeBase(): Promise<KnowledgeSection[]> {
    if (cached && Date.now() < cached.expiresAt) return cached.sections

    try {
        // Each getter already returns [] (or the static fallback) on any Supabase error.
        const [profile, projects, experiences, education, skills, aiCategories, aiArticles, aiPrompts, aiSnippets, correctionFacts] =
            await Promise.all([
                getSiteContent("profile"),
                getProjects(),
                getExperience(),
                getEducation(),
                getSkills(),
                getAICategories(),
                getAIArticles(),
                getAIPrompts(),
                getAISnippets(),
                getApprovedProfileFacts(),
            ])

        const sections = buildKnowledgeBase({
            profile,
            projects: mergeProjects(projects),
            experiences: experiences.length > 0 ? experiences : staticExperiences,
            education: education.length > 0 ? education : staticEducation,
            skills: skills.length > 0 ? skills : staticSkills,
            aiContent: {
                categories: aiCategories,
                articles: aiArticles,
                prompts: aiPrompts,
                snippets: aiSnippets,
            },
            correctionFacts,
        })

        cached = { sections, expiresAt: Date.now() + CACHE_TTL_MS }
        return sections
    } catch {
        // Unexpected failure — answer from the static knowledge base and let
        // the next request retry Supabase.
        return knowledgeBase
    }
}
