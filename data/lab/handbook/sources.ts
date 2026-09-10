import type { DocSource } from "@/src/lib/types/handbook"

/**
 * Primary sources only — vendor documentation and the protocol spec. Every
 * factual claim in the handbook should be traceable to one of these, so that
 * when a tool changes there is exactly one place to re-check.
 */
export const handbookSources: DocSource[] = [
    {
        title: "Claude Code documentation",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/overview",
        topics: ["overview", "install", "surfaces"],
    },
    {
        title: "Explore the .claude directory",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/claude-directory",
        topics: ["file layout", "scopes"],
    },
    {
        title: "How Claude remembers your project",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/memory",
        topics: ["CLAUDE.md", "rules", "auto memory"],
    },
    {
        title: "Explore the context window",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/context-window",
        topics: ["startup order", "compaction"],
    },
    {
        title: "Settings files and precedence",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/settings",
        topics: ["settings.json", "precedence"],
    },
    {
        title: "Configure permissions",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/permissions",
        topics: ["allow", "ask", "deny", "rule syntax"],
    },
    {
        title: "Configure the sandboxed Bash tool",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/sandboxing",
        topics: ["sandbox", "network isolation"],
    },
    {
        title: "Hooks reference",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/hooks",
        topics: ["events", "exit codes", "matchers"],
    },
    {
        title: "Extend Claude with skills",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/skills",
        topics: ["SKILL.md", "frontmatter", "invocation"],
    },
    {
        title: "Create custom subagents",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/sub-agents",
        topics: ["delegation", "isolation", "frontmatter"],
    },
    {
        title: "Connect Claude Code to tools via MCP",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/mcp",
        topics: ["MCP", "scopes", ".mcp.json"],
    },
    {
        title: "Run parallel sessions with worktrees",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/worktrees",
        topics: ["worktrees", "parallel agents"],
    },
    {
        title: "Best practices for Claude Code",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/best-practices",
        topics: ["workflow", "prompting"],
    },
    {
        title: "Agent SDK overview",
        organization: "Anthropic",
        url: "https://code.claude.com/docs/en/agent-sdk/overview",
        topics: ["SDK", "custom agents"],
    },
    {
        title: "Codex documentation",
        organization: "OpenAI",
        url: "https://learn.chatgpt.com/docs",
        topics: ["overview", "surfaces"],
    },
    {
        title: "Codex CLI",
        organization: "OpenAI",
        url: "https://learn.chatgpt.com/codex/cli",
        topics: ["install", "commands", "slash commands"],
    },
    {
        title: "Codex configuration basics",
        organization: "OpenAI",
        url: "https://learn.chatgpt.com/codex/config-file/config-basic",
        topics: ["config.toml", "precedence"],
    },
    {
        title: "AGENTS.md",
        organization: "OpenAI",
        url: "https://learn.chatgpt.com/codex/agent-configuration/agents-md",
        topics: ["AGENTS.md", "instruction chain"],
    },
    {
        title: "Codex permission modes",
        organization: "OpenAI",
        url: "https://learn.chatgpt.com/codex/permission-modes",
        topics: ["approvals", "sandbox modes"],
    },
    {
        title: "Build skills for Codex",
        organization: "OpenAI",
        url: "https://learn.chatgpt.com/codex/build-skills",
        topics: ["SKILL.md", ".agents/skills"],
    },
    {
        title: "Extend Codex with MCP",
        organization: "OpenAI",
        url: "https://learn.chatgpt.com/codex/extend/mcp",
        topics: ["mcp_servers", "TOML"],
    },
    {
        title: "Model Context Protocol specification",
        organization: "Model Context Protocol",
        url: "https://modelcontextprotocol.io/docs",
        topics: ["protocol", "tools", "resources"],
    },
    {
        title: "Building effective agents",
        organization: "Anthropic",
        url: "https://www.anthropic.com/research/building-effective-agents",
        topics: ["patterns", "workflows", "when not to"],
    },
    {
        title: "git worktree",
        organization: "Git",
        url: "https://git-scm.com/docs/git-worktree",
        topics: ["worktrees", "isolation"],
    },
]
