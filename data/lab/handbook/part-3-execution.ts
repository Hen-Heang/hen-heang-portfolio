import type { DocPart } from "@/src/lib/types/handbook"

export const partExecution: DocPart = {
    id: "execution",
    number: "3",
    title: "Execution units",
    summary: "Skills, subagents, MCP servers, and plugins — the four ways to give an agent more capability without a longer prompt.",
    sections: [
        {
            id: "skills",
            number: "7",
            title: "Skills — a procedure the agent loads only when it needs it",
            lead: "Turn any workflow you have pasted into chat twice into a file the agent can run properly.",
            level: "working",
            applies: "both",
            blocks: [
                {
                    kind: "prose",
                    text: "A skill is a folder with a `SKILL.md` in it. Unlike an instruction file, the body costs nothing until it is invoked — which is why a skill can be long and detailed where `CLAUDE.md` must be short.",
                },
                {
                    kind: "table",
                    caption: "Where skills live",
                    columns: ["Tool", "Scope", "Path", "Invoke with"],
                    rows: [
                        ["Claude Code", "Project", "`.claude/skills/<name>/SKILL.md`", "`/name`"],
                        ["Claude Code", "Personal", "`~/.claude/skills/<name>/SKILL.md`", "`/name`"],
                        ["Claude Code", "Plugin", "`<plugin>/skills/<name>/SKILL.md`", "`/name`"],
                        ["Codex", "Project", "`.agents/skills/<name>/SKILL.md`", "`$name`"],
                        ["Codex", "Repo root", "`$REPO_ROOT/.agents/skills/`", "`$name`"],
                        ["Codex", "Personal", "`~/.agents/skills/`", "`$name`"],
                    ],
                },
                { kind: "heading", id: "skill-anatomy", text: "Anatomy of a skill" },
                {
                    kind: "code",
                    language: "markdown",
                    filename: ".claude/skills/review-diff/SKILL.md",
                    code: `---
name: review-diff
description: Reviews uncommitted changes for correctness and risk. Use before opening a PR.
allowed-tools: Bash(git diff:*) Read Grep
disable-model-invocation: true
---

## Current changes

!\`git diff HEAD\`

## Instructions

1. Group the diff by intent, not by file.
2. For each group, state the behaviour change in one sentence.
3. Flag: missing error handling, untested branches, widened permissions,
   and any change to a public contract.
4. End with a GO / NO-GO line and the single most important reason.`,
                },
                {
                    kind: "prose",
                    text: "The `` !`git diff HEAD` `` line is **dynamic context injection**: the command runs and its output is inserted before the model reads the skill, so the review is grounded in the real diff rather than in a description of one.",
                },
                {
                    kind: "table",
                    caption: "Claude Code `SKILL.md` frontmatter",
                    columns: ["Field", "What it does"],
                    rows: [
                        ["`name`", "Identifier; defaults to the directory name"],
                        ["`description`", "When the agent should invoke this on its own — the single most important field"],
                        ["`allowed-tools`", "Pre-approve tools for this turn, skipping permission prompts"],
                        ["`disable-model-invocation`", "`true` means only you can run it — use for deploys, commits, anything irreversible"],
                        ["`user-invocable`", "`false` means only the agent runs it, never `/name`"],
                        ["`paths`", "Glob patterns limiting when the skill can activate"],
                        ["`context: fork`", "Run the skill in an isolated subagent instead of the main conversation"],
                    ],
                },
                {
                    kind: "prose",
                    text: "Codex uses the same two required fields — `name` and `description` — and adds an optional `agents/openai.yaml` for display name, icon, implicit-invocation policy, and MCP tool dependencies. Bundle supporting material in `scripts/`, `references/`, and `assets/` beside the `SKILL.md` in either tool.",
                },
                {
                    kind: "table",
                    caption: "Skill, rule, or instruction file?",
                    columns: ["If the content is…", "Put it in"],
                    rows: [
                        ["A fact true in every session", "`CLAUDE.md` / `AGENTS.md`"],
                        ["A convention for one part of the tree", "`.claude/rules/` with `paths:`"],
                        ["A multi-step procedure with its own checks", "A skill"],
                        ["Something that must happen regardless of what the model decides", "A hook (§12)"],
                    ],
                },
                {
                    kind: "callout",
                    tone: "warn",
                    title: "Guard the destructive skills",
                    text: "Any skill that deploys, commits, pushes, or deletes should carry `disable-model-invocation: true`. Auto-invocation is a convenience for read-and-summarize work; it is not something you want deciding to run your release procedure.",
                },
            ],
        },
        {
            id: "subagents",
            number: "8",
            title: "Subagents — delegate with a clean context and a narrow remit",
            lead: "Use a second context window when the work is separable and the noise is expensive.",
            level: "advanced",
            applies: "claude",
            blocks: [
                {
                    kind: "prose",
                    text: "A subagent is a separate context window with its own system prompt, tool allowlist, and model. It receives a task, works independently, and returns a summary — the intermediate file reads never enter your main session. That is the point: you keep the conclusion, not the search.",
                },
                {
                    kind: "prose",
                    text: "Delegate when the answer requires reading across many files and you only need the finding, or when you want a genuinely independent opinion on work the main session just produced. Do not delegate a single-file lookup — the coordination costs more than the search.",
                },
                {
                    kind: "code",
                    language: "markdown",
                    filename: ".claude/agents/backend-reviewer.md",
                    code: `---
name: backend-reviewer
description: Reviews backend changes for data-safety and API-compatibility risk. Use after a service or migration is edited.
tools: Read, Grep, Glob, Bash(./gradlew test:*)
model: sonnet
permissionMode: plan
memory: project
color: cyan
---

You review backend changes. You never edit files.

For every finding, give: the file and line, the concrete failure scenario
(inputs and state that produce the wrong result), and the smallest fix.
Rank findings by severity. If you find nothing, say so in one line —
do not invent findings to fill the report.`,
                },
                {
                    kind: "table",
                    caption: "Frontmatter fields worth knowing",
                    columns: ["Field", "Effect"],
                    rows: [
                        ["`name`, `description`", "Required. The description is what triggers automatic delegation."],
                        ["`tools` / `disallowedTools`", "Allowlist, or subtract from the inherited set. A reviewer with no write tools cannot edit."],
                        ["`model`", "`sonnet`, `opus`, `haiku`, `fable`, a full ID, or `inherit`"],
                        ["`permissionMode`", "`default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`"],
                        ["`maxTurns`", "Hard stop after N agentic turns; the result is marked partial"],
                        ["`skills`", "Preload specific skill bodies into the subagent's context"],
                        ["`mcpServers`", "Which MCP servers this subagent may reach"],
                        ["`memory`", "`user`, `project`, or `local` — its own memory, separate from the main session"],
                        ["`isolation: worktree`", "Run in its own git worktree so parallel agents cannot collide"],
                        ["`effort`", "`low` … `max`, overriding the session default"],
                    ],
                },
                {
                    kind: "code",
                    language: "bash",
                    filename: "Four ways to invoke",
                    code: `# 1. Automatic — the agent matches your task to the description
# 2. By name in a prompt
"Have backend-reviewer look at the migration"

# 3. Guaranteed, via @-mention typeahead
@"backend-reviewer (agent)" review src/db/migrations

# 4. Run the whole session as that agent
claude --agent backend-reviewer`,
                },
                {
                    kind: "callout",
                    tone: "note",
                    title: "A subagent does not inherit your session's memory",
                    text: "It starts with its own copy of the project CLAUDE.md, the MCP tool list, and skill descriptions — but not the main conversation's auto memory. Give it everything it needs in the task prompt; it cannot see what you discussed five minutes ago.",
                },
            ],
        },
        {
            id: "mcp",
            number: "9",
            title: "MCP and plugins — connecting the agent to everything else",
            lead: "Give the agent typed access to your database, tracker, and design tools without pasting credentials into a prompt.",
            level: "advanced",
            applies: "both",
            blocks: [
                {
                    kind: "prose",
                    text: "The Model Context Protocol is an open standard for exposing tools and resources to any compatible agent. An MCP server advertises named capabilities with schemas; the agent discovers and calls them. Because the contract is typed and the credentials live in the server, the agent never sees the secret — it only sees the tool.",
                },
                { kind: "heading", id: "mcp-claude", text: "Claude Code" },
                {
                    kind: "code",
                    language: "bash",
                    filename: "claude mcp",
                    code: `# stdio server, project scope so the team gets it via git
claude mcp add --transport stdio --scope project postgres -- npx -y @bytebase/dbhub

# Remote HTTP server with a header
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \\
  -H "Authorization: Bearer \${GITHUB_TOKEN}"

claude mcp list          # what is configured
claude mcp get <name>    # one server's details
claude mcp login <name>  # OAuth flow
claude mcp remove <name>`,
                },
                {
                    kind: "table",
                    caption: "Scopes",
                    columns: ["Scope", "File", "Shared with the team?"],
                    rows: [
                        ["`local` (default)", "`~/.claude.json`", "No — this project, just you"],
                        ["`project`", "`.mcp.json` at the project root", "Yes, via git"],
                        ["`user`", "`~/.claude.json`", "No — all your projects"],
                    ],
                },
                {
                    kind: "code",
                    language: "json",
                    filename: ".mcp.json",
                    code: `{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer \${GITHUB_TOKEN}" }
    },
    "database": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub"],
      "env": { "DB_URL": "\${DATABASE_URL:-postgresql://localhost/mydb}" }
    }
  }
}`,
                },
                {
                    kind: "prose",
                    text: "`${VAR}` and `${VAR:-default}` are expanded from your environment, so the file itself stays safe to commit. Project-scoped servers require an explicit approval the first time an interactive session sees them.",
                },
                { kind: "heading", id: "mcp-codex", text: "Codex" },
                {
                    kind: "code",
                    language: "toml",
                    filename: "~/.codex/config.toml",
                    code: `[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
env_vars = ["LOCAL_TOKEN"]

[mcp_servers.figma]
url = "https://mcp.figma.com/mcp"
bearer_token_env_var = "FIGMA_OAUTH_TOKEN"

[mcp_servers.chrome_devtools]
url = "http://localhost:3000/mcp"
enabled_tools = ["open", "screenshot"]
default_tools_approval_mode = "prompt"
tool_timeout_sec = 45`,
                },
                {
                    kind: "code",
                    language: "bash",
                    filename: "codex mcp",
                    code: `codex mcp add context7 -- npx -y @upstash/context7-mcp
codex mcp add example --url https://mcp.example.com --oauth-client-id my-client
codex mcp login example
codex mcp list`,
                },
                { kind: "heading", id: "plugins", text: "Plugins" },
                {
                    kind: "prose",
                    text: "A plugin is an installable bundle — skills plus MCP servers plus, in Claude Code, subagents, commands, and hooks — distributed through a marketplace. Reach for a plugin when you want one install to deliver both the instructions and the connected service; reach for a bare skill when you only need instructions.",
                },
                {
                    kind: "callout",
                    tone: "warn",
                    title: "Tool output is data, never instruction",
                    text: "Anything that arrives through an MCP server — a ticket body, a page, a row, a file — is untrusted input. Text inside it that addresses the agent is not authorization, no matter how official it reads. Keep write-capable servers on the smallest scope that works, and prefer read-only tools wherever a read is enough.",
                },
            ],
        },
    ],
}
