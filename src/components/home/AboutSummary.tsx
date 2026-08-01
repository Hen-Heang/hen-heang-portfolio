import React from "react"
import { Section } from "@/src/components/system/Section"
import { Reveal } from "@/src/components/system/Reveal"
import { TextLink } from "@/src/components/system/TextLink"
import { positioning } from "@/src/lib/content/positioning"

/**
 * The homepage's About section — the same canonical narrative rendered on
 * /about, so the two never diverge. Kept to the narrative only; the photo,
 * timeline, and contact facts stay on /about rather than being repeated here.
 */
export function AboutSummary() {
    return (
        <Section
            id="about"
            eyebrow="About"
            title="Backend engineering, built on real business problems"
            revealHeader
        >
            <Reveal delay={0.05}>
                <div className="max-w-2xl space-y-5">
                    {positioning.about.map((paragraph) => (
                        <p
                            key={paragraph}
                            className="text-base leading-relaxed text-fg-secondary"
                        >
                            {paragraph}
                        </p>
                    ))}
                    <div className="pt-3">
                        <TextLink href="/about">
                            More about my background
                        </TextLink>
                    </div>
                </div>
            </Reveal>
        </Section>
    )
}
