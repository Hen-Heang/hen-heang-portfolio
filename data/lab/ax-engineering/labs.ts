import type { AXLab } from "@/src/lib/types/ax-engineering"

export const axLabs: AXLab[] = [
    {
        id: "LAB-01",
        title: "Create project AGENTS.md",
        objective:
            "Express repository conventions, boundaries, and required checks as durable project instructions.",
        deliverable:
            "A reviewed AGENTS.md draft for a sample backend repository.",
        concepts: ["Instructions", "Context", "Permissions"],
        status: "planned",
    },
    {
        id: "LAB-02",
        title: "Create a reusable backend implementation skill",
        objective:
            "Turn a repeatable Spring feature workflow into a focused playbook.",
        deliverable:
            "A skill specification with triggers, procedure, and verification checklist.",
        concepts: ["Skills", "Quality Gates"],
        status: "planned",
    },
    {
        id: "LAB-03",
        title: "Design a Backend Reviewer agent",
        objective:
            "Define a narrow reviewer role that produces evidence-based findings without editing code.",
        deliverable:
            "A reviewer role contract, inputs, output schema, and stop conditions.",
        concepts: ["Agents", "Subagents", "Handoff"],
        status: "planned",
    },
    {
        id: "LAB-04",
        title: "Design read-only database MCP tools",
        objective:
            "Model safe schema inspection and query-explanation capabilities.",
        deliverable:
            "Typed tool schemas and a least-privilege permission table.",
        concepts: ["MCP", "Tools", "Permissions"],
        status: "planned",
    },
    {
        id: "LAB-05",
        title: "Define agent permissions",
        objective:
            "Classify operations by impact and decide which are allowed, denied, or approval-gated.",
        deliverable:
            "A project-neutral permission matrix with example policies.",
        concepts: ["Permissions", "Guardrails"],
        status: "planned",
    },
    {
        id: "LAB-06",
        title: "Isolate agent work using Git worktree concepts",
        objective:
            "Practice separating concurrent changes and defining safe integration boundaries.",
        deliverable: "A worktree workflow diagram and cleanup checklist.",
        concepts: ["Sandbox", "Git worktrees", "Handoff"],
        status: "planned",
    },
    {
        id: "LAB-07",
        title: "Create compile/test quality gates",
        objective:
            "Convert expected engineering evidence into ordered blocking checks.",
        deliverable:
            "A gate definition for compile, unit, integration, lint, and diff review.",
        concepts: ["Hooks", "Quality Gates", "CI/CD"],
        status: "planned",
    },
    {
        id: "LAB-08",
        title: "Design the first agent evaluation",
        objective:
            "Write representative cases that distinguish useful behavior from plausible-looking failure.",
        deliverable: "An eval dataset, rubric, and baseline result format.",
        concepts: ["Evals", "Guardrails"],
        status: "planned",
    },
    {
        id: "LAB-09",
        title: "Design execution observability",
        objective:
            "Choose the events and metrics needed to explain an agent run without recording secrets.",
        deliverable:
            "A trace event schema, redaction rules, and example run timeline.",
        concepts: ["Observability", "Tools", "Evals"],
        status: "planned",
    },
    {
        id: "LAB-10",
        title: "Create session handoff",
        objective:
            "Transfer verified state so another engineer or agent can continue safely.",
        deliverable: "A reusable handoff template and completed example.",
        concepts: ["Memory", "Handoff"],
        status: "planned",
    },
    {
        id: "LAB-11",
        title: "Design a complete Spring Agent Harness",
        objective:
            "Apply the learned concepts to an architecture proposal without implementing the full harness yet.",
        deliverable:
            "A technology-aware design, threat model, gates, eval plan, and staged build roadmap.",
        concepts: ["Agent Harness", "Spring Boot", "Integration"],
        status: "planned",
    },
]
