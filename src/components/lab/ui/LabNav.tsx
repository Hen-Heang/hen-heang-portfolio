import Link from "next/link"

export type LabNavKey = "overview" | "handbook" | "backend" | "devops" | "ax" | "ai" | "practice" | "library" | "progress"

const items: { key: LabNavKey; label: string; href: string }[] = [
    { key: "overview", label: "Overview", href: "/lab" },
    { key: "handbook", label: "Agent Handbook", href: "/lab/handbook" },
    { key: "backend", label: "Backend", href: "/lab/backend" },
    { key: "devops", label: "DevOps", href: "/lab/devops" },
    { key: "ax", label: "AX Engineering", href: "/lab/ax-engineering" },
    { key: "ai", label: "AI Library", href: "/ai-engineering" },
    { key: "practice", label: "Practice", href: "/lab/devops/labs" },
    { key: "library", label: "Library", href: "/lab/library" },
    { key: "progress", label: "Progress", href: "/lab/progress" },
]

/**
 * Shared Lab sub-navigation. A horizontally scrollable single-row list works
 * identically on mobile and desktop — no separate dropdown/disclosure needed,
 * and labels never get clipped since overflow scrolls instead of wrapping.
 * `active` is passed explicitly (rather than read from usePathname) so this
 * can render from a Server Component on every Lab route.
 */
export function LabNav({ active }: { active: LabNavKey }) {
    return (
        <nav aria-label="Engineering Lab sections" className="mb-6 -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {items.map((item) => {
                const isActive = item.key === active
                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                            isActive
                                ? "bg-brand text-brand-foreground"
                                : "text-fg-secondary hover:bg-surface-hover hover:text-fg"
                        }`}
                    >
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}
