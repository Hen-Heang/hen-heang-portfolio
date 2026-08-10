import { ArrowRight, Braces, Container, Database, Leaf, Search, Sparkles } from "lucide-react"
import Link from "next/link"

const stackNodes = [
    {
        label: "Java",
        detail: "Language",
        icon: Braces,
        color: "text-warning bg-warning/10",
    },
    {
        label: "Spring",
        detail: "Backend",
        icon: Leaf,
        color: "text-success bg-success/10",
    },
    {
        label: "Postgres",
        detail: "Data",
        icon: Database,
        color: "text-brand bg-brand/10",
    },
    {
        label: "Docker",
        detail: "Delivery",
        icon: Container,
        color: "text-fg-secondary bg-surface-elevated",
    },
]

/** Compact hero with a visual system map that makes the Lab feel like an engineering workspace. */
export function LabHero() {
    return (
        <section className="mb-8 grid gap-8 border-b border-border pb-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
                <span className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">Engineering Lab</span>
                <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-fg md:text-4xl">Learn backend engineering by building real systems.</h1>
                <p className="mt-3 max-w-xl text-base leading-6 text-fg-secondary">Structured paths for Java, Spring Boot, databases, DevOps, and AI-assisted development.</p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                        href="/lab/library"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-base font-semibold text-fg-secondary transition-colors hover:border-border-strong hover:text-fg"
                    >
                        <Search size={14} aria-hidden="true" /> Search the Lab
                    </Link>
                    <Link
                        href="#learning-paths"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-base font-semibold text-white transition-[filter] hover:brightness-110"
                    >
                        Browse learning paths <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-4 shadow-sm" aria-label="Backend engineering learning stack">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.12),transparent_48%)]" aria-hidden="true" />
                <div className="relative">
                    <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                        <div className="flex gap-1.5" aria-hidden="true">
                            <span className="h-2 w-2 rounded-full bg-error/70" />
                            <span className="h-2 w-2 rounded-full bg-warning/70" />
                            <span className="h-2 w-2 rounded-full bg-success/70" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-muted">build pipeline</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        {stackNodes.map((node, index) => (
                            <div key={node.label} className="flex items-center gap-3 rounded-2xl border border-border bg-background/80 p-3">
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${node.color}`}>
                                    <node.icon size={19} strokeWidth={1.8} aria-hidden="true" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold text-fg">{node.label}</span>
                                    <span className="block font-mono text-[10px] uppercase tracking-wider text-fg-muted">
                                        0{index + 1} · {node.detail}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 flex items-center gap-3 rounded-2xl bg-gradient-console px-3.5 py-3 text-white">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                            <Sparkles size={17} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold">AI-assisted review</p>
                            <p className="truncate font-mono text-[10px] uppercase tracking-wider text-white/55">Learn → Apply → Verify → Reflect</p>
                        </div>
                        <ArrowRight size={14} className="ml-auto shrink-0 text-white/45" aria-hidden="true" />
                    </div>
                </div>
            </div>
        </section>
    )
}
