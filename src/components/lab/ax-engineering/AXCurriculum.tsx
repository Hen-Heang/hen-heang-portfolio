import { Beaker, BookOpen, Clock3 } from "lucide-react"
import type {
    AXConcept,
    AXLab,
    AXModule,
    AXSource,
} from "@/src/lib/types/ax-engineering"

const statusLabel = {
    learning: "Learning",
    experimenting: "Experimenting",
    planned: "Planned",
} as const

const statusClasses = {
    learning: "border-brand/30 bg-brand/10 text-brand",
    experimenting: "border-warning/30 bg-warning/10 text-warning",
    planned: "border-border bg-background text-fg-muted",
} as const

const roadmapPhases = [
    {
        number: "01",
        title: "Orient",
        outcome: "Understand AX and the harness",
        from: 0,
        to: 3,
    },
    {
        number: "02",
        title: "Prepare",
        outcome: "Shape context and guidance",
        from: 3,
        to: 6,
    },
    {
        number: "03",
        title: "Execute",
        outcome: "Coordinate agents and tools",
        from: 6,
        to: 9,
    },
    {
        number: "04",
        title: "Control",
        outcome: "Constrain and verify work",
        from: 9,
        to: 13,
    },
    {
        number: "05",
        title: "Improve",
        outcome: "Measure, observe, and continue",
        from: 13,
        to: 17,
    },
    {
        number: "06",
        title: "Capstone",
        outcome: "Design a general harness",
        from: 17,
        to: 18,
    },
] as const

const labPhases = [
    {
        number: "01",
        title: "Guide the agent",
        outcome: "Instructions and reusable playbooks",
        from: 0,
        to: 2,
    },
    {
        number: "02",
        title: "Define capabilities",
        outcome: "Roles and bounded tools",
        from: 2,
        to: 4,
    },
    {
        number: "03",
        title: "Control execution",
        outcome: "Permissions, isolation, and gates",
        from: 4,
        to: 7,
    },
    {
        number: "04",
        title: "Measure and continue",
        outcome: "Evals, observability, and handoff",
        from: 7,
        to: 10,
    },
    {
        number: "05",
        title: "Connect the system",
        outcome: "A Spring harness design",
        from: 10,
        to: 11,
    },
] as const

