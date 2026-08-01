import { beforeEach, describe, expect, it, vi } from "vitest"

const getUserMock = vi.fn()

vi.mock("@/src/lib/supabase/server", () => ({
    createClient: vi.fn(async () => ({
        auth: { getUser: getUserMock },
        from: fromMock,
    })),
}))

const feedbackRows = new Map<string, Record<string, unknown>>()
const insertedFacts: Record<string, unknown>[] = []
const updatedFeedback: { id: string; patch: Record<string, unknown> }[] = []

function resetFixture() {
    feedbackRows.clear()
    insertedFacts.length = 0
    updatedFeedback.length = 0
    feedbackRows.set("11111111-2222-3333-4444-555555555555", {
        id: "11111111-2222-3333-4444-555555555555",
        request_id: "msg-1",
        page_context: "home",
        vote: "down",
        correction: "Actually he also holds an AWS certification.",
        evaluation_status: "pending",
        client_hash: "abcdef0123456789abcdef01",
    })
    feedbackRows.set("22222222-3333-4444-5555-666666666666", {
        id: "22222222-3333-4444-5555-666666666666",
        request_id: "msg-2",
        page_context: "home",
        vote: "down",
        correction: null,
        evaluation_status: "pending",
        client_hash: "abcdef0123456789abcdef02",
    })
}

function fromMock(table: string) {
    if (table === "portfolio_ai_feedback") {
        return {
            select: () => ({
                order: () => ({
                    limit: async () => ({ data: [...feedbackRows.values()], error: null }),
                }),
                eq: (_col: string, id: string) => ({
                    maybeSingle: async () => ({ data: feedbackRows.get(id) ?? null, error: null }),
                }),
            }),
            update: (patch: Record<string, unknown>) => ({
                eq: async (_col: string, id: string) => {
                    updatedFeedback.push({ id, patch })
                    const row = feedbackRows.get(id)
                    if (row) feedbackRows.set(id, { ...row, ...patch })
                    return { error: null }
                },
            }),
        }
    }
    if (table === "portfolio_ai_profile_facts") {
        return {
            insert: async (row: Record<string, unknown>) => {
                insertedFacts.push(row)
                return { error: null }
            },
        }
    }
    throw new Error(`unexpected table access in review route: ${table}`)
}

