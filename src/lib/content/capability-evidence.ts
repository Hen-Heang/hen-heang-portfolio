import type { ExperienceItem, Project } from "@/src/lib/types"
import { capabilityGroups, type CapabilityGroup } from "./capabilities"

/**
 * Links every canonical capability technology to the projects and roles that
 * actually used it.
 *
 * Nothing is authored by hand: each link is a name match against
 * `Project.technologies` and `ExperienceItem.stack`. A technology with no
 * match links to nothing rather than claiming evidence it doesn't have.
 * There are no proficiency scores here by design — the portfolio shows *where*
 * something was used, not a self-assessed level.
 */

/**
 * Version suffixes differ between data sets: capabilities say "Java",
 * projects say "Java 17" / "Java 21", experience says "Java 8+". Strip the
 * version so the same technology matches across all three.
 */
function stripVersion(value: string): string {
    return value.replace(/\s+v?\d+(\.\d+)*\+?[a-z]?$/i, "").trim()
}

/**
 * Equivalent spellings across the data sets. Values are canonical keys; one
 * name can expand to several — several capability labels are deliberately
 * combined ("Git/GitHub", "Docker/GitHub Actions"), and experience lists
 * "HTML/CSS" as a single entry.
 */
const ALIASES: Record<string, string[]> = {
    "spring data jpa": ["jpa"],
    jpa: ["jpa"],
    "rest api": ["rest apis"],
    nextjs: ["next.js"],
    "next js": ["next.js"],
    tailwindcss: ["tailwind css"],
    postgres: ["postgresql"],
    js: ["javascript"],
    ts: ["typescript"],
    swagger: ["openapi", "swagger"],
    openapi: ["openapi", "swagger"],
    "github actions": ["github actions"],
}

/**
 * Every canonical key a technology name should match on. Combined labels are
 * split on "/" first, so "Docker/GitHub Actions" matches a project listing
 * either Docker or GitHub Actions.
 */
export function techKeys(name: string): string[] {
    return name
        .split("/")
        .flatMap((part) => {
            const base = stripVersion(part).toLowerCase().trim()
            return base ? (ALIASES[base] ?? [base]) : []
        })
        .filter((key, index, all) => all.indexOf(key) === index)
}

function overlaps(a: string[], b: string[]): boolean {
    return a.some((key) => b.includes(key))
}

export interface TechProjectLink {
    slug: string
    title: string
    /** Short project label for chips, e.g. "H-Phsar" from "H-Phsar — B2B Marketplace API". */
    shortTitle: string
}

export interface TechRoleLink {
    /** Company name without its bracketed long form. */
    company: string
    role: string
    period: string
}

export interface CapabilityTech {
    name: string
    projects: TechProjectLink[]
    roles: TechRoleLink[]
    /** True when this technology has at least one verified project or role. */
    hasEvidence: boolean
}

export interface EnrichedCapabilityGroup extends Omit<CapabilityGroup, "technologies"> {
    technologies: CapabilityTech[]
}

/** Projects and experience both use em-dash subtitles; chips only need the name. */
function shortTitle(title: string): string {
    return title.split(/\s+[—–-]\s+/)[0].trim()
}

/** "KOSIGN [Korea Software Innovation Global Network]" -> "KOSIGN". */
function shortCompany(company: string): string {
    return company.replace(/\s*[[(].*$/, "").trim()
}

export function buildCapabilityEvidence(
    projects: Project[],
    experience: ExperienceItem[],
    groups: readonly CapabilityGroup[] = capabilityGroups,
): EnrichedCapabilityGroup[] {
    // `hidden` projects are excluded from every public listing, so they must
    // not surface as evidence either.
    const projectIndex = projects
        .filter((project) => !project.hidden)
        .map((project) => ({
            link: {
                slug: project.slug,
                title: project.title,
                shortTitle: shortTitle(project.title),
            },
            keys: (project.technologies ?? []).flatMap(techKeys),
        }))

    const roleIndex = experience.map((item) => ({
        link: {
            company: shortCompany(item.company),
            role: item.role,
            period: item.period,
        },
        keys: (item.stack ?? []).flatMap(techKeys),
    }))

    return groups.map((group) => ({
        ...group,
        technologies: group.technologies.map((name): CapabilityTech => {
            const keys = techKeys(name)
            const linkedProjects = projectIndex
                .filter((p) => overlaps(keys, p.keys))
                .map((p) => p.link)
            const linkedRoles = roleIndex
                .filter((r) => overlaps(keys, r.keys))
                .map((r) => r.link)

            return {
                name,
                projects: linkedProjects,
                roles: linkedRoles,
                hasEvidence: linkedProjects.length > 0 || linkedRoles.length > 0,
            }
        }),
    }))
}
