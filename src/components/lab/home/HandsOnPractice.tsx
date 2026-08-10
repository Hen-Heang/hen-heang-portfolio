import Link from "next/link"
import { Braces, Clock3, Terminal } from "lucide-react"
import type { Lab } from "@/src/lib/types/devops-lab"
import type { BackendItemSummary } from "@/src/lib/types/backend-engineering"
import type { Difficulty } from "@/src/lib/types/ai-engineering"
import { DifficultyBadge } from "@/src/components/ai-engineering/DifficultyBadge"
import { HoverArrow } from "@/src/components/lab/ui/HoverArrow"
import { Reveal } from "@/src/components/system/Reveal"
import { interactiveCard, cn } from "@/src/lib/utils/utils"

interface PracticeItem {
    href: string
    title: string
    description: string
    difficulty: Difficulty
    estimatedTime: string
    source: "devops" | "backend"
}

const sourceStyle: Record<
    PracticeItem["source"],
    { icon: typeof Braces; accent: string; label: string }
> = {
    backend: {
        icon: Braces,
        accent: "bg-brand/10 text-brand",
        label: "Backend",
    },
    devops: {
        icon: Terminal,
        accent: "bg-success/10 text-success",
        label: "DevOps",
    },
}

/** Hands-on labs pulled from both DevOps (real steps/commands) and Backend (published "lab" type items) — capped so this stays a preview, not a full catalog. */
export function HandsOnPractice({
    devopsLabs,
    backendLabs,
}: {
    devopsLabs: Lab[]
    backendLabs: BackendItemSummary[]
}) {
    const items: PracticeItem[] = [
        ...devopsLabs.map((lab) => ({
            href: `/lab/devops/labs/${lab.slug}`,
            title: lab.title,
            description: lab.description,
            difficulty: lab.difficulty,
            estimatedTime: lab.estimatedTime,
            source: "devops" as const,
        })),
        ...backendLabs.map((item) => ({
            href: `/lab/backend/${item.slug}`,
            title: item.title,
            description: item.description,
            difficulty: item.difficulty,
            estimatedTime: item.estimatedMinutes
                ? `${item.estimatedMinutes} min`
                : "—",
            source: "backend" as const,
        })),
    ].slice(0, 4)

    if (items.length === 0) return null

    return (
        <section className="mb-10" aria-labelledby="hands-on-practice-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <h2
                    id="hands-on-practice-heading"
                    className="text-xl font-bold tracking-tight text-fg"
                >
                    Hands-on practice
                </h2>
                <Link
                    href="/lab/devops/labs"
                    className="group flex items-center gap-1 font-mono text-sm text-fg-muted transition-colors hover:text-fg"
                >
                    all labs <HoverArrow size={12} />
                </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item, i) => {
                    const source = sourceStyle[item.source]
                    return (
                        <Reveal key={item.href} delay={i * 0.05}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4",
                                    interactiveCard,
                                )}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-2">
                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100 ${source.accent}`}
                                        >
                                            <source.icon
                                                size={15}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
                                            {source.label}
                                        </span>
                                    </span>
                                    <DifficultyBadge
                                        difficulty={item.difficulty}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-fg">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-fg-secondary">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                                    <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-fg-muted">
                                        <Clock3 size={11} aria-hidden="true" />{" "}
                                        {item.estimatedTime}
                                    </span>
                                    <HoverArrow />
                                </div>
                            </Link>
                        </Reveal>
                    )
                })}
            </div>
        </section>
    )
}
