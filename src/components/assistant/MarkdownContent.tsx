"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

/** Only http(s)/mailto links are ever rendered as clickable — blocks `javascript:`/`data:` and any other scheme a prompt-injected answer might try to slip in. */
const SAFE_HREF = /^(https?:|mailto:)/i

/**
 * Markdown renderer tuned for compact chat bubbles: tight spacing, accent
 * links that open in a new tab, and horizontally scrollable code blocks.
 * Kept dependency-light (no syntax highlighter) so the lazy-loaded widget
 * stays small.
 */
export function MarkdownContent({ text }: { text: string }) {
    return (
        <div className="text-sm leading-relaxed text-[#D1D5DB] space-y-3 break-words">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => <p>{children}</p>,
                    a: ({ href, children }) => {
                        if (!href || !SAFE_HREF.test(href)) return <span>{children}</span>
                        return (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#38BDF8] underline underline-offset-2 decoration-[#38BDF8]/40 hover:decoration-[#38BDF8]"
                            >
                                {children}
                            </a>
                        )
                    },
                    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-[#F8FAFC]">{children}</strong>,
                    h1: ({ children }) => <h3 className="text-sm font-semibold text-[#F8FAFC] mt-2 mb-1">{children}</h3>,
                    h2: ({ children }) => <h3 className="text-sm font-semibold text-[#F8FAFC] mt-2 mb-1">{children}</h3>,
                    h3: ({ children }) => <h4 className="text-sm font-semibold text-[#F8FAFC] mt-2 mb-1">{children}</h4>,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-[#4285F4]/40 pl-3 text-[#94A3B8] italic">{children}</blockquote>
                    ),
                    code: ({ className, children }) => {
                        const isBlock = /language-/.test(className ?? "") || String(children).includes("\n")
                        if (isBlock) {
                            return (
                                <code className={`${className ?? ""} block font-mono text-xs`}>{children}</code>
                            )
                        }
                        return (
                            <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[#11182B] text-[#38BDF8] border border-slate-400/15">
                                {children}
                            </code>
                        )
                    },
                    pre: ({ children }) => (
                        <pre className="p-3 my-2 rounded-lg bg-[#0B1020] border border-slate-400/15 overflow-x-auto text-[13px] text-[#F8FAFC]">
                            {children}
                        </pre>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-2">
                            <table className="text-[13px] border-collapse [&_th]:border [&_th]:border-slate-400/15 [&_th]:bg-[#11182B] [&_th]:px-2.5 [&_th]:py-1.5 [&_td]:border [&_td]:border-slate-400/15 [&_td]:px-2.5 [&_td]:py-1.5">
                                {children}
                            </table>
                        </div>
                    ),
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    )
}
