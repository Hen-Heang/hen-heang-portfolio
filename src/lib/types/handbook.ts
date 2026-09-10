/**
 * Types for the Agent Coding Handbook (`/lab/handbook`).
 *
 * The handbook is a reference document, not a card grid, so its content is
 * modelled as an ordered list of typed blocks per section — the same
 * data-driven approach as the Backend path, but with a document-shaped block
 * set (lead paragraphs, dense tables, file trees, flow diagrams) instead of a
 * lesson-shaped one.
 */

/** Which tool a row, node, or section applies to. Drives the tinted labels. */
export type DocTool = "claude" | "codex" | "both"

export type DocCalloutTone = "note" | "warn" | "tip"

/** Body copy. Backtick spans (`like this`) render as inline code. */
export interface DocProseBlock {
    kind: "prose"
    text: string
}

/** A titled subsection heading — rendered with the accent rule on its left. */
export interface DocHeadingBlock {
    kind: "heading"
    id: string
    text: string
}

export interface DocListBlock {
    kind: "list"
    ordered?: boolean
    items: { term?: string; detail: string }[]
}

export interface DocTableBlock {
    kind: "table"
    caption?: string
    columns: string[]
    rows: string[][]
}

export interface DocCodeBlock {
    kind: "code"
    language: string
    filename?: string
    code: string
}

/** One line of a file tree. `depth` indents; `note` is the right-hand comment. */
export interface DocTreeLine {
    depth: number
    name: string
    note?: string
    /** Renders the line in the accent colour — use for the files that matter most. */
    emphasis?: boolean
}

export interface DocTreeBlock {
    kind: "tree"
    caption?: string
    lines: DocTreeLine[]
}

export interface DocCalloutBlock {
    kind: "callout"
    tone: DocCalloutTone
    title: string
    text: string
}

export type DocFlowTone = "default" | "accent" | "edge"

export interface DocFlowNode {
    id: string
    label: string
    detail?: string
    tone?: DocFlowTone
}

/** A dashed feedback edge drawn under the diagram, e.g. "tests fail → back to implement". */
export interface DocFlowReturn {
    from: string
    to: string
    label: string
}

export interface DocFlowLegendItem {
    swatch: DocFlowTone | "return"
    label: string
}

export interface DocFlowSpec {
    title: string
    description?: string
    /**
     * Rows of nodes laid out as a serpentine: row 0 reads left to right, row 1
     * right to left, and so on. DOM order always matches reading order, so the
     * visual reversal is presentational only.
     */
    rows: DocFlowNode[][]
    returns?: DocFlowReturn[]
    legend: DocFlowLegendItem[]
}

export interface DocFlowBlock {
    kind: "flow"
    flow: DocFlowSpec
}

/** Side-by-side comparison of the same concept across both tools. */
export interface DocCompareBlock {
    kind: "compare"
    caption?: string
    rows: { aspect: string; claude: string; codex: string }[]
}

export type DocBlock =
    | DocProseBlock
    | DocHeadingBlock
    | DocListBlock
    | DocTableBlock
    | DocCodeBlock
    | DocTreeBlock
    | DocCalloutBlock
    | DocFlowBlock
    | DocCompareBlock

export type DocLevel = "foundation" | "working" | "advanced"

export interface DocSection {
    /** Anchor id — stable, used by the sidebar, the URL hash, and retrieval. */
    id: string
    /** Display number, e.g. "1" or "A". */
    number: string
    title: string
    /** One sentence stating what the reader can do after this section. */
    lead: string
    level: DocLevel
    applies: DocTool
    blocks: DocBlock[]
}

export interface DocPart {
    id: string
    number: string
    title: string
    /** One line describing what the whole part covers. */
    summary: string
    sections: DocSection[]
}

export interface DocSource {
    title: string
    organization: string
    url: string
    topics: string[]
}

export interface DocCommand {
    command: string
    tool: DocTool
    what: string
    when: string
}