export function AXRoadmap({ modules }: { modules: AXModule[] }) {
    return (
        <section
            id="roadmap"
            className="mb-12 scroll-mt-24"
            aria-labelledby="roadmap-heading"
        >
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                Learning roadmap
            </p>
            <h2
                id="roadmap-heading"
                className="mt-1.5 text-[26px] font-bold leading-[1.15] tracking-tight text-fg md:text-[32px]"
            >
                A deliberate learning sequence
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-6 text-fg-secondary">
                Backend engineering remains the foundation. This path adds the
                practices needed to explore reliable AI-assisted development
                systems.
            </p>
            <ol className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {roadmapPhases.map((phase) => (
                    <li
                        key={phase.title}
                        className="h-full rounded-2xl border border-border bg-surface p-4"
                    >
                        <div className="flex items-center gap-3 border-b border-border pb-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 font-mono text-xs font-bold text-brand">
                                {phase.number}
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-fg">
                                    {phase.title}
                                </h3>
                                <p className="text-xs text-fg-muted">
                                    {phase.outcome}
                                </p>
                            </div>
                        </div>
                        <ol className="mt-2 space-y-1.5">
                            {modules
                                .slice(phase.from, phase.to)
                                .map((module) => (
                                    <li key={module.slug}>
                                        <details
                                            id={`module-${module.slug}`}
                                            className="group scroll-mt-24 rounded-xl border border-transparent bg-background open:border-border"
                                        >
                                            <summary className="cursor-pointer list-none p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden">
                                                <span className="flex items-start gap-2.5">
                                                    <span className="font-mono text-xs font-bold text-brand">
                                                        {module.number}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-sm font-semibold leading-5 text-fg">
                                                            {module.title}
                                                        </span>
                                                        <span className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-fg-muted">
                                                            <span className="flex items-center gap-1">
                                                                <Clock3
                                                                    size={10}
                                                                    aria-hidden="true"
                                                                />
                                                                {
                                                                    module.estimatedScope
                                                                }
                                                            </span>
                                                            <span
                                                                className={`rounded-full border px-1.5 py-0.5 font-mono uppercase tracking-wide ${statusClasses[module.status]}`}
                                                            >
                                                                {
                                                                    statusLabel[
                                                                        module
                                                                            .status
                                                                    ]
                                                                }
                                                            </span>
                                                        </span>
                                                    </span>
                                                    <span
                                                        aria-hidden="true"
                                                        className="text-base text-brand transition-transform group-open:rotate-45"
                                                    >
                                                        +
                                                    </span>
                                                </span>
                                            </summary>
                                            <div className="border-t border-border px-3 pb-3 pt-2">
                                                <p className="text-xs leading-5 text-fg-secondary">
                                                    {module.description}
                                                </p>
                                                <ul
                                                    aria-label={`${module.title} concepts`}
                                                    className="mt-2 flex flex-wrap gap-1"
                                                >
                                                    {module.concepts.map(
                                                        (concept) => (
                                                            <li
                                                                key={concept}
                                                                className="rounded-full bg-surface-elevated px-2 py-1 text-[10px] text-fg-secondary"
                                                            >
                                                                {concept}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        </details>
                                    </li>
                                ))}
                        </ol>
                    </li>
                ))}
            </ol>
        </section>
    )
}

export function AXConceptGuide({ concepts }: { concepts: AXConcept[] }) {
    return (
        <section
            id="concepts"
            className="mb-12 scroll-mt-24"
            aria-labelledby="concepts-heading"
        >
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                Tools and concepts
            </p>
            <h2
                id="concepts-heading"
                className="mt-1.5 text-[26px] font-bold leading-[1.15] tracking-tight text-fg md:text-[32px]"
            >
                A practical harness vocabulary
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-6 text-fg-secondary">
                Open any concept for a concise explanation. The analogies are
                memory aids; the technical descriptions define the actual role.
            </p>
            <div className="mt-6 grid items-start gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {concepts.map((concept) => (
                    <details
                        id={`concept-${concept.slug}`}
                        key={concept.slug}
                        className="card-interactive group scroll-mt-24 rounded-xl border border-border bg-surface open:border-border-strong lg:open:col-span-2"
                    >
                        <summary className="cursor-pointer list-none rounded-xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden">
                            <span className="flex items-center justify-between gap-3">
                                <span>
                                    <span className="block text-base font-bold text-fg">
                                        {concept.name}
                                    </span>
                                    <span className="mt-1 block text-xs text-fg-muted">
                                        Analogy: {concept.analogy}
                                    </span>
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="text-xl leading-none text-brand transition-transform group-open:rotate-45"
                                >
                                    +
                                </span>
                            </span>
                        </summary>
                        <dl className="space-y-3 border-t border-border px-4 pb-4 pt-3 text-sm leading-6">
                            <ConceptRow
                                term="What is it?"
                                detail={concept.what}
                            />
                            <ConceptRow
                                term="Why do we need it?"
                                detail={concept.why}
                            />
                            <ConceptRow
                                term="How does it work?"
                                detail={concept.how}
                            />
                            <ConceptRow
                                term="Simple example"
                                detail={concept.example}
                            />
                            <ConceptRow
                                term="When should I use it?"
                                detail={concept.whenToUse}
                            />
                        </dl>
                    </details>
                ))}
            </div>
        </section>
    )
}

function ConceptRow({ term, detail }: { term: string; detail: string }) {
    return (
        <div>
            <dt className="font-semibold text-fg">{term}</dt>
            <dd className="mt-0.5 text-fg-secondary">{detail}</dd>
        </div>
    )
}

