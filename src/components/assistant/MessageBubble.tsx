"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowRight, BriefcaseBusiness, Check, Code2, Copy, FlaskConical, FolderGit2, ThumbsDown, ThumbsUp } from "lucide-react"

import { MarkdownContent } from "./MarkdownContent"
import { messagePortfolioMeta, messageText } from "./history"
import type { EvidenceItem, EvidenceType, PortfolioUIMessage, SkillStatus } from "@/src/lib/ai/response-schema"

interface MessageBubbleProps {
    message: PortfolioUIMessage
    /** Hide the copy button while this message is still streaming in. */
    isStreaming?: boolean
    onFeedback?: (vote: "up" | "down") => void
    /** Reuses the normal chat submit flow — present only on the latest, idle assistant message, so stale suggestions from earlier turns aren't offered as live actions. */
    onSuggestedQuestion?: (question: string) => void
}

const EVIDENCE_ICON: Record<EvidenceType, typeof FolderGit2> = {
    project: FolderGit2,
    experience: BriefcaseBusiness,
    lab: FlaskConical,
    skill: Code2,
}

const EVIDENCE_LABEL: Record<EvidenceType, string> = {
    project: "Project",
    experience: "Experience",
    lab: "Engineering Lab",
    skill: "Skill",
}

const EVIDENCE_LEVEL_LABEL: Record<EvidenceItem["evidenceLevel"], string> = {
    professional: "Professional experience",
    project: "Project implementation",
    demonstrated: "Studied & practiced",
    learning: "Currently learning",
}

const SKILL_STATUS_LABEL: Record<SkillStatus, string> = {
    primary: "Primary",
    "working-knowledge": "Working knowledge",
    learning: "Learning",
}

/** Deliberately distinct per status so a "learning" chip can never be mistaken for a primary skill at a glance. */
const SKILL_STATUS_STYLE: Record<SkillStatus, string> = {
    primary: "border-[#4285F4]/40 bg-[#4285F4]/10 text-[#F8FAFC]",
    "working-knowledge": "border-slate-400/20 bg-[#11182B] text-[#D1D5DB]",
    learning: "border-dashed border-slate-400/25 bg-transparent text-[#94A3B8]",
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
    const Icon = EVIDENCE_ICON[item.type]
    const body = (
        <>
            <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-[#94A3B8]">
                    <Icon className="h-3 w-3" aria-hidden />
                    {EVIDENCE_LABEL[item.type]}
                </span>
                {item.href && (
                    <ArrowRight className="h-3.5 w-3.5 text-[#94A3B8] transition-transform group-hover/card:translate-x-0.5 group-hover/card:text-[#F8FAFC]" aria-hidden />
                )}
            </div>
            <p className="mt-1.5 text-[13px] font-medium leading-snug text-[#F8FAFC]">{item.title}</p>
            {item.description && <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-[#94A3B8]">{item.description}</p>}
            <p className="mt-1.5 text-[10.5px] text-[#4285F4]/80">{EVIDENCE_LEVEL_LABEL[item.evidenceLevel]}</p>
        </>
    )

    const className =
        "group/card block rounded-xl border border-slate-400/15 bg-[#0B1020] px-3.5 py-3 transition-colors hover:border-[#4285F4]/30 hover:bg-[#11182B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285F4]"

    if (item.href) {
        return (
            <Link href={item.href} className={className}>
                {body}
            </Link>
        )
    }
    return <div className={className}>{body}</div>
}

function PortfolioMeta({ message, onSuggestedQuestion }: { message: PortfolioUIMessage; onSuggestedQuestion?: (question: string) => void }) {
    const meta = messagePortfolioMeta(message)
    if (!meta) return null
    const { evidence, skills, suggestedQuestions } = meta
    if (evidence.length === 0 && skills.length === 0 && suggestedQuestions.length === 0) return null

    return (
        <div className="mt-3 space-y-3">
            {evidence.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#94A3B8]">Related evidence</p>
                    <div className="space-y-2">
                        {evidence.map((item, index) => (
                            <EvidenceCard key={`${item.type}-${item.href ?? item.title}-${index}`} item={item} />
                        ))}
                    </div>
                </div>
            )}

            {skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Related skills">
                    {skills.map((skill) => (
                        <span
                            key={skill.name}
                            title={SKILL_STATUS_LABEL[skill.status]}
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11.5px] font-medium ${SKILL_STATUS_STYLE[skill.status]}`}
                        >
                            {skill.name}
                            {skill.status === "learning" && <span className="ml-1 text-[10px] text-[#94A3B8]">learning</span>}
                        </span>
                    ))}
                </div>
            )}

            {onSuggestedQuestion && suggestedQuestions.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#94A3B8]">You can also ask</p>
                    <div className="flex flex-col items-start gap-1">
                        {suggestedQuestions.map((question) => (
                            <button
                                key={question}
                                type="button"
                                onClick={() => onSuggestedQuestion(question)}
                                className="group/q inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-left text-[12.5px] text-[#94A3B8] transition-colors hover:text-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285F4]"
                            >
                                <ArrowRight className="h-3 w-3 shrink-0 text-[#4285F4] transition-transform group-hover/q:translate-x-0.5" aria-hidden />
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export function MessageBubble({ message, isStreaming, onFeedback, onSuggestedQuestion }: MessageBubbleProps) {
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
                {!isUser && <PortfolioMeta message={message} onSuggestedQuestion={onSuggestedQuestion} />}
            </div>

            {!isUser && !isStreaming && text.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-[11px] text-[#94A3B8] opacity-0 transition-all focus-within:opacity-100 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={copy}
                        aria-label={copied ? "Response copied" : "Copy response"}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-md px-3 transition-colors hover:bg-slate-800/50 hover:text-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4285F4]"
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
                                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-colors hover:bg-slate-800/50 hover:text-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4285F4]"
                                >
                                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => submitVote("down")}
                                    aria-label="This answer was not helpful"
                                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-colors hover:bg-slate-800/50 hover:text-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4285F4]"
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
