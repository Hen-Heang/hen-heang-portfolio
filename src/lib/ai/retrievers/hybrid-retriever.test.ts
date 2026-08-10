import { describe, expect, it, vi } from "vitest"
import { createHybridLabRetriever } from "./hybrid-retriever"
import type { LabRetriever, LabSearchResult } from "./types"

const stubResult: LabSearchResult = {
    slug: "docker",
    title: "Docker",
    category: "devops",
    type: "guide",
    summary: "...",
    technologies: ["docker"],
    source: "engineering-lab",
}

function retriever(name: string, impl: (query: string) => Promise<LabSearchResult[]>): LabRetriever {
    return { name, search: (query) => impl(query) }
}

describe("createHybridLabRetriever", () => {
    it("uses the primary's results when it succeeds with matches", async () => {
        const primary = retriever("primary", async () => [stubResult])
        const fallback = retriever("fallback", async () => [])
        const hybrid = createHybridLabRetriever(primary, fallback)

        const results = await hybrid.search("docker")
        expect(results).toEqual([stubResult])
    })

    it("falls back when the primary throws (e.g. FileSearchUnavailableError)", async () => {
        const primary = retriever("primary", async () => {
            throw new Error("vector store unavailable")
        })
        const fallbackSearch = vi.fn(async () => [stubResult])
        const fallback = retriever("fallback", fallbackSearch)
        const hybrid = createHybridLabRetriever(primary, fallback)

        const results = await hybrid.search("docker")
        expect(results).toEqual([stubResult])
        expect(fallbackSearch).toHaveBeenCalledWith("docker")
    })

    it("falls back when the primary succeeds but finds nothing", async () => {
        const primary = retriever("primary", async () => [])
        const fallback = retriever("fallback", async () => [stubResult])
        const hybrid = createHybridLabRetriever(primary, fallback)

        const results = await hybrid.search("docker")
        expect(results).toEqual([stubResult])
    })

    it("never lets a primary failure escape to the caller", async () => {
        const primary = retriever("primary", async () => {
            throw new Error("boom")
        })
        const fallback = retriever("fallback", async () => [])
        const hybrid = createHybridLabRetriever(primary, fallback)

        await expect(hybrid.search("docker")).resolves.toEqual([])
    })
})
