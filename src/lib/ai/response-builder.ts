import "server-only"

import {
    portfolioAssistantMetaSchema,
    EMPTY_PORTFOLIO_META,
    MAX_EVIDENCE_ITEMS,
    MAX_SKILL_CHIPS,
    MAX_SUGGESTED_QUESTIONS,
    type EvidenceItem,
    type EvidenceLevel,
    type PortfolioAssistantMeta,
    type SkillChip,
    type SkillStatus,
} from "./response-schema"

/**
 * Assembles the structured evidence/skills/suggestedQuestions payload from
 * this turn's tool-call results — never from the model's own text.
 *
 * ## Why this isn't model-generated structured output
 *
 * The AI SDK (`ai@7`) supports true schema-constrained generation via
 * `streamText({ output: Output.object({ schema }) })`, streamed through
 * `result.partialOutputStream`. It was deliberately not used here:
 *
 * - `Output.object` puts the *entire* response on the model's text channel —
 *   the streamed text becomes raw JSON, not the Markdown answer visitors
 *   read. Showing that live would mean either flashing raw `{"answer":"…`
 *   at the visitor, or buffering and re-parsing partial JSON on every delta
 *   to extract just the `answer` field — the "fragile partial JSON parser"
 *   this project explicitly avoids.
 * - It would let the model choose evidence `href`s and skill names from
 *   scratch, with only schema shape (not portfolio truth) enforced. Nothing
 *   would stop it from inventing a plausible-looking `/projects/foo-bar`
 *   slug under load. Building the payload mechanically from actual tool
 *   outputs makes that structurally impossible instead of relying on prompt
 *   discipline.
 *
 * Building it here instead costs nothing extra: the tool results this reads
 * already exist (the model already called them to ground its answer), so
 * there's no added latency, no added token cost, and no second model call.
 * The trade-off is that evidence/skills/suggestions aren't generated with
 * the model's own judgment about phrasing — they're a direct, typed
 * projection of whichever tools it chose to call, ranked by evidence
 * strength. `searchProjects`/`searchEngineeringLab` already return
 * relevance-ranked results, so "which tool, with what query" is still the
 * model's call — this only decides how to surface what came back.
 */

// --- Narrow shapes for each tool's actual output (see src/lib/ai/tools/*.ts) ---

interface ToolProjectSummary {
    slug: string
    title: string
    description: string
    ownership?: string | null
}

interface ToolExperienceItem {
    role: string
    company: string
    summary: string
}

interface ToolSkill {
    name: string
    status: SkillStatus
}

interface ToolLabResult {
    slug: string
    title: string
    summary: string
    category: "backend" | "devops" | "ai"
    type: string
}

