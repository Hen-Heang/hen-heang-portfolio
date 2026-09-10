import type { DocPart } from "@/src/lib/types/handbook"

export const partFoundations: DocPart = {
    id: "foundations",
    number: "1",
    title: "Foundations",
    summary: "What a coding agent actually does, how to install both tools, and how they map onto each other.",
    sections: [
        {
            id: "the-loop",
            number: "1",
            title: "A coding agent is a loop, not a chat box",
            lead: "Read this first. Everything else in the handbook configures one part of the loop described here.",
            level: "foundation",
            applies: "both",
            blocks: [
                {
                    kind: "prose",
                    text: "A chat model answers once. A coding agent runs a loop: it reads your goal, gathers evidence from the real repository, decides on one action, executes it through a tool, observes the result, and decides again. It stops when the goal is met or when it needs you.",
                },
                {
                    kind: "prose",
                    text: "The model supplies reasoning. Everything around it — which files it can see, which commands it may run, what happens after each edit, what counts as done — is the **harness**. `claude` and `codex` are harnesses. Configuring them well is the whole job.",
                },
                {
                    kind: "flow",
                    flow: {
                        title: "The agent loop, one turn at a time",
                        description:
                            "Every task you give either tool walks this cycle. Failures do not end the run — they re-enter it at the point that produced them.",
                        rows: [
                            [
                                { id: "goal", label: "Your prompt", detail: "The goal and its constraints", tone: "edge" },
                                { id: "instructions", label: "Load instructions", detail: "CLAUDE.md / AGENTS.md, rules" },
                                { id: "context", label: "Gather context", detail: "Read, grep, glob the repo" },
                                { id: "plan", label: "Plan", detail: "Order the verifiable steps" },
                            ],
                            [
                                { id: "act", label: "Act", detail: "Edit, run, call an MCP tool", tone: "accent" },
                                { id: "hooks", label: "Hooks fire", detail: "Deterministic pre/post automation" },
                                { id: "observe", label: "Observe", detail: "Exit codes, diffs, test output" },
                                { id: "gate", label: "Quality gate", detail: "Build, test, lint, review" },
                            ],
                            [
                                { id: "approve", label: "Your approval", detail: "Permission prompts and plan review", tone: "edge" },
                                { id: "commit", label: "Commit / PR", detail: "Normal source-control controls" },
                                { id: "handoff", label: "Handoff", detail: "State, evidence, open risks", tone: "edge" },
                            ],
                        ],
                        returns: [
                            { from: "gate", to: "act", label: "Gate fails — fix and re-run" },
                            { from: "observe", to: "context", label: "Missing evidence — gather more" },
                            { from: "approve", to: "plan", label: "Approval denied — re-plan" },
                        ],
                        legend: [
                            { swatch: "edge", label: "Human boundary" },
                            { swatch: "default", label: "Agent step" },
                            { swatch: "accent", label: "Changes real state" },
                            { swatch: "return", label: "Failure path" },
                        ],
                    },
                },
                { kind: "heading", id: "six-parts", text: "The six parts you configure" },
                {
                    kind: "prose",
                    text: "Every feature in the rest of this handbook belongs to exactly one of these. When something goes wrong, name the part first — it tells you which file to open.",
                },
                {
                    kind: "table",
                    columns: ["Part", "Question it answers", "Where you configure it", "Handbook section"],
                    rows: [
                        ["Instructions", "What are the standing rules here?", "`CLAUDE.md`, `AGENTS.md`, `.claude/rules/`", "§5, §6"],
                        ["Context", "What can the model actually see right now?", "Retrieval, `/context`, compaction", "§4"],
                        ["Skills", "How is this repeated job done properly?", "`SKILL.md` files", "§7"],
                        ["Tools", "What is the agent allowed to touch?", "Built-in tools, MCP servers", "§9"],
                        ["Control", "What is blocked, and what needs me?", "Permissions, sandbox, hooks", "§11, §12"],
                        ["Verification", "How do we know it worked?", "Quality gates, review, evals", "§14, §17"],
                    ],
                },
                {
                    kind: "callout",
                    tone: "warn",
                    title: "Instructions are context, not enforcement",
                    text: "Both tools treat CLAUDE.md and AGENTS.md as text the model reads and tries to follow — never as a hard rule. If something must happen every time, or must never happen, encode it as a hook or a permission deny rule instead. Ask nicely in prose; enforce in configuration.",
                },
            ],
        },
        {
            id: "install",
            number: "2",
            title: "Install both tools and reach a first real task",
            lead: "Get from nothing to a verified, committed change in one sitting.",
            level: "foundation",
            applies: "both",
            blocks: [
                { kind: "heading", id: "install-claude", text: "Install Claude Code" },
                {
                    kind: "code",
                    language: "bash",
                    filename: "Claude Code — pick one",
                    code: `# macOS, Linux, WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex

# Homebrew (does not auto-update; run 'brew upgrade claude-code')
brew install --cask claude-code

# WinGet (does not auto-update)
winget install Anthropic.ClaudeCode`,
                },
                {
                    kind: "prose",
                    text: "Native installs update themselves in the background. On native Windows, install **Git for Windows** as well — without it Claude Code falls back to PowerShell for its shell tool instead of Bash.",
                },
                { kind: "heading", id: "install-codex", text: "Install Codex" },
                {
                    kind: "code",
                    language: "bash",
                    filename: "Codex CLI — install and update",
                    code: `# Install (and later, update — same command)
curl -fsSL https://chatgpt.com/codex/install.sh | sh

# First run signs you in with your ChatGPT account
codex`,
                },
                { kind: "heading", id: "first-task", text: "Your first task, in the right order" },
                {
                    kind: "list",
                    ordered: true,
                    items: [
                        { term: "Generate the instruction file", detail: "Run `/init` in either tool. Claude Code writes `CLAUDE.md`; Codex writes `AGENTS.md`. Both read the codebase first and propose build commands and conventions." },
                        { term: "Read what it wrote", detail: "This file is loaded into every future session. Delete anything the agent can already derive from the code, and keep the things it cannot — pitfalls, rationale, conventions that differ from the tool defaults." },
                        { term: "Ask a read-only question first", detail: "\"Explain how authentication flows through this repo, and cite the files.\" You are checking whether the agent can find things before you let it change things." },
                        { term: "Give it one bounded change", detail: "One file, one behaviour, with a test you can run. Ask for the plan before the edit." },
                        { term: "Verify yourself", detail: "Run the build and the tests in your own terminal, then read the diff. Never approve a diff you have not read." },
                        { term: "Write down what you corrected", detail: "The first correction you repeat twice belongs in `CLAUDE.md` or `AGENTS.md`. This is how the setup compounds." },
                    ],
                },
                {
                    kind: "callout",
                    tone: "tip",
                    title: "Start read-only for the first day",
                    text: "Both tools default to asking before they write or reach the network. Leave that default alone until you have seen the agent be wrong at least once, and you know what its mistakes look like in this repository.",
                },
            ],
        },
        {
            id: "side-by-side",
            number: "3",
            title: "Claude Code and Codex, side by side",
            lead: "The same seven concepts exist in both tools under different filenames. Learn the mapping once.",
            level: "foundation",
            applies: "both",
            blocks: [
                {
                    kind: "prose",
                    text: "Both tools are terminal-first agent harnesses with an IDE extension, a cloud runner, and a GitHub integration. They differ in file layout and in how permissions are expressed, not in the shape of the loop.",
                },
                {
                    kind: "compare",
                    caption: "Concept-for-concept mapping",
                    rows: [
                        { aspect: "Standing instructions", claude: "`CLAUDE.md` (also `./.claude/CLAUDE.md`, `CLAUDE.local.md`)", codex: "`AGENTS.md` (plus `AGENTS.override.md`)" },
                        { aspect: "Scoped instruction files", claude: "`.claude/rules/*.md` with `paths:` frontmatter", codex: "Nested `AGENTS.md` per directory" },
                        { aspect: "Configuration file", claude: "`.claude/settings.json` (JSON)", codex: "`.codex/config.toml` (TOML)" },
                        { aspect: "Reusable procedures", claude: "`.claude/skills/<name>/SKILL.md`, run as `/name`", codex: "`.agents/skills/<name>/SKILL.md`, run as `$name`" },
                        { aspect: "Delegated agents", claude: "`.claude/agents/*.md` subagents", codex: "Cloud tasks and `codex exec` runs" },
                        { aspect: "External tools", claude: "`.mcp.json` / `claude mcp add`", codex: "`[mcp_servers.*]` in `config.toml` / `codex mcp add`" },
                        { aspect: "Permission control", claude: "`permissions.allow/ask/deny` rules + sandbox", codex: "`approval_policy` + `sandbox_mode` + permission profiles" },
                        { aspect: "Lifecycle automation", claude: "Hooks on ~30 events in `settings.json`", codex: "No equivalent hook system — use CI and git hooks" },
                        { aspect: "Non-interactive run", claude: "`claude -p \"...\"`", codex: "`codex exec \"...\"`" },
                        { aspect: "Bootstrap command", claude: "`/init`", codex: "`/init`" },
                    ],
                },
                { kind: "heading", id: "one-repo-both-tools", text: "Running both tools on one repository" },
                {
                    kind: "prose",
                    text: "Claude Code reads `CLAUDE.md`, not `AGENTS.md`. Keep one source of truth by writing `AGENTS.md` and importing it, so a change in shared conventions never has to be made twice.",
                },
                {
                    kind: "code",
                    language: "markdown",
                    filename: "CLAUDE.md",
                    code: `@AGENTS.md

## Claude Code only

Use plan mode for changes under \`src/billing/\`.
Run \`pnpm test\` before reporting a task complete.`,
                },
                {
                    kind: "callout",
                    tone: "note",
                    title: "Symlinks work too, but not everywhere",
                    text: "`ln -s AGENTS.md CLAUDE.md` is enough when you have nothing Claude-specific to add. On Windows a symlink needs Administrator rights or Developer Mode, so prefer the `@AGENTS.md` import — it is portable and lets you append tool-specific rules underneath.",
                },
            ],
        },
    ],
}
