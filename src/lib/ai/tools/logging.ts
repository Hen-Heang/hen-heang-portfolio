import "server-only"

/** Called after every tool execution — name, duration, and outcome only, never arguments or result content. */
export type ToolLogger = (toolName: string, durationMs: number, success: boolean) => void

/** Default logger for contexts with no request to correlate against (tests, evals, the standalone `portfolioTools` export). */
export const noopToolLogger: ToolLogger = () => {}

/**
 * Wraps a tool's `execute` with timing and failure isolation.
 *
 * Logs (tool name, duration, success) through the caller's logger — never
 * the input arguments or the result content, which may include portfolio
 * text. A thrown error is caught and turned into the same `{ error }` shape
 * the tools already return for a "not found" case, so one failing tool call
 * (e.g. a Supabase hiccup inside searchEngineeringLab) degrades gracefully
 * instead of aborting the whole streamed answer.
 */
export function withTiming<Input, Output>(
    name: string,
    logger: ToolLogger,
    execute: (input: Input) => Promise<Output>,
): (input: Input) => Promise<Output | { error: string }> {
    return async (input: Input) => {
        const startedAt = Date.now()
        try {
            const result = await execute(input)
            logger(name, Date.now() - startedAt, true)
            return result
        } catch {
            logger(name, Date.now() - startedAt, false)
            return { error: `The ${name} tool is temporarily unavailable. Answer from what's already known, or say this information can't be retrieved right now.` }
        }
    }
}
