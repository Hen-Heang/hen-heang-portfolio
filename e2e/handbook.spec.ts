import { expect, test } from "@playwright/test"

test.describe("Agent Coding Handbook", () => {
    test("renders the document, its diagrams, and its contents rail", async ({ page }) => {
        await page.goto("/lab/handbook")

        await expect(page.getByRole("heading", { level: 1, name: "Agent Coding Handbook" })).toBeVisible()

        // Part bands and numbered sections give the page its handbook structure.
        await expect(page.getByRole("heading", { name: "Foundations", exact: true })).toBeVisible()
        await expect(
            page.getByRole("heading", { name: "A coding agent is a loop, not a chat box" }),
        ).toBeVisible()

        // The flow diagram carries its own accessible summary plus a legend.
        const loopDiagram = page.getByRole("figure", { name: /The agent loop, one turn at a time/ })
        await expect(loopDiagram).toBeVisible()
        await expect(loopDiagram.getByText("Legend")).toBeVisible()

        // The contents rail anchors every section. Assert the link target and
        // then the anchor itself, rather than clicking inside a sticky
        // scroll container — that click is layout-timing sensitive and flakes.
        const contents = page.getByRole("navigation", { name: "Handbook contents" })
        await expect(contents).toBeVisible()
        await expect(contents.getByRole("link", { name: /Permissions and sandboxing/ })).toHaveAttribute(
            "href",
            "#permissions",
        )

        await page.goto("/lab/handbook#permissions")
        await expect(page.getByRole("heading", { name: "Permissions and sandboxing" })).toBeInViewport()
    })

    test("covers both tools with copyable configuration", async ({ page }) => {
        await page.goto("/lab/handbook#config-files")

        // Claude Code and Codex configuration sit side by side in one section.
        await expect(page.getByText(".claude/settings.local.json").first()).toBeVisible()
        await expect(page.getByText("~/.codex/config.toml").first()).toBeVisible()

        // Every code sample is copyable rather than select-and-hope.
        const copyButtons = page.getByRole("button", { name: /copy/i })
        expect(await copyButtons.count()).toBeGreaterThan(5)
    })

    test("stays readable on a phone without horizontal page scroll", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto("/lab/handbook")

        // The rail collapses into a disclosure at this width. The summary sits
        // far down a long page, so a font swap can reflow it out from under
        // the click point Playwright already computed. Retrying the open, and
        // skipping the click once it is open, keeps the real interaction under
        // test without depending on that timing.
        const disclosure = page.locator("details", { hasText: /Contents · \d+ sections/ })
        await expect(disclosure).toBeVisible()
        await expect(async () => {
            const isOpen = await disclosure.evaluate((el: HTMLDetailsElement) => el.open)
            if (!isOpen) await disclosure.locator("summary").click()
            await expect(disclosure.getByRole("link", { name: /Hooks — automation/ })).toBeVisible({
                timeout: 1_000,
            })
        }).toPass({ timeout: 15_000 })

        await expect(
            page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth),
        ).resolves.toBe(true)
    })

    test("is reachable from the Lab navigation", async ({ page }) => {
        await page.goto("/lab")
        await page.getByRole("link", { name: "Agent Handbook", exact: true }).first().click()
        await expect(page).toHaveURL(/\/lab\/handbook$/)
        await expect(page.getByRole("heading", { level: 1, name: "Agent Coding Handbook" })).toBeVisible()
    })
})
