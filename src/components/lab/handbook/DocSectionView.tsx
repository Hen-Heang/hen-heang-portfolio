import type { DocLevel, DocPart, DocSection, DocTool } from "@/src/lib/types/handbook"
import { DocBlockList } from "./DocBlocks"

const LEVEL_LABEL: Record<DocLevel, string> = {
    foundation: "Foundation",
    working: "Working knowledge",
    advanced: "Advanced",
}

const LEVEL_STYLE: Record<DocLevel, string> = {
    foundation: "border-success/40 bg-success/10 text-success",
    working: "border-brand/40 bg-brand/10 text-brand",
    advanced: "border-warning/45 bg-warning/10 text-warning",
}

const TOOL_LABEL: Record<DocTool, string> = {
    claude: "Claude Code",
    codex: "Codex",
    both: "Both tools",
}

/** The band that opens each PART — mirrors the numbered structure of a printed handbook. */
export function DocPartHeader({ part }: { part: DocPart }) {
    return (
        <header id={`part-${part.id}`} className="mb-10 mt-16 max-w-3xl scroll-mt-28 first:mt-0">
            <div className="rounded-2xl border border-border bg-surface px-5 py-5">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-fg-muted">
                    Part {part.number}
                </p>
                <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-fg">{part.title}</h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-6 text-fg-secondary">{part.summary}</p>
            </div>
        </header>
    )
}

export function DocSectionView({ section }: { section: DocSection }) {
    return (
        <section id={section.id} className="scroll-mt-28 border-t border-border pt-10 first:border-t-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-brand">
                    Section {section.number}
                </p>
                <span
                    className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${LEVEL_STYLE[section.level]}`}
                >
                    {LEVEL_LABEL[section.level]}
                </span>
                <span className="rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
                    {TOOL_LABEL[section.applies]}
                </span>
            </div>

            <h2 className="mt-3 max-w-3xl text-[30px] font-bold leading-[1.15] tracking-tight text-fg md:text-[38px]">
                {section.title}
            </h2>
            <p className="mt-4 max-w-3xl border-l-[3px] border-border-strong pl-4 text-[19px] leading-[1.65] text-fg-secondary">
                {section.lead}
            </p>

            <div className="mt-8 max-w-3xl">
                <DocBlockList blocks={section.blocks} />
            </div>
        </section>
    )
}
