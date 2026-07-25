import React from "react"
import { Section } from "@/src/components/system/Section"
import { Reveal } from "@/src/components/system/Reveal"
import { capabilityGroups } from "@/data/capabilities"

/** Full technical scope in four groups — the one homepage section that lists the complete stack, so other sections can stay to a short, relevant subset. */
export function TechnicalCapabilities() {
    return (
        <Section
            eyebrow="Technical Capabilities"
            title="Full technical scope"
            description="Backend implementation first, with the data, AI-assisted engineering, delivery, and frontend skills that support it in production."
            revealHeader
        >
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {capabilityGroups.map((group, index) => (
                    <Reveal key={group.label} delay={index * 0.06}>
                        <div>
                            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-fg-muted">
                                {group.label}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-fg-secondary">{group.summary}</p>
                            <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${group.label} technologies`}>
                                {group.technologies.map((tech) => (
                                    <li
                                        key={tech}
                                        className="rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-xs text-fg-secondary"
                                    >
                                        {tech}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>
                ))}
            </div>
        </Section>
    )
}
