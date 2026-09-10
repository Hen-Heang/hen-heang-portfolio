import { expect, test } from "@playwright/test"

const identity = "Backend / AX Software Engineer"

test.describe("portfolio-wide positioning", () => {
    test("keeps the backend-first AX identity consistent across core routes", async ({
        page,
    }) => {
        await page.goto("/")
        await expect(page.getByText(identity, { exact: true })).toBeVisible()
        await expect(page.getByText(/My foundation is backend engineering/)).toBeVisible()

        await page.goto("/about")
        await expect(
            page.getByRole("heading", {
                level: 1,
                name: `Hen Heang — ${identity}`,
            }),
        ).toBeVisible()
        await expect(page.getByText(/I am growing toward Backend \/ AX/)).toBeVisible()

        await page.goto("/resume")
        await expect(page.getByText(new RegExp(`^${identity}`)).first()).toBeVisible()
        await expect(
            page.getByRole("heading", { name: /H-Phsar — Backend API/ }),
        ).toBeVisible()

        await page.goto("/journey")
        await expect(page.getByText("AX Engineering", { exact: true })).toBeVisible()
        await expect(page.getByText("Last updated September 10, 2026")).toBeVisible()
    })

    test("keeps the main portfolio routes inside an iPhone-width viewport", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 428, height: 926 })

        for (const route of [
            "/",
            "/about",
            "/resume",
            "/journey",
            "/lab/ax-engineering",
            "/ai-engineering",
        ]) {
            await page.goto(route)
            await expect(
                page
                    .locator("body")
                    .evaluate((body) => body.scrollWidth <= window.innerWidth),
                `${route} should not overflow horizontally`,
            ).resolves.toBe(true)
        }
    })
})
