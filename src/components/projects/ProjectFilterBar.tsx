import React from "react"
import Link from "next/link"
import { cn } from "@/src/lib/utils/utils"

export type ProjectFilter = "all" | "backend" | "full-stack" | "live"

interface FilterOption {
    id: ProjectFilter
    label: string
}

const filters: FilterOption[] = [
    { id: "all", label: "All" },
    { id: "backend", label: "Backend" },
    { id: "full-stack", label: "Full-stack" },
    { id: "live", label: "Live" },
]

/**
 * URL-driven filter pills — server-rendered links so the filter state is
 * shareable and works without JavaScript. `?filter=` is read by the page.
 */
export function ProjectFilterBar({
    active,
    counts,
}: {
    active: ProjectFilter
    counts: Record<ProjectFilter, number>
}) {
    // An empty filter is a dead end, so hide it — unless it is the active one
    // (e.g. a shared `?filter=` link), so the current state stays visible.
    const visibleFilters = filters.filter(
        (filter) => filter.id === "all" || filter.id === active || counts[filter.id] > 0,
    )

    return (
        // Below `sm`, the strip scrolls horizontally instead of wrapping to
        // several lines; the mask fades the trailing edge as a scroll
        // affordance. At `sm` and up it reverts to a plain wrapping row.
        <div className="overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)] sm:overflow-visible sm:[mask-image:none] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-strong">
            <div
                className="flex w-max gap-2 pb-2 sm:w-auto sm:flex-wrap sm:pb-0"
                role="group"
                aria-label="Filter projects by type"
            >
                {visibleFilters.map((filter) => {
                    const isActive = filter.id === active
                    return (
                        <Link
                            key={filter.id}
                            href={filter.id === "all" ? "/projects" : `/projects?filter=${filter.id}`}
                            scroll={false}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
                                isActive
                                    ? "border-brand bg-brand/10 text-brand"
                                    : "border-border text-fg-secondary hover:border-border-strong hover:text-fg",
                            )}
                        >
                            {filter.label}
                            <span className="font-mono text-xs text-fg-muted">{counts[filter.id]}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
