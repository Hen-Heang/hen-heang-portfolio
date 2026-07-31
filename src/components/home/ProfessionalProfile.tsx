import React from "react"
import { Section } from "@/src/components/system/Section"
import { Reveal } from "@/src/components/system/Reveal"
import { ProfessionalExperienceContent } from "@/src/components/home/ProfessionalExperience"
import { TechnicalCapabilitiesContent } from "@/src/components/home/TechnicalCapabilities"
import type { ExperienceItem } from "@/src/lib/types"

export function ProfessionalProfile({
    experience,
}: {
    experience: ExperienceItem[]
}) {
    return (
        <Section
            id="profile"
            eyebrow="Professional Profile"
            title="Backend experience with product context"
            description="Enterprise delivery with Java and Spring Boot, supported by the data, security, and product-integration skills needed to ship dependable systems."
            className="bg-surface"
            revealHeader
        >
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-16">
                <Reveal>
                    <div>
                        <p className="mb-8 text-lg font-semibold tracking-tight text-fg">
                            Experience
                        </p>
                        <ProfessionalExperienceContent
                            experience={experience}
                        />
                    </div>
                </Reveal>
                <Reveal delay={0.06}>
                    <div className="border-t border-border pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                        <p className="mb-8 text-lg font-semibold tracking-tight text-fg">
                            Technical scope
                        </p>
                        <TechnicalCapabilitiesContent />
                    </div>
                </Reveal>
            </div>
        </Section>
    )
}
