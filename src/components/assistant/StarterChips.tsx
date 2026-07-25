"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { AUDIENCES, VISIBLE_CHIP_COUNT, pagePrompts, promptsForAudience, type PromptAudience } from "./starter-questions"
import type { PageContext } from "@/src/lib/ai/page-context"

interface StarterChipsProps {
    onSelect: (prompt: string) => void
    disabled?: boolean
    /** Current page context — shows curated page-aware prompts instead of the audience switcher when available. */
    page?: PageContext
}

/** Suggested questions shown when the conversation is empty. */
export function StarterChips({ onSelect, disabled, page }: StarterChipsProps) {
    const reduceMotion = useReducedMotion()
    const [audience, setAudience] = useState<PromptAudience>("general")
    const [showAll, setShowAll] = useState(false)

    const pageQuestions = page ? pagePrompts[page] : undefined
    const questions = pageQuestions ?? promptsForAudience(audience)
    const visible = showAll ? questions : questions.slice(0, VISIBLE_CHIP_COUNT)

    return (
        <div className="space-y-2.5">
            {!pageQuestions && (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Question category">
                    {AUDIENCES.map((a) => (
                        <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                                setAudience(a.id)
                                setShowAll(false)
                            }}
                            aria-pressed={audience === a.id}
                            disabled={disabled}
                            className={`min-h-8 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 ${
                                audience === a.id
                                    ? "bg-brand text-brand-foreground"
                                    : "bg-surface-hover text-fg-muted hover:text-fg-secondary"
                            }`}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
                {visible.map((question, index) => (
                    <motion.button
                        key={question.id}
                        type="button"
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : 0.05 * index, duration: 0.25 }}
                        onClick={() => onSelect(question.prompt)}
                        disabled={disabled}
                        className="min-h-10 rounded-full border border-border bg-background/60 px-3 py-2 text-xs font-medium text-fg-secondary transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50"
                    >
                        {question.label}
                    </motion.button>
                ))}

                {!showAll && questions.length > VISIBLE_CHIP_COUNT && (
                    <button
                        type="button"
                        onClick={() => setShowAll(true)}
                        disabled={disabled}
                        className="min-h-10 rounded-full px-3 py-2 text-xs font-medium text-fg-muted underline underline-offset-2 transition-colors hover:text-fg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50"
                    >
                        More questions
                    </button>
                )}
            </div>
        </div>
    )
}
