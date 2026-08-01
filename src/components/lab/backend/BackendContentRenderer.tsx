import Link from "next/link"
import { AlertTriangle, CheckCircle2, CircleDot, ExternalLink, Info, ShieldCheck } from "lucide-react"
import { CodeBlock } from "@/src/components/ai-engineering/CodeBlock"
import { ArchitectureDiagram, stepsFromLabels } from "@/src/components/lab/ui/ArchitectureDiagram"
import type {
    BackendBlock,
    BackendChecklistItem,
    BackendInterviewItem,
    BackendLabItem,
    BackendNarrativeItem,
    BackendSection,
} from "@/src/lib/types/backend-engineering"

const calloutStyle = {
    note: { className: "border-brand/40 bg-brand/5", icon: Info },
    warning: { className: "border-warning/40 bg-warning/5", icon: AlertTriangle },
    production: { className: "border-success/40 bg-success/5", icon: ShieldCheck },
    tradeoff: { className: "border-warning/40 bg-warning/5", icon: CircleDot },
}

export function BackendBlockRenderer({ block }: { block: BackendBlock }) {
    switch (block.type) {
        case "paragraph":
            return <p className="mb-5 text-[17px] leading-8 text-fg-secondary">{block.text}</p>
        case "list": {
            const Tag = block.ordered ? "ol" : "ul"
            return (
                <Tag className={`mb-5 space-y-2 break-words pl-5 text-[17px] leading-7 text-fg-secondary ${block.ordered ? "list-decimal" : "list-disc"}`}>
                    {block.items.map((item) => <li key={item}>{item}</li>)}
                </Tag>
            )
        }
        case "code":
            return <CodeBlock code={block.code} language={block.language} filename={block.filename} />
        case "callout": {
            const style = calloutStyle[block.tone]
            const Icon = style.icon
            return (
                <aside className={`my-6 rounded-xl border p-4 ${style.className}`}>
                    <div className="flex items-start gap-3">
                        <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-fg-secondary" />
                        <div>
                            <p className="text-base font-semibold text-fg">{block.title}</p>
                            <p className="mt-1 text-base leading-6 text-fg-secondary">{block.text}</p>
                        </div>
                    </div>
                </aside>
            )
        }
        case "table":
            return (
                <div className="my-6 w-full max-w-full overflow-x-auto rounded-xl border border-border">
                    <table className="w-full min-w-[560px] text-left text-base">
                        <thead className="border-b border-border bg-surface">
                            <tr>{block.headers.map((header) => <th key={header} scope="col" className="px-4 py-3 text-sm font-semibold uppercase tracking-wide text-fg-muted">{header}</th>)}</tr>
                        </thead>
                        <tbody>{block.rows.map((row, rowIndex) => <tr key={`${rowIndex}-${row[0]}`} className="border-b border-border last:border-0">{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`} className="px-4 py-3 align-top leading-6 text-fg-secondary">{cell}</td>)}</tr>)}</tbody>
                    </table>
                </div>
            )
        case "diagram":
            return (
                <figure className="my-7">
                    <ArchitectureDiagram title={block.title} steps={stepsFromLabels(block.steps)} />
                    <figcaption className="rounded-lg border-l-2 border-brand/60 bg-surface px-4 py-3 text-base leading-6 text-fg-muted">
                        <span className="font-semibold text-fg-secondary">Text alternative:</span> {block.textAlternative}
                    </figcaption>
                </figure>
            )
        case "steps":
            return (
                <ol className="my-6 space-y-4">
                    {block.items.map((item, index) => (
                        <li key={item.title} className="flex gap-4">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand/50 bg-brand/10 font-mono text-sm font-bold text-brand">{index + 1}</span>
                            <div><p className="font-semibold text-fg">{item.title}</p><p className="mt-1 text-base leading-6 text-fg-secondary">{item.text}</p></div>
                        </li>
                    ))}
                </ol>
            )
    }
}

export function BackendSections({ sections }: { sections: BackendSection[] }) {
    return (
        <div>
            {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24 border-t border-border py-8 first:border-t-0 first:pt-0">
                    <h2 className="mb-4 text-2xl font-bold tracking-tight text-fg">{section.title}</h2>
                    {section.blocks.map((block, index) => <BackendBlockRenderer key={`${section.id}-${index}`} block={block} />)}
                </section>
            ))}
        </div>
    )
}

export function BackendNarrativeContent({ item }: { item: BackendNarrativeItem }) {
    return <BackendSections sections={item.sections} />
}

export function BackendLabContent({ item }: { item: BackendLabItem }) {
    return (
        <div>
            <BackendSections sections={item.overview} />
            <section id="milestones" className="scroll-mt-24 border-t border-border py-8">
                <h2 className="text-2xl font-bold text-fg">Milestones</h2>
                <p className="mt-2 text-base leading-6 text-fg-secondary">Complete these in order. Each milestone has a verifiable outcome, not only a task list.</p>
                <div className="mt-6 space-y-4">
                    {item.milestones.map((milestone) => (
                        <details key={milestone.id} id={milestone.id} className="group scroll-mt-24 rounded-2xl border border-border bg-surface p-5 open:border-border-strong">
                            <summary className="cursor-pointer list-none text-xl font-semibold text-fg marker:content-none">{milestone.title}</summary>
                            <p className="mt-4 text-base leading-6 text-fg-secondary"><strong className="text-fg">Goal:</strong> {milestone.goal}</p>
                            <MilestoneList title="Tasks" items={milestone.tasks} />
                            <MilestoneList title="Acceptance criteria" items={milestone.acceptanceCriteria} icon="check" />
                            <MilestoneList title="Tests" items={milestone.tests} />
                            <MilestoneList title="Common risks" items={milestone.commonRisks} />
                            <MilestoneList title="Production notes" items={milestone.productionNotes} />
                        </details>
                    ))}
                </div>
            </section>
        </div>
    )
}

function MilestoneList({ title, items, icon }: { title: string; items: string[]; icon?: "check" }) {
    return (
        <div className="mt-5">
            <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-fg-muted">{title}</h3>
            <ul className="mt-2 space-y-2">
                {items.map((item) => <li key={item} className="flex gap-2 text-base leading-6 text-fg-secondary">{icon === "check" ? <CheckCircle2 size={14} aria-hidden="true" className="mt-1 shrink-0 text-success" /> : <CircleDot size={12} aria-hidden="true" className="mt-1.5 shrink-0 text-brand" />}{item}</li>)}
            </ul>
        </div>
    )
}

export function BackendChecklistContent({ item }: { item: BackendChecklistItem }) {
    return (
        <div>
            <p className="mb-8 text-lg leading-8 text-fg-secondary">{item.introduction}</p>
            <div className="space-y-8">
                {item.groups.map((group) => (
                    <section key={group.title} id={group.title.toLowerCase().replaceAll(" ", "-")} className="scroll-mt-24 rounded-2xl border border-border bg-surface p-5 md:p-6">
                        <h2 className="text-2xl font-bold text-fg">{group.title}</h2>
                        <p className="mt-2 text-base leading-6 text-fg-muted">{group.rationale}</p>
                        <ul className="mt-5 space-y-3">
                            {group.items.map((entry) => (
                                <li key={entry.label} className="rounded-xl border border-border bg-background p-4">
                                    <div className="flex items-start gap-3"><CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-success" /><div><p className="text-base font-semibold text-fg">{entry.label}</p><p className="mt-1 text-sm leading-5 text-fg-muted"><span className="font-semibold text-fg-secondary">Evidence:</span> {entry.evidence}</p></div></div>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
            <section id="release-decision" className="mt-8 scroll-mt-24 rounded-2xl border border-brand/40 bg-brand/5 p-6">
                <h2 className="text-2xl font-bold text-fg">Release decision</h2>
                <ul className="mt-4 space-y-3">{item.releaseDecision.map((decision) => <li key={decision} className="text-base leading-6 text-fg-secondary">{decision}</li>)}</ul>
            </section>
        </div>
    )
}

export function BackendInterviewContent({ item }: { item: BackendInterviewItem }) {
    return (
        <div>
            <p className="mb-8 text-lg leading-8 text-fg-secondary">{item.introduction}</p>
            <div className="space-y-4">
                {item.questions.map((entry, index) => (
                    <details key={entry.question} className="group rounded-2xl border border-border bg-surface p-5 open:border-border-strong">
                        <summary className="cursor-pointer list-none pr-4 font-semibold leading-6 text-fg marker:content-none"><span className="mr-2 font-mono text-brand">{String(index + 1).padStart(2, "0")}</span>{entry.question}</summary>
                        <div className="mt-5 border-t border-border pt-5">
                            <p className="text-base leading-6 text-fg-secondary"><strong className="text-fg">Focus:</strong> {entry.focus}</p>
                            <MilestoneList title="Strong answer" items={entry.strongAnswer} icon="check" />
                            <MilestoneList title="Weak signals" items={entry.weakSignals} />
                            <MilestoneList title="Follow-ups" items={entry.followUps} />
                        </div>
                    </details>
                ))}
            </div>
        </div>
    )
}

export function BackendSources({ sources }: { sources: BackendNarrativeItem["sources"] }) {
    return (
        <section aria-labelledby="source-metadata-heading" className="mt-10 border-t border-border pt-8">
            <h2 id="source-metadata-heading" className="text-2xl font-bold text-fg">Source metadata</h2>
            <p className="mt-2 text-base text-fg-muted">Primary references checked on {sources[0]?.accessedAt}. Version scope is stated at the top of this page.</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {sources.map((source) => (
                    <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="group flex h-full items-start justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong">
                            <div><p className="text-base font-semibold text-fg">{source.title}<span className="sr-only"> (opens in a new tab)</span></p><p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-fg-muted">{source.publisher} · {source.type}</p></div>
                            <ExternalLink size={13} aria-hidden="true" className="mt-0.5 shrink-0 text-fg-muted group-hover:text-brand" />
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export function BackendRelatedLinks({ items }: { items: { id: string; slug: string; title: string; status: string }[] }) {
    return (
        <section aria-labelledby="related-heading" className="mt-10 border-t border-border pt-8">
            <h2 id="related-heading" className="text-2xl font-bold text-fg">Related content</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {items.map((item) => item.status === "published" ? (
                    <Link key={item.id} href={`/lab/backend/${item.slug}`} className="rounded-xl border border-border bg-surface p-4 text-base font-semibold text-fg transition-colors hover:border-border-strong">{item.title}</Link>
                ) : (
                    <div key={item.id} className="rounded-xl border border-border/70 bg-surface/50 p-4 text-base text-fg-muted">{item.title} <span className="ml-1 font-mono text-[11px] uppercase">planned</span></div>
                ))}
            </div>
        </section>
    )
}
