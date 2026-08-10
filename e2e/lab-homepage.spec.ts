import { test, expect } from "@playwright/test"

test.describe("Engineering Lab homepage", () => {
    test("renders the compact hero, Continue Learning, learning paths, and library sections in order", async ({ page }) => {
        const response = await page.request.get("/lab")
        const html = await response.text()

        const positions = [
            "Learn backend engineering by building real systems.",
            'id="continue-learning-heading"',
            'id="learning-paths-heading"',
            'id="lab-library-heading"',
            'id="hands-on-practice-heading"',
            'id="apply-projects-heading"',
            'id="progress-summary-heading"',
        ].map((marker) => html.indexOf(marker))

        for (const pos of positions) expect(pos).toBeGreaterThan(-1)
        for (let i = 1; i < positions.length; i++) {
            expect(positions[i]).toBeGreaterThan(positions[i - 1])
        }
    })

    test("shows the Backend path as recommended and links to the roadmap", async ({ page }) => {
        await page.goto("/lab")
        const backendCard = page.locator("article", {
            hasText: "Backend Engineering",
        })
        await expect(backendCard.getByText("Recommended")).toBeVisible()
    })

    test("uses visual stack markers and real project previews", async ({ page }) => {
        await page.goto("/lab")
        await expect(page.getByLabel("Backend engineering learning stack")).toBeVisible()
        await expect(page.getByText("Postgres", { exact: true })).toBeVisible()
        await expect(page.getByRole("img", { name: /H-Phsar.*project preview/ })).toBeVisible()
        await expect(page.getByRole("img", { name: /Hengo.*project preview/ })).toBeVisible()
    })

    test("search stays interactive and swaps only the library preview section", async ({ page }) => {
        await page.goto("/lab")
        await expect(page.getByRole("link", { name: "Backend curriculum" })).toBeVisible()

        const search = page.getByRole("textbox", {
            name: "Search Engineering Lab",
        })
        await search.fill("docker")
        await expect(page.getByRole("link", { name: "Backend curriculum" })).toHaveCount(0)
        await expect(page.getByText(/\d+ results?$/)).toBeVisible()
        await expect(page.getByRole("link", { name: /Open in full library/ })).toBeVisible()

        await search.fill("")
        await expect(page.getByRole("link", { name: "Backend curriculum" })).toBeVisible()
    })

    test("the Lab nav marks the current section with aria-current", async ({ page }) => {
        await page.goto("/lab")
        const labNav = page.getByRole("navigation", {
            name: "Engineering Lab sections",
        })
        await expect(labNav.getByRole("link", { name: "Overview", exact: true })).toHaveAttribute("aria-current", "page")

        await page.goto("/lab/backend")
        await expect(labNav.getByRole("link", { name: "Backend", exact: true })).toHaveAttribute("aria-current", "page")
    })
})

test.describe("Engineering Lab library", () => {
    test("persists the query in the URL and survives a refresh", async ({ page }) => {
        await page.goto("/lab/library")
        const search = page.getByRole("textbox", {
            name: "Search the Engineering Lab library",
        })
        await search.fill("spring")
        await expect(page).toHaveURL(/[?&]q=spring/)

        await page.reload()
        await expect(
            page.getByRole("textbox", {
                name: "Search the Engineering Lab library",
            }),
        ).toHaveValue("spring")
    })

    test("filters by content type via the tab buttons", async ({ page }) => {
        await page.goto("/lab/library")
        await page.getByRole("button", { name: "Labs", exact: true }).click()
        await expect(page).toHaveURL(/[?&]type=lab/)
    })
})

test.describe("Engineering Lab progress", () => {
    test("shows the factual empty state with no local progress", async ({ page }) => {
        await page.context().clearCookies()
        await page.goto("/lab/progress")
        await expect(page.getByText("No learning progress yet.")).toBeVisible()
        await expect(page.getByRole("link", { name: "Start Backend Path" })).toBeVisible()
    })
})
