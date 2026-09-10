import {
    ArrowDown,
    ArrowRight,
    BookOpenCheck,
    BrainCircuit,
    FlaskConical,
    Layers3,
    RefreshCw,
    Workflow,
} from "lucide-react"

const journey = [
    {
        number: "01",
        title: "Understand",
        detail: "Start with the human, model, and harness relationship.",
        href: "#mental-model",
        icon: BrainCircuit,
    },
    {
        number: "02",
        title: "Map",
        detail: "See the layers that shape, execute, and control work.",
        href: "#architecture",
        icon: Layers3,
    },
    {
        number: "03",
        title: "Follow",
        detail: "Trace a requirement through delivery and feedback.",
        href: "#workflow",
        icon: Workflow,
    },
    {
        number: "04",
        title: "Learn",
        detail: "Build understanding in a deliberate module sequence.",
        href: "#roadmap",
        icon: BookOpenCheck,
    },
    {
        number: "05",
        title: "Practice",
        detail: "Turn each idea into a small, reviewable artifact.",
        href: "#labs",
        icon: FlaskConical,
    },
    {
        number: "06",
        title: "Improve",
        detail: "Use evidence, reflection, and references to iterate.",
        href: "#sources",
        icon: RefreshCw,
    },
] as const

export function AXJourneyMap() {
    return (
        <nav
            aria-label="AX Engineering page journey"
            className="mb-12 rounded-2xl border border-border bg-surface p-4 sm:p-5"
        >
            <div className="flex flex-col gap-1 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                        Explore this path
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-fg">
                        Understand → learn → practice → improve
                    </h2>
                </div>
                <p className="text-xs text-fg-muted">
                    Select a stage to jump to it
                </p>
            </div>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
                {journey.map((stage, index) => {
                    const Icon = stage.icon
                    return (
                        <li key={stage.title} className="relative min-w-0">
                            <a
                                href={stage.href}
                                className="card-interactive group flex h-full min-h-28 flex-col rounded-xl border border-border bg-background p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            >
                                <span className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] font-semibold text-fg-muted">
                                        {stage.number}
                                    </span>
                                    <Icon
                                        size={15}
                                        aria-hidden="true"
                                        className="text-brand"
                                    />
                                </span>
                                <span className="mt-2 text-sm font-bold text-fg">
                                    {stage.title}
                                </span>
                                <span className="mt-1 text-xs leading-4 text-fg-muted">
                                    {stage.detail}
                                </span>
                            </a>
                            {index < journey.length - 1 && (
                                <>
                                    <ArrowDown
                                        size={14}
                                        aria-hidden="true"
                                        className="absolute -bottom-2.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-surface text-border-strong sm:hidden"
                                    />
                                    <ArrowRight
                                        size={14}
                                        aria-hidden="true"
                                        className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-surface text-border-strong lg:block"
                                    />
                                </>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
