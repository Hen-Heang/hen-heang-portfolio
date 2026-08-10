import { describe, expect, it } from "vitest"
import { buildLabDocuments } from "./lab-documents"
import { backendItems } from "@/data/lab/backend"

describe("buildLabDocuments", () => {
    it("only includes published backend items, never planned roadmap stubs", async () => {
        const docs = await buildLabDocuments()
        const plannedSlugs = new Set(backendItems.filter((item) => item.status === "planned").map((item) => item.slug))
        for (const doc of docs) {
            expect(plannedSlugs.has(doc.slug)).toBe(false)
            expect(doc.status).toBe("published")
        }
    })

    it("every document has a canonical henheang.site URL, never anything else", async () => {
        const docs = await buildLabDocuments()
        expect(docs.length).toBeGreaterThan(0)
        for (const doc of docs) {
            expect(doc.url).toMatch(/^https:\/\/henheang\.site\/(lab|ai-engineering)\//)
        }
    })

    it("has a bounded content length per document (not a raw full article dump)", async () => {
        const docs = await buildLabDocuments()
        for (const doc of docs) {
            expect(doc.content.length).toBeLessThanOrEqual(4001) // INDEX_CONTENT_MAX_CHARS + ellipsis
        }
    })

    it("never leaks an actual credential — a real API key prefix, an env var assignment, or a service-role key name", async () => {
        // Not a bare "secret"/"password": those words legitimately appear in
        // Hen's own security-education content (e.g. "committing secrets ...
        // to Git"). This checks for the shape of a real leaked credential
        // instead — a key literal or a NAME=value assignment.
        const combined = JSON.stringify(await buildLabDocuments())
        expect(combined).not.toMatch(/sk-[a-zA-Z0-9]{16,}/)
        expect(combined).not.toMatch(/OPENAI_API_KEY\s*[:=]/i)
        expect(combined).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY\s*[:=]/i)
        expect(combined).not.toMatch(/[A-Z0-9_]+_SECRET\s*[:=]\s*["']?\S{8,}/i)
    })

    it("covers all three Lab categories", async () => {
        const docs = await buildLabDocuments()
        const categories = new Set(docs.map((doc) => doc.category))
        expect(categories.has("backend")).toBe(true)
        expect(categories.has("devops")).toBe(true)
    })

    it("has unique slugs (the manifest and vector store attributes key off slug)", async () => {
        const docs = await buildLabDocuments()
        const slugs = docs.map((doc) => doc.slug)
        expect(new Set(slugs).size).toBe(slugs.length)
    })
})
