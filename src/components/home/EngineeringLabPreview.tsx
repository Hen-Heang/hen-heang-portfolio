import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Section } from "@/src/components/system/Section"
import { TextLink } from "@/src/components/system/TextLink"
import { Reveal } from "@/src/components/system/Reveal"
import type { Article } from "@/src/lib/types/ai-engineering"

interface LabEntry {
    title: string
    meta: string
    href: string
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Homepage preview of the Engineering Lab: up to three readable entries
 * (real titles, not filenames) instead of the full directory tree that
 * `/lab` shows. Two backend guides are fixed (verified titles/slugs from
 * `data/lab/backend/items`); the third slot uses the latest real AI
 * Engineering article when one exists, falling back to a third backend
 * guide otherwise — never a placeholder title.
 */
export function EngineeringLabPreview({ articles }: { articles: Article[] }) {
    const latestArticle = articles[0]

    const entries: LabEntry[] = [
        {
            title: "Layered Spring Boot Architecture",
            meta: "Backend Engineering · System",
            href: "/lab/backend/spring-boot-layered-architecture",
        },
        {
            title: "Java Backend Fundamentals",
            meta: "Java · Guide",
            href: "/lab/backend/java-backend-fundamentals",
        },
        latestArticle
            ? {
                  title: latestArticle.title,
                  meta: `AI Engineering · ${capitalize(latestArticle.difficulty)}`,
                  href: `/ai-engineering/articles/${latestArticle.slug}`,
              }
            : {
                  title: "REST API Design Fundamentals",
                  meta: "Backend Engineering · Guide",
                  href: "/lab/backend/rest-api-design-fundamentals",
              },
    ]

    return (
        <Section
            eyebrow="Engineering Lab"
            title="Notes from day-to-day backend work"
            description="Guides and references kept in the open — the full directory lives on the Lab."
            revealHeader
        >
            <ul className="border-y border-border">
                {entries.map((entry, index) => (
                    <li key={entry.href} className="border-b border-border last:border-b-0">
                        <Reveal delay={index * 0.06}>
                            <Link
                                href={entry.href}
                                className="group flex items-center justify-between gap-4 py-4 transition-colors hover:text-brand"
                            >
                                <span>
                                    <span className="block font-medium text-fg transition-colors group-hover:text-brand">
                                        {entry.title}
                                    </span>
                                    <span className="mt-1 block text-sm text-fg-muted">{entry.meta}</span>
                                </span>
                                <ArrowRight
                                    size={16}
                                    className="shrink-0 text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand motion-reduce:transition-none"
                                    aria-hidden
                                />
                            </Link>
                        </Reveal>
                    </li>
                ))}
            </ul>

            <div className="mt-8">
                <TextLink href="/lab">Open the Engineering Lab</TextLink>
            </div>
        </Section>
    )
}
