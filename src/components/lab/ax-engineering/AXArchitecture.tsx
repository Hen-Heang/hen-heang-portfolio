import {
    ArrowDown,
    BookOpenText,
    Bot,
    Braces,
    CheckCircle2,
    Eye,
    GitBranch,
    Hand,
    KeyRound,
    MemoryStick,
    Network,
    NotebookTabs,
    PlaySquare,
    ShieldCheck,
    Sparkles,
    Users,
} from "lucide-react"
import { axConcepts } from "@/data/lab/ax-engineering"
import type { AXArchitectureGroup } from "@/src/lib/types/ax-engineering"

const groups: {
    id: AXArchitectureGroup
    label: string
    description: string
}[] = [
    {
        id: "knowledge",
        label: "Shape understanding",
        description:
            "Give the model relevant knowledge and repeatable guidance.",
    },
    {
        id: "execution",
        label: "Perform work",
        description: "Turn reasoning into bounded investigation and action.",
    },
    {
        id: "control",
        label: "Control risk",
        description: "Constrain execution and require engineering evidence.",
    },
    {
        id: "improvement",
        label: "Learn safely",
        description:
            "Explain runs, measure behavior, and preserve useful state.",
    },
]

const conceptIcons: Record<
    string,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    context: BookOpenText,
    instructions: NotebookTabs,
    skills: PlaySquare,
    agents: Bot,
    subagents: Users,
    mcp: Network,
    tools: Hand,
    planning: GitBranch,
    permissions: KeyRound,
    sandbox: Braces,
    hooks: Sparkles,
    "quality-gates": CheckCircle2,
    evals: ShieldCheck,
    observability: Eye,
    memory: MemoryStick,
    handoff: NotebookTabs,
}

export function AXArchitecture() {
    return (
        <section
            id="architecture"
            className="mb-12 scroll-mt-24"
            aria-labelledby="architecture-heading"
        >
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                Agent Harness architecture
            </p>
            <h2
                id="architecture-heading"
                className="mt-1.5 text-[26px] font-bold leading-[1.15] tracking-tight text-fg md:text-[32px]"
            >
                The system around the model
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-6 text-fg-secondary">
                A harness combines knowledge, execution, control, and
                improvement layers. Each part has a narrow job; together they
                make agent work easier to guide, inspect, and verify.
            </p>

            <div className="mt-6 flex flex-col items-center" aria-hidden="true">
                <div className="rounded-xl border border-brand/30 bg-brand/10 px-5 py-3 text-center">
                    <span className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">
                        Operating environment
                    </span>
                    <span className="mt-0.5 block text-sm font-bold text-fg">
                        Agent Harness
                    </span>
                </div>
                <span className="h-4 w-px bg-border-strong" />
                <ArrowDown size={15} className="-mt-1 text-border-strong" />
            </div>

            <div className="mt-1 grid gap-4 md:grid-cols-2">
                {groups.map((group) => (
                    <article
                        key={group.id}
                        className="rounded-2xl border border-border bg-surface p-5"
                    >
                        <div className="border-b border-border pb-3">
                            <h3 className="text-lg font-bold text-fg">
                                {group.label}
                            </h3>
                            <p className="mt-1 text-sm leading-5 text-fg-muted">
                                {group.description}
                            </p>
                        </div>
                        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                            {axConcepts
                                .filter((concept) => concept.group === group.id)
                                .map((concept) => {
                                    const Icon = conceptIcons[concept.slug]
                                    return (
                                        <li key={concept.slug}>
                                            <a
                                                href={`#concept-${concept.slug}`}
                                                className="card-interactive flex min-h-16 items-start gap-3 rounded-xl border border-border bg-background p-3"
                                            >
                                                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                                                    <Icon
                                                        size={14}
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-semibold text-fg">
                                                        {concept.name}
                                                    </span>
                                                    <span className="mt-0.5 block text-xs leading-4 text-fg-muted">
                                                        {concept.analogy}
                                                    </span>
                                                </span>
                                            </a>
                                        </li>
                                    )
                                })}
                        </ul>
                    </article>
                ))}
            </div>
        </section>
    )
}
