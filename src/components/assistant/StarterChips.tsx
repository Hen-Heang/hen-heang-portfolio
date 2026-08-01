"use client"

import { useCallback, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { RefreshCw } from "lucide-react"

import {
    VISIBLE_CHIP_COUNT,
    pagePrompts,
    primaryQuestions,
    secondaryQuestions,
    type AssistantStarterPrompt
} from "./starter-questions"
import type { PageContext } from "@/src/lib/ai/page-context"

interface StarterChipsProps {
    onSelect: (prompt: string) => void
    disabled?: boolean
    page?: PageContext
}

function shuffle<T>(array: T[]): T[] {
    const copy = [...array]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

/** Suggested questions shown when the conversation is empty. */
export function StarterChips({ onSelect, disabled, page }: StarterChipsProps) {
    const reduceMotion = useReducedMotion()
    const [rotationKey, setRotationKey] = useState(0)
    // The shuffle is computed in the click handler, not during render: picking
    // it in a `useMemo` made rendering impure, so React could resample the
    // chips on any incidental re-render (and produce different markup on the
    // server than on the client).
    const [rotated, setRotated] = useState<AssistantStarterPrompt[] | null>(null)

    const rotate = useCallback(() => {
        const shuffledSecondary = shuffle(secondaryQuestions)
        const nextQuestions = [
            primaryQuestions[Math.floor(Math.random() * primaryQuestions.length)],
            ...shuffledSecondary.slice(0, VISIBLE_CHIP_COUNT - 1)
        ]
        setRotated(shuffle(nextQuestions))
        setRotationKey(k => k + 1)
    }, [])

    const visible: AssistantStarterPrompt[] =
        (page && pagePrompts[page]) ||
        rotated ||
        primaryQuestions.slice(0, VISIBLE_CHIP_COUNT)

    return (
        <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Suggested questions">
                {visible.map((question, index) => (
                    <motion.button
                        key={`${rotationKey}-${question.id}`}
                        type="button"
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : 0.05 * index, duration: 0.25 }}
                        onClick={() => onSelect(question.prompt)}
                        disabled={disabled}
                        className="min-h-[44px] rounded-full border border-slate-400/15 bg-[#11182B] px-3.5 py-2 text-[13px] font-medium text-[#94A3B8] transition-colors hover:border-[#4285F4]/40 hover:bg-[#4285F4]/10 hover:text-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285F4] disabled:pointer-events-none disabled:opacity-50"
                    >
                        {question.label}
                    </motion.button>
                ))}

                {!page && (
                    <button
                        type="button"
                        onClick={rotate}
                        disabled={disabled}
                        aria-label="More questions"
                        className="flex min-h-[44px] w-[44px] items-center justify-center rounded-full text-[#94A3B8] transition-colors hover:bg-[#11182B] hover:text-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285F4] disabled:pointer-events-none disabled:opacity-50"
                    >
                        <RefreshCw size={14} />
                    </button>
                )}
            </div>
        </div>
    )
}
