import React from "react"
import { cn } from "@/src/lib/utils/utils"
import { Container } from "@/src/components/system/Container"
import { Eyebrow } from "@/src/components/system/Eyebrow"
import { SectionHeading } from "@/src/components/system/SectionHeading"
import { Reveal } from "@/src/components/system/Reveal"

interface SectionProps {
    id?: string
    eyebrow?: string
    title?: string
    description?: string
    revealHeader?: boolean
    className?: string
    /** "split" pins the header in a left column on large screens and puts the content beside it — for narrow, text-led content (prose, timelines) that would otherwise leave the right half of the page empty. */
    layout?: "stacked" | "split"
    children: React.ReactNode
}

/** Full-width page section with the editorial vertical rhythm and an optional header. */
export function Section({ id, eyebrow, title, description, revealHeader = false, className, layout = "stacked", children }: SectionProps) {
    const split = layout === "split"
    const header = (
        <div className={cn("mb-12 max-w-2xl md:mb-16", split && "lg:mb-0")}>
            {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
            {title && <SectionHeading className={split ? "lg:text-5xl" : undefined}>{title}</SectionHeading>}
            {description && (
                <p className="mt-4 text-base leading-relaxed text-fg-secondary sm:text-lg">
                    {description}
                </p>
            )}
        </div>
    )

    return (
        <section id={id} className={cn("scroll-mt-16 py-section", className)}>
            <Container>
                {split ? (
                    <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-16">
                        {/* Stretched column + sticky inner wrapper: the header stays in view while a long timeline scrolls past it. */}
                        <div className="lg:col-span-5 lg:self-stretch">
                            <div className="lg:sticky lg:top-24">
                                {(eyebrow || title) && (revealHeader ? <Reveal>{header}</Reveal> : header)}
                            </div>
                        </div>
                        <div className="min-w-0 lg:col-span-7">{children}</div>
                    </div>
                ) : (
                    <>
                        {(eyebrow || title) && (revealHeader ? <Reveal>{header}</Reveal> : header)}
                        {children}
                    </>
                )}
            </Container>
        </section>
    )
}
