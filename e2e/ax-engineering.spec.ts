import { expect, test } from "@playwright/test"

test.describe("AX Engineering learning path", () => {
    test("renders the learning system and keeps Backend as the recommended Lab foundation", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 428, height: 926 })
        await page.goto("/lab/ax-engineering")

        await expect(
            page.getByRole("heading", {
                name: "Engineering reliable human + AI development workflows.",
            }),
        ).toBeVisible()
        await expect(
            page.getByText("Learning / Experimenting", { exact: true }),
        ).toBeVisible()
        await expect(
            page.getByRole("link", { name: /AI Engineering Library/ }),
        ).toBeVisible()
        await expect(
            page.getByRole("heading", { name: "The system around the model" }),
        ).toBeVisible()
        await expect(
            page.getByRole("heading", {
                name: "A deliberate learning sequence",
            }),
        ).toBeVisible()
        await expect(
            page.getByRole("navigation", {
                name: "AX Engineering page journey",
            }),
        ).toBeVisible()
        const capstone = page.locator("#module-build-a-general-agent-harness")
        await expect(
            capstone.getByText("Build a General Agent Harness", {
                exact: true,
            }),
        ).toBeVisible()
        await capstone.locator("summary").click()
        await expect(capstone.getByText(/Combine the curriculum/)).toBeVisible()
        await expect(
            page
                .locator("body")
                .evaluate((body) => body.scrollWidth <= window.innerWidth),
        ).resolves.toBe(true)

        await page.goto("/lab")
        const backendCard = page.locator("article", {
            hasText: "Backend Engineering",
        })
        await expect(backendCard.getByText("Recommended")).toBeVisible()
    })

    test("finds AX concepts through the shared Lab search", async ({
        page,
    }) => {
        await page.goto("/lab")
        const search = page.getByRole("textbox", {
            name: "Search Engineering Lab",
        })
        await expect(async () => {
            await page.getByRole("button", { name: "Quality Gate" }).click()
            await expect(search).toHaveValue("Quality Gate", { timeout: 1_000 })
        }).toPass({ timeout: 15_000 })
        await expect(
            page.getByRole("link", { name: /Quality Gates/ }).first(),
        ).toBeVisible()
    })
})
