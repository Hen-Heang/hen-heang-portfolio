import type { AXConcept } from "@/src/lib/types/ax-engineering"

export const axConcepts: AXConcept[] = [
    {
        slug: "context",
        name: "Context",
        analogy: "Relevant reference desk",
        group: "knowledge",
        what: "The task, code, documentation, history, and evidence available to the model for its current decision.",
        why: "A capable model still produces weak work when it receives missing, stale, or distracting information.",
        how: "The harness selects scoped files and facts, retrieves related material, and refreshes context as the task changes.",
        example:
            "Load the Spring service, its tests, API contract, and repository rules before changing an endpoint.",
        whenToUse:
            "For every task; increase retrieval and summarization as the codebase or session grows.",
    },
    {
        slug: "instructions",
        name: "Instructions",
        analogy: "Engineering handbook",
        group: "knowledge",
        what: "Explicit rules that define goals, coding conventions, boundaries, and required checks.",
        why: "Stable expectations should not depend on the model guessing them from nearby code.",
        how: "Layer general guidance with directory-specific instructions, resolving conflicts by scope and priority.",
        example:
            "An AGENTS.md says to use Flyway for schema changes and run integration tests before completion.",
        whenToUse:
            "When a convention or safety rule should apply repeatedly across tasks.",
    },
    {
        slug: "skills",
        name: "Skills",
        analogy: "Playbooks",
        group: "knowledge",
        what: "Reusable procedures for a focused kind of work, such as adding a REST endpoint or reviewing a migration.",
        why: "A playbook makes proven steps discoverable and repeatable without overloading global instructions.",
        how: "The harness matches a task to a skill, loads its complete procedure, and follows its tools and checks.",
        example:
            "A backend implementation skill guides controller, service, validation, test, and documentation changes.",
        whenToUse:
            "When a workflow repeats and benefits from domain-specific steps or templates.",
    },
    {
        slug: "agents",
        name: "Agents",
        analogy: "Engineer",
        group: "execution",
        what: "A model operating in a loop that can inspect state, decide on actions, use tools, and evaluate results.",
        why: "Multi-step engineering work needs interaction with real project state, not only one generated answer.",
        how: "The harness supplies goals and capabilities; the agent alternates reasoning, action, observation, and adjustment.",
        example:
            "An implementation agent inspects a failing test, edits the service, reruns the test, and reviews the diff.",
        whenToUse:
            "For bounded tasks that require several evidence-driven actions.",
    },
    {
        slug: "subagents",
        name: "Subagents",
        analogy: "Specialists",
        group: "execution",
        what: "Separate agent contexts delegated a focused investigation, implementation, or review task.",
        why: "Specialization can reduce context noise and provide an independent perspective.",
        how: "A coordinating agent gives a precise scope and expected output, then integrates and verifies the result.",
        example:
            "One subagent reviews database safety while another checks API compatibility.",
        whenToUse:
            "When work can be cleanly divided and the coordination cost is justified.",
    },
    {
        slug: "mcp",
        name: "MCP",
        analogy: "Universal tool port",
        group: "execution",
        what: "Model Context Protocol is a standard way for clients to expose tools and contextual resources to models.",
        why: "A shared protocol reduces one-off integrations between agent hosts and external systems.",
        how: "An MCP server advertises named capabilities with schemas; a compatible client discovers and invokes them.",
        example:
            "A read-only database server exposes describe-schema and explain-query tools without exposing credentials to prompts.",
        whenToUse:
            "When capabilities should be reusable across compatible agent clients with explicit contracts.",
    },
    {
        slug: "tools",
        name: "Tools",
        analogy: "Hands",
        group: "execution",
        what: "Typed capabilities that let an agent inspect or change external state.",
        why: "Reasoning alone cannot read the current repository, run a test, query a service, or create a patch.",
        how: "The model requests a tool with structured arguments; the harness validates, executes, and returns an observation.",
        example:
            "A test tool accepts a package and test filter, then returns the exit code and bounded output.",
        whenToUse:
            "When decisions require current evidence or an authorized action outside the model.",
    },
    {
        slug: "planning",
        name: "Planning",
        analogy: "Tech lead",
        group: "control",
        what: "A visible decomposition of a goal into ordered, verifiable work and decision points.",
        why: "Plans expose assumptions, dependencies, and progress before changes become difficult to unwind.",
        how: "The agent drafts steps, marks one active, updates them from evidence, and closes them only after verification.",
        example:
            "Inspect schema, add migration, update mapper, add tests, run gates, and review the final diff.",
        whenToUse: "For multi-file, ambiguous, risky, or long-running work.",
    },
    {
        slug: "permissions",
        name: "Permissions",
        analogy: "Policy",
        group: "control",
        what: "Rules describing which resources and actions an agent may use, sometimes requiring human approval.",
        why: "Agent capability should match task risk and must not imply unlimited authority.",
        how: "The harness evaluates each requested operation against allowlists, scopes, identities, and approval requirements.",
        example:
            "Allow SELECT on a development database but require approval for migrations and deny production writes.",
        whenToUse:
            "Whenever tools can access sensitive data, mutate state, spend money, or affect other people.",
    },
    {
        slug: "sandbox",
        name: "Sandbox",
        analogy: "Isolated workbench",
        group: "control",
        what: "A constrained environment that limits files, processes, network access, time, and resources.",
        why: "Isolation reduces the blast radius of mistakes and makes execution easier to reproduce.",
        how: "The harness runs work in a container, VM, temporary directory, or restricted process with explicit boundaries.",
        example:
            "Build an untrusted branch in an ephemeral container with no production credentials.",
        whenToUse:
            "For generated code, untrusted inputs, parallel experiments, and high-impact tools.",
    },
    {
        slug: "hooks",
        name: "Hooks",
        analogy: "Automatic triggers",
        group: "control",
        what: "Deterministic actions attached to events in an agent or repository lifecycle.",
        why: "Critical mechanical checks should run consistently instead of relying on the model to remember them.",
        how: "Before or after a defined event, the harness invokes a formatter, validator, logger, or policy check.",
        example:
            "Format Java files after edits and scan the staged diff for secrets before a commit.",
        whenToUse:
            "For fast, deterministic automation that must accompany a repeated event.",
    },
    {
        slug: "quality-gates",
        name: "Quality Gates",
        analogy: "Checkpoints",
        group: "control",
        what: "Required evidence that must pass before work moves to the next stage.",
        why: "A plausible implementation is not the same as a compiled, tested, reviewed, and secure change.",
        how: "The harness runs defined checks, records results, and blocks promotion when required criteria fail.",
        example:
            "Require compile, unit tests, integration tests, lint, and an independent diff review before PR creation.",
        whenToUse:
            "At boundaries such as implementation completion, pull requests, and deployment.",
    },
    {
        slug: "evals",
        name: "Evals",
        analogy: "Exams",
        group: "improvement",
        what: "Repeatable scenarios and scoring methods that measure whether an AI system behaves as intended.",
        why: "Model and prompt changes can introduce subtle regressions that ordinary code tests do not capture.",
        how: "Run representative inputs, capture outputs and traces, apply deterministic or reviewed graders, and compare trends.",
        example:
            "Check whether a coding agent identifies a missing authorization test without inventing project requirements.",
        whenToUse:
            "When selecting models, changing prompts or tools, and protecting important agent behaviors.",
    },
    {
        slug: "observability",
        name: "Observability",
        analogy: "Flight recorder",
        group: "improvement",
        what: "Structured records of agent steps, tool calls, outcomes, errors, latency, and resource use.",
        why: "Without traces, failures are difficult to explain, reproduce, or improve.",
        how: "The harness emits correlated events and metrics while redacting secrets and controlling retention.",
        example:
            "Trace which context was loaded, which test command failed, and how the agent revised its plan.",
        whenToUse:
            "For debugging, evaluation, audit, performance analysis, and responsible operation.",
    },
    {
        slug: "memory",
        name: "Memory",
        analogy: "Notebook",
        group: "improvement",
        what: "Selected information retained beyond the immediate model turn or session.",
        why: "Long tasks benefit from continuity, but unlimited history creates stale context and privacy risk.",
        how: "Store scoped facts, decisions, and summaries with provenance, expiry, and retrieval rules.",
        example:
            "Remember that a migration decision was approved and link it to the ADR that remains the source of truth.",
        whenToUse:
            "When useful state must survive context limits or session boundaries.",
    },
    {
        slug: "handoff",
        name: "Handoff",
        analogy: "Shift report",
        group: "improvement",
        what: "A concise transfer of goals, completed work, evidence, open risks, and next actions.",
        why: "Another human or agent should resume from verified state rather than reconstructing the whole session.",
        how: "Summarize decisions and changes, cite files and checks, and clearly separate facts from unresolved assumptions.",
        example:
            "Report changed files, test results, a blocked external dependency, and the next safe command to run.",
        whenToUse:
            "At session boundaries, delegation returns, reviews, incidents, and ownership changes.",
    },
]
