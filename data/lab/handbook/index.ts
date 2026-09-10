import type { DocPart, DocSection } from "@/src/lib/types/handbook"
import { partFoundations } from "./part-1-foundations"
import { partContext } from "./part-2-context"
import { partExecution } from "./part-3-execution"
import { partConfiguration } from "./part-4-configuration"
import { partWorkflow } from "./part-5-workflow"
import { partAdvanced } from "./part-6-advanced"
import { partAppendix } from "./appendix"

export { handbookSources } from "./sources"

/** Reading order. The sidebar, the anchors, and the retrieval index all derive from this. */
export const handbookParts: DocPart[] = [
    partFoundations,
    partContext,
    partExecution,
    partConfiguration,
    partWorkflow,
    partAdvanced,
    partAppendix,
]

export const handbookSections: DocSection[] = handbookParts.flatMap((part) => part.sections)

export const handbookMeta = {
    title: "Agent Coding Handbook",
    subtitle: "Claude Code and Codex, from first install to unattended runs",
    version: "1.0.0",
    /** Kept in the data layer so the page, the metadata, and the tests agree on one date. */
    updated: "2026-09-10",
} as const
