import type { StatusLevel } from "@/src/components/lab/ui/StatusIndicator"

export interface SystemStatusEntry {
    area: string
    tech: string
    status: StatusLevel
    detail: string
}

export const systemStatus: SystemStatusEntry[] = [
    {
        area: "Backend",
        tech: "Java · Spring Boot 3",
        status: "active",
        detail: "REST APIs, Spring Security + JWT, MyBatis and JPA — my daily driver at work and in every side project.",
    },
    {
        area: "Database",
        tech: "PostgreSQL",
        status: "production",
        detail: "Schema design, Flyway migrations, Row Level Security, and query tuning across multiple deployed projects.",
    },
    {
        area: "Frontend",
        tech: "Next.js · React 19",
        status: "active",
        detail: "App Router, TanStack Query, and Tailwind CSS — how every backend I build gets a face.",
    },
    {
        area: "AX Engineering",
        tech: "Agent Harness · MCP · Evals",
        status: "experimenting",
        detail: "Using AI-assisted development in practice while learning how context, tools, guardrails, verification, and feedback form a reliable Agent Harness.",
    },
    {
        area: "DevOps",
        tech: "Docker · CI/CD · Nginx",
        status: "learning",
        detail: "Dockerizing Spring Boot, GitHub Actions pipelines, and reverse proxies — documented step by step in the DevOps lab.",
    },
]

export const currentFocus = [
    "Spring Boot 3",
    "PostgreSQL",
    "System Design",
    "Docker & CI/CD",
    "AX Engineering",
]

export const engineeringPhilosophy =
    "Understand the system before writing the code. Make state explicit, document decisions, and treat every project as a chance to learn how software behaves in production — not just how it compiles."
