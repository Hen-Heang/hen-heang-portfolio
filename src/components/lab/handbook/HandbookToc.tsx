"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"

export interface TocSection {
    id: string
    number: string
    title: string
}

export interface TocPart {
    id: string
    number: string
    title: string
    sections: TocSection[]
}

function TocLinks({ parts, activeId, onNavigate }: { parts: TocPart[]; activeId: string | null; onNavigate?: () => void }) {
    return (
        <div className="mt-3 space-y-4">
            {parts.map((part) => (
                <div key={part.id}>
                    <p className="px-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-muted">
                        Part {part.number}. {part.title}
                    </p>
                    <ul className="mt-1.5 space-y-0.5">
                        {part.sections.map((section) => (
                            <li key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    onClick={onNavigate}
                                    aria-current={activeId === section.id ? "location" : undefined}
                                    className={`block rounded-md px-2 py-1.5 text-[13px] leading-5 transition-colors ${
                                        activeId === section.id
                                            ? "bg-brand/10 font-medium text-brand"
                                            : "text-fg-secondary hover:bg-surface-hover hover:text-fg"
                                    }`}
                                >
                                    <span className="mr-1.5 font-mono text-fg-muted">{section.number}.</span>
                                    {section.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )
}

/**
 * Numbered table of contents for the handbook, grouped by part. Scroll-spy
 * follows the same pattern as OnPageNav — an observer band near the top of the
 * viewport — but the grouped, numbered shape is what makes a long reference
 * document navigable, so it does not reuse that component.
 */
export function HandbookToc({ parts }: { parts: TocPart[] }) {
    const [activeId, setActiveId] = useState<string | null>(null)
    const sectionCount = parts.reduce((total, part) => total + part.sections.length, 0)

    useEffect(() => {
        const ids = parts.flatMap((part) => part.sections.map((section) => section.id))
        if (ids.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((entry) => entry.isIntersecting)
                if (visible.length > 0) setActiveId(visible[0].target.id)
            },
            { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
        )

        const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
        elements.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [parts])

    if (sectionCount === 0) return null

    return (
        <>
            <details className="group mb-8 rounded-2xl border border-border bg-surface p-4 xl:hidden">
                <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between gap-3 marker:content-none">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
                        Contents · {sectionCount} sections
                    </span>
                    <ChevronDown size={14} className="text-fg-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <TocLinks parts={parts} activeId={activeId} />
            </details>

            {/* h-full matters: the sticky child can only travel inside its
                containing block, so the nav has to stretch to the grid row's
                height or the rail scrolls away partway down the document. */}
            <nav aria-label="Handbook contents" className="hidden h-full xl:block">
                <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-4">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-fg-muted">Contents</p>
                    <TocLinks parts={parts} activeId={activeId} />
                </div>
            </nav>
        </>
    )
}
