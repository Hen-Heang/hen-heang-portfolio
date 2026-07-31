import { z } from "zod"
import { AI_SOURCE_TYPES, AI_VISIBILITY, AI_APPROVAL_STATUS, AI_FACT_STATUS, AI_FEEDBACK_VOTE, AI_FEEDBACK_EVALUATION_STATUS, AI_SYNC_RUN_STATUS } from "@/src/lib/types/ai-knowledge"
import { PAGE_CONTEXTS } from "@/src/lib/ai/page-context"

const KNOWLEDGE_CATEGORIES = [
    "profile", "positioning", "experience", "career", "projects",
    "skills", "ai-engineering", "articles", "contact", "faq",
] as const

/** Validates a raw Supabase row (snake_case) and maps it to the camelCase AISource shape. */
export const AISourceRowSchema = z
    .object({
        id: z.string().uuid(),
        source_type: z.enum(AI_SOURCE_TYPES),
        repository_name: z.string().nullable(),
        title: z.string().min(1),
        source_url: z.string().min(1),
        visibility: z.enum(AI_VISIBILITY),
        approval_status: z.enum(AI_APPROVAL_STATUS),
        source_revision: z.string().nullable(),
        metadata: z.record(z.string(), z.unknown()),
        last_synced_at: z.string().nullable(),
        created_at: z.string(),
        updated_at: z.string(),
    })
    .transform((r) => ({
        id: r.id,
        sourceType: r.source_type,
        repositoryName: r.repository_name,
        title: r.title,
        sourceUrl: r.source_url,
        visibility: r.visibility,
        approvalStatus: r.approval_status,
        sourceRevision: r.source_revision,
        metadata: r.metadata,
        lastSyncedAt: r.last_synced_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    }))

export const AIChunkRowSchema = z
    .object({
        id: z.string().uuid(),
        source_id: z.string().uuid(),
        chunk_key: z.string().min(1),
        title: z.string().nullable(),
        content: z.string(),
        repository_name: z.string().nullable(),
        file_path: z.string().nullable(),
        source_url: z.string().nullable(),
        content_hash: z.string(),
        visibility: z.enum(AI_VISIBILITY),
        approved: z.boolean(),
        is_active: z.boolean(),
        created_at: z.string(),
        updated_at: z.string(),
    })
    .transform((r) => ({
        id: r.id,
        sourceId: r.source_id,
        chunkKey: r.chunk_key,
        title: r.title,
        content: r.content,
        repositoryName: r.repository_name,
        filePath: r.file_path,
        sourceUrl: r.source_url,
        contentHash: r.content_hash,
        visibility: r.visibility,
        approved: r.approved,
        isActive: r.is_active,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    }))

export const AIProfileFactRowSchema = z
    .object({
        id: z.string().uuid(),
        category: z.enum(KNOWLEDGE_CATEGORIES),
        fact_text: z.string().min(1),
        supporting_source_id: z.string().uuid().nullable(),
        visibility: z.enum(AI_VISIBILITY),
        status: z.enum(AI_FACT_STATUS),
        valid_from: z.string().nullable(),
        valid_until: z.string().nullable(),
        created_at: z.string(),
        updated_at: z.string(),
    })
    .transform((r) => ({
        id: r.id,
        category: r.category,
        factText: r.fact_text,
        supportingSourceId: r.supporting_source_id,
        visibility: r.visibility,
        status: r.status,
        validFrom: r.valid_from,
        validUntil: r.valid_until,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    }))

export const AIFeedbackRowSchema = z
    .object({
        id: z.string().uuid(),
        request_id: z.string(),
        page_context: z.enum(PAGE_CONTEXTS),
        vote: z.enum(AI_FEEDBACK_VOTE),
        correction: z.string().nullable(),
        evaluation_status: z.enum(AI_FEEDBACK_EVALUATION_STATUS),
        client_hash: z.string(),
        created_at: z.string(),
        updated_at: z.string(),
    })
    .transform((r) => ({
        id: r.id,
        requestId: r.request_id,
        pageContext: r.page_context,
        vote: r.vote,
        correction: r.correction,
        evaluationStatus: r.evaluation_status,
        clientHash: r.client_hash,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    }))

export const AISyncRunRowSchema = z
    .object({
        id: z.string().uuid(),
        source_id: z.string().uuid(),
        status: z.enum(AI_SYNC_RUN_STATUS),
        processed_count: z.number().int().nonnegative(),
        inserted_count: z.number().int().nonnegative(),
        updated_count: z.number().int().nonnegative(),
        deactivated_count: z.number().int().nonnegative(),
        error_summary: z.string().nullable(),
        started_at: z.string(),
        finished_at: z.string().nullable(),
    })
    .transform((r) => ({
        id: r.id,
        sourceId: r.source_id,
        status: r.status,
        processedCount: r.processed_count,
        insertedCount: r.inserted_count,
        updatedCount: r.updated_count,
        deactivatedCount: r.deactivated_count,
        errorSummary: r.error_summary,
        startedAt: r.started_at,
        finishedAt: r.finished_at,
    }))
