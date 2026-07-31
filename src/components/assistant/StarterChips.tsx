"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { VISIBLE_CHIP_COUNT, pagePrompts, promptsForAudience } from "./starter-questions"
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
    const [showAll, setShowAll] = useState(false)

    const pageQuestions = page ? pagePrompts[page] : undefined
    const questions = pageQuestions ?? promptsForAudience("general")
    const visible = showAll ? questions : questions.slice(0, VISIBLE_CHIP_COUNT)

    return (
        <div className="space-y-2.5">


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
                        className="min-h-10 rounded-full border border-slate-400/15 bg-[#11182B] px-3 py-2 text-[13px] font-medium text-[#94A3B8] transition-colors hover:border-[#4285F4]/40 hover:bg-[#4285F4]/10 hover:text-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285F4] disabled:pointer-events-none disabled:opacity-50"
                    >
                        {question.label}
                    </motion.button>
                ))}

                {!showAll && questions.length > VISIBLE_CHIP_COUNT && (
                    <button
                        type="button"
                        onClick={() => setShowAll(true)}
                        disabled={disabled}
                        className="min-h-10 rounded-full px-3 py-2 text-[13px] font-medium text-[#94A3B8] underline underline-offset-2 transition-colors hover:text-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285F4] disabled:pointer-events-none disabled:opacity-50"
                    >
                        More questions
                    </button>
                )}
            </div>
        </div>
    )
}
