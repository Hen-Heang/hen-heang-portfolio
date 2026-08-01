// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { FeedbackReviewPanel } from "./FeedbackReviewPanel"

const OWNER_FEEDBACK_URL = "/api/assistant-feedback/review"

function feedbackRow(overrides: Record<string, unknown> = {}) {
    return {
        id: "11111111-2222-3333-4444-555555555555",
        request_id: "msg-1",
        page_context: "home",
        vote: "down",
        correction: "He works with MyBatis, not Hibernate.",
        evaluation_status: "pending",
        client_hash: "abcdef0123456789abcdef01",
        created_at: "2026-07-30T10:00:00.000Z",
        updated_at: "2026-07-30T10:00:00.000Z",
        ...overrides,
    }
}

const fetchMock = vi.fn()

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
})

/** Resolves the initial GET with the given rows. */
function mockInitialLoad(rows: Record<string, unknown>[]) {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ feedback: rows }) })
}

describe("FeedbackReviewPanel", () => {
    it("shows an empty state when there is no negative feedback to review", async () => {
        mockInitialLoad([])
        render(<FeedbackReviewPanel />)

        expect(await screen.findByText("No negative feedback to review.")).toBeDefined()
    })

    it("shows only negative feedback by default, and reveals up-votes via the toggle", async () => {
        mockInitialLoad([
            feedbackRow({ id: "11111111-2222-3333-4444-555555555555", vote: "down", correction: "Down-vote correction." }),
            feedbackRow({ id: "22222222-3333-4444-5555-666666666666", vote: "up", correction: "Up-vote note." }),
        ])
        render(<FeedbackReviewPanel />)

        expect(await screen.findByText("Down-vote correction.")).toBeDefined()
        expect(screen.queryByText("Up-vote note.")).toBeNull()

        fireEvent.click(screen.getByText("Show all votes"))

        expect(await screen.findByText("Up-vote note.")).toBeDefined()
    })

    it("renders an untrusted correction as inert text, never as live markup", async () => {
        const hostile = '<img src=x onerror="document.title=\'pwned\'">Actually he uses Oracle.'
        mockInitialLoad([feedbackRow({ correction: hostile })])
        const { container } = render(<FeedbackReviewPanel />)

        // The exact hostile string is shown verbatim as text content...
        expect(await screen.findByText(hostile)).toBeDefined()
        // ...and never parsed into a real element that could execute.
        expect(container.querySelector("img")).toBeNull()
        expect(document.title).not.toBe("pwned")
    })

    it("approving a correction posts the chosen category to the owner-only review endpoint", async () => {
        mockInitialLoad([feedbackRow()])
        render(<FeedbackReviewPanel />)

        const approve = await screen.findByText("Approve correction")

        // Owner picks the category the fact should be filed under.
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "experience" } })

        fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
        mockInitialLoad([]) // the panel reloads after a successful action
        fireEvent.click(approve)

        await waitFor(() => {
            const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === "POST")
            expect(postCall).toBeDefined()
            expect(postCall![0]).toBe(OWNER_FEEDBACK_URL)
            expect(JSON.parse(postCall![1].body)).toEqual({
                feedbackId: "11111111-2222-3333-4444-555555555555",
                action: "approve",
                category: "experience",
            })
        })
    })

    it("rejecting a correction sends the reject action and creates no fact category", async () => {
        mockInitialLoad([feedbackRow()])
        render(<FeedbackReviewPanel />)

        const reject = await screen.findByText("Reject")

        fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
        mockInitialLoad([])
        fireEvent.click(reject)

        await waitFor(() => {
            const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === "POST")
            expect(JSON.parse(postCall![1].body)).toMatchObject({ action: "reject" })
        })
    })

    it("offers only 'Mark reviewed' for a down-vote with no correction attached", async () => {
        mockInitialLoad([feedbackRow({ correction: null })])
        render(<FeedbackReviewPanel />)

        expect(await screen.findByText("Mark reviewed")).toBeDefined()
        expect(screen.queryByText("Approve correction")).toBeNull()
    })

    it("surfaces a server error instead of failing silently", async () => {
        fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Unauthorized." }) })
        render(<FeedbackReviewPanel />)

        expect(await screen.findByText("Unauthorized.")).toBeDefined()
    })

    it("surfaces a network failure with a readable message", async () => {
        fetchMock.mockRejectedValueOnce(new Error("offline"))
        render(<FeedbackReviewPanel />)

        expect(await screen.findByText("Could not reach the feedback review endpoint.")).toBeDefined()
    })
})
