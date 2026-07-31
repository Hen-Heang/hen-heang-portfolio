// Mirrors supabase/migrations/20260731090000_portfolio_ai_knowledge_schema.sql.
// This is the owner-only knowledge-pipeline schema (sources → chunks, profile
// facts, feedback, sync runs) — distinct from the public-facing AI Engineering
// content (categories/articles/prompts/snippets) in ai-engineering.ts.

import type { KnowledgeCategory } from "@/data/knowledge"
import type { PageContext } from "@/src/lib/ai/page-context"

export const AI_SOURCE_TYPES = ["github_repo", "article", "manual", "site_page"] as const
export type AISourceType = (typeof AI_SOURCE_TYPES)[number]

export const AI_VISIBILITY = ["public", "owner"] as const
export type AIVisibility = (typeof AI_VISIBILITY)[number]

export const AI_APPROVAL_STATUS = ["pending", "approved", "rejected"] as const
export type AIApprovalStatus = (typeof AI_APPROVAL_STATUS)[number]

export const AI_FACT_STATUS = ["draft", "approved", "rejected"] as const
export type AIFactStatus = (typeof AI_FACT_STATUS)[number]

export const AI_FEEDBACK_VOTE = ["up", "down"] as const
export type AIFeedbackVote = (typeof AI_FEEDBACK_VOTE)[number]

export const AI_FEEDBACK_EVALUATION_STATUS = ["pending", "reviewed", "actioned", "dismissed"] as const
export type AIFeedbackEvaluationStatus = (typeof AI_FEEDBACK_EVALUATION_STATUS)[number]

export const AI_SYNC_RUN_STATUS = ["running", "succeeded", "failed", "partial"] as const
export type AISyncRunStatus = (typeof AI_SYNC_RUN_STATUS)[number]

export interface AISource {
    id: string
    sourceType: AISourceType
    repositoryName: string | null
    title: string
    sourceUrl: string
    visibility: AIVisibility
    approvalStatus: AIApprovalStatus
    sourceRevision: string | null
    metadata: Record<string, unknown>
    lastSyncedAt: string | null
    createdAt: string
    updatedAt: string
}

export interface AIChunk {
    id: string
    sourceId: string
    chunkKey: string
    title: string | null
    content: string
    repositoryName: string | null
    filePath: string | null
    sourceUrl: string | null
    contentHash: string
    visibility: AIVisibility
    approved: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface AIProfileFact {
    id: string
    category: KnowledgeCategory
    factText: string
    supportingSourceId: string | null
    visibility: AIVisibility
    status: AIFactStatus
    validFrom: string | null
    validUntil: string | null
    createdAt: string
    updatedAt: string
}

export interface AIFeedback {
    id: string
    requestId: string
    pageContext: PageContext
    vote: AIFeedbackVote
    correction: string | null
    evaluationStatus: AIFeedbackEvaluationStatus
    clientHash: string
    createdAt: string
    updatedAt: string
}

export interface AISyncRun {
    id: string
    sourceId: string
    status: AISyncRunStatus
    processedCount: number
    insertedCount: number
    updatedCount: number
    deactivatedCount: number
    errorSummary: string | null
    startedAt: string
    finishedAt: string | null
}
