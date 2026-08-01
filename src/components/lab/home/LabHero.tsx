import { ArrowRight, Search } from "lucide-react"
import Link from "next/link"

/** Compact, static hero — one label, one title, one description, two actions, one line stating the learning loop. */
export function LabHero() {
    return (
        <section className="mb-8 border-b border-border pb-8">
            <span className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">Engineering Lab</span>
            <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-fg md:text-4xl">
                Learn backend engineering by building real systems.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-6 text-fg-secondary">
                Structured paths for Java, Spring Boot, databases, DevOps, and AI-assisted development.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/lab/library" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-base font-semibold text-fg-secondary transition-colors hover:border-border-strong hover:text-fg">
                    <Search size={14} aria-hidden="true" /> Search the Lab
                </Link>
                <Link href="#learning-paths" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-base font-semibold text-white transition-[filter] hover:brightness-110">
                    Browse learning paths <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </div>

            <p className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
                Learn <span aria-hidden="true">→</span> Apply <span aria-hidden="true">→</span> Verify <span aria-hidden="true">→</span> Reflect
            </p>
        </section>
    )
}
