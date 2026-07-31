import { expect, test } from "@playwright/test"

const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 390, height: 844 },
]

test.describe("Backend Engineering layout and accessibility", () => {
    for (const viewport of viewports) {
        test(`keeps the long detail route within the ${viewport.name} viewport`, async ({ page }) => {
            await page.setViewportSize(viewport)
            await page.goto("/lab/backend/java-backend-fundamentals")
            await expect(page.getByRole("heading", { name: "Java Backend Fundamentals" })).toBeVisible()

            const dimensions = await page.evaluate(() => ({
                clientWidth: document.documentElement.clientWidth,
                scrollWidth: document.documentElement.scrollWidth,
            }))
            expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
            await expect(page.getByRole("button", { name: "Copy to clipboard" }).first()).toBeVisible()
            await expect(page.getByRole("table").first()).toBeVisible()
            if (viewport.name === "mobile") {
                const tableScroller = page.getByRole("table").first().locator("xpath=..")
                const tableOverflow = await tableScroller.evaluate((element) => ({
                    clientWidth: element.clientWidth,
                    scrollWidth: element.scrollWidth,
                    overflowX: getComputedStyle(element).overflowX,
                }))
                expect(tableOverflow.overflowX).toBe("auto")
                expect(tableOverflow.scrollWidth).toBeGreaterThan(tableOverflow.clientWidth)
            }
        })
    }

    test("uses one main landmark, ordered headings, unique IDs, labelled diagrams, and table headers", async ({ page }) => {
        await page.goto("/lab/backend/java-backend-fundamentals")
        await expect(page.locator("main")).toHaveCount(1)

        const audit = await page.evaluate(() => {
            const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map((element) => element.id)
            const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
            const headings = [...document.querySelectorAll<HTMLHeadingElement>("h1,h2,h3,h4,h5,h6")]
                .map((heading) => Number(heading.tagName.slice(1)))
            const skippedHeading = headings.some((level, index) => index > 0 && level > headings[index - 1] + 1)
            return { duplicates, skippedHeading }
        })

        expect(audit.duplicates).toEqual([])
        expect(audit.skippedHeading).toBe(false)
        await expect(page.getByText("Text alternative:").first()).toBeVisible()
        await expect(page.getByRole("columnheader").first()).toHaveAttribute("scope", "col")
    })

    test("supports roadmap scrolling and native details keyboard operation", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto("/lab/backend/roadmap")
        const sequence = page.getByLabel("Backend roadmap level sequence")
        const overflow = await sequence.evaluate((element) => ({
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
        }))
        expect(overflow.scrollWidth).toBeGreaterThan(overflow.clientWidth)

        const summary = page.getByText("Review examples, mistakes, interview prompts, and production concerns").first()
        await summary.focus()
        await page.keyboard.press("Enter")
        await expect(summary.locator("xpath=..")).toHaveAttribute("open", "")
    })

    test("keeps the desktop table of contents sticky and mobile breadcrumbs truncated", async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto("/lab/backend/java-backend-fundamentals")
        const toc = page.getByRole("navigation", { name: "On this page" }).locator("xpath=..")
        expect(await toc.evaluate((element) => getComputedStyle(element).position)).toBe("sticky")

        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto("/lab/backend/voucher-redemption-production-case-study")
        const currentCrumb = page.getByRole("navigation", { name: "Breadcrumb" }).locator("span.truncate").last()
        await expect(currentCrumb).toBeVisible()
        expect(await currentCrumb.evaluate((element) => getComputedStyle(element).textOverflow)).toBe("ellipsis")
    })

    test("exposes visible focus, 44px primary touch targets, safe external labels, and reduced motion", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.emulateMedia({ reducedMotion: "reduce" })
        await page.goto("/lab/backend")

        const search = page.getByRole("textbox", { name: "Search backend curriculum" })
        await search.focus()
        const focusOutline = await search.evaluate((element) => getComputedStyle(element).outlineStyle)
        expect(focusOutline).not.toBe("none")

        for (const locator of [
            page.getByRole("link", { name: /View roadmap/ }),
            page.getByRole("combobox", { name: "Category" }),
            page.getByRole("button", { name: "Open lab menu" }),
        ]) {
            expect((await locator.boundingBox())!.height).toBeGreaterThanOrEqual(44)
        }

        const transitionSeconds = await page.getByRole("link", { name: /View roadmap/ }).evaluate((element) =>
            Number.parseFloat(getComputedStyle(element).transitionDuration),
        )
        expect(transitionSeconds).toBeLessThanOrEqual(0.02)

        const contrastRatio = await page.getByText("Reference library").evaluate((element) => {
            function rgb(value: string): number[] {
                return value.match(/[\d.]+/g)!.slice(0, 3).map(Number)
            }
            function luminance([red, green, blue]: number[]): number {
                const channels = [red, green, blue].map((channel) => {
                    const value = channel / 255
                    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
                })
                return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
            }
            let backgroundElement: Element | null = element
            let background = "rgba(0, 0, 0, 0)"
            while (backgroundElement && background.endsWith(", 0)")) {
                background = getComputedStyle(backgroundElement).backgroundColor
                backgroundElement = backgroundElement.parentElement
            }
            const values = [luminance(rgb(getComputedStyle(element).color)), luminance(rgb(background))].sort((a, b) => b - a)
            return (values[0] + 0.05) / (values[1] + 0.05)
        })
        expect(contrastRatio).toBeGreaterThanOrEqual(4.5)

        await page.goto("/lab/backend/java-backend-fundamentals")
        await expect(page.getByRole("link", { name: /opens in a new tab/ }).first()).toBeVisible()
    })
})