const jsonRequest = (body: unknown) =>
    new Request("http://localhost/api/assistant-feedback/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    })

describe("POST /api/assistant-feedback/review", () => {
    beforeEach(() => {
        resetFixture()
        getUserMock.mockReset()
    })

    it("rejects an unauthenticated caller with 401 and touches no tables", async () => {
        getUserMock.mockResolvedValue({ data: { user: null } })
        const { POST } = await import("./route")

        const res = await POST(jsonRequest({ feedbackId: "11111111-2222-3333-4444-555555555555", action: "approve", category: "skills" }))

        expect(res.status).toBe(401)
        expect(insertedFacts).toHaveLength(0)
    })

    it("rejects a non-owner authenticated caller with 403", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "not-the-owner@example.com" } } })
        const { POST } = await import("./route")

        const res = await POST(jsonRequest({ feedbackId: "11111111-2222-3333-4444-555555555555", action: "approve", category: "skills" }))

        expect(res.status).toBe(403)
        expect(insertedFacts).toHaveLength(0)
    })

    it("approves a correction: promotes it to a public approved fact and marks feedback actioned", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "henheang15@gmail.com" } } })
        const { POST } = await import("./route")

        const res = await POST(
            jsonRequest({ feedbackId: "11111111-2222-3333-4444-555555555555", action: "approve", category: "skills" }),
        )

        expect(res.status).toBe(200)
        expect(insertedFacts).toEqual([
            {
                category: "skills",
                fact_text: "Actually he also holds an AWS certification.",
                visibility: "public",
                status: "approved",
                source_feedback_id: "11111111-2222-3333-4444-555555555555",
            },
        ])
        expect(updatedFeedback).toEqual([{ id: "11111111-2222-3333-4444-555555555555", patch: { evaluation_status: "actioned" } }])
    })

    it("rejects approving feedback that has no correction", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "henheang15@gmail.com" } } })
        const { POST } = await import("./route")

        const res = await POST(
            jsonRequest({ feedbackId: "22222222-3333-4444-5555-666666666666", action: "approve", category: "skills" }),
        )

        expect(res.status).toBe(400)
        expect(insertedFacts).toHaveLength(0)
    })

    it("sanitizes an owner-supplied factText override before storing it", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "henheang15@gmail.com" } } })
        const { POST } = await import("./route")

        await POST(
            jsonRequest({
                feedbackId: "11111111-2222-3333-4444-555555555555",
                action: "approve",
                category: "skills",
                factText: "<script>alert(1)</script>He also holds an AWS cert.",
            }),
        )

        expect(insertedFacts[0].fact_text).not.toContain("<")
    })

    it("rejects an approve action missing a category", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "henheang15@gmail.com" } } })
        const { POST } = await import("./route")

        const res = await POST(jsonRequest({ feedbackId: "11111111-2222-3333-4444-555555555555", action: "approve" }))

        expect(res.status).toBe(400)
        expect(insertedFacts).toHaveLength(0)
    })

    it("reject action dismisses the feedback without creating a fact", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "henheang15@gmail.com" } } })
        const { POST } = await import("./route")

        const res = await POST(jsonRequest({ feedbackId: "11111111-2222-3333-4444-555555555555", action: "reject" }))

        expect(res.status).toBe(200)
        expect(insertedFacts).toHaveLength(0)
        expect(updatedFeedback).toEqual([{ id: "11111111-2222-3333-4444-555555555555", patch: { evaluation_status: "dismissed" } }])
    })

    it("acknowledge action marks feedback reviewed without creating a fact", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "henheang15@gmail.com" } } })
        const { POST } = await import("./route")

        const res = await POST(jsonRequest({ feedbackId: "22222222-3333-4444-5555-666666666666", action: "acknowledge" }))

        expect(res.status).toBe(200)
        expect(insertedFacts).toHaveLength(0)
        expect(updatedFeedback).toEqual([{ id: "22222222-3333-4444-5555-666666666666", patch: { evaluation_status: "reviewed" } }])
    })

    it("returns 404 for a feedback id that doesn't exist", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "henheang15@gmail.com" } } })
        const { POST } = await import("./route")

        const res = await POST(jsonRequest({ feedbackId: "99999999-9999-9999-9999-999999999999", action: "reject" }))

        expect(res.status).toBe(404)
    })

    it("rejects an invalid payload (bad action)", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "henheang15@gmail.com" } } })
        const { POST } = await import("./route")

        const res = await POST(jsonRequest({ feedbackId: "11111111-2222-3333-4444-555555555555", action: "delete-everything" }))

        expect(res.status).toBe(400)
    })
})

describe("GET /api/assistant-feedback/review", () => {
    beforeEach(() => {
        resetFixture()
        getUserMock.mockReset()
    })

    it("rejects an unauthenticated caller with 401", async () => {
        getUserMock.mockResolvedValue({ data: { user: null } })
        const { GET } = await import("./route")

        const res = await GET(new Request("http://localhost/api/assistant-feedback/review"))
        expect(res.status).toBe(401)
    })

    it("rejects a non-owner authenticated caller with 403", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "not-the-owner@example.com" } } })
        const { GET } = await import("./route")

        const res = await GET(new Request("http://localhost/api/assistant-feedback/review"))
        expect(res.status).toBe(403)
    })

    it("returns the feedback list for the owner", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "henheang15@gmail.com" } } })
        const { GET } = await import("./route")

        const res = await GET(new Request("http://localhost/api/assistant-feedback/review"))
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.feedback).toHaveLength(2)
    })
})
