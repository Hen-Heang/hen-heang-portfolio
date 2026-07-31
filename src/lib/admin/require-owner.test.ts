import { describe, expect, it, vi } from "vitest"

const getUserMock = vi.fn()

vi.mock("@/src/lib/supabase/server", () => ({
    createClient: vi.fn(async () => ({
        auth: { getUser: getUserMock },
    })),
}))

describe("requireOwner", () => {
    it("returns 401 when there is no authenticated user", async () => {
        getUserMock.mockResolvedValueOnce({ data: { user: null } })
        const { requireOwner } = await import("./require-owner")

        const result = await requireOwner()

        expect(result.authorized).toBe(false)
        expect(result.status).toBe(401)
    })

    it("returns 403 when the authenticated user is not the owner", async () => {
        getUserMock.mockResolvedValueOnce({ data: { user: { email: "someone-else@example.com" } } })
        const { requireOwner } = await import("./require-owner")

        const result = await requireOwner()

        expect(result.authorized).toBe(false)
        expect(result.status).toBe(403)
    })

    it("authorizes the verified owner", async () => {
        getUserMock.mockResolvedValueOnce({ data: { user: { email: "henheang15@gmail.com" } } })
        const { requireOwner } = await import("./require-owner")

        const result = await requireOwner()

        expect(result.authorized).toBe(true)
        expect(result.status).toBeNull()
    })

    it("is case-sensitive and does not treat an email-case variant as the owner", async () => {
        getUserMock.mockResolvedValueOnce({ data: { user: { email: "HenHeang15@Gmail.com" } } })
        const { requireOwner } = await import("./require-owner")

        const result = await requireOwner()

        expect(result.authorized).toBe(false)
    })
})
