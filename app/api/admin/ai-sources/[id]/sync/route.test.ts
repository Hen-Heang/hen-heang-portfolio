import { beforeEach, describe, expect, it, vi } from "vitest"

const getUserMock = vi.fn()

vi.mock("@/src/lib/supabase/server", () => ({
    createClient: vi.fn(async () => ({
        auth: { getUser: getUserMock },
        from: fromMock,
    })),
}))

const OWNER = "henheang15@gmail.com"
const GITHUB_SOURCE_ID = "11111111-2222-3333-4444-555555555555"
const ARTICLE_SOURCE_ID = "22222222-3333-4444-5555-666666666666"

const sourceRows = new Map<string, Record<string, unknown>>()
let insertedRuns: Record<string, unknown>[] = []

function resetFixture() {
    sourceRows.clear()
    insertedRuns = []
    sourceRows.set(GITHUB_SOURCE_ID, { id: GITHUB_SOURCE_ID, source_type: "github_repo" })
    sourceRows.set(ARTICLE_SOURCE_ID, { id: ARTICLE_SOURCE_ID, source_type: "article" })
}

function fromMock(table: string) {
    if (table === "portfolio_ai_sources") {
        return {
            select: () => ({
                eq: (_col: string, id: string) => ({
                    maybeSingle: async () => ({ data: sourceRows.get(id) ?? null, error: null }),
                }),
            }),
        }
    }
    if (table === "portfolio_ai_sync_runs") {
        return {
            insert: (row: Record<string, unknown>) => {
                insertedRuns.push(row)
                return {
                    select: () => ({
                        single: async () => ({ data: { id: "run-1", ...row }, error: null }),
                    }),
                }
            },
        }
    }
    throw new Error(`unexpected table access in sync route: ${table}`)
}

const request = () => new Request("http://localhost/api/admin/ai-sources/x/sync", { method: "POST" })
const ctx = (id: string) => ({ params: Promise.resolve({ id }) })

describe("POST /api/admin/ai-sources/[id]/sync", () => {
    beforeEach(() => {
        resetFixture()
        getUserMock.mockReset()
    })

    it("rejects an unauthenticated caller with 401 and records no sync run", async () => {
        getUserMock.mockResolvedValue({ data: { user: null } })
        const { POST } = await import("./route")

        const res = await POST(request(), ctx(GITHUB_SOURCE_ID))

        expect(res.status).toBe(401)
        expect(insertedRuns).toHaveLength(0)
    })

    it("rejects a non-owner authenticated caller with 403 and records no sync run", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "not-the-owner@example.com" } } })
        const { POST } = await import("./route")

        const res = await POST(request(), ctx(GITHUB_SOURCE_ID))

        expect(res.status).toBe(403)
        expect(insertedRuns).toHaveLength(0)
    })

    it("does not treat an email-case variant of the owner address as authorized", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: "HenHeang15@Gmail.com" } } })
        const { POST } = await import("./route")

        const res = await POST(request(), ctx(GITHUB_SOURCE_ID))

        expect(res.status).toBe(403)
        expect(insertedRuns).toHaveLength(0)
    })

    it("returns 404 for a source id that doesn't exist", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: OWNER } } })
        const { POST } = await import("./route")

        const res = await POST(request(), ctx("99999999-9999-9999-9999-999999999999"))

        expect(res.status).toBe(404)
        expect(insertedRuns).toHaveLength(0)
    })

    it("refuses to sync a source that isn't a GitHub repo", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: OWNER } } })
        const { POST } = await import("./route")

        const res = await POST(request(), ctx(ARTICLE_SOURCE_ID))

        expect(res.status).toBe(400)
        expect(insertedRuns).toHaveLength(0)
    })

    it("records an honest stub run for the owner rather than reporting a fake success", async () => {
        getUserMock.mockResolvedValue({ data: { user: { email: OWNER } } })
        const { POST } = await import("./route")

        const res = await POST(request(), ctx(GITHUB_SOURCE_ID))

        expect(res.status).toBe(200)
        expect(insertedRuns).toHaveLength(1)

        const run = insertedRuns[0]
        expect(run.source_id).toBe(GITHUB_SOURCE_ID)
        // GitHub sync isn't built yet — the run must not claim to have succeeded
        // or to have processed content it never fetched.
        expect(run.status).toBe("failed")
        expect(run.processed_count).toBe(0)
        expect(run.inserted_count).toBe(0)
        expect(String(run.error_summary)).toMatch(/isn't implemented yet/i)
    })
})
