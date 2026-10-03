import type { EducationItem, ExperienceItem } from "@/src/lib/types"
import type { Achievement } from "@/data/achievements"
import type { TimelineEntry } from "@/src/components/system/Timeline"

/**
 * Best-effort chronological key: the first 4-digit year found in a
 * human-readable period string (e.g. "July 2023 — April 2024" → 2023).
 * Entries with no parseable year (e.g. "In progress") sort last.
 */
function startYear(period: string): number {
    const match = period.match(/\d{4}/)
    return match ? Number(match[0]) : Number.POSITIVE_INFINITY
}

/** All 4-digit years in a period string, as a [min, max] range (e.g. "2023-2024" -> [2023, 2024]). */
function yearRange(period: string): [number, number] {
    const years = [...period.matchAll(/\d{4}/g)].map((m) => Number(m[0]))
    if (years.length === 0) return [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
    return [Math.min(...years), Math.max(...years)]
}

/** Loose organization-name match so "KSHRD" and "Korea Software HRD Center" count as the same place. */
const ORG_ALIASES: Record<string, string> = {
    kshrd: "korea software hrd center",
    kosign: "kosign [korea software innovation global network]",
}

function canonicalOrg(name: string): string {
    const normalized = name.trim().toLowerCase().replace(/\s+/g, " ")
    return ORG_ALIASES[normalized] ?? normalized
}

/**
 * Builds the Cambodia → Korea career timeline from all real education +
 * experience data, merged in chronological order. The self-directed
 * "in progress" learning entry always renders last regardless of its
 * nominal start year. Ties within the same year keep the source arrays'
 * relative order (Array.prototype.sort is stable).
 *
 * `achievements` (certifications/awards) is optional — pass it to fold
 * "Certifications & milestones" into this same timeline instead of showing
 * it as a separate section: each achievement is attached as a credential
 * badge on the matching company/school entry (matched by org name, then by
 * whichever candidate's year range is closest to the achievement's date).
 * Achievements with no matching org (e.g. independent certifications) become
 * their own timeline entries instead, positioned by year like everything
 * else, so nothing is dropped.
 */
export function buildCareerTimeline(
    experience: ExperienceItem[],
    education: EducationItem[],
    achievements: Achievement[] = [],
): TimelineEntry[] {
    const direction = education.find((e) => e.institution.trim().toLowerCase() === "self-learning")
    const isUniversity = (e: EducationItem) => e.institution.toLowerCase().includes("university")

    const educationEntries: TimelineEntry[] = education
        .filter((e) => e !== direction)
        .map((e) => ({
            period: e.period,
            title: e.title,
            org: e.institution.trim(),
            location: isUniversity(e) ? "Phnom Penh, Cambodia" : undefined,
            description: e.description,
            kind: "education",
        }))

    // Work history is stored newest-first; the story reads oldest-first.
    const workEntries: TimelineEntry[] = [...experience].reverse().map((job) => ({
        period: job.period,
        title: job.role,
        org: job.company,
        location: job.location,
        description: job.summary,
        highlights: job.highlights,
        stack: job.stack,
        kind: "work",
    }))

    const orgEntries = [...educationEntries, ...workEntries]
    const standaloneEntries: TimelineEntry[] = []

    for (const achievement of achievements) {
        const achievementYear = Number(achievement.date)
        const candidates = orgEntries.filter((e) => canonicalOrg(e.org) === canonicalOrg(achievement.issuer))

        if (candidates.length === 0) {
            // No matching company/school on record — still show it, as its own entry.
            standaloneEntries.push({
                period: achievement.date,
                title: achievement.title,
                org: achievement.issuer,
                description: achievement.description ?? "",
                image: achievement.image,
                link: achievement.link,
                kind: "certificate",
            })
            continue
        }

        // Prefer the candidate whose period actually spans the achievement's
        // year; otherwise the one ending closest to it (most likely the
        // program this credential capped off).
        const best = candidates.reduce((closest, candidate) => {
            const [closestMin, closestMax] = yearRange(closest.period)
            const [candMin, candMax] = yearRange(candidate.period)
            const closestContains = achievementYear >= closestMin && achievementYear <= closestMax
            const candContains = achievementYear >= candMin && achievementYear <= candMax
            if (candContains && !closestContains) return candidate
            if (closestContains && !candContains) return closest
            return Math.abs(candMax - achievementYear) < Math.abs(closestMax - achievementYear) ? candidate : closest
        })

        best.credentials = [
            ...(best.credentials ?? []),
            { title: achievement.title, type: achievement.type, image: achievement.image, link: achievement.link },
        ]
    }

    const merged = [...orgEntries, ...standaloneEntries].sort(
        (a, b) => startYear(a.period) - startYear(b.period),
    )

    if (direction) {
        merged.push({
            period: direction.period,
            title: direction.title,
            org: direction.institution.trim(),
            description: direction.description,
            kind: "direction",
        })
    }

    return merged
}
