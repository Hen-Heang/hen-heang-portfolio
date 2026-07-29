import React from "react"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, FileText, Github } from "lucide-react"
import { Container } from "@/src/components/system/Container"
import { Eyebrow } from "@/src/components/system/Eyebrow"
import { StatusBadge } from "@/src/components/system/StatusBadge"
import { TechnicalPanel, type TechnicalTab } from "@/src/components/system/TechnicalPanel"
import { HeroEntrance } from "@/src/components/home/HeroEntrance"
import { profileData } from "@/data/profile"
import type { Project } from "@/src/lib/types"
import type { ProfileContentParsed } from "@/src/lib/schemas/content"

/**
 * Builds the hero's technical views from real project data, architecture
 * first (the default, visible-on-mobile tab) per the recommended priority:
 * architecture, then API request, then database. The API response body and
 * pipeline stages are labeled illustrative in their captions. Pipeline is
 * extra desktop-only depth — mobile only ever shows the first tab.
 */
function buildTabs(projects: Project[]): TechnicalTab[] {
    const bySlug = (slug: string) => projects.find((p) => p.slug === slug)
    const tabs: TechnicalTab[] = []

    const hphsar = bySlug("h-phsar")
    if (hphsar?.architecture?.length) {
        tabs.push({
            id: "architecture",
            label: "architecture",
            data: {
                kind: "architecture",
                layers: hphsar.architecture,
                caption: "H-Phsar marketplace API — request flow through the real production layers.",
            },
        })
    }

    const authhub = bySlug("authhub")
    const authEndpoint = authhub?.apiEndpoints?.[0]
    if (authEndpoint) {
        tabs.push({
            id: "api",
            label: "api",
            data: {
                kind: "request",
                method: authEndpoint.method,
                path: authEndpoint.path,
                responseLines: [
                    "HTTP/1.1 200 OK",
                    "{",
                    '  "accessToken":  "eyJhbGciOiJIUzI1…",',
                    '  "refreshToken": "d290f1ee-6c54-4b01…",',
                    '  "tokenType":    "Bearer",',
                    '  "expiresIn":    900',
                    "}",
                ],
                caption: `Real endpoint from ${authhub.title.split("—")[0].trim()} (JWT with refresh + revocation). Response body illustrative.`,
            },
        })
    }

    const moneyFlow = bySlug("money-flow")
    if (moneyFlow?.dataModel?.length) {
        tabs.push({
            id: "database",
            label: "database",
            data: {
                kind: "database",
                tables: moneyFlow.dataModel.slice(0, 10),
                caption: "Money Flow schema — per-user access enforced with Postgres Row Level Security.",
            },
        })
    }

    tabs.push({
        id: "pipeline",
        label: "pipeline",
        data: {
            kind: "pipeline",
            stages: [
                { label: "git push", detail: "feature branch" },
                { label: "GitHub Actions", detail: "postgres:16 service" },
                { label: "build + test", detail: "Flyway validates schema" },
                { label: "deploy", detail: "on green" },
            ],
            caption: "CI pipeline as run on AuthHub (GitHub Actions + postgres:16). Stages illustrative.",
        },
    })

    return tabs
}

export function Hero({ profile, projects }: { profile: ProfileContentParsed; projects: Project[] }) {
    const tabs = buildTabs(projects)
    const valueProposition = profile.heroValueProposition ?? profileData.heroValueProposition
    const heroBio = profile.heroBio ?? profileData.heroBio

    return (
        <section className="pb-section pt-16 md:pt-24">
            <Container>
                <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="flex max-w-xl flex-col items-start">
                        <HeroEntrance className="mb-5">
                            <Eyebrow>Backend Developer · {profile.location}</Eyebrow>
                        </HeroEntrance>

                        <HeroEntrance delay={0.06}>
                            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-fg sm:text-5xl">
                                {profile.name}
                            </h1>
                        </HeroEntrance>

                        <HeroEntrance delay={0.12} className="mt-4">
                            <p className="text-balance text-xl font-medium leading-snug text-fg-secondary sm:text-2xl">
                                {valueProposition}
                            </p>
                        </HeroEntrance>

                        <HeroEntrance delay={0.18} className="mt-6">
                            <p className="text-base leading-relaxed text-fg-secondary">{heroBio}</p>
                        </HeroEntrance>

                        <HeroEntrance delay={0.24} className="mt-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    href="#work"
                                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
                                >
                                    View Selected Work
                                    <ArrowRight size={15} aria-hidden />
                                </Link>
                                <Link
                                    href="/resume"
                                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-5 text-sm font-medium text-fg transition-colors hover:border-border-strong hover:bg-surface-hover"
                                >
                                    <FileText size={15} aria-hidden />
                                    View Resume
                                </Link>
                                <a
                                    href={profile.socialLinks.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-11 items-center gap-1.5 px-2 text-sm font-medium text-fg-secondary transition-colors hover:text-fg"
                                    aria-label="View Hen Heang on GitHub (opens in a new tab)"
                                >
                                    <Github size={16} aria-hidden />
                                    GitHub
                                    <ArrowUpRight size={13} aria-hidden />
                                </a>
                            </div>
                        </HeroEntrance>

                        <HeroEntrance delay={0.3} className="mt-10">
                            <p className="font-mono text-xs text-fg-muted">
                                {profile.yearsExperience} years of experience · Enterprise systems · Cambodia → South Korea
                            </p>

                            {profile.available && (
                                <div className="mt-3">
                                    <StatusBadge status="live" pulse>
                                        Open to backend roles
                                    </StatusBadge>
                                </div>
                            )}
                        </HeroEntrance>
                    </div>

                    <HeroEntrance delay={0.36} className="min-w-0">
                        <TechnicalPanel tabs={tabs} />
                    </HeroEntrance>
                </div>
            </Container>
        </section>
    )
}
