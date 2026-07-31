import { expect, test } from "@playwright/test"

test.describe("Homepage current focus", () => {
    test("shows a compact three-item focus list inside Engineering Growth", async ({
        page,
    }) => {
        await page.goto("/")

        const section = page.locator("#growth")
        await expect(
            section.getByRole("heading", {
                name: "Learning tied to real systems",
            }),
        ).toBeVisible()
        await expect(
            section.getByText("Engineering Growth", { exact: true }),
        ).toBeVisible()
        const focus = section
            .getByRole("heading", { name: "Current focus" })
            .locator("xpath=..")
        await expect(focus.getByRole("listitem")).toHaveCount(3)
        await expect(
            focus.getByRole("link", { name: "View learning journey" }),
        ).toHaveAttribute("href", "/journey")

        await expect(
            page.getByRole("heading", { name: "What I’m working on" }),
        ).toHaveCount(0)
        await expect(
            page.getByRole("heading", { name: "What I own on the backend" }),
        ).toHaveCount(0)
    })
})
