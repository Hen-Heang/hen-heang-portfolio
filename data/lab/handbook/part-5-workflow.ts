import type { DocPart } from "@/src/lib/types/handbook"

export const partWorkflow: DocPart = {
    id: "workflow",
    number: "5",
    title: "Daily workflow",
    summary: "The loop to run every day, the gates that decide when a stage is finished, and how to run the whole thing unattended.",
    sections: [
        {
            id: "development-loop",
            number: "13",
            title: "The development loop",
            lead: "One pipeline, eight stages, each with a deliverable that feeds the next.",
            level: "working",
            applies: "both",
            blocks: [
                {
                    kind: "prose",
                    text: "The failure mode of agent-assisted work is not bad code — it is unbounded work. A stage that never declares itself finished quietly turns into a 40-file diff nobody can review. Give every stage an input, a deliverable, and a criterion that says when it is done.",
                },
                {
                    kind: "flow",
                    flow: {
                        title: "The pipeline",
                        description: "Each stage produces the next stage's input. An unmet criterion stops progression rather than deferring the problem downstream.",
                        rows: [
                            [
                                { id: "frame", label: "Frame", detail: "Goal, constraints, definition of done", tone: "edge" },
                                { id: "explore", label: "Explore", detail: "Read-only. Find the real change surface." },
                                { id: "plan", label: "Plan", detail: "Ordered, verifiable steps" },
                                { id: "implement", label: "Implement", detail: "Smallest coherent change", tone: "accent" },
                            ],
                            [
                                { id: "test", label: "Test", detail: "Run the suite; add the missing case" },
                                { id: "review", label: "Review", detail: "Independent pass over the diff" },
                                { id: "commit", label: "Commit", detail: "Conventional message, feature branch" },
                                { id: "handoff", label: "Handoff", detail: "State, evidence, open risks", tone: "edge" },
                            ],
                        ],
                        returns: [
                            { from: "test", to: "implement", label: "Red — fix, then re-run (cap the retries)" },
                            { from: "review", to: "plan", label: "Scope changed — re-plan, do not patch over it" },
                        ],
                        legend: [
                            { swatch: "edge", label: "Human owns this" },
                            { swatch: "default", label: "Agent stage" },
                            { swatch: "accent", label: "Changes the working tree" },
                            { swatch: "return", label: "Failure path" },
                        ],
                    },
                },
                {
                    kind: "table",
                    caption: "Criteria per stage",
                    columns: ["Stage", "Input", "Done when", "When unmet"],
                    rows: [
                        ["Frame", "Ticket, bug report, idea", "The goal, the constraints, and the definition of done are written down in one paragraph", "Ask, do not assume. An unframed task produces confident work on the wrong problem."],
                        ["Explore", "The framed goal", "The agent names the files it will change and cites why, without having changed anything", "Widen the search or point it at an entry point yourself"],
                        ["Plan", "Exploration findings", "Ordered steps, each with the check that proves it", "Steps that cannot be verified get split until they can"],
                        ["Implement", "The approved plan", "One coherent change, built, matching the plan", "Scope drift returns to Plan rather than continuing"],
                        ["Test", "The change", "Suite green, and a new test covers the new behaviour", "Re-enter Implement with the failure list; after three rounds, take over"],
                        ["Review", "The full cumulative diff", "No blocking findings; every finding has a file, a line, and a failure scenario", "Fix, then re-review only the changed part"],
                        ["Commit", "Reviewed change", "Conventional commit on a feature branch, pushed", "Convention or protected-branch violations are fixed before retry"],
                        ["Handoff", "Session end", "What is done, what is verified, what is unresolved, and the next safe command", "An unverified item is stated as unverified — never as complete"],
                    ],
                },
                { kind: "heading", id: "plan-mode", text: "Plan before you let it write" },
                {
                    kind: "prose",
                    text: "Plan mode is the highest-leverage habit in the whole handbook. The agent reads and explores but cannot edit, so you get to inspect the intent before the diff exists — and a bad plan costs you thirty seconds instead of a revert.",
                },
                {
                    kind: "code",
                    language: "bash",
                    filename: "Enter plan mode",
                    code: `# Claude Code — Shift+Tab cycles the permission mode, or:
claude --permission-mode plan

# Persist it as the default for a risky repository, in .claude/settings.json:
#   { "permissions": { "defaultMode": "plan" } }

# Codex — review without touching the working tree:
codex review`,
                },
                {
                    kind: "callout",
                    tone: "tip",
                    title: "Cap the retry loop yourself",
                    text: "An agent that has failed the same test three times is not one attempt away from succeeding — it is missing information. Stop, read the failure yourself, and hand back the missing fact. This single rule saves more time than any prompt technique.",
                },
            ],
        },
        {
            id: "quality-gates",
            number: "14",
            title: "Quality gates and review",
            lead: "Define what counts as evidence, so \"it works\" stops being an opinion.",
            level: "working",
            applies: "both",
            blocks: [
                {
                    kind: "prose",
                    text: "A plausible implementation is not a verified one. A gate is a check with a binary outcome that must pass before work advances — compile, test, lint, type-check, security scan, and a review pass that did not write the code.",
                },
                {
                    kind: "table",
                    caption: "Where to put each gate",
                    columns: ["Gate", "Enforce it as", "Why there"],
                    rows: [
                        ["Formatting", "`PostToolUse` hook on `Edit`", "Deterministic, instant, and never worth a token of the model's attention"],
                        ["Secret scanning", "`PreToolUse` hook on `Bash`, plus a deny rule on `.env`", "Must hold even when a prompt injection is trying to talk past it"],
                        ["Type-check and unit tests", "A command in `CLAUDE.md` the agent is told to run", "The agent needs the output to fix its own work"],
                        ["Integration tests", "CI on the pull request", "Too slow for the inner loop; too important to skip"],
                        ["Independent review", "A reviewer subagent, then a human", "The context that wrote the code is the worst context to judge it"],
                        ["Human approval", "The permission prompt and the PR", "Accountability does not delegate"],
                    ],
                },
                { kind: "heading", id: "review-prompt", text: "Ask for a review that is falsifiable" },
                {
                    kind: "prose",
                    text: "\"Review this code\" produces a list of style opinions. Demand a concrete failure scenario for every finding and the list gets short, specific, and worth reading.",
                },
                {
                    kind: "code",
                    language: "text",
                    filename: "A review prompt that works",
                    code: `Review the uncommitted diff for correctness only — not style.

For each finding give exactly:
  1. file:line
  2. the inputs or state that produce the wrong behaviour
  3. the observable wrong result
  4. the smallest fix

Rank by severity. If a finding is a guess, label it PLAUSIBLE, not CONFIRMED.
If you find nothing, say so in one line. Do not pad the list.`,
                },
                {
                    kind: "prose",
                    text: "Both tools ship review entry points: `/code-review` and the `ultrareview` and Code Review integrations in Claude Code, and `codex review` plus `/review` in Codex. Use them for the first pass, and read the diff yourself for the second — the review is a filter, not a substitute.",
                },
                {
                    kind: "callout",
                    tone: "warn",
                    title: "Never approve a diff you have not read",
                    text: "Every safeguard in this handbook is a filter with a false-negative rate. The last one is you. If the diff is too large to read, that is the finding — the task was scoped wrong, and the fix is a smaller task, not a faster skim.",
                },
            ],
        },
        {
            id: "automation",
            number: "15",
            title: "Headless runs, CI, and scheduled work",
            lead: "Run the agent where nobody is watching, safely.",
            level: "advanced",
            applies: "both",
            blocks: [
                {
                    kind: "prose",
                    text: "Both tools are composable Unix programs. Piping into them and running them from CI is where the time actually comes back — the interactive session is for work that needs judgement, and everything else should be a script.",
                },
                {
                    kind: "code",
                    language: "bash",
                    filename: "Non-interactive runs",
                    code: `# Claude Code — one-shot, prints and exits
claude -p "translate new strings into French and open a PR"

# Feed it a stream
tail -200 app.log | claude -p "summarize anomalies as a bullet list"
git diff main --name-only | claude -p "review these files for security issues"

# Codex — the same shape
codex exec "add a regression test for the null-tenant bug"
codex resume            # pick up where a previous run stopped`,
                },
                { kind: "heading", id: "unattended-safety", text: "Rules for unattended runs" },
                {
                    kind: "list",
                    ordered: true,
                    items: [
                        { term: "Deny by default", detail: "Run in `dontAsk` mode with an explicit allowlist, or a Codex permission profile scoped to what the job needs. A run with nobody to answer a prompt should fail closed, not proceed." },
                        { term: "Sandbox it", detail: "A container or an ephemeral VM, with no production credentials mounted. The blast radius should be the checkout, and nothing else." },
                        { term: "Bound the run", detail: "`maxTurns` on subagents, a job timeout in CI, and a token budget. An agent in a loop is expensive long before it is dangerous." },
                        { term: "Produce a reviewable artefact", detail: "A pull request, not a push to main. The output of an unattended run is a proposal." },
                        { term: "Keep the trace", detail: "Log which context loaded, which commands ran, and what failed. Without the trace an unattended failure is unexplainable." },
                    ],
                },
                {
                    kind: "table",
                    caption: "Where to run it",
                    columns: ["Need", "Claude Code", "Codex"],
                    rows: [
                        ["Automate PR review and triage", "GitHub Actions, GitLab CI/CD, Code Review", "GitHub integration"],
                        ["Long tasks off your machine", "Claude Code on the web, `claude --cloud`", "Codex cloud, `codex apply`"],
                        ["Recurring schedule", "Routines (cloud), desktop scheduled tasks, `/loop`", "Automations"],
                        ["From team chat", "Slack — mention `@Claude`", "Slack integration"],
                        ["Custom orchestration in your own code", "Agent SDK (TypeScript, Python)", "Codex SDK"],
                    ],
                },
                {
                    kind: "callout",
                    tone: "warn",
                    title: "Content the job reads is not authorization",
                    text: "An unattended run processes issues, logs, and pages written by other people. Text in that content telling the agent to do something is data, not an instruction — and there is no human in the loop to notice. This is exactly why unattended runs get the tightest allowlist and the smallest credentials.",
                },
            ],
        },
    ],
}
