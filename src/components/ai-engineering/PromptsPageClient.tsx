"use client"

import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { Search } from "lucide-react"
import type { Prompt } from "@/src/lib/types/ai-engineering"
import { promptCategoryLabels } from "@/data/ai-engineering/prompts"
import { PromptCard } from "@/src/components/ai-engineering/PromptCard"
import { Tag } from "@/src/components/ai-engineering/Tag"

export function PromptsPageClient({ prompts }: { prompts: Prompt[] }) {
    const [query, setQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    const categoryEntries = Object.entries(promptCategoryLabels) as [Prompt["category"], string][]

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return prompts.filter((p) => {
            if (activeCategory && p.category !== activeCategory) return false
            if (!q) return true
            return (
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.tags.some((t) => t.toLowerCase().includes(q))
            )
        })
    }, [prompts, query, activeCategory])

    return (
        <div className="px-4 md:px-8 py-10 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
                <h1 className="mb-1 text-3xl md:text-4xl font-bold tracking-tight text-fg">Prompt Library</h1>
                <p className="max-w-2xl text-sm md:text-base leading-relaxed text-fg-secondary">
                    Prompts I actually reach for — each one has a copy button, expected output, and the best practice behind it.
                </p>
            </motion.div>

            <div className="relative mb-4">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search prompts..."
                    aria-label="Search prompts"
                    className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-muted outline-none focus:border-brand transition-colors"
                />
            </div>

            <div className="mb-8 flex flex-wrap gap-1.5">
                <Tag label="All" active={activeCategory === null} onClick={() => setActiveCategory(null)} />
                {categoryEntries.map(([slug, label]) => (
                    <Tag key={slug} label={label} active={activeCategory === slug} onClick={() => setActiveCategory(slug)} />
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="py-16 text-center text-sm text-fg-muted">No prompts match your search.</div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {filtered.map((prompt) => (
                        <PromptCard key={prompt.id} prompt={prompt} />
                    ))}
                </div>
            )}
        </div>
    )
}
