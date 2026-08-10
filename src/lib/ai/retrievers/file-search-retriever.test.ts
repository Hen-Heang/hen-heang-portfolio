import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { rawFileSearch, fileSearchLabRetriever, FileSearchUnavailableError } from "./file-search-retriever"

const originalFetch = global.fetch
const originalKey = process.env.OPENAI_API_KEY
const originalStore = process.env.OPENAI_PORTFOLIO_VECTOR_STORE_ID

beforeEach(() => {
    process.env.OPENAI_API_KEY = "sk-test-key"
    process.env.OPENAI_PORTFOLIO_VECTOR_STORE_ID = "vs_test123"
})

afterEach(() => {
    global.fetch = originalFetch
    process.env.OPENAI_API_KEY = originalKey
    process.env.OPENAI_PORTFOLIO_VECTOR_STORE_ID = originalStore
    vi.restoreAllMocks()
})

function mockFetchOnce(body: unknown, status = 200) {
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })) as unknown as typeof fetch
}

describe("rawFileSearch", () => {
    it("throws FileSearchUnavailableError when the vector store id is not configured", async () => {
        delete process.env.OPENAI_PORTFOLIO_VECTOR_STORE_ID
        const fetchMock = vi.fn()
        global.fetch = fetchMock as unknown as typeof fetch

        await expect(rawFileSearch("Docker")).rejects.toBeInstanceOf(FileSearchUnavailableError)
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("calls the vector store search endpoint with the query and a bounded result count", async () => {
        mockFetchOnce({ data: [] })
        await rawFileSearch("Docker networking", { limit: 3 })

        const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
        expect(url).toBe("https://api.openai.com/v1/vector_stores/vs_test123/search")
        const body = JSON.parse((init as RequestInit).body as string)
        expect(body.query).toBe("Docker networking")
        expect(body.max_num_results).toBe(3)
    })

    it("caps max_num_results even if a caller asks for more", async () => {
        mockFetchOnce({ data: [] })
        await rawFileSearch("Docker", { limit: 999 })
        const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
        const body = JSON.parse((init as RequestInit).body as string)
        expect(body.max_num_results).toBeLessThanOrEqual(8)
    })

    it("maps a real-shaped response into raw matches, reading slug only from attributes", async () => {
        mockFetchOnce({
            data: [
                { file_id: "file_1", filename: "docker-networking.md", score: 0.83, attributes: { slug: "docker", category: "devops" }, content: [{ type: "text", text: "Docker networking overview..." }] },
                { file_id: "file_2", filename: "mystery.md", score: 0.4, content: [{ type: "text", text: "no attributes at all" }] },
            ],
        })

        const matches = await rawFileSearch("container networking")
        expect(matches).toHaveLength(2)
        expect(matches[0]).toMatchObject({ slug: "docker", fileId: "file_1", score: 0.83 })
        expect(matches[0].text).toContain("Docker networking overview")
        expect(matches[1].slug).toBeNull()
    })

    it("throws on a non-OK response instead of returning a fabricated result", async () => {
        mockFetchOnce({ error: "server error" }, 500)
        await expect(rawFileSearch("Docker")).rejects.toBeInstanceOf(FileSearchUnavailableError)
    })

    it("throws when the fetch itself fails (network error, timeout)", async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch
        await expect(rawFileSearch("Docker")).rejects.toBeInstanceOf(FileSearchUnavailableError)
    })
})

describe("fileSearchLabRetriever", () => {
    it("is named for eval/log reporting", () => {
        expect(fileSearchLabRetriever.name).toBe("file-search")
    })

    it("drops a match with no slug in attributes rather than inventing metadata", async () => {
        mockFetchOnce({ data: [{ file_id: "f1", filename: "x.md", score: 0.5, content: [{ type: "text", text: "..." }] }] })
        const results = await fileSearchLabRetriever.search("something")
        expect(results).toEqual([])
    })

    it("drops a match whose slug no longer exists in the live Engineering Lab index", async () => {
        mockFetchOnce({ data: [{ file_id: "f1", filename: "x.md", score: 0.9, attributes: { slug: "this-slug-was-deleted-long-ago" }, content: [] }] })
        const results = await fileSearchLabRetriever.search("something")
        expect(results).toEqual([])
    })

    it("resolves a real slug to trusted, live portfolio metadata — not to anything the vector store echoed back", async () => {
        mockFetchOnce({ data: [{ file_id: "f1", filename: "totally-unrelated-filename.md", score: 0.9, attributes: { slug: "spring-boot-layered-architecture" }, content: [{ type: "text", text: "matched excerpt" }] }] })
        const results = await fileSearchLabRetriever.search("layered architecture")
        expect(results).toHaveLength(1)
        expect(results[0].slug).toBe("spring-boot-layered-architecture")
        expect(results[0].source).toBe("engineering-lab")
        // Title/category/technologies come from our own live index, never from `filename`.
        expect(results[0].title.toLowerCase()).not.toContain("totally-unrelated-filename")
    })
})
