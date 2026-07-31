"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { RefreshCw, RotateCcw, Send, Sparkles, Square, X } from "lucide-react"

import { MessageBubble } from "./MessageBubble"
import { StarterChips } from "./StarterChips"
import { TypingIndicator } from "./TypingIndicator"
import { clearAssistantHistory, loadAssistantHistory, saveAssistantHistory } from "./history"
import type { PageContext } from "@/src/lib/ai/page-context"
import { profileData } from "@/data/profile"

const MAX_INPUT_CHARS = 1_000
/** How close to the bottom (px) the user must be for auto-scroll to engage. */
const STICK_THRESHOLD = 80

/** Server errors arrive as JSON `{ error }` — fall back to a generic line. */
function friendlyError(error: Error | undefined): string {
    if (!error) return ""
    try {
        const parsed = JSON.parse(error.message) as { error?: string }
        if (typeof parsed.error === "string" && parsed.error.length > 0) return parsed.error
    } catch {
        // not JSON — use the fallback below
    }
    return "Something went wrong. Please try again in a moment."
}

/** Privacy-safe "was this helpful?" signal — vote, page, and the message id only, never the question/answer text. Best-effort; failures are silently ignored. */
function sendFeedback(vote: "up" | "down", page: PageContext, requestId: string): void {
    void fetch("/api/assistant-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote, page, requestId }),
        keepalive: true,
    }).catch(() => {})
}

interface AssistantPanelProps {
    onClose: () => void
    /** Coarse page-context hint (home/projects-index/project-detail/resume/articles/other) — a retrieval nudge, never treated as fact. */
    page?: PageContext
    /** Project slug when `page` is "project-detail". */
    projectSlug?: string
}

/**
 * Chat UI rendered inside the Radix Dialog.Content mounted by
 * AssistantWidget — dialog semantics (focus trap, Escape, focus
 * restoration) come from Radix; this component owns only the chat state.
 */
