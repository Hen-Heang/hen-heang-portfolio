import { expect, test } from "@playwright/test"

const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
] as const

test.describe("Homepage polish", () => {
    test("server-renders the recruiter-focused hero and consistent resume CTAs", async ({ page, request }) => {
        const consoleErrors: string[] = []
        const pageErrors: string[] = []
        page.on("console", (message) => {
            if (message.type() === "error") consoleErrors.push(message.text())
        })
        page.on("pageerror", (error) => pageErrors.push(error.message))

        const response = await request.get("/")
        const html = await response.text()

        expect(html).toContain("Java &amp; Spring Boot backend developer building dependable APIs and business systems.")
        expect(html).toContain("I turn business rules into secure, testable services")
        expect(html).toContain("2+ years of experience")

        await page.goto("/")
        const main = page.locator("main")
        await expect(
            main.getByText("Java & Spring Boot backend developer building dependable APIs and business systems."),
        ).toBeVisible()

        const resumeLinks = main.getByRole("link", { name: "View Resume" })
        await expect(resumeLinks).toHaveCount(2)
        for (const link of await resumeLinks.all()) {
            await expect(link).toHaveAttribute("href", "/resume")
        }
        await expect(main.getByText(/Download (CV|Resume)/)).toHaveCount(0)
        expect(consoleErrors).toEqual([])
        expect(pageErrors).toEqual([])
    })

    for (const viewport of viewports) {
        test(`keeps the homepage within the ${viewport.name} viewport`, async ({ page }) => {
            await page.setViewportSize(viewport)
            await page.goto("/")
            await expect(page.getByRole("heading", { name: "Hen Heang", level: 1 })).toBeVisible()

            const dimensions = await page.evaluate(() => ({
                clientWidth: document.documentElement.clientWidth,
                scrollWidth: document.documentElement.scrollWidth,
                offenders: [...document.querySelectorAll<HTMLElement>("body *")]
                    .filter((element) => {
                        const rect = element.getBoundingClientRect()
                        return rect.left < -1 || rect.right > document.documentElement.clientWidth + 1
                    })
                    .slice(0, 8)
                    .map((element) => ({
                        tag: element.tagName,
                        className: element.className,
                        left: element.getBoundingClientRect().left,
                        right: element.getBoundingClientRect().right,
                    })),
            }))
            expect(dimensions.scrollWidth, JSON.stringify(dimensions.offenders)).toBeLessThanOrEqual(
                dimensions.clientWidth,
            )
        })
    }

    test("keeps Radix tab keyboard semantics and panel height stable", async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto("/")

        const tabList = page.getByRole("tablist", { name: "Engineering views" })
        const architecture = tabList.getByRole("tab", { name: "architecture" })
        const api = tabList.getByRole("tab", { name: "api" })
        await expect(architecture).toHaveAttribute("aria-selected", "true")

        const panel = tabList.locator("xpath=../../..")
        const before = await panel.boundingBox()
        await architecture.focus()
        await page.keyboard.press("ArrowRight")
        await expect(api).toBeFocused()
        await expect(api).toHaveAttribute("aria-selected", "true")
        await expect(page.getByRole("tabpanel")).toContainText("HTTP/1.1 200 OK")
        const after = await panel.boundingBox()

        expect(Math.abs((after?.height ?? 0) - (before?.height ?? 0))).toBeLessThanOrEqual(1)
    })

    test("renders static hero content and preserves focus treatment with reduced motion", async ({ page }) => {
        const consoleErrors: string[] = []
        page.on("console", (message) => {
            if (message.type() === "error") consoleErrors.push(message.text())
        })
        await page.setViewportSize({ width: 390, height: 844 })
        await page.emulateMedia({ reducedMotion: "reduce" })
        await page.goto("/")

        const heading = page.getByRole("heading", { name: "Hen Heang", level: 1 })
        await expect(heading).toBeVisible()
        const heroMotionStyle = await heading.locator("xpath=..").evaluate((element) => {
            const style = getComputedStyle(element)
            return { opacity: style.opacity, transform: style.transform }
        })
        expect(heroMotionStyle.opacity).toBe("1")
        expect(heroMotionStyle.transform).toBe("none")

        const resume = page.getByRole("link", { name: "View Resume" }).first()
        await resume.focus()
        expect(await resume.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none")
        expect(consoleErrors).toEqual([])
    })

    test("supports dark mode and keeps both resume views public", async ({ page, request }) => {
        await page.emulateMedia({ colorScheme: "light" })
        await page.goto("/")
        const darkToggle = page.getByRole("button", { name: "Switch to dark theme" }).first()
        await darkToggle.click()
        await expect(page.locator("html")).toHaveClass(/dark/)

        expect((await request.get("/resume")).status()).toBe(200)
        expect((await request.get("/cv")).status()).toBe(200)
    })
})
