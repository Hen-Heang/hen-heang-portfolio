import type { DocPart } from "@/src/lib/types/handbook"

export const partConfiguration: DocPart = {
    id: "configuration",
    number: "4",
    title: "Configuration",
    summary: "The files, the precedence between them, the permission model, and the hooks that enforce what prose cannot.",
    sections: [
        {
            id: "config-files",
            number: "10",
            title: "Configuration files and which one wins",
            lead: "Know every file in play and the exact order they resolve in — most configuration bugs are precedence bugs.",
            level: "working",
            applies: "both",
            blocks: [
                { kind: "heading", id: "claude-tree", text: "The `.claude` directory" },
                {
                    kind: "tree",
                    caption: "Project scope — committed unless noted",
                    lines: [
                        { depth: 0, name: "your-project/" },
                        { depth: 1, name: "CLAUDE.md", note: "Instructions read every session", emphasis: true },
                        { depth: 1, name: "CLAUDE.local.md", note: "Your personal overrides — gitignore this" },
                        { depth: 1, name: ".mcp.json", note: "Project MCP servers, shared with the team" },
                        { depth: 1, name: ".worktreeinclude", note: "Gitignored files to copy into new worktrees" },
                        { depth: 1, name: ".claude/" },
                        { depth: 2, name: "settings.json", note: "Permissions, hooks, model — committed", emphasis: true },
                        { depth: 2, name: "settings.local.json", note: "Your overrides for this project — gitignored" },
                        { depth: 2, name: "rules/", note: "Topic instructions, optionally path-gated" },
                        { depth: 2, name: "skills/", note: "Reusable procedures, one folder each" },
                        { depth: 2, name: "agents/", note: "Subagents with their own context window" },
                        { depth: 2, name: "commands/", note: "Single-file prompts — skills supersede these" },
                        { depth: 2, name: "workflows/", note: "Scripts that orchestrate many subagents" },
                        { depth: 2, name: "output-styles/", note: "Instruction sets that adjust how the agent writes" },
                    ],
                },
                {
                    kind: "tree",
                    caption: "User scope — `~/`, applies to every project",
                    lines: [
                        { depth: 0, name: "~/.claude/" },
                        { depth: 1, name: "CLAUDE.md", note: "Your preferences everywhere", emphasis: true },
                        { depth: 1, name: "settings.json", note: "Your defaults for all projects", emphasis: true },
                        { depth: 1, name: "keybindings.json", note: "Custom keyboard shortcuts" },
                        { depth: 1, name: "themes/", note: "Custom colour themes" },
                        { depth: 1, name: "rules/ · skills/ · agents/ · workflows/", note: "Personal versions of each" },
                        { depth: 1, name: "projects/<project>/memory/", note: "Auto memory — the agent writes this" },
                        { depth: 0, name: "~/.claude.json", note: "App state, UI preferences, local MCP servers" },
                    ],
                },
                { kind: "heading", id: "settings-precedence", text: "Settings precedence, highest first" },
                {
                    kind: "table",
                    columns: ["#", "Layer", "File", "Who it is for"],
                    rows: [
                        ["1", "Managed", "`managed-settings.json`, MDM, or the claude.ai console", "Your organization — you cannot override it"],
                        ["2", "Command line", "`claude --settings <file>`", "You, this session only"],
                        ["3", "Project local", "`.claude/settings.local.json`", "You, this project"],
                        ["4", "Shared project", "`.claude/settings.json`", "Everyone on the project, via git"],
                        ["5", "User", "`~/.claude/settings.json`", "You, every project"],
                    ],
                },
                {
                    kind: "code",
                    language: "json",
                    filename: ".claude/settings.json",
                    code: `{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": ["Bash(pnpm run lint)", "Bash(pnpm run test:*)"],
    "ask": ["Bash(git push:*)"],
    "deny": ["Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)"],
    "additionalDirectories": ["../shared-types"],
    "defaultMode": "default"
  },
  "env": { "NODE_ENV": "test" },
  "autoMemoryEnabled": true
}`,
                },
                { kind: "heading", id: "codex-config", text: "Codex `config.toml`" },
                {
                    kind: "table",
                    caption: "Codex precedence, highest first",
                    columns: ["#", "Source"],
                    rows: [
                        ["1", "CLI flags and `--config` overrides"],
                        ["2", "Project config — `.codex/config.toml`, closest to the working directory wins"],
                        ["3", "Profile files — `~/.codex/<profile>.config.toml`"],
                        ["4", "User config — `~/.codex/config.toml`"],
                        ["5", "Cloud-managed defaults"],
                        ["6", "System config — `/etc/codex/config.toml`"],
                        ["7", "Built-in defaults"],
                    ],
                },
                {
                    kind: "code",
                    language: "toml",
                    filename: "~/.codex/config.toml",
                    code: `model = "gpt-5.6"
approval_policy = "on-request"     # or "never"
sandbox_mode = "workspace-write"
default_permissions = ":workspace" # :read-only | :workspace | :danger-full-access
web_search = "cached"              # cached | indexed | live | disabled

[windows]
sandbox = "elevated"               # fall back to "unelevated" if needed

[permissions.review-only]
# a named profile you can switch into`,
                },
                {
                    kind: "callout",
                    tone: "note",
                    title: "Project config only loads for trusted projects",
                    text: "`.codex/config.toml` is read from the repository, so Codex loads it only after you have trusted the project. The same reasoning applies to Claude Code hooks defined in a project settings file — a repository you just cloned cannot silently run commands on your machine.",
                },
                {
                    kind: "callout",
                    tone: "tip",
                    title: "When a setting seems ignored, prove where it came from",
                    text: "Run `/permissions` in Claude Code — the dialog names the settings file each rule came from. `claude doctor` prints the fully resolved configuration and flags rules it had to skip.",
                },
            ],
        },
        {
            id: "permissions",
            number: "11",
            title: "Permissions and sandboxing",
            lead: "Decide exactly what runs without you, what stops for you, and what never runs at all.",
            level: "working",
            applies: "both",
            blocks: [
                {
                    kind: "prose",
                    text: "Two independent layers protect you. **Permissions** decide which tool calls the harness will make; they cover every tool. **Sandboxing** is OS-level enforcement on shell commands and their child processes. Permissions can be talked around by a convincing prompt injection; a sandbox cannot. Use both.",
                },
                {
                    kind: "flow",
                    flow: {
                        title: "How one tool call is decided (Claude Code)",
                        description: "Rules are evaluated deny, then ask, then allow. The first match in that order decides — specificity never reorders it.",
                        rows: [
                            [
                                { id: "call", label: "Tool call requested", detail: "e.g. Bash(git push origin main)", tone: "edge" },
                                { id: "deny", label: "deny rules", detail: "Any match → blocked, always" },
                                { id: "ask", label: "ask rules", detail: "Any match → prompt you, even in auto mode" },
                            ],
                            [
                                { id: "allow", label: "allow rules", detail: "Match → run with no prompt" },
                                { id: "mode", label: "Permission mode", detail: "default · acceptEdits · plan · auto · dontAsk · bypass" },
                                { id: "hook", label: "PreToolUse hook", detail: "Last word — can deny or approve", tone: "accent" },
                            ],
                            [
                                { id: "sandbox", label: "Sandbox", detail: "OS-level fence on Bash and its children", tone: "accent" },
                                { id: "run", label: "Command runs", detail: "Result observed by the agent" },
                                { id: "prompt", label: "You are asked", detail: "Approve, deny, or add a rule", tone: "edge" },
                            ],
                        ],
                        returns: [{ from: "prompt", to: "call", label: "\"Yes, don't ask again\" writes a new allow rule" }],
                        legend: [
                            { swatch: "edge", label: "You" },
                            { swatch: "default", label: "Rule evaluation" },
                            { swatch: "accent", label: "Enforcement point" },
                            { swatch: "return", label: "Feeds back into configuration" },
                        ],
                    },
                },
                { kind: "heading", id: "rule-syntax", text: "Rule syntax" },
                {
                    kind: "prose",
                    text: "Every rule is `Tool` or `Tool(specifier)`. A bare tool name in `deny` removes the tool from the agent's context entirely, so it never even sees it. A scoped rule leaves the tool available and blocks only the matching calls.",
                },
                {
                    kind: "table",
                    columns: ["Rule", "Matches"],
                    rows: [
                        ["`Bash`", "Every shell command"],
                        ["`Bash(pnpm run build)`", "That exact command"],
                        ["`Bash(pnpm run test:*)`", "Any command starting with that prefix"],
                        ["`Read(./.env)`", "Reading `.env` in the current directory"],
                        ["`Read(./secrets/**)`", "Reading anything under `secrets/`"],
                        ["`Edit(/src/**/*.ts)`", "Editing TypeScript under `src/`, anchored at the settings source"],
                        ["`Read(//Users/alice/keys/**)`", "An absolute path — note the **double** leading slash"],
                        ["`WebFetch(domain:example.com)`", "Fetches to that host"],
                        ["`WebFetch(domain:*.example.com)`", "Any subdomain, but not the apex"],
                        ["`mcp__github`", "Every tool from the `github` MCP server"],
                        ["`mcp__github__create_issue`", "One specific MCP tool"],
                        ["`Agent(Explore)`", "Use of the Explore subagent"],
                    ],
                },
                {
                    kind: "callout",
                    tone: "warn",
                    title: "A single leading slash is not an absolute path",
                    text: "`Read(/Users/alice/file)` anchors at the settings source, not at the filesystem root. Absolute paths need two: `Read(//Users/alice/file)`. This trips people up constantly, and it fails open — the rule you thought protected a file matches nothing.",
                },
                {
                    kind: "prose",
                    text: "Rules match each subcommand of a compound command independently, so `Bash(safe-cmd *)` does not approve `safe-cmd && rm -rf /`. Deny and ask rules also reach inside subshells, command substitutions, and loop bodies. Environment-runner wrappers such as `npx`, `docker exec`, and `devbox run` are **not** stripped — write one rule per inner command rather than trusting `Bash(devbox run *)`.",
                },
                { kind: "heading", id: "modes", text: "Permission modes" },
                {
                    kind: "table",
                    caption: "Claude Code — set the starting mode with `defaultMode`",
                    columns: ["Mode", "Behaviour"],
                    rows: [
                        ["`default`", "Prompts on first use of each tool. Shown as **Manual** in the UI."],
                        ["`acceptEdits`", "Auto-accepts file edits and common filesystem commands inside the working directories"],
                        ["`plan`", "Reads and explores, never edits source. The right mode for \"tell me how you would do this\"."],
                        ["`auto`", "Auto-approves with background safety checks that verify actions match your request"],
                        ["`dontAsk`", "Auto-denies anything not pre-approved. Good for unattended runs with a tight allowlist."],
                        ["`bypassPermissions`", "Skips prompts. Containers and disposable VMs only."],
                    ],
                },
                {
                    kind: "table",
                    caption: "Codex",
                    columns: ["Mode", "Sandbox", "Approvals", "Behaviour"],
                    rows: [
                        ["Ask for approval (default)", "`workspace-write`", "`on-request`", "Reads and edits inside the workspace; asks before the network or anything outside it"],
                        ["Approve for me", "`workspace-write`", "reviewed automatically", "Same boundary; requests for extra access are reviewed for you rather than by you"],
                        ["Full access", "unrestricted", "none", "Any file, any command, network included. Materially raises the risk of loss and leaks."],
                    ],
                },
                {
                    kind: "prose",
                    text: "Changing who reviews a request never widens the sandbox — the two are separate dials. In the Codex CLI, `/permissions` manages both.",
                },
                {
                    kind: "code",
                    language: "json",
                    filename: "A sane starting point for a work repository",
                    code: `{
  "permissions": {
    "deny": [
      "Read(./.env)", "Read(./.env.*)",
      "Read(./**/credentials.json)", "Read(~/.ssh/**)",
      "Bash(curl:*)", "Bash(git push --force:*)"
    ],
    "ask": ["Bash(git push:*)", "Bash(gh pr merge:*)"],
    "allow": [
      "Bash(pnpm install)", "Bash(pnpm run:*)",
      "Bash(git status)", "Bash(git diff:*)", "Bash(git log:*)"
    ],
    "defaultMode": "default",
    "disableBypassPermissionsMode": "disable"
  }
}`,
                },
                {
                    kind: "callout",
                    tone: "note",
                    title: "Deny rules cannot carry exceptions",
                    text: "`Bash(aws *)` in deny blocks `Bash(aws s3 ls)` even though you also allowed it — deny is checked first and the first match ends the decision. Write the narrow deny rules you actually mean.",
                },
            ],
        },
        {
            id: "hooks",
            number: "12",
            title: "Hooks — automation that does not depend on the model remembering",
            lead: "Attach deterministic shell commands to lifecycle events so critical checks always run.",
            level: "advanced",
            applies: "claude",
            blocks: [
                {
                    kind: "prose",
                    text: "A hook is a shell command bound to an event. It runs whether or not the model thought of it, which is precisely why it is the right home for formatting, secret scanning, and any rule you have written into `CLAUDE.md` twice and watched get skipped anyway.",
                },
                {
                    kind: "code",
                    language: "json",
                    filename: ".claude/settings.json",
                    code: `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          { "type": "command", "command": "pnpm exec prettier --write \\"$CLAUDE_FILE_PATHS\\"" }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "\${CLAUDE_PROJECT_DIR}/.claude/hooks/scan-secrets.sh" }
        ]
      }
    ]
  }
}`,
                },
                {
                    kind: "table",
                    caption: "The events you will reach for first",
                    columns: ["Event", "Fires when", "Blocking"],
                    rows: [
                        ["`SessionStart`", "A session begins, resumes, clears, compacts, or forks", "Exit 2 prevents the session starting"],
                        ["`UserPromptSubmit`", "Before your prompt is processed", "Exit 2 rejects the prompt"],
                        ["`PreToolUse`", "Before a tool runs — matcher is the tool name", "Exit 2 blocks the call"],
                        ["`PostToolUse`", "After a tool succeeds", "Exit 2 stops the agent from finishing"],
                        ["`PostToolUseFailure`", "After a tool fails", "Exit 2 stops the agent from finishing"],
                        ["`Stop`", "The agent is about to finish responding", "Exit 2 makes it keep working"],
                        ["`SubagentStart` / `SubagentStop`", "A subagent spawns or finishes", "Stop can block with exit 2"],
                        ["`PreCompact` / `PostCompact`", "Around context compaction", "PreCompact can block"],
                        ["`FileChanged`", "A watched file changes — matcher is a filename pattern", "Exit 2 prevents the change"],
                        ["`InstructionsLoaded`", "Instruction files load — invaluable for debugging", "Informational"],
                        ["`Notification`", "A notification is sent, e.g. a permission prompt", "Informational"],
                        ["`SessionEnd`", "The session terminates", "Informational"],
                    ],
                },
                {
                    kind: "prose",
                    text: "There are around thirty events in total, covering permission decisions, task lifecycle, model switches, worktrees, config changes, and MCP elicitation. The full list is in the hooks reference; the twelve above cover most real setups.",
                },
                { kind: "heading", id: "hook-contract", text: "The exit-code contract" },
                {
                    kind: "table",
                    columns: ["Exit code", "Meaning"],
                    rows: [
                        ["`0`", "Success. Valid JSON on stdout is honoured."],
                        ["`2`", "Block the action. `stderr` is shown to the agent as the reason."],
                        ["anything else", "Non-blocking error — the action still proceeds."],
                    ],
                },
                {
                    kind: "code",
                    language: "bash",
                    filename: ".claude/hooks/scan-secrets.sh",
                    code: `#!/usr/bin/env bash
# PreToolUse hook: refuse commands that would print a secret file.
set -euo pipefail

payload="$(cat)"                       # hook input arrives on stdin as JSON
command="$(jq -r '.tool_input.command // ""' <<<"$payload")"

if grep -Eq '(^|[[:space:]])(cat|less|head|tail)[[:space:]]+.*\\.env' <<<"$command"; then
  echo "Refusing: this command would print .env to the transcript." >&2
  exit 2
fi
exit 0`,
                },
                {
                    kind: "callout",
                    tone: "tip",
                    title: "Use InstructionsLoaded to debug a rule that never fires",
                    text: "Log every instruction file as it loads, with the reason. It answers the two questions that cause most \"the agent ignored my rule\" reports: did the file load at all, and did it load before or after the thing it was supposed to affect?",
                },
                {
                    kind: "callout",
                    tone: "warn",
                    title: "Hooks run with your credentials",
                    text: "A hook in a project settings file is a shell command from a repository. Read hooks before trusting a workspace you did not write, and keep anything that touches secrets or production in your user settings rather than a committed project file.",
                },
            ],
        },
    ],
}