export function AXLabs({ labs }: { labs: AXLab[] }) {
    return (
        <section
            id="labs"
            className="mb-12 scroll-mt-24"
            aria-labelledby="labs-heading"
        >
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                Practical labs
            </p>
            <h2
                id="labs-heading"
                className="mt-1.5 text-[26px] font-bold leading-[1.15] tracking-tight text-fg md:text-[32px]"
            >
                Practice the design before the platform
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-6 text-fg-secondary">
                These planned exercises produce designs, policies, and testable
                artifacts. They intentionally stop short of implementing the
                future Spring AX Engineering Harness.
            </p>
            <ol className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {labPhases.map((phase) => (
                    <li
                        key={phase.title}
                        className="h-full rounded-2xl border border-border bg-surface p-4"
                    >
                        <div className="flex items-center gap-3 border-b border-border pb-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 font-mono text-xs font-bold text-warning">
                                {phase.number}
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-fg">
                                    {phase.title}
                                </h3>
                                <p className="text-xs text-fg-muted">
                                    {phase.outcome}
                                </p>
                            </div>
                        </div>
                        <ol className="mt-2 space-y-1.5">
                            {labs.slice(phase.from, phase.to).map((lab) => (
                                <li key={lab.id}>
                                    <details className="group rounded-xl border border-transparent bg-background open:border-border">
                                        <summary className="cursor-pointer list-none p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning [&::-webkit-details-marker]:hidden">
                                            <span className="flex items-start gap-2.5">
                                                <Beaker
                                                    size={14}
                                                    aria-hidden="true"
                                                    className="mt-0.5 shrink-0 text-warning"
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block font-mono text-[10px] font-semibold uppercase tracking-wide text-warning">
                                                        {lab.id} · Planned
                                                    </span>
                                                    <span className="mt-0.5 block text-sm font-semibold leading-5 text-fg">
                                                        {lab.title}
                                                    </span>
                                                </span>
                                                <span
                                                    aria-hidden="true"
                                                    className="text-base text-warning transition-transform group-open:rotate-45"
                                                >
                                                    +
                                                </span>
                                            </span>
                                        </summary>
                                        <div className="border-t border-border px-3 pb-3 pt-2">
                                            <p className="text-xs leading-5 text-fg-secondary">
                                                {lab.objective}
                                            </p>
                                            <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-fg-muted">
                                                <BookOpen
                                                    size={12}
                                                    aria-hidden="true"
                                                    className="mt-1 shrink-0"
                                                />
                                                <span>
                                                    <strong className="font-semibold text-fg-secondary">
                                                        Deliverable:
                                                    </strong>{" "}
                                                    {lab.deliverable}
                                                </span>
                                            </p>
                                            <ul
                                                aria-label={`${lab.id} concepts`}
                                                className="mt-2 flex flex-wrap gap-1"
                                            >
                                                {lab.concepts.map((concept) => (
                                                    <li
                                                        key={concept}
                                                        className="rounded-full bg-surface-elevated px-2 py-1 text-[10px] text-fg-secondary"
                                                    >
                                                        {concept}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </details>
                                </li>
                            ))}
                        </ol>
                    </li>
                ))}
            </ol>
        </section>
    )
}

export function AXReferences({ sources }: { sources: AXSource[] }) {
    return (
        <section
            id="sources"
            className="mb-4 scroll-mt-24"
            aria-labelledby="sources-heading"
        >
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                Learning sources
            </p>
            <h2
                id="sources-heading"
                className="mt-1.5 text-[26px] font-bold leading-[1.15] tracking-tight text-fg md:text-[32px]"
            >
                Continue with primary references
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {sources.map((source) => (
                    <li key={source.url}>
                        <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="card-interactive block rounded-xl border border-border bg-surface p-4"
                        >
                            <span className="block text-sm font-semibold text-fg">
                                {source.title}
                            </span>
                            <span className="mt-1 block text-xs text-fg-muted">
                                {source.organization} ·{" "}
                                {source.topics.join(" · ")}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    )
}
