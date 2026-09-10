import type { AXModule } from "@/src/lib/types/ax-engineering"

export const axRoadmap: AXModule[] = [
    {
        number: "00",
        slug: "overview",
        title: "AX Engineering Overview",
        description:
            "Build a practical vocabulary for reliable human + AI software-development workflows.",
        status: "learning",
        estimatedScope: "2–3 hours",
        concepts: ["AX engineering", "human oversight", "agent harness"],
    },
    {
        number: "01",
        slug: "ai-assisted-development",
        title: "AI-Assisted Development",
        description:
            "Practice using models as collaborators while keeping engineering judgment and verification with the human.",
        status: "experimenting",
        estimatedScope: "3–4 hours",
        concepts: ["task framing", "review", "verification"],
    },
    {
        number: "02",
        slug: "agent-harness-fundamentals",
        title: "Agent Harness Fundamentals",
        description:
            "Understand the operating layer that connects a model to project context, tools, policy, and feedback.",
        status: "learning",
        estimatedScope: "4–6 hours",
        concepts: ["harness", "control loop", "state"],
    },
    {
        number: "03",
        slug: "context-engineering",
        title: "Context Engineering",
        description:
            "Select, structure, and refresh the information an agent needs without flooding its context window.",
        status: "planned",
        estimatedScope: "4–6 hours",
        concepts: ["retrieval", "context budget", "relevance"],
    },
    {
        number: "04",
        slug: "project-instructions",
        title: "Project Instructions",
        description:
            "Write durable repository guidance that makes conventions, boundaries, and verification steps explicit.",
        status: "planned",
        estimatedScope: "3–4 hours",
        concepts: ["AGENTS.md", "scope", "conventions"],
    },
    {
        number: "05",
        slug: "skills",
        title: "Skills",
        description:
            "Package repeatable engineering procedures as focused playbooks an agent can apply when relevant.",
        status: "planned",
        estimatedScope: "3–5 hours",
        concepts: ["playbooks", "triggering", "reuse"],
    },
    {
        number: "06",
        slug: "agents-and-subagents",
        title: "Agents & Subagents",
        description:
            "Explore role boundaries, delegation, independent review, and the cost of coordination.",
        status: "planned",
        estimatedScope: "4–6 hours",
        concepts: ["agent", "subagent", "delegation"],
    },
    {
        number: "07",
        slug: "mcp-and-tool-calling",
        title: "MCP & Tool Calling",
        description:
            "Learn how agents discover and invoke controlled capabilities through typed tool contracts.",
        status: "planned",
        estimatedScope: "5–7 hours",
        concepts: ["MCP", "tools", "schemas"],
    },
    {
        number: "08",
        slug: "planning-and-orchestration",
        title: "Planning & Orchestration",
        description:
            "Break work into observable steps, manage dependencies, and adapt plans as evidence changes.",
        status: "planned",
        estimatedScope: "4–6 hours",
        concepts: ["planning", "orchestration", "checkpoints"],
    },
    {
        number: "09",
        slug: "permissions-and-guardrails",
        title: "Permissions & Guardrails",
        description:
            "Constrain what an agent can read, change, execute, and send according to risk.",
        status: "planned",
        estimatedScope: "4–6 hours",
        concepts: ["least privilege", "approval", "policy"],
    },
    {
        number: "10",
        slug: "sandbox-and-git-worktrees",
        title: "Sandbox & Git Worktrees",
        description:
            "Isolate execution and parallel code changes so experiments are easier to inspect and recover.",
        status: "planned",
        estimatedScope: "4–5 hours",
        concepts: ["sandbox", "worktree", "isolation"],
    },
    {
        number: "11",
        slug: "hooks-and-automation",
        title: "Hooks & Automation",
        description:
            "Attach deterministic actions to lifecycle events such as edits, tool calls, commits, and completion.",
        status: "planned",
        estimatedScope: "3–5 hours",
        concepts: ["hooks", "automation", "lifecycle"],
    },
    {
        number: "12",
        slug: "quality-gates",
        title: "Quality Gates",
        description:
            "Require compile, lint, test, security, and review evidence before work advances.",
        status: "planned",
        estimatedScope: "4–6 hours",
        concepts: ["tests", "static analysis", "review"],
    },
    {
        number: "13",
        slug: "ai-evaluations",
        title: "AI Evaluations",
        description:
            "Design repeatable checks for task outcomes, behavior, safety, and regression detection.",
        status: "planned",
        estimatedScope: "5–8 hours",
        concepts: ["eval cases", "graders", "regressions"],
    },
    {
        number: "14",
        slug: "observability",
        title: "Observability",
        description:
            "Capture traces, tool activity, outcomes, latency, and cost so agent behavior can be understood.",
        status: "planned",
        estimatedScope: "4–6 hours",
        concepts: ["traces", "metrics", "audit trail"],
    },
    {
        number: "15",
        slug: "memory-and-handoff",
        title: "Memory & Handoff",
        description:
            "Preserve useful decisions and transfer concise state without treating stale notes as truth.",
        status: "planned",
        estimatedScope: "4–6 hours",
        concepts: ["memory", "handoff", "state"],
    },
    {
        number: "16",
        slug: "ci-cd-integration",
        title: "CI/CD Integration",
        description:
            "Connect agent contributions to familiar pull-request checks, approvals, and delivery controls.",
        status: "planned",
        estimatedScope: "4–6 hours",
        concepts: ["CI/CD", "pull requests", "approval"],
    },
    {
        number: "17",
        slug: "build-a-general-agent-harness",
        title: "Build a General Agent Harness",
        description:
            "Combine the curriculum into a small, technology-neutral harness design before applying it to Spring.",
        status: "planned",
        estimatedScope: "8–12 hours",
        concepts: ["integration", "trade-offs", "capstone"],
    },
]
