import type { DocPart } from "@/src/lib/types/handbook"

export const partAdvanced: DocPart = {
    id: "advanced",
    number: "6",
    title: "Advanced practice",
    summary: "Running many agents at once without collisions, and treating your own setup as something to measure and improve.",
    sections: [
        {
            id: "parallel",
            number: "16",
            title: "Parallel agents and worktrees",
            lead: "Run several agents at once without them editing the same file underneath each other.",
            level: "advanced",
            applies: "both",
            blocks: [
                {
                    kind: "prose",
                    text: "Parallelism pays when tasks are genuinely independent — three separate bugs, or one review split across dimensions. It costs when they are not: two agents in one working tree will overwrite each other, and merging their reasoning is slower than doing the work once.",
                },
                {
                    kind: "prose",
                    text: "The isolation primitive is the **git worktree**: a second checkout of the same repository on its own branch, in its own directory. Each agent gets a real filesystem it cannot share, and you merge through the normal review path.",
                },
                {
                    kind: "code",
                    language: "bash",
                    filename: "Worktrees by hand",
                    code: `git worktree add ../repo-auth-fix -b fix/auth-refresh
git worktree add ../repo-perf   -b perf/query-plan
git worktree list
git worktree remove ../repo-auth-fix   # when the branch has merged`,
                },
                {
                    kind: "prose",
                    text: "Claude Code automates this. A subagent with `isolation: worktree` in its frontmatter runs in a temporary worktree that is cleaned up if it changed nothing. `.worktreeinclude` in the project root lists the gitignored files — `.env.local`, build caches — that must be copied into each new worktree for the project to actually run there.",
                },
                {
                    kind: "table",
                    caption: "Choosing a parallelism mechanism (Claude Code)",
                    columns: ["Mechanism", "Use when", "Isolation"],
                    rows: [
                        ["Subagent", "You need a finding, not a diff — search, review, research", "Separate context, same working tree"],
                        ["Subagent with `isolation: worktree`", "The delegated task will edit files", "Own branch and checkout"],
                        ["Agent view / background agents", "Several full sessions you want to watch from one screen", "Separate sessions"],
                        ["Agent teams and cross-session messaging", "Long-running sessions that must coordinate", "Separate sessions that can message each other"],
                        ["Dynamic workflows", "A deterministic fan-out — N dimensions, each verified", "Scripted orchestration of many subagents"],
                    ],
                },
                {
                    kind: "prose",
                    text: "Codex approaches the same problem from the cloud side: start several cloud tasks in parallel and bring each result back into your checkout with `codex apply`. The isolation is the remote environment rather than a local worktree, and the merge point is still a reviewed diff.",
                },
                {
                    kind: "callout",
                    tone: "note",
                    title: "Fan out on the review, not on the implementation",
                    text: "Parallel implementation on one feature produces conflicting diffs and a merge you have to referee. Parallel review of one diff — correctness, security, performance, tests, each in its own context — produces independent findings that compose cleanly. Start there.",
                },
            ],
        },
        {
            id: "improve",
            number: "17",
            title: "Measuring and improving your own setup",
            lead: "Treat your configuration as a system with a failure rate you can watch go down.",
            level: "advanced",
            applies: "both",
            blocks: [
                {
                    kind: "prose",
                    text: "Prompts, instruction files, and tool definitions are code with no test suite by default. A change that feels like an improvement can quietly break a behaviour you relied on, and you will not find out until it costs you an afternoon.",
                },
                { kind: "heading", id: "evals", text: "A minimal eval loop" },
                {
                    kind: "list",
                    ordered: true,
                    items: [
                        { term: "Collect real failures", detail: "Every time you correct the agent, save the task and the wrong output. Ten of these is already a useful suite." },
                        { term: "Write the expected behaviour, not the expected text", detail: "\"Refuses to widen the permission scope\" is checkable. \"Says the right thing\" is not." },
                        { term: "Re-run the set after every configuration change", detail: "New rule, new skill, new model — the same ten tasks, and you compare." },
                        { term: "Grade deterministically where you can", detail: "Exit codes, file diffs, and \"did it touch a forbidden path\" beat a subjective judgement every time." },
                        { term: "Keep the trace, not just the verdict", detail: "Which context loaded, which tool ran, where it turned wrong. A failed eval with no trace tells you nothing actionable." },
                    ],
                },
                { kind: "heading", id: "observability", text: "Observability" },
                {
                    kind: "prose",
                    text: "`/context` shows what is loaded right now. The `InstructionsLoaded` hook logs which instruction files loaded, when, and why. `claude doctor` prints the fully resolved configuration and flags rules it had to skip. Between them you can answer nearly every \"why did it do that?\" question without guessing.",
                },
                { kind: "heading", id: "cost", text: "Cost and context discipline" },
                {
                    kind: "table",
                    columns: ["Symptom", "Usual cause", "Fix"],
                    rows: [
                        ["Sessions compact constantly", "A large instruction file loading every time", "Move content into path-scoped rules and skills"],
                        ["The agent re-reads the same files each turn", "No plan, so no memory of what it already knows", "Plan first; the plan survives compaction"],
                        ["Answers drift late in a session", "Key facts were summarized away", "Put them in `CLAUDE.md` so they are re-injected"],
                        ["A wide search burns the whole window", "Exploration in the main context", "Delegate it to a subagent and keep only the conclusion"],
                        ["Costs spike with no more output", "An unbounded retry loop", "`maxTurns`, timeouts, and a hard retry cap"],
                    ],
                },
                {
                    kind: "callout",
                    tone: "tip",
                    title: "The compounding habit",
                    text: "At the end of a session, ask one question: what did I explain that I have now explained twice? That answer goes into CLAUDE.md, a rule, or a skill. A setup that absorbs one correction a day is unrecognizable in a month — and the work of building it is indistinguishable from the work of using it.",
                },
            ],
        },
    ],
}
