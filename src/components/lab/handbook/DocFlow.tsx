import { ArrowDown, ArrowLeft, ArrowRight, CornerUpLeft } from "lucide-react"
import type { DocFlowNode, DocFlowSpec, DocFlowTone } from "@/src/lib/types/handbook"
import { RichText } from "./RichText"

const NODE_TONE: Record<DocFlowTone, string> = {
    default: "border-border bg-background",
    accent: "border-brand/50 bg-brand/[0.07]",
    edge: "border-border-strong bg-surface-elevated",
}

const SWATCH_TONE: Record<DocFlowTone, string> = {
    default: "border-border bg-background",
    accent: "border-brand/60 bg-brand/20",
    edge: "border-border-strong bg-surface-elevated",
}

function FlowNode({ node }: { node: DocFlowNode }) {
    return (
        <div
            className={`flex min-w-0 flex-1 flex-col justify-center rounded-xl border px-3 py-2.5 text-center md:min-h-[4.25rem] ${NODE_TONE[node.tone ?? "default"]}`}
        >
            <span className="font-mono text-[13px] font-semibold leading-5 text-fg">{node.label}</span>
            {node.detail && <span className="mt-0.5 text-[11px] leading-4 text-fg-muted">{node.detail}</span>}
        </div>
    )
}

/**
 * A serpentine pipeline diagram: row 0 reads left to right, row 1 right to
 * left, and so on. The reversal is done with `flex-row-reverse` so DOM order
 * always matches reading order for assistive technology. Below `md` the whole
 * thing collapses to a single top-to-bottom column, where a serpentine has no
 * meaning and every arrow simply points down.
 */
export function DocFlow({ flow }: { flow: DocFlowSpec }) {
    return (
        <figure
            className="my-8 overflow-hidden rounded-2xl border border-border bg-surface"
            aria-label={`${flow.title}. ${flow.rows.flat().map((n) => n.label).join(", then ")}.`}
        >
            <figcaption className="border-b border-border px-4 py-3 sm:px-5">
                <p className="text-sm font-semibold text-fg">{flow.title}</p>
                {flow.description && (
                    <p className="mt-1 text-[13px] leading-5 text-fg-muted">
                        <RichText text={flow.description} />
                    </p>
                )}
            </figcaption>

            <div className="space-y-2 p-4 sm:p-5">
                {flow.rows.map((row, rowIndex) => {
                    const reversed = rowIndex % 2 === 1
                    return (
                        <div key={rowIndex}>
                            <div className={`flex flex-col gap-2 md:items-stretch md:gap-2 ${reversed ? "md:flex-row-reverse" : "md:flex-row"}`}>
                                {row.map((node, nodeIndex) => (
                                    <div
                                        key={node.id}
                                        className={`flex min-w-0 flex-1 flex-col gap-2 md:items-center ${reversed ? "md:flex-row-reverse" : "md:flex-row"}`}
                                    >
                                        <FlowNode node={node} />
                                        {nodeIndex < row.length - 1 && (
                                            <>
                                                <ArrowDown size={14} aria-hidden="true" className="mx-auto shrink-0 text-border-strong md:hidden" />
                                                {reversed ? (
                                                    <ArrowLeft size={14} aria-hidden="true" className="hidden shrink-0 text-border-strong md:block" />
                                                ) : (
                                                    <ArrowRight size={14} aria-hidden="true" className="hidden shrink-0 text-border-strong md:block" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {rowIndex < flow.rows.length - 1 && (
                                <div className={`flex py-1.5 ${reversed ? "md:justify-start" : "md:justify-end"} justify-center`}>
                                    <ArrowDown size={14} aria-hidden="true" className="shrink-0 text-border-strong md:mx-[3.5rem]" />
                                </div>
                            )}
                        </div>
                    )
                })}

                {flow.returns && flow.returns.length > 0 && (
                    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-dashed border-border pt-3">
                        {flow.returns.map((edge) => (
                            <li key={`${edge.from}-${edge.to}`} className="flex items-start gap-1.5 text-[11px] leading-4 text-error">
                                <CornerUpLeft size={12} aria-hidden="true" className="mt-px shrink-0" />
                                <span>
                                    <span className="font-mono">{edge.from}</span> → <span className="font-mono">{edge.to}</span>
                                    <span className="text-fg-muted"> · {edge.label}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-2.5 sm:px-5">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">Legend</span>
                {flow.legend.map((item) => (
                    <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-fg-muted">
                        {item.swatch === "return" ? (
                            <CornerUpLeft size={11} aria-hidden="true" className="text-error" />
                        ) : (
                            <span aria-hidden="true" className={`h-2.5 w-3.5 rounded-[3px] border ${SWATCH_TONE[item.swatch]}`} />
                        )}
                        {item.label}
                    </span>
                ))}
            </div>
        </figure>
    )
}
