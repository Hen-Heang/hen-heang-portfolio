import Link from "next/link"
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
    Search,
    Terminal,
} from "lucide-react"
import { Reveal } from "@/src/components/system/Reveal"

const stack = [
    { name: "Java", icon: Coffee },
    { name: "Spring Boot", icon: Leaf },
    { name: "PostgreSQL", icon: Database },
    { name: "DevOps", icon: Terminal },
    { name: "AI Engineering", icon: Bot },
]

const loop = [
    { label: "Learn", icon: BookOpen },
    { label: "Apply", icon: Hammer },
    { label: "Verify", icon: CheckCircle2 },
    { label: "Reflect", icon: Lightbulb },
]

/** Compact hero with one gentle entrance for the whole composition. Keeping the
 * motion boundary in Reveal lets this component remain server-rendered. */
export function LabHero() {
    return (
        <section className="mb-8 border-b border-border pb-8">
            <Reveal>
                <span className="block font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                    Engineering Lab
                </span>

                <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-fg md:text-4xl">
                    Learn backend engineering by building real systems.
                </h1>

                <p className="mt-3 max-w-xl text-base leading-6 text-fg-secondary">
                    Structured paths for Java, Spring Boot, databases, DevOps,
                    and AI-assisted development.
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

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                        href="/lab/library"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-base font-semibold text-fg-secondary transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:text-fg active:translate-y-0 active:scale-[0.98] motion-reduce:hover:translate-y-0"
                    >
                        <Search size={14} aria-hidden="true" /> Search the Lab
                    </Link>
                    <Link
                        href="#learning-paths"
                        className="group inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] motion-reduce:hover:translate-y-0"
                    >
                        Browse learning paths
                        <ArrowRight
                            size={14}
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                        />
                    </Link>
                </div>

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
