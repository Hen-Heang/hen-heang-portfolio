"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Search, FileCode2, MessageSquareCode, Terminal, ArrowRight, X } from "lucide-react"
import type { AICategory, Article } from "@/src/lib/types/ai-engineering"
import { ArticleCard } from "@/src/components/ai-engineering/ArticleCard"
import { CategoryCard } from "@/src/components/ai-engineering/CategoryCard"
import { Tag } from "@/src/components/ai-engineering/Tag"
import { LabNav } from "@/src/components/lab/ui/LabNav"
import { LabPathHeader } from "@/src/components/lab/ui/LabPathHeader"

export function AIEngineeringHubClient({
    articles,
    categories,
    allTags,
    allTechnologies,
    promptCount,
    snippetCount,
}: {
    articles: Article[]
    categories: AICategory[]
    allTags: string[]
    allTechnologies: string[]
    promptCount: number
    snippetCount: number
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const activeCategory = searchParams.get("category")
    const categoryBySlug = useMemo(() => new Map(categories.map((c) => [c.slug, c])), [categories])

    const [query, setQuery] = useState("")
    const [activeTag, setActiveTag] = useState<string | null>(null)
    const [activeTech, setActiveTech] = useState<string | null>(null)
    const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null)

    function setCategory(slug: string | null) {
        const params = new URLSearchParams(searchParams.toString())
        if (slug) params.set("category", slug)
        else params.delete("category")
        router.push(`${pathname}${params.toString() ? `?${params}` : ""}`, { scroll: false })
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return articles.filter((a) => {
            if (activeCategory && a.category !== activeCategory) return false
            if (activeTag && !a.tags.includes(activeTag)) return false
            if (activeTech && !a.technologies.includes(activeTech)) return false
            if (activeDifficulty && a.difficulty !== activeDifficulty) return false
            if (!q) return true
            return (
                a.title.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q) ||
                a.tags.some((t) => t.toLowerCase().includes(q)) ||
                a.technologies.some((t) => t.toLowerCase().includes(q))
            )
        })
    }, [articles, query, activeCategory, activeTag, activeTech, activeDifficulty])

    const featured = articles.filter((a) => a.featured)
    const hasActiveFilters = !!(activeCategory || activeTag || activeTech || activeDifficulty || query)

    function clearFilters() {
        setQuery("")
        setActiveTag(null)
        setActiveTech(null)
        setActiveDifficulty(null)
        setCategory(null)
    }

    return (
        <div className="px-4 md:px-8 py-10 max-w-6xl mx-auto">
            <LabNav active="ai" />
            <LabPathHeader
                label="AI Engineering"
                title="AI-assisted engineering, not AI engineering"
                description="AI accelerates development, but engineers remain responsible for architecture, quality, security, and business logic. Here's how I use Claude Code and Codex as a collaborator — not a replacement — while building with Java, Spring Boot, MyBatis, and PostgreSQL."
                accent="warning"
            />

            {/* Quick links */}
            <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Link
                    href="/ai-engineering/prompts"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 hover:border-border-strong transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <MessageSquareCode size={18} className="text-brand" />
                        <div>
                            <p className="text-sm font-semibold text-fg">Prompt Library</p>
                            <p className="text-xs text-fg-muted">{promptCount} copy-ready prompts for real backend work</p>
                        </div>
                    </div>
                </Link>
                <Link
                    href="/ai-engineering/snippets"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 hover:border-border-strong transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <FileCode2 size={18} className="text-brand" />
                        <div>
                            <p className="text-sm font-semibold text-fg">Code Snippets</p>
                            <p className="text-xs text-fg-muted">{snippetCount} snippets — MyBatis, idempotency, Thymeleaf patterns</p>
                        </div>
                    </div>
                </Link>
                <Link
                    href="/lab/devops"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 hover:border-border-strong transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-success" />
                        <div>
                            <p className="text-sm font-semibold text-fg">DevOps Basics</p>
                            <p className="text-xs text-fg-muted">Docker, CI/CD, and deployment for backend devs</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* How I use AI — compact workflow, not a claim of expertise */}
            <section className="mb-12 rounded-2xl border border-border bg-surface px-5 py-6 md:px-8 md:py-8">
                <h2 className="text-lg font-bold text-fg">How I Use AI in Engineering</h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                        { step: "Understand", detail: "Analyze requirements and unfamiliar code." },
                        { step: "Plan", detail: "Create implementation steps and identify risks." },
                        { step: "Implement", detail: "Use AI assistance while maintaining existing architecture." },
                        { step: "Verify", detail: "Run tests, inspect diffs, and manually validate behavior." },
                        { step: "Document", detail: "Update technical notes, READMEs, and project guidance." },
                    ].map((item, i) => (
                        <div key={item.step}>
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
                                {String(i + 1).padStart(2, "0")}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-fg">{item.step}</p>
                            <p className="mt-1 text-xs leading-relaxed text-fg-secondary">{item.detail}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-fg-muted">
                    AI assists the workflow; architecture decisions, verification, and final code quality remain my
                    responsibility.
                </p>
            </section>

            {/* Categories */}
            <section className="mb-12">
                <h2 className="mb-4 text-lg font-bold text-fg">Browse by category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((cat) => (
                        <CategoryCard
                            key={cat.slug}
                            category={cat}
                            count={articles.filter((a) => a.category === cat.slug).length}
                        />
                    ))}
                </div>
            </section>

            {/* Featured */}
            {!hasActiveFilters && featured.length > 0 && (
                <section className="mb-12">
                    <h2 className="mb-4 text-lg font-bold text-fg">Featured</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featured.map((article) => (
                            <ArticleCard key={article.slug} article={article} category={categoryBySlug.get(article.category)} />
                        ))}
                    </div>
                </section>
            )}

            {/* Search + filters */}
            <section>
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-fg">All articles</h2>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-xs font-medium text-fg-muted hover:text-fg transition-colors"
                        >
                            <X size={12} /> Clear filters
                        </button>
                    )}
                </div>

                <div className="relative mb-4">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title, tag, or technology..."
                        aria-label="Search articles"
                        className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-muted outline-none focus:border-brand transition-colors"
                    />
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                    {(["beginner", "intermediate", "advanced"] as const).map((d) => (
                        <Tag
                            key={d}
                            label={d[0].toUpperCase() + d.slice(1)}
                            active={activeDifficulty === d}
                            onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
                        />
                    ))}
                    <span className="mx-1 w-px bg-surface-elevated" />
                    {allTechnologies.map((tech) => (
                        <Tag key={tech} label={tech} active={activeTech === tech} onClick={() => setActiveTech(activeTech === tech ? null : tech)} />
                    ))}
                </div>

                <div className="mb-6 flex flex-wrap gap-1.5">
                    {allTags.map((tag) => (
                        <Tag key={tag} label={tag} active={activeTag === tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} />
                    ))}
                </div>

                {activeCategory && (
                    <div className="mb-5 flex items-center gap-2 text-xs text-fg-muted">
                        Filtered by category:
                        <Tag label={categories.find((c) => c.slug === activeCategory)?.title || activeCategory} active onClick={() => setCategory(null)} />
                    </div>
                )}

                {filtered.length === 0 ? (
                    <div className="py-16 text-center text-sm text-fg-muted">No articles match your filters yet.</div>
                ) : (
                    <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((article) => (
                                <motion.div
                                    key={article.slug}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ArticleCard article={article} category={categoryBySlug.get(article.category)} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </section>

            {/* Back to the unified hub */}
            <Link
                href="/lab"
                className="group mt-14 flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 hover:border-border-strong transition-colors"
            >
                <span className="text-sm font-medium text-fg-secondary group-hover:text-fg">
                    Search across AI Engineering and DevOps Basics together in Engineering Lab
                </span>
                <ArrowRight size={13} className="text-border-strong group-hover:text-brand group-hover:translate-x-1 transition-all shrink-0 ml-3" />
            </Link>
        </div>
    )
}