export interface ToolCallRecord {
    toolName: string
    output: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function asProjectSummaries(output: unknown): ToolProjectSummary[] {
    if (!isRecord(output) || !Array.isArray(output.projects)) return []
    return output.projects.filter(
        (p): p is ToolProjectSummary => isRecord(p) && typeof p.slug === "string" && typeof p.title === "string" && typeof p.description === "string",
    )
}

function asSingleProject(output: unknown): ToolProjectSummary | undefined {
    if (!isRecord(output) || typeof output.slug !== "string" || typeof output.title !== "string" || typeof output.description !== "string") return undefined
    return { slug: output.slug, title: output.title, description: output.description, ownership: typeof output.ownership === "string" ? output.ownership : null }
}

function asExperienceItems(output: unknown): ToolExperienceItem[] {
    if (!isRecord(output) || !Array.isArray(output.experience)) return []
    return output.experience.filter(
        (e): e is ToolExperienceItem => isRecord(e) && typeof e.role === "string" && typeof e.company === "string" && typeof e.summary === "string",
    )
}

function asSkills(output: unknown): ToolSkill[] {
    if (!isRecord(output) || !Array.isArray(output.skills)) return []
    return output.skills.filter(
        (s): s is ToolSkill => isRecord(s) && typeof s.name === "string" && (s.status === "primary" || s.status === "working-knowledge" || s.status === "learning"),
    )
}

function isLabResult(value: unknown): value is ToolLabResult {
    return (
        isRecord(value) &&
        typeof value.slug === "string" &&
        typeof value.title === "string" &&
        typeof value.summary === "string" &&
        (value.category === "backend" || value.category === "devops" || value.category === "ai") &&
        typeof value.type === "string"
    )
}

function asLabResults(output: unknown): ToolLabResult[] {
    if (!isRecord(output) || !Array.isArray(output.results)) return []
    return output.results.filter(isLabResult)
}

function asSingleLabResult(output: unknown): ToolLabResult | undefined {
    return isLabResult(output) ? output : undefined
}

/** Only Backend Engineering, DevOps topics/labs, and AI Engineering articles have an individually addressable page (mirrors src/lib/ai/lab-knowledge.ts) — everything else links to its Lab section index instead of a slug that doesn't resolve. */
function labHref(item: ToolLabResult): string {
    if (item.category === "backend") return `/lab/backend/${item.slug}`
    if (item.category === "ai") return item.type === "article" ? `/ai-engineering/articles/${item.slug}` : "/ai-engineering"
    if (item.type === "lab") return `/lab/devops/labs/${item.slug}`
    if (item.type === "guide") return `/lab/devops/topics/${item.slug}`
    return "/lab/devops"
}

/** Trims a long case-study title ("H-Phsar — B2B Marketplace API") down to its short name for use inside a suggested question. */
function shortTitle(title: string): string {
    return title.split(/\s+[—-]\s+/)[0].trim()
}

const EVIDENCE_LEVEL_RANK: Record<EvidenceLevel, number> = { professional: 0, project: 1, demonstrated: 2, learning: 3 }
const SKILL_STATUS_RANK: Record<SkillStatus, number> = { primary: 0, "working-knowledge": 1, learning: 2 }

function evidenceKey(item: EvidenceItem): string {
    return `${item.type}:${item.href ?? item.title}`
}

function pickTopEvidence(candidates: EvidenceItem[]): EvidenceItem[] {
    const seen = new Set<string>()
    const deduped = candidates.filter((item) => {
        const key = evidenceKey(item)
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
    return deduped.sort((a, b) => EVIDENCE_LEVEL_RANK[a.evidenceLevel] - EVIDENCE_LEVEL_RANK[b.evidenceLevel]).slice(0, MAX_EVIDENCE_ITEMS)
}

function pickTopSkills(candidates: SkillChip[]): SkillChip[] {
    const byName = new Map<string, SkillChip>()
    for (const skill of candidates) if (!byName.has(skill.name)) byName.set(skill.name, skill)
    return [...byName.values()].sort((a, b) => SKILL_STATUS_RANK[a.status] - SKILL_STATUS_RANK[b.status]).slice(0, MAX_SKILL_CHIPS)
}

/** Deterministic, portfolio-scoped follow-ups templated from whichever evidence/skills actually made the cut — never freeform generation, so they can never wander out of scope. */
function buildSuggestedQuestions(evidence: EvidenceItem[], skills: SkillChip[]): string[] {
    const candidates: string[] = []
    const project = evidence.find((e) => e.type === "project")
    const lab = evidence.find((e) => e.type === "lab")
    const hasExperience = evidence.some((e) => e.type === "experience")

    if (project) {
        candidates.push(`What was his role in ${shortTitle(project.title)}?`)
        candidates.push(`What technologies were used in ${shortTitle(project.title)}?`)
    }
    if (lab) {
        candidates.push(`What else has he learned about ${shortTitle(lab.title)}?`)
    }
    if (skills.length > 0) {
        candidates.push(`Does he use ${skills[0].name} anywhere else?`)
    }
    if (hasExperience && !project) {
        candidates.push("Which projects show this experience?")
    }

    const unique = [...new Set(candidates)]
    return unique.slice(0, MAX_SUGGESTED_QUESTIONS)
}

export function buildPortfolioMeta(toolResults: ToolCallRecord[]): PortfolioAssistantMeta {
    if (toolResults.length === 0) return EMPTY_PORTFOLIO_META

    const evidenceCandidates: EvidenceItem[] = []
    const skillCandidates: SkillChip[] = []

    for (const { toolName, output } of toolResults) {
        switch (toolName) {
            case "searchProjects": {
                for (const project of asProjectSummaries(output)) {
                    evidenceCandidates.push({
                        type: "project",
                        title: project.title,
                        description: project.description,
                        href: `/projects/${project.slug}`,
                        evidenceLevel: project.ownership === "Professional Work" ? "professional" : "project",
                    })
                }
                break
            }
            case "getProject": {
                const project = asSingleProject(output)
                if (project) {
                    evidenceCandidates.push({
                        type: "project",
                        title: project.title,
                        description: project.description,
                        href: `/projects/${project.slug}`,
                        evidenceLevel: project.ownership === "Professional Work" ? "professional" : "project",
                    })
                }
                break
            }
            case "getExperience": {
                for (const item of asExperienceItems(output)) {
                    evidenceCandidates.push({
                        type: "experience",
                        title: `${item.role} · ${item.company}`,
                        description: item.summary,
                        href: "/about",
                        evidenceLevel: "professional",
                    })
                }
                break
            }
            case "getSkills": {
                for (const skill of asSkills(output)) {
                    skillCandidates.push({ name: skill.name, status: skill.status })
                }
                break
            }
            case "searchEngineeringLab": {
                for (const item of asLabResults(output)) {
                    evidenceCandidates.push({
                        type: "lab",
                        title: item.title,
                        description: item.summary,
                        href: labHref(item),
                        evidenceLevel: "demonstrated",
                    })
                }
                break
            }
            case "getLabItem": {
                const item = asSingleLabResult(output)
                if (item) {
                    evidenceCandidates.push({
                        type: "lab",
                        title: item.title,
                        description: item.summary,
                        href: labHref(item),
                        evidenceLevel: "demonstrated",
                    })
                }
                break
            }
            default:
                break
        }
    }

    const evidence = pickTopEvidence(evidenceCandidates)
    const skills = pickTopSkills(skillCandidates)
    const suggestedQuestions = buildSuggestedQuestions(evidence, skills)

    return portfolioAssistantMetaSchema.parse({ evidence, skills, suggestedQuestions })
}
