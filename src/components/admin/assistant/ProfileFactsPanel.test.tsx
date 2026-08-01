// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"

const FACT_ID = "11111111-2222-3333-4444-555555555555"

let factRows: Record<string, unknown>[] = []
let updates: { patch: Record<string, unknown>; id: string }[] = []
let inserts: Record<string, unknown>[] = []
let deletes: string[] = []

function factRow(overrides: Record<string, unknown> = {}) {
    return {
        id: FACT_ID,
        category: "skills",
        fact_text: "He works with MyBatis, not Hibernate.",
        supporting_source_id: null,
        visibility: "owner",
        status: "draft",
        valid_from: null,
        valid_until: null,
        created_at: "2026-07-30T10:00:00.000Z",
        updated_at: "2026-07-30T10:00:00.000Z",
        ...overrides,
    }
}

function fromMock(table: string) {
    if (table !== "portfolio_ai_profile_facts") {
        throw new Error(`unexpected table access in ProfileFactsPanel: ${table}`)
    }
    return {
        select: () => ({
            order: async () => ({ data: factRows, error: null }),
        }),
        insert: async (row: Record<string, unknown>) => {
            inserts.push(row)
            return { error: null }
        },
        update: (patch: Record<string, unknown>) => ({
            eq: async (_col: string, id: string) => {
                updates.push({ patch, id })
                return { error: null }
            },
        }),
        delete: () => ({
            eq: async (_col: string, id: string) => {
                deletes.push(id)
                return { error: null }
            },
        }),
    }
}

vi.mock("@/src/lib/supabase/client", () => ({
    createClient: () => ({ from: fromMock }),
}))

// Imported after the mock is registered.
const { ProfileFactsPanel } = await import("./ProfileFactsPanel")

beforeEach(() => {
    factRows = []
    updates = []
    inserts = []
    deletes = []
})

afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
})

describe("ProfileFactsPanel", () => {
    it("shows an empty state explaining that new facts start as drafts", async () => {
        render(<ProfileFactsPanel />)

        expect(await screen.findByText(/No profile facts yet/)).toBeDefined()
    })

    it("renders a fact with its category, status and visibility", async () => {
        factRows = [factRow()]
        render(<ProfileFactsPanel />)

        expect(await screen.findByText("He works with MyBatis, not Hibernate.")).toBeDefined()
        expect(screen.getByText("skills")).toBeDefined()
        expect(screen.getByText("draft")).toBeDefined()
        expect(screen.getByText("owner")).toBeDefined()
    })

    it("approving a draft fact writes status=approved for that row", async () => {
        factRows = [factRow()]
        render(<ProfileFactsPanel />)

        fireEvent.click(await screen.findByText("Approve"))

        await waitFor(() => {
            expect(updates).toEqual([{ patch: { status: "approved" }, id: FACT_ID }])
        })
    })

    it("rejecting a fact writes status=rejected rather than deleting it", async () => {
        factRows = [factRow({ status: "approved" })]
        render(<ProfileFactsPanel />)

        fireEvent.click(await screen.findByText("Reject"))

        await waitFor(() => {
            expect(updates).toEqual([{ patch: { status: "rejected" }, id: FACT_ID }])
        })
        expect(deletes).toHaveLength(0)
    })

    it("a newly created fact is stored as a draft — never auto-approved", async () => {
        render(<ProfileFactsPanel />)

        fireEvent.click(await screen.findByText("New"))
        fireEvent.change(screen.getByLabelText(/Fact text/), { target: { value: "A newly asserted fact." } })
        fireEvent.click(screen.getByText("Save"))

        await waitFor(() => expect(inserts).toHaveLength(1))
        expect(inserts[0]).toMatchObject({ fact_text: "A newly asserted fact.", status: "draft" })
    })

    // A truly empty field is blocked by the textarea's `required` attribute, but
    // whitespace-only input satisfies `required` — this is the case the
    // component's own trim() guard exists to catch.
    it("refuses to save a whitespace-only fact and explains why", async () => {
        render(<ProfileFactsPanel />)

        fireEvent.click(await screen.findByText("New"))
        fireEvent.change(screen.getByLabelText(/Fact text/), { target: { value: "   \n  " } })
        fireEvent.click(screen.getByText("Save"))

        expect(await screen.findByText("Fact text can't be empty.")).toBeDefined()
        expect(inserts).toHaveLength(0)
    })

    it("deleting asks for confirmation and does nothing when the owner declines", async () => {
        factRows = [factRow()]
        const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)
        render(<ProfileFactsPanel />)

        fireEvent.click(await screen.findByLabelText("Delete"))

        expect(confirmSpy).toHaveBeenCalledOnce()
        // The confirmation must steer the owner toward the reversible action.
        expect(confirmSpy.mock.calls[0][0]).toMatch(/Reject/)
        expect(deletes).toHaveLength(0)
    })

    it("deletes only after the owner confirms", async () => {
        factRows = [factRow()]
        vi.spyOn(window, "confirm").mockReturnValue(true)
        render(<ProfileFactsPanel />)

        fireEvent.click(await screen.findByLabelText("Delete"))

        await waitFor(() => expect(deletes).toEqual([FACT_ID]))
    })
})
