import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { moderateInput } from "./moderation"

const originalKey = process.env.OPENAI_API_KEY
const originalFetch = global.fetch

beforeEach(() => {
    process.env.OPENAI_API_KEY = "sk-test-key"
})

afterEach(() => {
    process.env.OPENAI_API_KEY = originalKey
    global.fetch = originalFetch
    vi.restoreAllMocks()
})

describe("moderateInput", () => {
    it("calls the current omni-moderation-latest model", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [{ flagged: false }] }), { status: 200 }))
        global.fetch = fetchMock as unknown as typeof fetch

        await moderateInput("a normal portfolio question")

        expect(fetchMock).toHaveBeenCalledTimes(1)
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe("https://api.openai.com/v1/moderations")
        const body = JSON.parse((init as RequestInit).body as string)
        expect(body.model).toBe("omni-moderation-latest")
        expect(body.input).toBe("a normal portfolio question")
    })

    it("returns flagged: true when the API flags the input", async () => {
        global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [{ flagged: true }] }), { status: 200 })) as unknown as typeof fetch

        const result = await moderateInput("something disallowed")
        expect(result.flagged).toBe(true)
    })

    it("returns flagged: false when the API does not flag the input", async () => {
        global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [{ flagged: false }] }), { status: 200 })) as unknown as typeof fetch

        const result = await moderateInput("what backend skills does Hen have?")
        expect(result.flagged).toBe(false)
    })

    it("fails open (never flags) when the moderation API returns a non-OK status", async () => {
        global.fetch = vi.fn().mockResolvedValue(new Response("server error", { status: 500 })) as unknown as typeof fetch

        const result = await moderateInput("a normal question during a provider outage")
        expect(result.flagged).toBe(false)
    })

    it("fails open when the moderation request throws (network error, timeout)", async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch

        const result = await moderateInput("a normal question during a network blip")
        expect(result.flagged).toBe(false)
    })

    it("fails open without calling the API when no key is configured", async () => {
        delete process.env.OPENAI_API_KEY
        const fetchMock = vi.fn()
        global.fetch = fetchMock as unknown as typeof fetch

        const result = await moderateInput("anything")
        expect(result.flagged).toBe(false)
        expect(fetchMock).not.toHaveBeenCalled()
    })
})
