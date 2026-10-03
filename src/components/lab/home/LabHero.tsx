import {
    ArrowRight,
    BookOpen,
    Bot,
    CheckCircle2,
    Coffee,
    Database,
    Hammer,
    Leaf,
    Lightbulb,
    Terminal,
} from "lucide-react"
import { Reveal } from "@/src/components/system/Reveal"

const stack = [
    { name: "Java", icon: Coffee },
    { name: "Spring Boot", icon: Leaf },
    { name: "PostgreSQL", icon: Database },
    { name: "DevOps", icon: Terminal },
    { name: "AX Engineering", icon: Bot },
]

const loop = [
    { label: "Learn", icon: BookOpen },
    { label: "Apply", icon: Hammer },
    { label: "Verify", icon: CheckCircle2 },
    { label: "Reflect", icon: Lightbulb },
]

/** Compact hero with one gentle entrance for the whole composition. Keeping the
 * motion boundary in Reveal lets this component remain server-rendered.
 *
 * No CTA buttons here: "Continue learning" directly below is the primary
 * action, the search section is on the same page, and the learning paths
 * follow immediately — hero buttons pointing at each just repeated them. */
export function LabHero() {
    return (
        <section className="mb-8 border-b border-border pb-8">
            <Reveal>
                <span className="block font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                    Engineering Lab
                </span>

                <h1 className="mt-2.5 max-w-3xl text-[32px] font-bold leading-[1.1] tracking-tight text-fg md:text-[46px]">
                    Learn by building real systems — then prove they work.
                </h1>

                <p className="mt-4 max-w-2xl text-[17px] leading-7 text-fg-secondary">
                    Backend-first paths through Java, Spring Boot, PostgreSQL,
                    and DevOps, plus a working handbook for Claude Code and
                    Codex. Every path ends in something verified, not something
                    read.
                </p>

                <ul
                    aria-label="Core technologies"
                    className="mt-4 flex flex-wrap items-center gap-1.5"
                >
                    {stack.map((tech) => (
                        <li
                            key={tech.name}
                            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-fg-secondary"
                        >
                            <tech.icon
                                size={13}
                                aria-hidden="true"
                                className="text-fg-muted"
                            />
                            {tech.name}
                        </li>
                    ))}
                </ul>

                <ol
                    aria-label="The Lab learning loop"
                    className="mt-5 flex flex-wrap items-center gap-x-1.5 gap-y-2"
                >
                    {loop.map((step, i) => (
                        <li
                            key={step.label}
                            className="flex items-center gap-1.5"
                        >
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1.5">
                                <step.icon
                                    size={12}
                                    aria-hidden="true"
                                    className="text-brand"
                                />
                                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-fg-secondary">
                                    {step.label}
                                </span>
                            </span>
                            {i < loop.length - 1 && (
                                <ArrowRight
                                    size={11}
                                    aria-hidden="true"
                                    className="hidden text-border-strong sm:block"
                                />
                            )}
                        </li>
                    ))}
                </ol>
            </Reveal>
        </section>
    )
}
