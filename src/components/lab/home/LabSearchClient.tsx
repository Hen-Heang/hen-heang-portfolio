"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, X } from "lucide-react"
import type {
    EngineeringLabSearchItem,
    EngineeringLabSource,
} from "@/src/lib/types/engineering-lab"
import { rankLabSearch } from "@/src/lib/lab/search"
import { Tag } from "@/src/components/ai-engineering/Tag"
import { HoverArrow } from "@/src/components/lab/ui/HoverArrow"
import { cn, interactiveCard } from "@/src/lib/utils/utils"

const sourceTextColors: Record<EngineeringLabSource, string> = {
    "AI Engineering": "text-brand",
    "Backend Engineering": "text-success",
    "DevOps Basics": "text-warning",
}

const suggestions = ["Spring Security", "Docker", "PostgreSQL", "CI/CD"]

/**
 * The only interactive island on the Lab homepage. `children` is the
 * server-rendered dashboard content (already in the initial HTML) — it's
 * shown as-is with no query, and swapped for client-computed results while
 * searching, without ever being fetched or re-fetched.
 */
export function LabSearchClient({
    items,
    children,
}: {
    items: EngineeringLabSearchItem[]
    children: React.ReactNode
}) {
    const [query, setQuery] = useState("")

    const results = useMemo(() => {
        if (!query.trim()) return []
        return rankLabSearch(query, items, { limit: 24 })
    }, [items, query])

    return (
        <section
            id="lab-library"
            className="scroll-mt-24"
            aria-labelledby="lab-library-heading"
        >
            <div className="mb-5">
                <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                    Find exactly what you need
                </p>
                <h2
                    id="lab-library-heading"
                    className="mt-1 text-2xl font-bold tracking-tight text-fg md:text-3xl"
                >
                    Search the Engineering Lab
                </h2>
                <p className="mt-2 text-base leading-6 text-fg-secondary">
                    Search across guides, labs, prompts, snippets, commands, and
                    infrastructure references.
                </p>
            </div>

            <div className="mb-10 max-w-2xl">
                <div className="relative">
                    <Search
                        size={16}
                        aria-hidden="true"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted"
                    />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search Docker, JWT, MyBatis, CI/CD..."
                        aria-label="Search Engineering Lab"
                        className="min-h-12 w-full rounded-2xl border border-border bg-surface py-3 pl-11 pr-11 text-base text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-elevated hover:text-fg"
                        >
                            <X size={15} aria-hidden="true" />
                        </button>
                    )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-fg-muted">
                        Try
                    </span>
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => setQuery(suggestion)}
                            className="rounded-full border border-border px-2.5 py-1 text-sm text-fg-secondary transition-colors hover:border-border-strong hover:text-fg"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>

            {query.trim() ? (
                <div className="mb-14 duration-150 animate-in fade-in-0 motion-reduce:animate-none">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <p
                            aria-live="polite"
                            className="font-mono text-base font-semibold uppercase tracking-wider text-fg-muted"
                        >
                            {results.length} result
                            {results.length === 1 ? "" : "s"}
                        </p>
                        <Link
                            href={`/lab/library?q=${encodeURIComponent(query.trim())}`}
                            className="group flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                        >
                            Open in full library{" "}
                            <HoverArrow size={12} className="text-brand" />
                        </Link>
                    </div>
                    {results.length === 0 ? (
                        <div className="py-16 text-center text-base text-fg-muted">
                            Nothing matches yet — try a different term.
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {results.map((item) => (
                                <Link
                                    key={`${item.source}-${item.type}-${item.href}-${item.title}`}
                                    href={item.href}
                                    className={cn(
                                        "group flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4",
                                        interactiveCard,
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span
                                            className={`font-mono text-xs font-semibold uppercase tracking-wider ${sourceTextColors[item.source]}`}
                                        >
                                            {item.source} · {item.type}
                                        </span>
                                        <HoverArrow
                                            size={13}
                                            className="text-border-strong"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold text-fg">
                                        {item.title}
                                    </h3>
                                    <p className="line-clamp-2 text-base leading-relaxed text-fg-secondary">
                                        {item.description}
                                    </p>
                                    {item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.tags.slice(0, 3).map((t) => (
                                                <Tag key={t} label={t} />
                                            ))}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                children
            )}
        </section>
    )
}
