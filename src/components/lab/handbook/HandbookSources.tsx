import { ExternalLink } from "lucide-react"
import type { DocSource } from "@/src/lib/types/handbook"

/**
 * Appendix B. Primary sources only, so a claim in the handbook can always be
 * re-checked against the vendor documentation it came from.
 */
export function HandbookSources({ sources }: { sources: DocSource[] }) {
    const byOrg = sources.reduce<Record<string, DocSource[]>>((groups, source) => {
        ;(groups[source.organization] ??= []).push(source)
        return groups
    }, {})

    return (
        <section id="sources" className="scroll-mt-28 border-t border-border pt-10">
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-brand">Section B</p>
            <h2 className="mt-3 max-w-3xl text-[30px] font-bold leading-[1.15] tracking-tight text-fg md:text-[38px]">
                Source library
            </h2>
            <p className="mt-4 max-w-3xl border-l-[3px] border-border-strong pl-4 text-[19px] leading-[1.65] text-fg-secondary">
                Every factual claim above traces to one of these. When a tool ships a change, re-check it here rather than
                trusting the handbook.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
                {Object.entries(byOrg).map(([organization, items]) => (
                    <div key={organization}>
                        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-muted">
                            {organization}
                        </p>
                        <ul className="mt-2 space-y-1.5">
                            {items.map((source) => (
                                <li key={source.url}>
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group inline-flex items-baseline gap-1.5 text-[15px] leading-6 text-fg-secondary underline-offset-4 transition-colors hover:text-brand hover:underline"
                                    >
                                        {source.title}
                                        <ExternalLink size={11} aria-hidden="true" className="shrink-0 self-center text-fg-muted" />
                                    </a>
                                    <span className="ml-1 text-[12px] text-fg-muted">{source.topics.join(" · ")}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    )
}
