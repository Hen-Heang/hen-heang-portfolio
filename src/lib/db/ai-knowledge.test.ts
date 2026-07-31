import { describe, expect, it, vi } from "vitest"

describe("getApprovedProfileFacts", () => {
    it("returns [] when Supabase is not configured (no env vars in this test run)", async () => {
        vi.resetModules()
        const { getApprovedProfileFacts } = await import("./ai-knowledge")
        expect(await getApprovedProfileFacts()).toEqual([])
    })

    it("maps Supabase rows to AIProfileFact, relying on RLS (not app code) to have already filtered to approved+public+valid rows", async () => {
        vi.resetModules()
        const order = vi.fn().mockResolvedValue({
            data: [
                {
                    id: "fact-1",
                    category: "positioning",
                    fact_text: "He now also works with Kotlin.",
                    supporting_source_id: null,
                    visibility: "public",
                    status: "approved",
                    valid_from: null,
                    valid_until: null,
                    created_at: "2026-01-01T00:00:00Z",
                    updated_at: "2026-01-02T00:00:00Z",
                },
            ],
            error: null,
        })
        const select = vi.fn(() => ({ order }))
        const from = vi.fn(() => ({ select }))

        vi.doMock("@/src/lib/supabase", () => ({
            getSupabaseClient: () => ({ from }),
        }))

        const { getApprovedProfileFacts } = await import("./ai-knowledge")
        const facts = await getApprovedProfileFacts()

        expect(from).toHaveBeenCalledWith("portfolio_ai_profile_facts")
        expect(facts).toEqual([
            {
                id: "fact-1",
                category: "positioning",
                factText: "He now also works with Kotlin.",
                supportingSourceId: null,
                visibility: "public",
                status: "approved",
                validFrom: null,
                validUntil: null,
                createdAt: "2026-01-01T00:00:00Z",
                updatedAt: "2026-01-02T00:00:00Z",
            },
        ])
    })

    it("returns [] on a Supabase query error instead of throwing", async () => {
        vi.resetModules()
        const order = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } })
        const select = vi.fn(() => ({ order }))
        const from = vi.fn(() => ({ select }))

        vi.doMock("@/src/lib/supabase", () => ({
            getSupabaseClient: () => ({ from }),
        }))

        const { getApprovedProfileFacts } = await import("./ai-knowledge")
        expect(await getApprovedProfileFacts()).toEqual([])
    })
})
