import React from "react"
import { Section } from "@/src/components/system/Section"
import { Reveal } from "@/src/components/system/Reveal"
import { EngineeringLabPreview } from "@/src/components/home/EngineeringLabPreview"
import { CurrentFocus } from "@/src/components/home/CurrentFocus"
import type { Article } from "@/src/lib/types/ai-engineering"

export function EngineeringGrowth({ articles }: { articles: Article[] }) {
    return (
        <Section
            id="growth"
            eyebrow="Engineering Growth"
            title="Learning tied to real systems"
            description="Public backend notes and a concise view of the skills I’m actively strengthening."
            revealHeader
        >
            <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
                <Reveal>
                    <div>
                        <h3 className="mb-6 text-lg font-semibold tracking-tight text-fg">
                            From the lab
                        </h3>
                        <EngineeringLabPreview articles={articles} embedded />
                    </div>
                </Reveal>
                <Reveal delay={0.06}>
                    <div>
                        <h3 className="mb-6 text-lg font-semibold tracking-tight text-fg">
                            Current focus
                        </h3>
                        <CurrentFocus embedded />
                    </div>
                </Reveal>
            </div>
        </Section>
    )
}
