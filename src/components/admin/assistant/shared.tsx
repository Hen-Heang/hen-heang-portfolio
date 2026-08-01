import { Loader2 } from "lucide-react"
import type { KnowledgeCategory } from "@/data/knowledge"

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
    "profile", "positioning", "experience", "career", "projects",
    "skills", "ai-engineering", "articles", "contact", "faq",
]

export function LoadingState() {
    return (
        <div className="flex items-center justify-center py-12 text-[#52525b]">
            <Loader2 size={16} className="animate-spin" />
        </div>
    )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
    return <p className="text-center py-12 text-[#52525b] text-sm">{children}</p>
}

export function ErrorBanner({ message }: { message: string }) {
    return (
        <p className="mx-5 mt-4 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {message}
        </p>
    )
}

export function SuccessBanner({ message }: { message: string }) {
    return (
        <p className="mx-5 mt-4 text-emerald-400 text-xs bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">
            {message}
        </p>
    )
}

const TONE_CLASS = {
    neutral: "bg-[#27272a] text-[#a1a1aa]",
    positive: "bg-emerald-400/10 text-emerald-400",
    negative: "bg-red-400/10 text-red-400",
    warning: "bg-amber-400/10 text-amber-400",
} as const

export function Badge({ tone, children }: { tone: keyof typeof TONE_CLASS; children: React.ReactNode }) {
    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${TONE_CLASS[tone]}`}>
            {children}
        </span>
    )
}

/** Renders untrusted text (GitHub-sourced chunk content, visitor-submitted corrections) as an inert text node — never dangerouslySetInnerHTML, so it can never execute as HTML/script regardless of what it contains. Truncates for preview purposes, not as a security measure. */
export function SafeTextPreview({ text, maxLength = 500 }: { text: string; maxLength?: number }) {
    const truncated = text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
    return <p className="whitespace-pre-wrap break-words text-[#a1a1aa] text-xs leading-relaxed">{truncated}</p>
}

export function formatTimestamp(value: string | null): string {
    if (!value) return "never"
    return new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}
