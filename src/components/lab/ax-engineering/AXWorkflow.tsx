import { ArrowDown, ArrowRight } from "lucide-react"
import type { AXWorkflowStep } from "@/src/lib/types/ax-engineering"

const workflowStages = [
    {
        number: "01",
        title: "Frame",
        outcome: "A grounded task",
        from: 0,
        to: 3,
    },
    {
        number: "02",
        title: "Decide",
        outcome: "An evidence-based plan",
        from: 3,
        to: 6,
    },
    {
        number: "03",
        title: "Build",
        outcome: "A checked change",
        from: 6,
        to: 9,
    },
    {
        number: "04",
        title: "Verify",
        outcome: "Reviewable evidence",
        from: 9,
        to: 12,
    },
    {
        number: "05",
        title: "Deliver & learn",
        outcome: "A durable handoff",
        from: 12,
        to: 15,
    },
] as const

export function AXWorkflow({ steps }: { steps: AXWorkflowStep[] }) {
    return (
        <section
            id="workflow"
            className="mb-12 scroll-mt-24"
            aria-labelledby="workflow-heading"
        >
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                End-to-end workflow
            </p>
            <h2
                id="workflow-heading"
                className="mt-1.5 text-[26px] font-bold leading-[1.15] tracking-tight text-fg md:text-[32px]"
            >
                From requirement to feedback
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-6 text-fg-secondary">
                This is a learning model, not a claim that every task needs
                every stage. The harness should scale its controls to the work
                and its risk.
            </p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {workflowStages.map((stage, stageIndex) => (
                    <li
                        key={stage.title}
                        className="card-interactive relative flex min-w-0 flex-col rounded-2xl border border-border bg-surface p-4"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-brand">
                                Stage {stage.number}
                            </span>
                            <span className="h-px flex-1 bg-border" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-fg">
                            {stage.title}
                        </h3>
                        <ol className="mt-3 space-y-2 border-l border-border pl-3">
                            {steps.slice(stage.from, stage.to).map((step) => (
                                <li key={step.label}>
                                    <span className="block text-xs font-semibold text-fg">
                                        {step.label}
                                    </span>
                                    <span className="mt-0.5 block text-[11px] leading-4 text-fg-muted">
                                        {step.detail}
                                    </span>
                                </li>
                            ))}
                        </ol>
                        {/* mt-auto pins the outcome to the card floor so the
                            five chips share one baseline despite the stages
                            having different step counts; the wrapper's pt-4
                            keeps a minimum gap when a card is already full. */}
                        <div className="mt-auto pt-4">
                            <p className="rounded-lg bg-surface-elevated px-2.5 py-2 text-[11px] font-medium text-fg-secondary">
                                Outcome: {stage.outcome}
                            </p>
                        </div>
                        {stageIndex < workflowStages.length - 1 && (
                            <>
                                <ArrowDown
                                    size={14}
                                    aria-hidden="true"
                                    className="absolute -bottom-2.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background text-border-strong sm:hidden"
                                />
                                <ArrowRight
                                    size={14}
                                    aria-hidden="true"
                                    className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background text-border-strong lg:block"
                                />
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </section>
    )
}
