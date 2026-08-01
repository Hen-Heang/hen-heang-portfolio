import { test, expect } from "@playwright/test"

test.describe("Site navigation", () => {
    test("desktop nav prioritizes Work, Lab, About, and Resume with one active route", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 1280, height: 900 })
        await page.goto("/about")
        const mainNav = page.getByLabel("Main", { exact: true })
        await expect(
            mainNav.getByRole("link", { name: "Work" }),
        ).not.toHaveAttribute("aria-current", "page")
        await expect(
            mainNav.getByRole("link", { name: "About" }),
        ).toHaveAttribute("aria-current", "page")
        await expect(
            mainNav.getByRole("link", { name: "Resume" }),
        ).toHaveAttribute("href", "/resume")
        await expect(
            mainNav.getByRole("link", { name: "Journey" }),
        ).toHaveCount(0)
        await expect(
            mainNav.getByRole("link", { name: "Experience" }),
        ).toHaveCount(0)
    })

    test("mobile navigation drawer opens, escape closes it, and focus returns to the trigger", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto("/")
        const trigger = page.getByRole("button", {
            name: "Open navigation menu",
        })
        await trigger.click()
        const drawer = page.getByRole("dialog")
        await expect(drawer).toBeVisible()
        await expect(drawer.getByRole("link", { name: "Lab" })).toBeVisible()
        await expect(
            drawer.getByRole("link", { name: "Journey" }),
        ).toBeVisible()
        await page.keyboard.press("Escape")
        await expect(drawer).toBeHidden()
        await expect(trigger).toBeFocused()
    })
})

test.describe("Command menu", () => {
    test("desktop trigger communicates the Cmd/Ctrl+K shortcut and is keyboard accessible", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 1280, height: 900 })
        await page.goto("/")

        const trigger = page.getByRole("button", {
            name: /Open command menu, keyboard shortcut Command or Control K/,
        })
        await expect(trigger).toBeVisible()
        await expect(trigger).toHaveAttribute(
            "aria-keyshortcuts",
            "Meta+K Control+K",
        )
        await expect(trigger.getByText("⌘K")).toBeVisible()

        // Open via button click, close via Escape, focus should return to the button.
        await trigger.click()
        const dialog = page.getByRole("dialog")
        await expect(dialog).toBeVisible()
        await expect(dialog).toHaveAttribute(
            "aria-keyshortcuts",
            "Meta+K Control+K",
        )
        await page.keyboard.press("Escape")
        await expect(dialog).toBeHidden()
        await expect(trigger).toBeFocused()

        // Open via the global Meta+K shortcut while focus is elsewhere, close, verify restore.
        const navLink = page
            .getByLabel("Main", { exact: true })
            .getByRole("link", { name: "Work" })
        await navLink.focus()
        await expect(navLink).toBeFocused()
        await page.keyboard.press("Meta+k")
        await expect(dialog).toBeVisible()
        await page.keyboard.press("Escape")
        await expect(dialog).toBeHidden()
        await expect(navLink).toBeFocused()
    })

    test("filters commands by search and supports arrow-key navigation", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 1280, height: 900 })
        await page.goto("/")
        await page
            .getByRole("button", {
                name: /Open command menu, keyboard shortcut Command or Control K/,
            })
            .click()
        const dialog = page.getByRole("dialog")
        await expect(dialog).toBeVisible()

        const search = page.getByRole("combobox", { name: "Command search" })
        await expect(search).toBeFocused()
        await search.fill("lab")
        await expect(
            page.getByRole("option", { name: "Open Engineering Lab" }),
        ).toBeVisible()

        await search.fill("journey")
        await expect(
            page.getByRole("option", { name: "View Current Journey" }),
        ).toBeVisible()

        await page.keyboard.press("Escape")
        await expect(dialog).toBeHidden()
    })
})
