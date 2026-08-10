import Link from "next/link"
import { ArrowRight, FlaskConical } from "lucide-react"
import type { Lab } from "@/src/lib/types/devops-lab"
import type { BackendItemSummary } from "@/src/lib/types/backend-engineering"

interface PracticeItem {
    href: string
    title: string
    description: string
    difficulty: string
    estimatedTime: string
}

/** Hands-on labs pulled from both DevOps (real steps/commands) and Backend (published "lab" type items) — capped so this stays a preview, not a full catalog. */
export function HandsOnPractice({ devopsLabs, backendLabs }: { devopsLabs: Lab[]; backendLabs: BackendItemSummary[] }) {
    const items: PracticeItem[] = [
        ...devopsLabs.map((lab) => ({
            href: `/lab/devops/labs/${lab.slug}`,
            title: lab.title,
            description: lab.description,
            difficulty: lab.difficulty,
            estimatedTime: lab.estimatedTime,
        })),
        ...backendLabs.map((item) => ({
            href: `/lab/backend/${item.slug}`,
            title: item.title,
            description: item.description,
            difficulty: item.difficulty,
            estimatedTime: item.estimatedMinutes ? `${item.estimatedMinutes} min` : "—",
        })),
    ].slice(0, 4)

    if (items.length === 0) return null

    return (
        <section className="mb-10" aria-labelledby="hands-on-practice-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <h2 id="hands-on-practice-heading" className="text-xl font-bold tracking-tight text-fg">
                    Hands-on practice
                </h2>
                <Link href="/lab/devops/labs" className="flex items-center gap-1 font-mono text-sm text-fg-muted transition-colors hover:text-fg">
                    all labs <ArrowRight size={12} aria-hidden="true" />
                </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group flex gap-3.5 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-hover"
                    >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success transition-transform group-hover:-translate-y-0.5">
                            <FlaskConical size={20} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <span className="font-mono text-[11px] uppercase tracking-wider text-fg-muted">
                                {item.difficulty} · {item.estimatedTime}
                            </span>
                            <h3 className="mt-1 text-base font-semibold text-fg">{item.title}</h3>
                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-fg-secondary">{item.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
