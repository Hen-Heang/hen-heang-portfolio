import { describe, expect, it } from "vitest"
import { diffManifest, hashDocument, type Manifest } from "./manifest"
import type { LabDocument } from "./lab-documents"

function doc(overrides: Partial<LabDocument> = {}): LabDocument {
    return {
        slug: "docker",
        title: "Docker",
        category: "devops",
        contentType: "guide",
        technologies: ["docker"],
        topics: ["containers"],
        status: "published",
        summary: "Docker fundamentals.",
        content: "Docker packages an application...",
        url: "https://henheang.site/lab/devops/topics/docker",
        ...overrides,
    }
}

describe("hashDocument", () => {
    it("is stable for the same content", () => {
        expect(hashDocument(doc())).toBe(hashDocument(doc()))
    })

    it("changes when the content changes", () => {
        expect(hashDocument(doc())).not.toBe(hashDocument(doc({ content: "different content" })))
    })

    it("changes when the summary, technologies, or topics change (not just content)", () => {
        const base = hashDocument(doc())
        expect(hashDocument(doc({ summary: "A different summary." }))).not.toBe(base)
        expect(hashDocument(doc({ technologies: ["kubernetes"] }))).not.toBe(base)
        expect(hashDocument(doc({ topics: ["networking"] }))).not.toBe(base)
    })

    it("does not change when only the slug changes (slug is the manifest key, not part of the hash)", () => {
        expect(hashDocument(doc())).toBe(hashDocument(doc({ slug: "different-slug" })))
    })
})

describe("diffManifest", () => {
    it("marks a document with no manifest entry as new", () => {
        const actions = diffManifest([{ slug: "docker", hash: "abc" }], {})
        expect(actions).toEqual([{ kind: "new", slug: "docker" }])
    })

    it("marks a document whose hash matches the manifest as unchanged", () => {
        const manifest: Manifest = { docker: { hash: "abc", fileId: "file_1", uploadedAt: "2026-01-01T00:00:00Z" } }
        const actions = diffManifest([{ slug: "docker", hash: "abc" }], manifest)
        expect(actions).toEqual([{ kind: "unchanged", slug: "docker", fileId: "file_1" }])
    })

    it("marks a document whose hash differs from the manifest as changed, carrying the previous file id", () => {
        const manifest: Manifest = { docker: { hash: "old-hash", fileId: "file_1", uploadedAt: "2026-01-01T00:00:00Z" } }
        const actions = diffManifest([{ slug: "docker", hash: "new-hash" }], manifest)
        expect(actions).toEqual([{ kind: "changed", slug: "docker", previousFileId: "file_1" }])
    })

    it("marks a manifest entry with no matching generated document as deleted", () => {
        const manifest: Manifest = { "old-removed-article": { hash: "abc", fileId: "file_9", uploadedAt: "2026-01-01T00:00:00Z" } }
        const actions = diffManifest([], manifest)
        expect(actions).toEqual([{ kind: "deleted", slug: "old-removed-article", fileId: "file_9" }])
    })

    it("does not rebuild the whole vector store when only one document changed", () => {
        const manifest: Manifest = {
            docker: { hash: "docker-hash", fileId: "file_1", uploadedAt: "2026-01-01T00:00:00Z" },
            kubernetes: { hash: "k8s-hash", fileId: "file_2", uploadedAt: "2026-01-01T00:00:00Z" },
        }
        const actions = diffManifest(
            [
                { slug: "docker", hash: "docker-hash-CHANGED" },
                { slug: "kubernetes", hash: "k8s-hash" },
            ],
            manifest,
        )
        expect(actions).toEqual([
            { kind: "changed", slug: "docker", previousFileId: "file_1" },
            { kind: "unchanged", slug: "kubernetes", fileId: "file_2" },
        ])
    })

    it("handles a full mix of new, changed, unchanged, and deleted in one diff", () => {
        const manifest: Manifest = {
            docker: { hash: "same", fileId: "file_1", uploadedAt: "2026-01-01T00:00:00Z" },
            "old-topic": { hash: "gone", fileId: "file_2", uploadedAt: "2026-01-01T00:00:00Z" },
            cicd: { hash: "stale", fileId: "file_3", uploadedAt: "2026-01-01T00:00:00Z" },
        }
        const actions = diffManifest(
            [
                { slug: "docker", hash: "same" },
                { slug: "cicd", hash: "fresh" },
                { slug: "kubernetes", hash: "brand-new" },
            ],
            manifest,
        )
        expect(actions).toEqual(
            expect.arrayContaining([
                { kind: "unchanged", slug: "docker", fileId: "file_1" },
                { kind: "changed", slug: "cicd", previousFileId: "file_3" },
                { kind: "new", slug: "kubernetes" },
                { kind: "deleted", slug: "old-topic", fileId: "file_2" },
            ]),
        )
        expect(actions).toHaveLength(4)
    })
})
