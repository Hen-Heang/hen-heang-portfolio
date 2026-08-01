"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { BookOpenCheck, Filter, Map, Search, X } from "lucide-react"
import { BACKEND_CATEGORIES, BACKEND_CONTENT_TYPES, type BackendItemSummary } from "@/src/lib/types/backend-engineering"
import { filterBackendItems, sortBackendItems } from "@/src/lib/backend/search"
import { BackendCard } from "@/src/components/lab/backend/BackendCard"
import { useBackendProgress } from "@/src/components/lab/backend/BackendProgress"
import { LabNav } from "@/src/components/lab/ui/LabNav"
import { LabPathHeader } from "@/src/components/lab/ui/LabPathHeader"
import { LabProgressSummary } from "@/src/components/lab/ui/LabProgressSummary"
import { LabPrimaryActions } from "@/src/components/lab/ui/LabPrimaryActions"

const categoryLabel: Record<string, string> = {
    foundations: "Foundations", java: "Java", http: "Web & HTTP", database: "Database", spring: "Spring Boot",
    api: "API", security: "Security", testing: "Testing", performance: "Performance",
    "distributed-systems": "Distributed Systems", devops: "DevOps", observability: "Operations", capstone: "Capstone",
}

const paramOrDefault = (params: URLSearchParams, key: string, fallback: string): string => params.get(key) ?? fallback

