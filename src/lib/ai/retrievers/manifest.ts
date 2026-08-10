import { createHash } from "node:crypto"
import type { LabDocument } from "./lab-documents"

/**
 * Sync strategy for the vector store indexing script: a content hash per
 * document, tracked in a small JSON manifest. Deliberately the simplest
 * reliable option (not slug+timestamp, which trusts a clock; not a
 * from-scratch rebuild every run, which is wasteful and would balloon file
 * IDs at OpenAI for no reason).
 */

export interface ManifestEntry {
    hash: string
    fileId: string
    uploadedAt: string
}

export type Manifest = Record<string, ManifestEntry>

export function hashDocument(doc: LabDocument): string {
    const stable = JSON.stringify({
        title: doc.title,
        category: doc.category,
        contentType: doc.contentType,
        technologies: doc.technologies,
        topics: doc.topics,
        summary: doc.summary,
        content: doc.content,
        url: doc.url,
    })
    return createHash("sha256").update(stable).digest("hex")
}

export type DiffAction =
    | { kind: "new"; slug: string }
    | { kind: "changed"; slug: string; previousFileId: string }
    | { kind: "unchanged"; slug: string; fileId: string }
    | { kind: "deleted"; slug: string; fileId: string }

/**
 * Pure diff between the freshly generated documents and what the manifest
 * says is already indexed — no network calls, so it's fully unit-testable.
 * The indexing script (scripts/index-lab-content.ts) is the only caller
 * that turns these actions into real OpenAI API calls.
 */
export function diffManifest(documents: { slug: string; hash: string }[], manifest: Manifest): DiffAction[] {
    const actions: DiffAction[] = []
    const seenSlugs = new Set<string>()

    for (const doc of documents) {
        seenSlugs.add(doc.slug)
        const existing = manifest[doc.slug]
        if (!existing) {
            actions.push({ kind: "new", slug: doc.slug })
        } else if (existing.hash !== doc.hash) {
            actions.push({ kind: "changed", slug: doc.slug, previousFileId: existing.fileId })
        } else {
            actions.push({ kind: "unchanged", slug: doc.slug, fileId: existing.fileId })
        }
    }

    for (const [slug, entry] of Object.entries(manifest)) {
        if (!seenSlugs.has(slug)) actions.push({ kind: "deleted", slug, fileId: entry.fileId })
    }

    return actions
}
