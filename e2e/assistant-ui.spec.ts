import { expect, test, type Locator, type Page } from "@playwright/test"

const viewports = [
    { name: "320px", width: 320, height: 700 },
    { name: "375px", width: 375, height: 812 },
    { name: "390px", width: 390, height: 844 },
    { name: "768px", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
] as const

const storedConversation = [
    {
        role: "user",
        text: `Can you review ${"a".repeat(180)}?`,
    },
    {
        role: "assistant",
        text: [
            "A response with a long external link:",
            "",
            `[Portfolio source](https://example.com/${"very-long-segment-".repeat(14)})`,
            "",
            "```ts",
            `const longValue = "${"0123456789".repeat(22)}";`,
            "```",
            "",
            "| Area | Result |",
            "| --- | --- |",
            `| Responsive behavior | ${"verified-".repeat(18)} |`,
        ].join("\n"),
    },
]

async function openAssistant(page: Page): Promise<Locator> {
    const launcher = page.getByRole("button", { name: "Ask about my work" })
    await expect(launcher).toBeVisible()
    const launcherBox = await launcher.boundingBox()
    expect(launcherBox?.width).toBeGreaterThanOrEqual(44)
    expect(launcherBox?.height).toBeGreaterThanOrEqual(44)
    await launcher.click()

    const dialog = page.getByRole("dialog", { name: "Portfolio Assistant" })
    await expect(dialog).toBeVisible()
    return dialog
}

async function expectInsideViewport(page: Page, locator: Locator) {
    const viewport = page.viewportSize()
    const box = await locator.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(-1)
    expect(box!.y).toBeGreaterThanOrEqual(-1)
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1)
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height + 1)
}

async function expectNoPageOverflow(page: Page) {
    const overflow = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)
}

async function expectMinimumTouchTarget(locator: Locator) {
    const box = await locator.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
}

test.describe("Portfolio Assistant responsive UI", () => {
    for (const viewport of viewports) {
        test(`fits the ${viewport.name} viewport without clipping`, async ({ page }, testInfo) => {
            await page.setViewportSize(viewport)
            await page.goto("/")
            await expectNoPageOverflow(page)

            const dialog = await openAssistant(page)
            await expectInsideViewport(page, dialog)
            await expectNoPageOverflow(page)

            const dialogOverflow = await dialog.evaluate((element) => ({
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
            }))
            expect(dialogOverflow.scrollWidth).toBeLessThanOrEqual(dialogOverflow.clientWidth)

            const input = dialog.getByRole("textbox", { name: "Ask about Hen's experience or projects..." })
            await expect(input).toBeVisible()
            await expectInsideViewport(page, input)
            await expectMinimumTouchTarget(input)

            if (viewport.width < 640) {
                const dialogBox = await dialog.boundingBox()
                expect(Math.abs((dialogBox?.height ?? 0) - viewport.height)).toBeLessThanOrEqual(1)
                const fontSize = await input.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))
                expect(fontSize).toBeGreaterThanOrEqual(16)
            }

            const requiredTargets = [
                dialog.getByRole("button", { name: "Close assistant" }),
                dialog.getByRole("link", { name: "View resume" }),
                dialog.getByRole("link", { name: "Contact Heang" }),
                dialog.getByRole("button", { name: "Send message" }),
                dialog.getByRole("button", { name: "Backend experience" }),
            ]
            for (const target of requiredTargets) await expectMinimumTouchTarget(target)

            await page.screenshot({
                path: testInfo.outputPath(`assistant-${viewport.name}-light.png`),
                fullPage: false,
            })

            await page.keyboard.press("Escape")
            await expect(dialog).toBeHidden()
            await expect(page.getByRole("button", { name: "Ask about my work" })).toBeFocused()
        })
    }

    test("keeps the input visible when the mobile viewport shrinks", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto("/")
        const dialog = await openAssistant(page)
        const input = dialog.getByRole("textbox", { name: "Ask about Hen's experience or projects..." })
        await input.focus()

        await page.setViewportSize({ width: 390, height: 500 })

        await expectInsideViewport(page, dialog)
        await expectInsideViewport(page, input)
        const dialogBox = await dialog.boundingBox()
        expect(Math.abs((dialogBox?.height ?? 0) - 500)).toBeLessThanOrEqual(1)
    })

    test("contains long messages, links, code, and tables at 320px", async ({ page }, testInfo) => {
        await page.addInitScript((messages) => {
            window.localStorage.setItem("hh-assistant-history-v1", JSON.stringify(messages))
        }, storedConversation)
        await page.setViewportSize({ width: 320, height: 700 })
        await page.goto("/")

        const dialog = await openAssistant(page)
        await expectNoPageOverflow(page)

        const externalLink = dialog.getByRole("link", { name: /Portfolio source/ })
        await expect(externalLink).toHaveAttribute("target", "_blank")
        await expect(externalLink).toHaveAttribute("rel", /noopener/)
        await expectInsideViewport(page, externalLink)

        const codeBlock = dialog.locator("pre").first()
        const codeOverflow = await codeBlock.evaluate((element) => ({
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            overflowX: getComputedStyle(element).overflowX,
        }))
        expect(codeOverflow.scrollWidth).toBeGreaterThan(codeOverflow.clientWidth)
        expect(codeOverflow.overflowX).toBe("auto")
        await expectInsideViewport(page, codeBlock)

        await expectMinimumTouchTarget(dialog.getByRole("button", { name: "Copy response" }))
        await expectMinimumTouchTarget(dialog.getByRole("button", { name: "This answer was helpful" }))
        await expectMinimumTouchTarget(dialog.getByRole("button", { name: "This answer was not helpful" }))

        await page.screenshot({
            path: testInfo.outputPath("assistant-320px-long-content.png"),
            fullPage: false,
        })
    })

    test("shows loading, streaming, and error feedback without losing the input", async ({ page }) => {
        await page.route("**/api/chat", async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 750))
            await route.fulfill({
                status: 503,
                contentType: "application/json",
                body: JSON.stringify({ error: "Assistant is temporarily unavailable." }),
            })
        })
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto("/")

        const dialog = await openAssistant(page)
        const input = dialog.getByRole("textbox", { name: "Ask about Hen's experience or projects..." })
        await input.fill("Summarize the backend experience.")
        await dialog.getByRole("button", { name: "Send message" }).click()

        await expect(dialog.getByRole("button", { name: "Stop generating" })).toBeVisible()
        await expect(dialog.getByRole("status", { name: "Assistant is typing" })).toBeVisible()
        await expect(dialog.getByRole("alert")).toBeVisible()
        await expectMinimumTouchTarget(dialog.getByRole("button", { name: "Retry" }))
        await expect(input).toBeVisible()
        await expectInsideViewport(page, input)
    })

    test("uses the dark theme and honors reduced motion", async ({ page }, testInfo) => {
        await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto("/")
        const dialog = await openAssistant(page)
        await expect(page.locator("html")).toHaveClass(/dark/)

        const motion = await dialog.evaluate((element) => ({
            animationDuration: Number.parseFloat(getComputedStyle(element).animationDuration) || 0,
            transitionDuration: Number.parseFloat(getComputedStyle(element).transitionDuration) || 0,
        }))
        expect(motion.animationDuration).toBeLessThanOrEqual(0.001)
        expect(motion.transitionDuration).toBeLessThanOrEqual(0.001)

        await page.screenshot({
            path: testInfo.outputPath("assistant-390px-dark-reduced-motion.png"),
            fullPage: false,
        })
    })
})
