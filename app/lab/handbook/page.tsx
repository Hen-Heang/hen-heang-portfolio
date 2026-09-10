import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpenText, Sparkles } from "lucide-react"
import { profileData } from "@/data/profile"
import { handbookMeta, handbookParts, handbookSections, handbookSources } from "@/data/lab/handbook"
import { DocPartHeader, DocSectionView } from "@/src/components/lab/handbook/DocSectionView"
import { HandbookSources } from "@/src/components/lab/handbook/HandbookSources"
import { HandbookToc } from "@/src/components/lab/handbook/HandbookToc"
import { LabNav } from "@/src/components/lab/ui/LabNav"
import { ReadingProgressBar } from "@/src/components/lab/ui/ReadingProgressBar"

export const metadata: Metadata = {
    title: "Agent Coding Handbook — Claude Code & Codex | Engineering Lab",
    description:
        "A working reference for Claude Code and Codex: the agent loop, CLAUDE.md and AGENTS.md, context and memory, skills, subagents, MCP, settings precedence, permissions, sandboxing, hooks, the daily development loop, quality gates, and unattended runs.",
    alternates: { canonical: `${profileData.portfolioUrl}/lab/handbook` },
    openGraph: {
        title: "Agent Coding Handbook — Claude Code & Codex | Hen Heang",
        description:
            "From first install to unattended runs: configuration, permissions, hooks, skills, subagents, MCP, and the workflow that holds it together.",
        url: `${profileData.portfolioUrl}/lab/handbook`,
        type: "article",
    },
}

/** Entry points for the three reasons this page gets opened. */
const readingPaths = [
    {
        label: "First day",
        title: "I have never used either tool",
        detail: "Read §1 to §3, then stop and do the first task. Come back for §5 once you have corrected the agent twice.",
        href: "#the-loop",
    },
    {
        label: "New repository",
        title: "I am setting a project up properly",
        detail: "§5 and §6 for the instruction files, §10 to §12 for settings, permissions, and hooks. Copy the starting configuration in §11.",
        href: "#instruction-files",
    },
    {
        label: "Something is wrong",
        title: "It ignored my rule, or did something I did not expect",
        detail: "§4 for what actually loaded, §10 for which file won, §11 for how the tool call was decided.",
        href: "#context-window",
    },
]

export default function HandbookPage() {
    const toc = handbookParts.map((part) => ({
        id: part.id,
        number: part.number,
        title: part.title,
        sections: part.sections.map((section) => ({
            id: section.id,
            number: section.number,
            title: section.title,
        })),
    }))

    return (
        <div className="mx-auto max-w-[82rem] px-4 py-8 md:px-8">
            <ReadingProgressBar />
            <LabNav active="handbook" />

            <header className="mb-10 border-b border-border pb-10">
                <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-brand">
                    Engineering Lab · Reference
                </p>
                <h1 className="mt-3 max-w-4xl text-[34px] font-bold leading-[1.1] tracking-tight text-fg md:text-[52px]">
                    {handbookMeta.title}
                </h1>
                <p className="mt-4 max-w-2xl text-[19px] leading-[1.6] text-fg-secondary">
                    {handbookMeta.subtitle}. Written to be read once end to end, then opened at a single section on the day
                    you need it.
                </p>

                <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[12px] text-fg-muted">
                    <div className="flex gap-1.5">
                        <dt className="uppercase tracking-wider">Version</dt>
                        <dd className="text-fg-secondary">{handbookMeta.version}</dd>
                    </div>
                    <div className="flex gap-1.5">
                        <dt className="uppercase tracking-wider">Updated</dt>
                        <dd className="text-fg-secondary">{handbookMeta.updated}</dd>
                    </div>
                    <div className="flex gap-1.5">
                        <dt className="uppercase tracking-wider">Sections</dt>
                        <dd className="text-fg-secondary">{handbookSections.length}</dd>
                    </div>
                    <div className="flex gap-1.5">
                        <dt className="uppercase tracking-wider">Sources</dt>
                        <dd className="text-fg-secondary">{handbookSources.length} primary</dd>
                    </div>
                </dl>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                        href="#the-loop"
                        className="group inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover"
                    >
                        Start at Section 1
                        <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                        href="#cheat-sheet"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-brand/50"
                    >
                        <BookOpenText size={15} aria-hidden="true" /> Command cheat sheet
                    </Link>
                    <Link
                        href="/lab/ax-engineering"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-brand/50"
                    >
                        <Sparkles size={15} aria-hidden="true" /> AX Engineering concepts
                    </Link>
                </div>
            </header>

            <section aria-labelledby="reading-paths-heading" className="mb-12">
                <h2 id="reading-paths-heading" className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
                    Where to start
                </h2>
                <ul className="mt-4 grid gap-3 md:grid-cols-3">
                    {readingPaths.map((path) => (
                        <li key={path.href}>
                            <Link
                                href={path.href}
                                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/50"
                            >
                                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                                    {path.label}
                                </span>
                                <span className="mt-1.5 text-[15px] font-semibold leading-5 text-fg">{path.title}</span>
                                <span className="mt-2 text-[13px] leading-5 text-fg-muted">{path.detail}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {/* The table of contents comes first in the DOM so it is reachable
                immediately on small screens, where it renders as a collapsed
                disclosure. On xl it is placed into the right rail by grid
                position rather than by being rendered twice. */}
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-12">
                <div className="xl:col-start-2 xl:row-start-1">
                    <HandbookToc parts={toc} />
                </div>

                <div className="min-w-0 xl:col-start-1 xl:row-start-1">
                    {handbookParts.map((part) => (
                        <div key={part.id}>
                            <DocPartHeader part={part} />
                            <div className="space-y-12">
                                {part.sections.map((section) => (
                                    <DocSectionView key={section.id} section={section} />
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="mt-12">
                        <HandbookSources sources={handbookSources} />
                    </div>

                    <p className="mt-12 border-t border-border pt-6 text-[13px] leading-5 text-fg-muted">
                        This handbook records how I run these tools day to day. Tool behaviour changes; the source library
                        above is the authority, and this page is the summary I keep in sync with it.
                    </p>
                </div>
            </div>
        </div>
    )
}
