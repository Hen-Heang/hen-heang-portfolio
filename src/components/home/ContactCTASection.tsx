import React from "react"
import Link from "next/link"
import { Container } from "@/src/components/system/Container"
import { Reveal } from "@/src/components/system/Reveal"

export function ContactCTASection() {
    return (
        <section className="border-t border-border py-section">
            <Container>
                <Reveal>
                    <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <h2 className="text-display-sm text-fg">Have a system to build?</h2>
                            <p className="mt-4 max-w-lg text-lg leading-relaxed text-fg-secondary">
                                I&apos;m available for Java and Spring Boot backend roles, API work, and product teams that value dependable systems.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/contact"
                                className="inline-flex h-11 items-center rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
                            >
                                Start a conversation
                            </Link>
                            <Link
                                href="/resume"
                                className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-medium text-fg transition-colors hover:border-border-strong hover:bg-surface-hover"
                            >
                                View Resume
                            </Link>
                        </div>
                    </div>
                </Reveal>
            </Container>
        </section>
    )
}
