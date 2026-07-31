"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react"
import type { UIMessage } from "ai"

import { MarkdownContent } from "./MarkdownContent"
import { messageText } from "./history"

interface MessageBubbleProps {
    message: UIMessage
    /** Hide the copy button while this message is still streaming in. */
    isStreaming?: boolean
    onFeedback?: (vote: "up" | "down") => void
}

export function MessageBubble({ message, isStreaming, onFeedback }: MessageBubbleProps) {
    const [copied, setCopied] = useState(false)
    const [vote, setVote] = useState<"up" | "down" | null>(null)
    const reduceMotion = useReducedMotion()
    const isUser = message.role === "user"
    const text = messageText(message)

    const submitVote = (next: "up" | "down") => {
        if (vote) return
        setVote(next)
        onFeedback?.(next)
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
        } catch {
            // Clipboard blocked (permissions/insecure context) — nothing to do.
        }
    }

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`group flex flex-col ${isUser ? "items-end" : "items-start"}`}
        >
            <div
                className={
                    isUser
                        ? "max-w-[85%] rounded-2xl rounded-br-md bg-[#11182B] border border-[#4285F4]/20 px-4 py-2.5 text-[14px] leading-relaxed text-[#F8FAFC] whitespace-pre-wrap break-words shadow-sm"
                        : "max-w-[95%] py-1 text-[#F8FAFC]"
                }
            >
                {isUser ? text : <MarkdownContent text={text} />}
            </div>

            {!isUser && !isStreaming && text.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-[11px] text-[#94A3B8] opacity-0 transition-all focus-within:opacity-100 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={copy}
                        aria-label={copied ? "Response copied" : "Copy response"}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-slate-800/50 hover:text-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4285F4]"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-green-400" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                        {copied ? "Copied" : "Copy"}
                    </button>

                    {onFeedback && (
                        vote ? (
                            <span className="px-1.5 py-1">Thanks for the feedback</span>
                        ) : (
                            <span className="inline-flex items-center gap-1" role="group" aria-label="Was this helpful?">
                                <span className="hidden sm:inline">Helpful?</span>
                                <button
                                    type="button"
                                    onClick={() => submitVote("up")}
                                    aria-label="This answer was helpful"
                                    className="rounded-md p-1 transition-colors hover:bg-slate-800/50 hover:text-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4285F4]"
                                >
                                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => submitVote("down")}
                                    aria-label="This answer was not helpful"
                                    className="rounded-md p-1 transition-colors hover:bg-slate-800/50 hover:text-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4285F4]"
                                >
                                    <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
                                </button>
                            </span>
                        )
                    )}
                </div>
            )}
        </motion.div>
    )
}
