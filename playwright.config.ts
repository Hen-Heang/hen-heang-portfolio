import { defineConfig, devices } from "@playwright/test"

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000)
const baseURL = `http://127.0.0.1:${port}`
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH

/** `next dev` compiles each route on first request, which costs several seconds
 * per cold navigation and blows both the expect and the per-test timeout on
 * navigation-heavy specs. Run against a prebuilt production server instead, so
 * the suite measures the app rather than the dev compiler. Set PLAYWRIGHT_PROD=1
 * to reproduce CI locally (requires `pnpm run build` first). */
const useProdServer = Boolean(process.env.CI) || process.env.PLAYWRIGHT_PROD === "1"

export default defineConfig({
    testDir: "./e2e",
    timeout: 60_000,
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: process.env.CI ? "github" : "list",
    use: {
        baseURL,
        /* `html { scroll-behavior: smooth }` makes Playwright's scroll-into-view
         * animate, so an off-screen target keeps moving and never satisfies the
         * "element is stable" actionability check — clicks then time out under
         * load. Reduced motion is a path the app supports first-class (auto
         * scrolling, ~0s transitions, [data-motion-enter] pinned to its final
         * state), so running the suite there makes it deterministic. Tests that
         * assert reduced-motion behaviour still emulate it explicitly. */
        contextOptions: { reducedMotion: "reduce" },
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                ...(executablePath
                    ? { launchOptions: { executablePath } }
                    : {}),
            },
        },
    ],
    webServer: {
        command: useProdServer
            ? `pnpm start --hostname 127.0.0.1 --port ${port}`
            : `pnpm dev --hostname 127.0.0.1 --port ${port}`,
        url: baseURL,
        // Never adopt a stray server when a production run was asked for — a
        // leftover `next dev` on the port would silently put the dev compiler
        // back in front of the suite.
        reuseExistingServer: !process.env.CI && !useProdServer,
        timeout: 120_000,
        env: {
            ...process.env,
            NEXT_TELEMETRY_DISABLED: "1",
        },
    },
})
