import { describe, expect, it, vi } from "vitest"
import { withTiming } from "./logging"

describe("withTiming", () => {
    it("logs success and passes the result through unchanged", async () => {
        const logger = vi.fn()
        const wrapped = withTiming("testTool", logger, async (input: { n: number }) => ({ doubled: input.n * 2 }))

        const result = await wrapped({ n: 3 })

        expect(result).toEqual({ doubled: 6 })
        expect(logger).toHaveBeenCalledTimes(1)
        const [name, durationMs, success] = logger.mock.calls[0]
        expect(name).toBe("testTool")
        expect(typeof durationMs).toBe("number")
        expect(success).toBe(true)
    })

    it("isolates a thrown error into a safe { error } result instead of crashing the caller", async () => {
        const logger = vi.fn()
        const wrapped = withTiming("flakyTool", logger, async () => {
            throw new Error("simulated failure (e.g. a Supabase hiccup)")
        })

        const result = await wrapped(undefined)

        expect(result).toHaveProperty("error")
        expect(logger).toHaveBeenCalledWith("flakyTool", expect.any(Number), false)
    })

    it("never leaks the underlying error message to the caller", async () => {
        const wrapped = withTiming("secretTool", () => {}, async () => {
            throw new Error("raw provider internals that must not leak")
        })

        const result = (await wrapped(undefined)) as { error: string }
        expect(result.error).not.toContain("raw provider internals")
    })
})
