"use client"

import Link from "next/link"
import { Terminal, FlaskConical, BookOpen, PlayCircle } from "lucide-react"
import type { RoadmapTopic } from "@/src/lib/types/devops-lab"
import { Roadmap } from "@/src/components/lab/devops/Roadmap"
import { DiagramViewer } from "@/src/components/lab/devops/DiagramViewer"
import { deploymentPipelineDiagram, requestFlowDiagram } from "@/data/lab/devops/diagrams"
import { useDevOpsProgress } from "@/src/components/lab/devops/DevOpsProgress"
import { LabNav } from "@/src/components/lab/ui/LabNav"
import { LabPathHeader } from "@/src/components/lab/ui/LabPathHeader"
import { LabProgressSummary } from "@/src/components/lab/ui/LabProgressSummary"
import { LabPrimaryActions } from "@/src/components/lab/ui/LabPrimaryActions"
import { HoverArrow } from "@/src/components/lab/ui/HoverArrow"
import { Reveal } from "@/src/components/system/Reveal"
import { interactiveCard, cn } from "@/src/lib/utils/utils"

const quickLinks = [
    { href: "/lab/devops/labs", icon: FlaskConical, title: "Hands-on Labs", description: "Dockerize an app, wire up Nginx, ship a CI/CD pipeline" },
    { href: "/lab/devops/commands", icon: Terminal, title: "Command Reference", description: "Searchable Git, Docker, Maven, and PostgreSQL commands" },
    { href: "/lab/devops/infrastructure", icon: BookOpen, title: "Backend Infrastructure", description: "Reverse proxy, load balancer, caching, health checks — explained" },
]

export function DevOpsLabHubClient({ topics }: { topics: RoadmapTopic[] }) {
    const progress = useDevOpsProgress()
    const availableTopics = topics.filter((t) => t.hasCard)
    const done = availableTopics.filter((t) => progress.has(t.slug)).length
    const nextTopic = availableTopics.find((t) => !progress.has(t.slug))

    return (
        <div className="px-4 md:px-8 py-10 max-w-6xl mx-auto">
            <LabNav active="devops" />
            <LabPathHeader
                label="DevOps Basics"
                title="DevOps for Backend Developers"
                description="I'm a backend developer, not a DevOps engineer — but understanding the delivery lifecycle is what turns “the code works” into “the service is live, reachable, and recoverable.” This covers Docker, CI/CD, reverse proxies, and deployment, focused on what a Java/Spring Boot and Next.js stack actually needs."
                accent="success"
            >
                <LabProgressSummary completed={done} total={availableTopics.length} accent="success" />
                <LabPrimaryActions
                    actions={[
                        { href: nextTopic ? `/lab/devops/topics/${nextTopic.slug}` : "/lab/devops/labs", label: nextTopic ? `Continue: ${nextTopic.title}` : "Practice with a hands-on lab", icon: PlayCircle },
                        { href: "/lab/devops/labs", label: "Browse hands-on labs", icon: FlaskConical, variant: "secondary" },
                    ]}
                />
            </LabPathHeader>

            <div className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {quickLinks.map((link, i) => (
                    <Reveal key={link.href} delay={i * 0.05}>
                        <Link
                            href={link.href}
                            className={cn("group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-4", interactiveCard)}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100">
                                    <link.icon size={16} aria-hidden="true" />
                                </span>
                                <HoverArrow className="mt-1" />
                            </div>
                            <div>
                                <p className="text-base font-semibold text-fg">{link.title}</p>
                                <p className="text-sm text-fg-muted">{link.description}</p>
                            </div>
                        </Link>
                    </Reveal>
                ))}
            </div>

            <section className="mb-14">
                <h2 className="mb-1 text-xl font-bold text-fg">Learning roadmap</h2>
                <p className="mb-5 text-sm text-fg-muted">Track what you&apos;ve learned — progress is saved in your browser.</p>
                <Roadmap topics={topics} />
            </section>

            <section className="mb-14">
                <h2 className="mb-5 text-xl font-bold text-fg">Architecture</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                    <DiagramViewer diagram={deploymentPipelineDiagram} />
                    <DiagramViewer diagram={requestFlowDiagram} />
                </div>
            </section>

            <Link
                href="/lab/library"
                className={cn("group flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4", interactiveCard)}
            >
                <span className="text-base font-medium text-fg-secondary group-hover:text-fg">
                    Search across the whole Engineering Lab library
                </span>
                <HoverArrow />
            </Link>
        </div>
    )
}
