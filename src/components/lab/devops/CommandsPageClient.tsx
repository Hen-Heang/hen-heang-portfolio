"use client"

import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { Search } from "lucide-react"
import type { CommandCategory } from "@/src/lib/types/devops-lab"
import { CommandCard } from "@/src/components/lab/devops/CommandCard"
import { Tag } from "@/src/components/ai-engineering/Tag"

export function CommandsPageClient({ categories }: { categories: CommandCategory[] }) {
    const [query, setQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return categories
            .filter((c) => !activeCategory || c.category === activeCategory)
            .map((c) => ({
                ...c,
                commands: c.commands.filter(
                    (cmd) =>
                        !q ||
                        cmd.name.toLowerCase().includes(q) ||
                        cmd.description.toLowerCase().includes(q) ||
                        cmd.example.toLowerCase().includes(q)
                ),
            }))
            .filter((c) => c.commands.length > 0)
    }, [categories, query, activeCategory])

    return (
        <div className="px-4 md:px-8 py-10 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
                <h1 className="mb-1 text-3xl md:text-4xl font-bold tracking-tight text-fg">Command Reference</h1>
                <p className="max-w-2xl text-base md:text-lg leading-relaxed text-fg-secondary">Searchable Git, Docker, Linux, Maven, and PostgreSQL commands with copy buttons.</p>
            </motion.div>

            <div className="relative mb-4">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search commands..."
                    aria-label="Search commands"
                    className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-base text-fg placeholder:text-fg-muted outline-none focus:border-brand transition-colors"
                />
            </div>

            <div className="mb-8 flex flex-wrap gap-1.5">
                <Tag label="All" active={activeCategory === null} onClick={() => setActiveCategory(null)} />
                {categories.map((c) => (
                    <Tag key={c.category} label={c.category} active={activeCategory === c.category} onClick={() => setActiveCategory(c.category)} />
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="py-16 text-center text-base text-fg-muted">No commands match your search.</div>
            ) : (
                <div className="space-y-8">
                    {filtered.map((c) => (
                        <section key={c.category}>
                            <h2 className="mb-3 text-base font-bold uppercase tracking-wider text-brand">{c.category}</h2>
                            <div className="grid md:grid-cols-2 gap-3">
                                {c.commands.map((cmd) => (
                                    <CommandCard key={cmd.name} entry={cmd} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    )
}
