import type { DocPart } from "@/src/lib/types/handbook"

export const partContext: DocPart = {
    id: "context",
    number: "2",
    title: "Context and instructions",
    summary: "What the agent sees at the start of a session, what you can put there on purpose, and what survives a long run.",
    sections: [
        {
            id: "context-window",
            number: "4",
            title: "The context window is a budget you spend",
            lead: "Know exactly what is loaded before you type, and what happens when the session runs long.",
            level: "working",
            applies: "both",
            blocks: [
                {
                    kind: "prose",
                    text: "Every session starts with a fresh context window and immediately fills part of it before you say anything. Knowing the running order tells you why an instruction was ignored — usually it was never loaded at all.",
                },
                {
                    kind: "table",
                    caption: "Claude Code startup order",
                    columns: ["#", "What loads", "Visible to you?"],
                    rows: [
                        ["1", "System prompt — behaviour, tool use, response format", "No"],
                        ["2", "Auto memory — first 200 lines or 25 KB of `MEMORY.md`", "No"],
                        ["3", "Environment info — cwd, platform, shell, git branch and status", "No"],
                        ["4", "MCP tool names (schemas stay deferred until needed)", "No"],
                        ["5", "Skill descriptions — names and one-liners, not bodies", "No"],
                        ["6", "`~/.claude/CLAUDE.md` — your personal instructions", "Yes"],
                        ["7", "Project `CLAUDE.md` and unscoped `.claude/rules/*.md`", "Yes"],
                        ["8", "Your prompt", "Yes"],
                    ],
                },
                {
                    kind: "prose",
                    text: "Run `/context` in a session to see the real numbers for the current run, including which memory files actually loaded. If a file you wrote is not in that list, the agent cannot see it — no amount of rewording will help.",
                },
                { kind: "heading", id: "compaction", text: "What survives compaction" },
                {
                    kind: "prose",
                    text: "When the window fills, Claude Code summarizes the conversation and continues. Content loaded from disk is re-injected; content that only ever existed in the conversation is summarized away. This table is the single most useful thing to know about long sessions.",
                },
                {
                    kind: "table",
                    columns: ["Loaded as", "After compaction"],
                    rows: [
                        ["System prompt and output style", "Still apply"],
                        ["Project-root `CLAUDE.md` and unscoped rules", "Re-injected from disk"],
                        ["Auto memory", "Re-injected from disk"],
                        ["The plan written in plan mode", "Re-injected from disk"],
                        ["Rules with `paths:` frontmatter", "Reloaded when a matching file is next read"],
                        ["Nested `CLAUDE.md` in subdirectories", "Reloaded when a file in that directory is next read"],
                        ["Files the agent read or edited", "Up to five re-read, most recently modified first"],
                        ["Invoked skill bodies", "Re-injected, capped at 5,000 tokens each and 25,000 total"],
                        ["Anything you only said in chat", "Summarized — treat it as gone"],
                    ],
                },
                {
                    kind: "callout",
                    tone: "tip",
                    title: "Put the important instructions at the top of a SKILL.md",
                    text: "Skill bodies are truncated from the end when they exceed the per-skill cap after compaction. The first lines of the file are the ones guaranteed to come back.",
                },
                {
                    kind: "callout",
                    tone: "warn",
                    title: "An instruction you gave only in chat will not persist",
                    text: "If a correction disappeared after a long session, it was conversation-only, it lives in a nested file that has not reloaded, or it is a path-scoped rule that has not matched a file since. Move it into CLAUDE.md or AGENTS.md and it stops being a recurring problem.",
                },
            ],
        },
        {
            id: "instruction-files",
            number: "5",
            title: "CLAUDE.md and AGENTS.md — the files that shape every session",
            lead: "Write instructions that are actually followed: correctly placed, specific, and short.",
            level: "working",
            applies: "both",
            blocks: [
                { kind: "heading", id: "claude-md-scopes", text: "Where Claude Code looks" },
                {
                    kind: "table",
                    caption: "Load order, broadest scope first — later files are read last and therefore win ties",
                    columns: ["Scope", "Location", "Use it for"],
                    rows: [
                        [
                            "Managed policy",
                            "macOS `/Library/Application Support/ClaudeCode/CLAUDE.md` · Linux and WSL `/etc/claude-code/CLAUDE.md` · Windows `C:\\Program Files\\ClaudeCode\\CLAUDE.md`",
                            "Organization standards nobody can opt out of",
                        ],
                        ["User", "`~/.claude/CLAUDE.md`", "Your preferences across every project"],
                        ["Project", "`./CLAUDE.md` or `./.claude/CLAUDE.md`", "Team conventions, committed to git"],
                        ["Local", "`./CLAUDE.local.md` (gitignore it)", "Your sandbox URLs, personal test data"],
                    ],
                },
                {
                    kind: "prose",
                    text: "Files in directories above your working directory load at launch, ordered from the filesystem root down, so the file closest to where you started is read last. Files in subdirectories load on demand when the agent reads a file there.",
                },
                { kind: "heading", id: "agents-md-scopes", text: "Where Codex looks" },
                {
                    kind: "prose",
                    text: "Codex builds an instruction chain at startup: global first, then project files from the git root down to your working directory. In each location it checks `AGENTS.override.md` before `AGENTS.md`. Files closer to your current directory appear later in the combined prompt and therefore override earlier guidance. The chain stops once it reaches `project_doc_max_bytes` — 32 KiB by default.",
                },
                {
                    kind: "tree",
                    caption: "A layered Codex setup",
                    lines: [
                        { depth: 0, name: "~/.codex/AGENTS.md", note: "Your personal working agreements, every repo", emphasis: true },
                        { depth: 0, name: "my-repo/" },
                        { depth: 1, name: "AGENTS.md", note: "Repository expectations, committed", emphasis: true },
                        { depth: 1, name: "services/" },
                        { depth: 2, name: "payments/" },
                        { depth: 3, name: "AGENTS.override.md", note: "Wins over the root file for this subtree" },
                    ],
                },
                {
                    kind: "code",
                    language: "bash",
                    filename: "Verify the chain loaded in the order you expect",
                    code: `codex --ask-for-approval never "Summarize the current instructions."`,
                },
                { kind: "heading", id: "writing-rules", text: "How to write instructions that get followed" },
                {
                    kind: "list",
                    items: [
                        { term: "Stay under 200 lines", detail: "Longer files consume context and measurably reduce adherence. If it is growing, that content belongs in a path-scoped rule or a skill." },
                        { term: "Be concrete enough to verify", detail: "\"Use 2-space indentation\" beats \"format code properly\". \"Run `pnpm test` before committing\" beats \"test your changes\"." },
                        { term: "Write what cannot be derived", detail: "Skip the directory listing and the dependency list — the agent can read those. Keep the pitfalls, the rationale, and the conventions that differ from the tool defaults." },
                        { term: "Remove contradictions", detail: "When two files disagree, the agent picks one arbitrarily. Review the whole set periodically, including nested files." },
                        { term: "Add an entry the second time you repeat yourself", detail: "The first correction is a conversation. The second is a missing instruction." },
                    ],
                },
                { kind: "heading", id: "imports", text: "Imports" },
                {
                    kind: "prose",
                    text: "`CLAUDE.md` can pull in other files with `@path/to/file`, resolved relative to the importing file, up to four hops deep. Imports are expanded at launch, so they organize content — they do not reduce what it costs. Wrap a path in backticks to mention it without importing it.",
                },
                {
                    kind: "code",
                    language: "markdown",
                    filename: "CLAUDE.md",
                    code: `See @README for the project overview and @package.json for available commands.

# Additional instructions
- Git workflow: @docs/git-instructions.md
- Personal preferences shared across worktrees: @~/.claude/my-project-instructions.md`,
                },
                {
                    kind: "callout",
                    tone: "note",
                    title: "External imports prompt for approval once",
                    text: "An import in a project file that resolves outside your working directory triggers a one-time approval dialog listing the files. This exists because a teammate could commit that import — decline it and it stays disabled.",
                },
            ],
        },
        {
            id: "rules-and-memory",
            number: "6",
            title: "Rules and memory — instructions that load only when relevant",
            lead: "Split a growing instruction file into path-scoped rules, and understand the notes the agent writes about you.",
            level: "working",
            applies: "claude",
            blocks: [
                { kind: "heading", id: "rules", text: "Path-scoped rules" },
                {
                    kind: "prose",
                    text: "`.claude/rules/` holds one markdown file per topic, discovered recursively. A rule with no frontmatter loads at launch with the same priority as `.claude/CLAUDE.md`. A rule with `paths:` frontmatter loads only when the agent reads a matching file — which is how you keep backend conventions out of a frontend task.",
                },
                {
                    kind: "code",
                    language: "markdown",
                    filename: ".claude/rules/api-design.md",
                    code: `---
paths:
  - "src/api/**/*.ts"
  - "src/**/*.{controller,service}.ts"
---

# API rules

- Every endpoint validates its input before touching a service.
- Errors use the shared error envelope, never a bare string.
- A new endpoint ships with an integration test in the same PR.`,
                },
                {
                    kind: "table",
                    caption: "Glob patterns in `paths:`",
                    columns: ["Pattern", "Matches"],
                    rows: [
                        ["`**/*.ts`", "All TypeScript files in any directory"],
                        ["`src/**/*`", "Everything under `src/`"],
                        ["`*.md`", "Markdown files in the project root only"],
                        ["`src/components/*.tsx`", "Components in one specific directory"],
                        ["`src/**/*.{ts,tsx}`", "Brace expansion — two patterns from one line"],
                    ],
                },
                {
                    kind: "prose",
                    text: "Personal rules in `~/.claude/rules/` apply to every project and load before project rules, so project rules take priority. The directory supports symlinks, which is the clean way to share one rule set across several repositories.",
                },
                { kind: "heading", id: "auto-memory", text: "Auto memory: the notes the agent keeps" },
                {
                    kind: "prose",
                    text: "Separately from anything you write, Claude Code saves short notes as it works — your preferences, corrections you gave it, and project facts it cannot derive from the code. They live in plain markdown you can read, edit, or delete.",
                },
                {
                    kind: "tree",
                    caption: "`~/.claude/projects/<project>/memory/`",
                    lines: [
                        { depth: 0, name: "MEMORY.md", note: "Index — first 200 lines or 25 KB load every session", emphasis: true },
                        { depth: 0, name: "user_role.md", note: "One memory, read on demand" },
                        { depth: 0, name: "feedback_testing.md", note: "One memory, read on demand" },
                    ],
                },
                {
                    kind: "table",
                    caption: "Two memory systems, different jobs",
                    columns: ["", "CLAUDE.md", "Auto memory"],
                    rows: [
                        ["Who writes it", "You", "The agent"],
                        ["What it holds", "Instructions and rules", "Learnings, preferences, corrections"],
                        ["Scope", "Project, user, or organization", "Per repository, shared across worktrees, machine-local"],
                        ["Use it for", "Standards, workflows, architecture", "Things you would otherwise re-explain every session"],
                    ],
                },
                {
                    kind: "code",
                    language: "json",
                    filename: ".claude/settings.json — turn it off for one project",
                    code: `{
  "autoMemoryEnabled": false
}`,
                },
                {
                    kind: "callout",
                    tone: "tip",
                    title: "Audit it once a month",
                    text: "Run `/memory` to browse what has been saved. Memories reflect what was true when they were written — delete the stale ones rather than letting them quietly steer future sessions.",
                },
            ],
        },
    ],
}
