import type { AXSource } from "@/src/lib/types/ax-engineering"

export const axSources: AXSource[] = [
    {
        title: "Model Context Protocol documentation",
        organization: "Model Context Protocol",
        url: "https://modelcontextprotocol.io/docs",
        topics: ["MCP", "tools", "resources"],
    },
    {
        title: "Building effective agents",
        organization: "Anthropic",
        url: "https://www.anthropic.com/research/building-effective-agents",
        topics: ["workflows", "agents", "evaluation"],
    },
    {
        title: "OpenAI evaluation best practices",
        organization: "OpenAI",
        url: "https://platform.openai.com/docs/guides/evaluation-best-practices",
        topics: ["evals", "graders", "regressions"],
    },
    {
        title: "Git worktree documentation",
        organization: "Git",
        url: "https://git-scm.com/docs/git-worktree",
        topics: ["worktrees", "isolation", "parallel work"],
    },
]
