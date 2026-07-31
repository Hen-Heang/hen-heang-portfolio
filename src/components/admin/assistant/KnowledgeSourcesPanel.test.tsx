// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"

const REPO_SOURCE_ID = "11111111-2222-3333-4444-555555555555"
const ARTICLE_SOURCE_ID = "22222222-3333-4444-5555-666666666666"

let sourceRows: Record<string, unknown>[] = []
let chunkRows: Record<string, unknown>[] = []
let runRows: Record<string, unknown>[] = []
let updates: { patch: Record<string, unknown>; id: string }[] = []

function sourceRow(overrides: Record<string, unknown> = {}) {
    return {
        id: REPO_SOURCE_ID,
        source_type: "github_repo",
        repository_name: "hen-heang-portfolio",
        title: "hen-heang-portfolio",
        source_url: "https://github.com/Hen-Heang/hen-heang-portfolio",
        visibility: "owner",
        approval_status: "pending",
        source_revision: null,
        metadata: {},
        last_synced_at: null,
        created_at: "2026-07-30T10:00:00.000Z",
        updated_at: "2026-07-30T10:00:00.000Z",
        ...overrides,
    }
}

function chunkRow(overrides: Record<string, unknown> = {}) {
    return {
        id: "33333333-4444-5555-6666-777777777777",
        source_id: REPO_SOURCE_ID,
        chunk_key: "readme#intro",
        title: "README — intro",
        content: "A Next.js portfolio site.",
        repository_name: "hen-heang-portfolio",
        file_path: "README.md",
        source_url: "https://github.com/Hen-Heang/hen-heang-portfolio#readme",
        content_hash: "abc123",
        visibility: "owner",
        approved: false,
        is_active: true,
        created_at: "2026-07-30T10:00:00.000Z",
        updated_at: "2026-07-30T10:00:00.000Z",
        ...overrides,
    }
}

function fromMock(table: string) {
    if (table === "portfolio_ai_sources") {
        return {
            select: () => ({
                order: async () => ({ data: sourceRows, error: null }),
            }),
            update: (patch: Record<string, unknown>) => ({
                eq: async (_col: string, id: string) => {
                    updates.push({ patch, id })
                    return { error: null }
                },
            }),
        }
    }
    if (table === "portfolio_ai_chunks") {
        return {
            select: () => ({
                eq: () => ({ order: () => ({ limit: async () => ({ data: chunkRows, error: null }) }) }),
            }),
        }
    }
    if (table === "portfolio_ai_sync_runs") {
        return {
            select: () => ({
                eq: () => ({ order: () => ({ limit: async () => ({ data: runRows, error: null }) }) }),
            }),
        }
    }
    throw new Error(`unexpected table access in KnowledgeSourcesPanel: ${table}`)
}

vi.mock("@/src/lib/supabase/client", () => ({
    createClient: () => ({ from: fromMock }),
}))

const { KnowledgeSourcesPanel } = await import("./KnowledgeSourcesPanel")

const fetchMock = vi.fn()

beforeEach(() => {
    sourceRows = []
    chunkRows = []
    runRows = []
    updates = []
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
})

describe("KnowledgeSourcesPanel", () => {
    it("shows an empty state when no sources are registered", async () => {
        render(<KnowledgeSourcesPanel />)

        expect(await screen.findByText("No knowledge sources yet.")).toBeDefined()
    })

    it("renders a source with its type, visibility and approval status", async () => {
        sourceRows = [sourceRow()]
        render(<KnowledgeSourcesPanel />)

        expect(await screen.findByText("hen-heang-portfolio")).toBeDefined()
        expect(screen.getByText("github repo")).toBeDefined()
        expect(screen.getByText("owner")).toBeDefined()
        expect(screen.getByText("pending")).toBeDefined()
        expect(screen.getByText(/synced never/)).toBeDefined()
    })

    it("approving a source writes approval_status=approved", async () => {
        sourceRows = [sourceRow()]
        render(<KnowledgeSourcesPanel />)

        fireEvent.click(await screen.findByText("Approve"))

        await waitFor(() => {
            expect(updates).toEqual([{ patch: { approval_status: "approved" }, id: REPO_SOURCE_ID }])
        })
    })

    it("rejecting a source archives it by status rather than deleting the row", async () => {
        sourceRows = [sourceRow({ approval_status: "approved" })]
        render(<KnowledgeSourcesPanel />)

        fireEvent.click(await screen.findByText("Reject"))

        await waitFor(() => {
            expect(updates).toEqual([{ patch: { approval_status: "rejected" }, id: REPO_SOURCE_ID }])
        })
    })

    it("toggles a source between public and owner-only visibility", async () => {
        sourceRows = [sourceRow({ visibility: "owner" })]
        render(<KnowledgeSourcesPanel />)

        fireEvent.click(await screen.findByText("Make public"))

        await waitFor(() => {
            expect(updates).toEqual([{ patch: { visibility: "public" }, id: REPO_SOURCE_ID }])
        })
    })

    it("offers a sync trigger for GitHub sources only", async () => {
        sourceRows = [sourceRow({ id: ARTICLE_SOURCE_ID, source_type: "article", title: "An article source" })]
        render(<KnowledgeSourcesPanel />)

        await screen.findByText("An article source")
        expect(screen.queryByText("Sync now")).toBeNull()
    })

    it("the sync trigger posts to the owner-only server route, never to GitHub from the browser", async () => {
        sourceRows = [sourceRow()]
        fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ run: { id: "run-1" } }) })
        render(<KnowledgeSourcesPanel />)

        fireEvent.click(await screen.findByText("Sync now"))

        await waitFor(() => expect(fetchMock).toHaveBeenCalled())
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe(`/api/admin/ai-sources/${REPO_SOURCE_ID}/sync`)
        expect(init.method).toBe("POST")
        // The browser must never talk to GitHub directly (that would need a token client-side).
        expect(fetchMock.mock.calls.every(([u]) => !String(u).includes("github.com"))).toBe(true)
    })

    it("reports a failed sync trigger instead of claiming success", async () => {
        sourceRows = [sourceRow()]
        fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Not authorized." }) })
        render(<KnowledgeSourcesPanel />)

        fireEvent.click(await screen.findByText("Sync now"))

        expect(await screen.findByText("Not authorized.")).toBeDefined()
    })

    it("expanding a source shows a safe plain-text preview of its synced chunks", async () => {
        sourceRows = [sourceRow()]
        chunkRows = [chunkRow({ content: '<script>document.title="pwned"</script>Portfolio README text.' })]
        const { container } = render(<KnowledgeSourcesPanel />)

        fireEvent.click(await screen.findByLabelText("Expand"))

        expect(await screen.findByText(/Portfolio README text\./)).toBeDefined()
        // Untrusted GitHub-sourced content is rendered inert, never parsed as markup.
        expect(container.querySelector("script")).toBeNull()
        expect(document.title).not.toBe("pwned")
    })

    it("shows an explicit empty message when an expanded source has no chunks or runs yet", async () => {
        sourceRows = [sourceRow()]
        render(<KnowledgeSourcesPanel />)

        fireEvent.click(await screen.findByLabelText("Expand"))

        expect(await screen.findByText("No chunks synced for this source yet.")).toBeDefined()
        expect(screen.getByText("No sync runs recorded yet.")).toBeDefined()
    })
})