export default function AssistantPanel({ onClose, page = "other", projectSlug }: AssistantPanelProps) {
    // The panel only mounts after a click, so localStorage is available.
    const [initialMessages] = useState(loadAssistantHistory)

    const { messages, sendMessage, regenerate, status, stop, error, clearError, setMessages } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
            prepareSendMessagesRequest: ({ messages: reqMessages, trigger }) => ({
                body: {
                    messages: reqMessages,
                    page,
                    projectSlug,
                    // Regenerating after a failed/unsatisfying answer retries on the cost-sensitive fallback model.
                    preferFallback: trigger === "regenerate-message",
                },
            }),
        }),
        messages: initialMessages,
    })

    const [input, setInput] = useState("")
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const stickToBottom = useRef(true)

    const isBusy = status === "submitted" || status === "streaming"
    const lastMessage = messages[messages.length - 1]
    const showTyping = status === "submitted" || (status === "streaming" && lastMessage?.role !== "assistant")

    // Grow with multiline input up to the CSS max-height, then scroll.
    useEffect(() => {
        const input = inputRef.current
        if (!input) return
        input.style.height = "auto"
        input.style.height = `${Math.min(input.scrollHeight, 112)}px`
    }, [input])

    // Persist between turns; skip mid-stream so we don't write on every token.
    useEffect(() => {
        if (status === "ready" || status === "error") saveAssistantHistory(messages)
    }, [messages, status])

    // Auto-scroll while the user hasn't scrolled up to read something.
    useEffect(() => {
        const el = scrollRef.current
        if (el && stickToBottom.current) el.scrollTop = el.scrollHeight
    }, [messages, showTyping])

    const handleScroll = () => {
        const el = scrollRef.current
        if (!el) return
        stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD
    }

    const submit = useCallback(
        (text: string) => {
            const trimmed = text.trim()
            if (trimmed.length === 0 || trimmed.length > MAX_INPUT_CHARS || isBusy) return
            clearError()
            stickToBottom.current = true
            void sendMessage({ text: trimmed })
            setInput("")
        },
        [isBusy, clearError, sendMessage],
    )

    const retry = useCallback(() => {
        clearError()
        stickToBottom.current = true
        void regenerate()
    }, [clearError, regenerate])

    const clearConversation = () => {
        stop()
        clearError()
        setMessages([])
        clearAssistantHistory()
        inputRef.current?.focus()
    }

    const errorText = friendlyError(error)

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center gap-3 border-b border-border px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand">
                    <Sparkles className="h-[18px] w-[18px] text-brand-foreground" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold text-fg">Portfolio Assistant</h2>
                    <p className="truncate text-[11px] text-fg-muted">
                        Explore Hen Heang&apos;s experience, backend skills, projects, and career background.
                    </p>
                </div>
                {messages.length > 0 && (
                    <button
                        type="button"
                        onClick={clearConversation}
                        aria-label="Clear conversation"
                        title="Clear conversation"
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        <RotateCcw className="h-4 w-4" aria-hidden />
                    </button>
                )}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close assistant"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    <X className="h-4 w-4" aria-hidden />
                </button>
            </header>

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                role="log"
                aria-live="polite"
                aria-label="Conversation"
                className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
            >
                {messages.length === 0 && (
                    <div className="space-y-4">
                        <div className="space-y-3 rounded-2xl rounded-bl-md border border-border bg-background/60 px-4 py-3 text-sm leading-relaxed text-fg-secondary">
                            <p>
                                Hi! I can help you learn about Hen&apos;s backend experience, technical skills,
                                projects, and availability.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href="/resume"
                                    className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-fg-secondary transition-colors hover:border-brand/40 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                >
                                    View resume
                                </a>
                                <a
                                    href={`mailto:${profileData.email}`}
                                    className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-fg-secondary transition-colors hover:border-brand/40 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                >
                                    Contact Heang
                                </a>
                            </div>
                        </div>
                        <StarterChips onSelect={submit} disabled={isBusy} page={page} />
                    </div>
                )}

                {messages.map((message, index) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        isStreaming={status === "streaming" && index === messages.length - 1 && message.role === "assistant"}
                        onFeedback={
                            message.role === "assistant" && index === messages.length - 1
                                ? (vote) => sendFeedback(vote, page, message.id)
                                : undefined
                        }
                    />
                ))}

                {showTyping && <TypingIndicator />}

                {errorText && (
                    <div role="alert" className="space-y-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                        <p>{errorText}</p>
                        <button
                            type="button"
                            onClick={retry}
                            className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-background/60 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:text-red-400"
                        >
                            <RefreshCw className="h-3 w-3" aria-hidden />
                            Retry
                        </button>
                    </div>
                )}
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault()
                    submit(input)
                }}
                className="border-t border-border px-3 pt-2"
                style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
                <div className="flex items-end gap-2 rounded-2xl border border-border bg-background/60 px-3 py-2">
                    <label htmlFor="assistant-input" className="sr-only">
                        Ask a question about Heang
                    </label>
                    <textarea
                        id="assistant-input"
                        ref={inputRef}
                        value={input}
                        onChange={(event) => setInput(event.target.value.slice(0, MAX_INPUT_CHARS))}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault()
                                submit(input)
                            }
                        }}
                        rows={1}
                        maxLength={MAX_INPUT_CHARS}
                        placeholder="Ask about my projects or experience…"
                        className="max-h-28 min-h-8 flex-1 resize-none overflow-y-auto bg-transparent py-1 text-sm leading-relaxed text-fg outline-none placeholder:text-fg-muted"
                    />
                    {isBusy ? (
                        <button
                            type="button"
                            onClick={() => stop()}
                            aria-label="Stop generating"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-hover text-fg-secondary transition-colors hover:bg-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            <Square className="h-4 w-4" aria-hidden />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={input.trim().length === 0}
                            aria-label="Send message"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-40"
                        >
                            <Send className="h-4 w-4" aria-hidden />
                        </button>
                    )}
                </div>
                <p className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-fg-muted">
                    <span>Answers are generated from Hen Heang&apos;s public portfolio data — may be imperfect.</span>
                    {input.length > MAX_INPUT_CHARS * 0.8 && (
                        <span aria-live="polite">{MAX_INPUT_CHARS - input.length} left</span>
                    )}
                </p>
            </form>
        </div>
    )
}
