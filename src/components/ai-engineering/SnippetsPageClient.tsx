"use client"

import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { Search } from "lucide-react"
import type { Snippet } from "@/src/lib/types/ai-engineering"
import { SnippetCard } from "@/src/components/ai-engineering/SnippetCard"
import { Tag } from "@/src/components/ai-engineering/Tag"

export function SnippetsPageClient({ snippets, allTags }: { snippets: Snippet[]; allTags: string[] }) {
    const [query, setQuery] = useState("")
    const [activeTag, setActiveTag] = useState<string | null>(null)

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return snippets.filter((s) => {
            if (activeTag && !s.tags.includes(activeTag)) return false
            if (!q) return true
            return s.title.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q))
        })
    }, [snippets, query, activeTag])

    return (
        <div className="px-4 md:px-8 py-10 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
                <h1 className="mb-1 text-3xl md:text-4xl font-bold tracking-tight text-fg">Code Snippets</h1>
                <p className="max-w-2xl text-sm md:text-base leading-relaxed text-fg-secondary">
                    Reusable patterns I keep pasting into new projects — MyBatis dynamic SQL, idempotency, Thymeleaf fragments.
                </p>
            </motion.div>

            <div className="relative mb-4">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search snippets..."
                    aria-label="Search snippets"
                    className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-muted outline-none focus:border-brand transition-colors"
                />
            </div>

            <div className="mb-8 flex flex-wrap gap-1.5">
                <Tag label="All" active={activeTag === null} onClick={() => setActiveTag(null)} />
                {allTags.map((tag) => (
                    <Tag key={tag} label={tag} active={activeTag === tag} onClick={() => setActiveTag(tag)} />
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="py-16 text-center text-sm text-fg-muted">No snippets match your search.</div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {filtered.map((snippet) => (
                        <SnippetCard key={snippet.id} snippet={snippet} />
                    ))}
                </div>
            )}
        </div>
    )
}
