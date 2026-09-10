import { ArrowDown, ArrowRight, Box, Cloud, Database, Layers, ListOrdered, Monitor, Server, Zap } from "lucide-react"

export type ArchNodeType = "client" | "app" | "api" | "service" | "database" | "cache" | "queue" | "external" | "default"

export interface ArchNode {
    label: string
    sublabel?: string
    type?: ArchNodeType
}

/** A single stage of the flow. An array of nodes renders as a parallel branch at that stage. */
export type ArchStep = ArchNode | ArchNode[]

const TYPE_ICON: Record<ArchNodeType, React.ComponentType<{ size?: number; className?: string }>> = {
    client: Monitor,
    app: Layers,
    api: Server,
    service: Box,
    database: Database,
    cache: Zap,
    queue: ListOrdered,
    external: Cloud,
    default: Box,
}

const TYPE_COLOR: Record<ArchNodeType, string> = {
    client: "text-sky-600 dark:text-sky-400",
    app: "text-brand",
    api: "text-brand",
    service: "text-fg-secondary",
    database: "text-success",
    cache: "text-warning",
    queue: "text-warning",
    external: "text-fg-muted",
    default: "text-fg-muted",
}

function normalizeStep(step: ArchStep): ArchNode[] {
    return Array.isArray(step) ? step : [step]
}

/** Converts a flat label list (e.g. Project.architecture) into a linear sequence of steps. */
export function stepsFromLabels(labels: string[]): ArchStep[] {
    return labels.map((label) => ({ label }))
}

function NodeCard({ node }: { node: ArchNode }) {
    const type = node.type ?? "default"
    const Icon = TYPE_ICON[type]
    return (
        <div className="card-interactive flex min-w-[104px] flex-1 flex-col items-center gap-1 rounded-xl border border-border bg-surface-code px-3 py-3 text-center">
            <Icon size={14} aria-hidden="true" className={TYPE_COLOR[type]} />
            <span className="text-base font-semibold text-surface-code-foreground">{node.label}</span>
            {node.sublabel && <span className="text-[11px] text-surface-code-foreground/60">{node.sublabel}</span>}
        </div>
    )
}

export function ArchitectureDiagram({ title, steps }: { title?: string; steps: ArchStep[] }) {
    return (
        <div className="my-6 rounded-2xl border border-border bg-surface p-5">
            {title && <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-fg-muted">{title}</p>}
            {/* No md:flex-wrap: a wrapped row strands its trailing arrow
                pointing into empty space, and CSS can't detect the break.
                Nodes shrink to share one row instead, and the whole strip
                scrolls horizontally below that rather than wrapping. */}
            <div className="flex flex-col items-stretch gap-1 md:flex-row md:items-center md:justify-center md:gap-2 md:overflow-x-auto md:pb-1">
                {steps.map((step, i) => {
                    const nodes = normalizeStep(step)
                    return (
                        <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1 md:flex-row md:gap-2">
                            <div className="flex flex-col items-center gap-2 md:flex-row">
                                {nodes.map((node, ni) => (
                                    <NodeCard key={ni} node={node} />
                                ))}
                            </div>
                            {i < steps.length - 1 && (
                                <>
                                    <ArrowDown size={16} aria-hidden="true" className="shrink-0 text-border-strong md:hidden" />
                                    <ArrowRight size={16} aria-hidden="true" className="hidden shrink-0 text-border-strong md:block" />
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/** Compact inline variant for cards — chips connected by arrows, no icons or title. */
export function ArchitectureDiagramCompact({ steps }: { steps: ArchStep[] }) {
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {steps.map((step, i) => {
                const nodes = normalizeStep(step)
                return (
                    <div key={i} className="flex items-center gap-1.5">
                        <div className="flex flex-wrap items-center gap-1">
                            {nodes.map((node, ni) => (
                                <span
                                    key={ni}
                                    className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-fg-secondary"
                                >
                                    {node.label}
                                </span>
                            ))}
                        </div>
                        {i < steps.length - 1 && <ArrowRight size={10} aria-hidden="true" className="shrink-0 text-border-strong" />}
                    </div>
                )
            })}
        </div>
    )
}
