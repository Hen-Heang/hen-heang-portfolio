import React from "react"
import { Section } from "@/src/components/system/Section"
import { TextLink } from "@/src/components/system/TextLink"
import { Reveal } from "@/src/components/system/Reveal"
import { progressItems } from "@/data/progress"

/** Backend, AI-assisted development, and Korean — the three most relevant to a backend-hiring recruiter. DevOps stays on /journey with the full set. */
const HOMEPAGE_FOCUS_IDS = ["backend", "ai", "korean"] as const

function formatUpdatedAt(value: string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`))
}

/**
 * Compact, text-first current-focus list — replaces the four tall MagicCard
 * panels that used to sit above professional proof. Full milestone detail
 * stays on /journey; this is three lines, not four cards.
 */
export function CurrentFocus({
    embedded = false,
}: { embedded?: boolean } = {}) {
    const items = HOMEPAGE_FOCUS_IDS.map((id) =>
        progressItems.find((item) => item.id === id),
    ).filter(
        (item): item is (typeof progressItems)[number] => item !== undefined,
    )

    if (items.length === 0) return null

    const content = (
        <>
            <ul className="border-y border-border">
                {items.map((item, index) => (
                    <li
                        key={item.id}
                        className="border-b border-border last:border-b-0"
                    >
                        <Reveal delay={index * 0.06}>
                            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                                <div>
                                    <p className="font-medium text-fg">
                                        {item.title}
                                    </p>
                                    <p className="mt-1 text-sm text-fg-secondary">
                                        {item.currentFocus}
                                    </p>
                                </div>
                                <time
                                    dateTime={item.updatedAt}
                                    className="shrink-0 font-mono text-xs text-fg-muted"
                                >
                                    Updated {formatUpdatedAt(item.updatedAt)}
                                </time>
                            </div>
                        </Reveal>
                    </li>
                ))}
            </ul>

            <div className="mt-8">
                <TextLink href="/journey">View learning journey</TextLink>
            </div>
        </>
    )

    if (embedded) return content

    return (
        <Section
            id="current-focus"
            eyebrow="Current Focus"
            title="What I’m actively improving"
            description="Backend depth first, plus the workflow and communication skills that support it."
            className="bg-surface"
            revealHeader
        >
            {content}
        </Section>
    )
}
