import React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, FileText } from "lucide-react"
import { GithubIcon } from "@/src/components/icons/social"
import { Container } from "@/src/components/system/Container"
import {
    TechnicalPanel,
    type TechnicalTab,
} from "@/src/components/system/TechnicalPanel"
import { HeroEntrance } from "@/src/components/home/HeroEntrance"
import { positioning } from "@/src/lib/content/positioning"
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
                layers: ["Client", ...hphsar.architecture.slice(0, 4)],
                caption:
                    "H-Phsar request flow, from the client boundary to persistence.",
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
                caption:
                    "Money Flow schema — per-user access enforced with Postgres Row Level Security.",
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
            caption:
                "CI pipeline as run on AuthHub (GitHub Actions + postgres:16). Stages illustrative.",
        },
    })

    return tabs
}

export function Hero({
    profile,
    projects,
}: {
    profile: ProfileContentParsed
    projects: Project[]
}) {
    const tabs = buildTabs(projects)

    return (
        <section className="pb-12 pt-10 sm:pt-14 md:pb-16 md:pt-20">
            <Container>
                <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="flex max-w-xl flex-col items-start">
                        <HeroEntrance className="mb-6">
                            <div className="flex items-center gap-3.5">
                                <div className="relative shrink-0">
                                    <Image
                                        src={profile.profileImage || "/image/heang_new.png"}
                                        alt={profile.name}
                                        width={52}
                                        height={52}
                                        priority
                                        className="h-13 w-13 rounded-2xl object-cover ring-2 ring-border shadow-md"
                                    />
                                    {profile.available && (
                                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface ring-2 ring-surface" title="Available for opportunities">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                                            Backend / AX Engineer
                                        </span>
                                    </div>
                                    <p className="text-xs text-fg-muted mt-0.5">
                                        Based in {profile.location} · {profile.available ? "Open to opportunities" : "Active"}
                                    </p>
                                </div>
                            </div>
                        </HeroEntrance>

                        <HeroEntrance delay={0.06}>
                            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-fg sm:text-5xl lg:text-6xl leading-[1.06]">
                                {profile.name}
                            </h1>
                        </HeroEntrance>

                        <HeroEntrance delay={0.12} className="mt-3">
                            <p className="text-balance text-lg font-semibold leading-snug text-brand sm:text-xl">
                                {positioning.title}
                            </p>
                        </HeroEntrance>

                        <HeroEntrance delay={0.18} className="mt-4">
                            <p className="text-balance text-base leading-relaxed text-fg-secondary sm:text-lg">
                                {positioning.description}
                            </p>
                        </HeroEntrance>

                        <HeroEntrance delay={0.22} className="mt-3">
                            <p className="text-sm leading-relaxed text-fg-muted sm:text-base">
                                {positioning.supporting}
                            </p>
                        </HeroEntrance>

                        <HeroEntrance delay={0.24} className="mt-8 w-full">
                            <div className="flex w-full flex-wrap items-center gap-3">
                                <Link
                                    href="#work"
                                    className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:brightness-110 active:scale-[0.98] sm:w-auto"
                                >
                                    <span>View Backend Work</span>
                                    <ArrowRight size={15} aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5" />
                                </Link>
                                <Link
                                    href="/resume"
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-medium text-fg transition-all duration-200 hover:border-border-strong hover:bg-surface-hover active:scale-[0.98] sm:w-auto"
                                >
                                    <FileText size={15} aria-hidden />
                                    <span>Resume & Skills</span>
                                </Link>
                                <a
                                    href={profile.socialLinks.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-11 items-center gap-1.5 px-3 text-sm font-medium text-fg-secondary transition-colors hover:text-fg"
                                    aria-label="View Hen Heang on GitHub (opens in a new tab)"
                                >
                                    <GithubIcon size={16} />
                                    <span>GitHub</span>
                                    <ArrowUpRight size={13} aria-hidden className="text-fg-muted" />
                                </a>
                            </div>
                        </HeroEntrance>

                        <HeroEntrance delay={0.3} className="mt-8 w-full">
                            <div className="grid grid-cols-3 gap-3 border-y border-border py-4 w-full">
                                <div>
                                    <div className="font-mono text-2xl font-bold tracking-tight text-fg tabular-nums sm:text-3xl">
                                        {profile.yearsExperience}
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-fg-muted">
                                        Years Exp
                                    </div>
                                </div>
                                <div>
                                    <div className="font-mono text-2xl font-bold tracking-tight text-fg tabular-nums sm:text-3xl">
                                        4+
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-fg-muted">
                                        Core Systems
                                    </div>
                                </div>
                                <div>
                                    <div className="font-mono text-2xl font-bold tracking-tight text-emerald-500 tabular-nums sm:text-3xl">
                                        100%
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-fg-muted">
                                        Production
                                    </div>
                                </div>
                            </div>
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
