import { beforeEach, describe, expect, it, vi } from "vitest"

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature only, asserted against via insertMock.mock.calls
const insertMock = vi.fn(async (row: Record<string, unknown>) => ({ error: null as { message: string; code?: string } | null }))
const fromMock = vi.fn(() => ({ insert: insertMock }))

vi.mock("@/src/lib/supabase", () => ({
    getSupabaseClient: () => ({ from: fromMock }),
}))

const jsonRequest = (body: unknown, headers: Record<string, string> = {}) =>
    new Request("http://localhost/api/assistant-feedback", {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(body),
    })

const clientHeaders = (ip: string) => ({ "x-forwarded-for": ip })

describe("POST /api/assistant-feedback", () => {
    beforeEach(() => {
        insertMock.mockClear()
        fromMock.mockClear()
    })

    it("accepts valid vote-only feedback and persists it without an evaluation_status override", async () => {
        const { POST } = await import("./route")
        const res = await POST(jsonRequest({ vote: "up", page: "home", requestId: "msg-1" }, clientHeaders("10.0.0.1")))

        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({ ok: true })
        expect(fromMock).toHaveBeenCalledWith("portfolio_ai_feedback")
        const insertedRow = insertMock.mock.calls[0][0]
        expect(insertedRow.vote).toBe("up")
        expect(insertedRow.page_context).toBe("home")
        expect(insertedRow.request_id).toBe("msg-1")
        expect(insertedRow.correction).toBeNull()
        expect(insertedRow).not.toHaveProperty("evaluation_status")
        // Never the raw IP.
        expect(JSON.stringify(insertedRow)).not.toContain("10.0.0.1")
    })

    it("accepts a valid correction and persists sanitized text", async () => {
        const { POST } = await import("./route")
        const res = await POST(
            jsonRequest(
                { vote: "down", page: "project-detail", requestId: "msg-2", correction: "Actually he used PostgreSQL, not MySQL." },
                clientHeaders("10.0.0.2"),
            ),
        )

        expect(res.status).toBe(200)
        const insertedRow = insertMock.mock.calls[0][0]
        expect(insertedRow.correction).toBe("Actually he used PostgreSQL, not MySQL.")
    })

    it("strips HTML/script injection from a stored correction", async () => {
        const { POST } = await import("./route")
        const res = await POST(
            jsonRequest(
                { vote: "down", page: "home", requestId: "msg-3", correction: "<script>alert(document.cookie)</script>Wrong info" },
                clientHeaders("10.0.0.3"),
            ),
        )

        expect(res.status).toBe(200)
        const insertedRow = insertMock.mock.calls[0][0]
        expect(insertedRow.correction).not.toContain("<")
        expect(insertedRow.correction).not.toContain(">")
        expect(insertedRow.correction).not.toMatch(/<script/i)
    })

    it("rejects an invalid vote and never calls Supabase", async () => {
        const { POST } = await import("./route")
        const res = await POST(jsonRequest({ vote: "sideways", page: "home", requestId: "msg-4" }, clientHeaders("10.0.0.4")))

        expect(res.status).toBe(400)
        expect(fromMock).not.toHaveBeenCalled()
    })

    it("rejects a missing requestId", async () => {
        const { POST } = await import("./route")
        const res = await POST(jsonRequest({ vote: "up", page: "home" }, clientHeaders("10.0.0.5")))

        expect(res.status).toBe(400)
        expect(fromMock).not.toHaveBeenCalled()
    })

    it("rejects malformed JSON", async () => {
        const { POST } = await import("./route")
        const res = await POST(
            new Request("http://localhost/api/assistant-feedback", {
                method: "POST",
                headers: { "content-type": "application/json", ...clientHeaders("10.0.0.6") },
                body: "{not json",
            }),
        )

        expect(res.status).toBe(400)
        expect(fromMock).not.toHaveBeenCalled()
    })

    it("a caller cannot inject an evaluation_status/approved/visibility override into the insert payload", async () => {
        const { POST } = await import("./route")
        await POST(
            jsonRequest(
                { vote: "up", page: "home", requestId: "msg-7", evaluationStatus: "actioned", approved: true, visibility: "public" },
                clientHeaders("10.0.0.7"),
            ),
        )

        const insertedRow = insertMock.mock.calls[0][0]
        expect(insertedRow).not.toHaveProperty("evaluationStatus")
        expect(insertedRow).not.toHaveProperty("approved")
        expect(insertedRow).not.toHaveProperty("visibility")
    })

    it("enforces the base rate limit after repeated requests from the same client", async () => {
        const { POST } = await import("./route")
        const headers = clientHeaders("10.0.0.8")

        let lastStatus = 200
        for (let i = 0; i < 25; i++) {
            const res = await POST(jsonRequest({ vote: "up", page: "home", requestId: `msg-rl-${i}` }, headers))
            lastStatus = res.status
        }

        expect(lastStatus).toBe(429)
    })

    it("enforces a stricter rate limit specifically on correction submissions", async () => {
        const { POST } = await import("./route")
        const headers = clientHeaders("10.0.0.9")

        let lastStatus = 200
        for (let i = 0; i < 6; i++) {
            const res = await POST(
                jsonRequest({ vote: "down", page: "home", requestId: `msg-corr-${i}`, correction: "A correction." }, headers),
            )
            lastStatus = res.status
        }

        expect(lastStatus).toBe(429)
    })

    it("degrades gracefully (still 200) when Supabase is not configured", async () => {
        vi.resetModules()
        vi.doMock("@/src/lib/supabase", () => ({ getSupabaseClient: () => null }))

        const { POST } = await import("./route")
        const res = await POST(jsonRequest({ vote: "up", page: "home", requestId: "msg-10" }, clientHeaders("10.0.0.10")))

        expect(res.status).toBe(200)
    })

    it("degrades gracefully (still 200, no error detail leaked) when the Supabase insert fails", async () => {
        vi.resetModules()
        const failingInsert = vi.fn(async () => ({ error: { message: "db is down", code: "XX000" } }))
        vi.doMock("@/src/lib/supabase", () => ({
            getSupabaseClient: () => ({ from: () => ({ insert: failingInsert }) }),
        }))

        const { POST } = await import("./route")
        const res = await POST(jsonRequest({ vote: "up", page: "home", requestId: "msg-11" }, clientHeaders("10.0.0.11")))

        expect(res.status).toBe(200)
        const body = await res.json()
        expect(JSON.stringify(body)).not.toContain("db is down")
    })
})
