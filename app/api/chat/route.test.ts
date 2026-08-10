import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- parameter kept so callers/assertions can type against streamText's real options shape
const streamTextMock = vi.fn((_options: Record<string, unknown>) => ({
    stream: new ReadableStream({ start: (controller) => controller.close() }),
    steps: Promise.resolve([]),
}))

vi.mock("ai", async (importOriginal) => {
    const actual = await importOriginal<typeof import("ai")>()
    return {
        ...actual,
        streamText: streamTextMock,
        convertToModelMessages: vi.fn(async (messages: unknown) => messages),
    }
})

vi.mock("@ai-sdk/openai", () => ({
    openai: { responses: vi.fn((model: string) => ({ modelId: model })) },
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- parameter kept to type-match the real moderateInput(text) signature
const moderateInputMock = vi.fn(async (_text: string) => ({ flagged: false }))
vi.mock("@/src/lib/ai/moderation", () => ({
    moderateInput: (text: string) => moderateInputMock(text),
}))

const originalKey = process.env.OPENAI_API_KEY

const jsonRequest = (body: unknown, ip: string) =>
    new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify(body),
    })

const validBody = (text = "What backend skills does Hen have?") => ({
    messages: [{ id: "m-1", role: "user", parts: [{ type: "text", text }] }],
    page: "other",
})

describe("POST /api/chat", () => {
    beforeEach(() => {
        process.env.OPENAI_API_KEY = "sk-test-key"
        streamTextMock.mockClear()
        moderateInputMock.mockClear()
        moderateInputMock.mockResolvedValue({ flagged: false })
    })

    afterEach(() => {
        process.env.OPENAI_API_KEY = originalKey
    })

    it("returns 503 without leaking anything when the assistant isn't configured", async () => {
        delete process.env.OPENAI_API_KEY
        const { POST } = await import("./route")
        const res = await POST(jsonRequest(validBody(), "203.0.113.1"))
        expect(res.status).toBe(503)
        expect(streamTextMock).not.toHaveBeenCalled()
    })

    it("rejects an oversized message with 400 before calling the model", async () => {
        const { POST } = await import("./route")
        const res = await POST(jsonRequest(validBody("x".repeat(2000)), "203.0.113.2"))
        expect(res.status).toBe(400)
        expect(streamTextMock).not.toHaveBeenCalled()
    })

    it("rejects malformed request bodies with 400", async () => {
        const { POST } = await import("./route")
        const res = await POST(jsonRequest({ notMessages: true }, "203.0.113.3"))
        expect(res.status).toBe(400)
        expect(streamTextMock).not.toHaveBeenCalled()
    })

    it("blocks a flagged message with a safe generic error and never reaches the model", async () => {
        moderateInputMock.mockResolvedValue({ flagged: true })
        const { POST } = await import("./route")
        const res = await POST(jsonRequest(validBody("disallowed content"), "203.0.113.4"))

        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.error).not.toMatch(/moderation|openai|flagged/i)
        expect(streamTextMock).not.toHaveBeenCalled()
    })

    it("enforces the rate limit after repeated requests from the same client", async () => {
        const { POST } = await import("./route")
        const ip = "203.0.113.5"
        let lastStatus = 200
        for (let i = 0; i < 11; i++) {
            lastStatus = (await POST(jsonRequest(validBody(), ip))).status
        }
        expect(lastStatus).toBe(429)
    })

    it("on a normal accepted request, calls the model with the safety identifier (not a raw client id) and a bounded tool-call step limit", async () => {
        const { POST } = await import("./route")
        const res = await POST(jsonRequest(validBody(), "203.0.113.6"))

        expect(res.status).toBe(200)
        expect(streamTextMock).toHaveBeenCalledTimes(1)
        const call = streamTextMock.mock.calls[0][0] as {
            tools: unknown
            stopWhen: unknown
            providerOptions: { openai: Record<string, unknown> }
        }
        expect(call.tools).toBeDefined()
        expect(call.stopWhen).toBeDefined()
        expect(call.providerOptions.openai).toHaveProperty("safetyIdentifier")
        expect(call.providerOptions.openai.safetyIdentifier).not.toBe("203.0.113.6")
        expect(call.providerOptions.openai).not.toHaveProperty("user")
    })

    it("moderates only the latest user message, not the raw IP or full history", async () => {
        const { POST } = await import("./route")
        await POST(jsonRequest(validBody("does Hen know Docker?"), "203.0.113.7"))

        expect(moderateInputMock).toHaveBeenCalledWith("does Hen know Docker?")
    })
})