export function BackendHubClient({ items, roadmapLevelCount }: { items: BackendItemSummary[]; roadmapLevelCount: number }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [query, setQuery] = useState(() => paramOrDefault(searchParams, "q", ""))
    const pendingQuerySync = useRef<ReturnType<typeof setTimeout> | null>(null)
    const level = paramOrDefault(searchParams, "level", "all")
    const category = paramOrDefault(searchParams, "category", "all")
    const difficulty = paramOrDefault(searchParams, "difficulty", "all")
    const type = paramOrDefault(searchParams, "type", "all")
    const status = paramOrDefault(searchParams, "status", "published")
    const progress = useBackendProgress()

    const updateParams = useCallback(
        (next: Record<string, string | undefined>) => {
            const params = new URLSearchParams(searchParams.toString())
            for (const [key, value] of Object.entries(next)) {
                if (value && value !== "all") params.set(key, value)
                else params.delete(key)
            }
            router.push(`${pathname}${params.toString() ? `?${params}` : ""}`, { scroll: false })
        },
        [pathname, router, searchParams],
    )

    // Debounce the free-text query → URL sync so typing doesn't spam browser history.
    useEffect(() => {
        const handle = setTimeout(() => {
            if (query !== paramOrDefault(searchParams, "q", "")) updateParams({ q: query || undefined })
        }, 250)
        pendingQuerySync.current = handle
        return () => {
            clearTimeout(handle)
            if (pendingQuerySync.current === handle) pendingQuerySync.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the debounced query itself changes
    }, [query])

    function cancelPendingQuerySync() {
        if (pendingQuerySync.current) {
            clearTimeout(pendingQuerySync.current)
            pendingQuerySync.current = null
        }
    }

    const results = useMemo(() => sortBackendItems(filterBackendItems(items, {
        query,
        level: level === "all" ? "all" : Number(level),
        category,
        difficulty: difficulty as "all" | "beginner" | "intermediate" | "advanced",
        type: type as "all" | (typeof BACKEND_CONTENT_TYPES)[number],
        status: status as "all" | "published" | "planned" | "draft",
    })), [items, query, level, category, difficulty, type, status])

    const publishedCount = items.filter((item) => item.status === "published").length
    const completedCount = items.filter((item) => item.status === "published" && progress.has(item.id)).length
    const nextItem = items.find((item) => item.status === "published" && !progress.has(item.id))
    const activeFilterCount = [level !== "all", category !== "all", difficulty !== "all", type !== "all", status !== "published"].filter(Boolean).length
    const hasFilters = Boolean(query) || activeFilterCount > 0

    function resetFilters() {
        setQuery("")
        router.push(pathname, { scroll: false })
    }

    return (
        <div>
            <LabNav active="backend" />
            <LabPathHeader
                label="Backend Engineering Lab"
                title="From fundamentals to production systems"
                description="A Java- and Spring-focused curriculum for learning, reviewing, demonstrating production reasoning, and preparing for backend interviews."
                accent="brand"
            >
                <LabProgressSummary completed={completedCount} total={publishedCount} accent="brand" />
                <LabPrimaryActions
                    actions={[
                        { href: nextItem ? `/lab/backend/${nextItem.slug}` : "/lab/backend/roadmap", label: nextItem ? `Continue: ${nextItem.title}` : "Review completed path", icon: BookOpenCheck },
                        { href: "/lab/backend/roadmap", label: `View roadmap (${roadmapLevelCount} levels)`, icon: Map, variant: "secondary" },
                    ]}
                />
            </LabPathHeader>

            <section id="catalog" className="mt-10 scroll-mt-24" aria-labelledby="backend-catalog-heading">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="font-mono text-sm uppercase tracking-wider text-brand-hover">Reference library</p>
                        <h2 id="backend-catalog-heading" className="mt-1 text-2xl font-bold text-fg">Published depth, planned progression</h2>
                    </div>
                    <p aria-live="polite" className="font-mono text-sm text-fg-muted">{results.length} item{results.length === 1 ? "" : "s"}</p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="relative">
                        <Search size={16} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted" />
                        <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search backend curriculum" placeholder="Search transactions, Java, security, PostgreSQL…" className="min-h-11 w-full rounded-xl border border-border bg-background py-2 pl-10 pr-4 text-base text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-brand" />
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                        <FilterSelect label="Level" value={level} onChange={(value) => updateParams({ level: value })} options={[{ value: "all", label: "All levels" }, ...Array.from({ length: roadmapLevelCount }, (_, value) => ({ value: String(value), label: `Level ${value}` }))]} />
                        <FilterSelect label="Category" value={category} onChange={(value) => updateParams({ category: value })} options={[{ value: "all", label: "All categories" }, ...BACKEND_CATEGORIES.map((value) => ({ value, label: categoryLabel[value] }))]} />
                        <FilterSelect label="Difficulty" value={difficulty} onChange={(value) => updateParams({ difficulty: value })} options={[{ value: "all", label: "All difficulties" }, { value: "beginner", label: "Beginner" }, { value: "intermediate", label: "Intermediate" }, { value: "advanced", label: "Advanced" }]} />
                        <FilterSelect label="Content type" value={type} onChange={(value) => updateParams({ type: value })} options={[{ value: "all", label: "All types" }, ...BACKEND_CONTENT_TYPES.map((value) => ({ value, label: value.replaceAll("-", " ") }))]} />
                        <FilterSelect label="Status" value={status} onChange={(value) => updateParams({ status: value })} options={[{ value: "published", label: "Ready to learn" }, { value: "all", label: "All statuses" }, { value: "planned", label: "Planned" }]} />
                    </div>
                    {hasFilters && (
                        <button type="button" onClick={resetFilters} className="mt-3 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
                            <X size={12} aria-hidden="true" /> Clear filters{activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}
                        </button>
                    )}
                </div>

                {results.length > 0 ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2" onClickCapture={cancelPendingQuerySync}>
                        {results.map((item) => <BackendCard key={item.id} item={item} complete={progress.has(item.id)} />)}
                    </div>
                ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-border py-16 text-center">
                        <Filter size={24} aria-hidden="true" className="mx-auto text-fg-muted" />
                        <p className="mt-3 text-base font-semibold text-fg">No matching backend content</p>
                        <p className="mt-1 text-base text-fg-muted">Try a broader term or clear one of the filters.</p>
                    </div>
                )}
            </section>
        </div>
    )
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
    const id = `backend-filter-${label.toLowerCase().replaceAll(" ", "-")}`
    return (
        <div>
            <label htmlFor={id} className="sr-only">{label}</label>
            <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base capitalize text-fg-secondary outline-none focus:border-brand">
                {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
        </div>
    )
}
