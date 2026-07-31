import { expect, test } from "@playwright/test"

test.describe("Backend Engineering curriculum", () => {
    test("loads every requested backend route with its expected primary heading", async ({ page }) => {
        const routes = [
            ["/lab", "Learn backend engineering by building real systems."],
            ["/lab/backend", "From fundamentals to production systems"],
            ["/lab/backend/roadmap", "Backend Engineering Roadmap"],
            ["/lab/backend/java-backend-fundamentals", "Java Backend Fundamentals"],
            ["/lab/backend/client-server-http-request-lifecycle", "Client–Server and HTTP Request Lifecycle"],
            ["/lab/backend/rest-api-design-fundamentals", "REST API Design Fundamentals"],
            ["/lab/backend/postgresql-schema-indexing-fundamentals", "PostgreSQL Schema and Indexing Fundamentals"],
            ["/lab/backend/spring-boot-layered-architecture", "Layered Spring Boot Architecture"],
            ["/lab/backend/spring-boot-task-api-lab", "Lab: Build a Spring Boot Task API"],
            ["/lab/backend/mybatis-mapper-workflow", "MyBatis Mapper Workflow"],
            ["/lab/backend/spring-transaction-fundamentals", "Spring Transaction Fundamentals"],
            ["/lab/backend/spring-security-authentication-flow", "Spring Security Authentication Flow"],
            ["/lab/backend/backend-testing-strategy", "Backend Testing Strategy"],
            ["/lab/backend/docker-cicd-spring-boot", "Docker and CI/CD for Spring Boot"],
            ["/lab/backend/production-readiness-checklist", "Production Readiness Checklist"],
            ["/lab/backend/voucher-redemption-production-case-study", "Production Case Study: B2B Voucher Redemption"],
            ["/lab/backend/backend-interview-questions", "Java and Spring Backend Interview Questions"],
        ] as const

        for (const [route, heading] of routes) {
            const response = await page.goto(route)
            expect(response?.status(), route).toBe(200)
            await expect(page.getByRole("heading", { name: heading, level: 1 }), route).toBeVisible()
        }

        const planned = await page.goto("/lab/backend/java-concurrency-virtual-threads")
        expect(planned?.status()).toBe(404)
    })

    test("integrates published and planned backend content into global Lab search", async ({ page }) => {
        await page.goto("/lab")
        const search = page.getByRole("textbox", { name: "Search Engineering Lab" })

        await search.fill("Java Backend Fundamentals")
        const published = page.getByRole("link", { name: /Backend Engineering.*Java Backend Fundamentals/ })
        await expect(published).toHaveAttribute("href", "/lab/backend/java-backend-fundamentals")
        await expect(published.getByText(/Backend Engineering/)).toHaveClass(/text-success/)

        await search.fill("Java Concurrency and Virtual Threads")
        await expect(page.getByRole("link", { name: /Java Concurrency and Virtual Threads/ })).toHaveAttribute(
            "href",
            "/lab/backend/roadmap"
        )

        await search.fill("Docker")
        const devopsSource = page.getByText(/DevOps Basics/).first()
        await expect(devopsSource).toHaveClass(/text-warning/)
    })

    test("opens the hub, roadmap, Java fundamentals, Spring content, search, filters, lab, and related content", async ({ page }) => {
        await page.goto("/lab/backend")
        await expect(page.getByRole("heading", { name: "From fundamentals to production systems" })).toBeVisible()

        await page.getByRole("link", { name: /View roadmap/ }).click()
        await expect(page).toHaveURL(/\/lab\/backend\/roadmap$/)
        await expect(page.getByRole("heading", { name: "Backend Engineering Roadmap" })).toBeVisible()

        await page.getByRole("link", { name: "Java Backend Fundamentals" }).click()
        await expect(page.getByRole("heading", { name: "Java Backend Fundamentals", level: 1 })).toBeVisible()

        await page.getByRole("link", { name: "Backend Engineering" }).first().click()
        const search = page.getByRole("textbox", { name: "Search backend curriculum" })
        await search.fill("Spring Boot layered architecture")
        await page.getByRole("link", { name: /Layered Spring Boot Architecture/ }).click()
        await expect(page.getByRole("heading", { name: "Layered Spring Boot Architecture", level: 1 })).toBeVisible()

        await page.getByRole("link", { name: "Backend Engineering" }).first().click()
        await search.fill("transactions")
        await expect(page.getByRole("link", { name: /Spring Transaction Fundamentals/ })).toBeVisible()

        await search.fill("")
        const categoryFilter = page.getByRole("combobox", { name: "Category" })
        await categoryFilter.selectOption("security")
        await expect(categoryFilter).toHaveValue("security")
        await expect(page.getByRole("link", { name: /Spring Security Authentication Flow/ })).toBeVisible()

        await page.getByRole("button", { name: "Clear filters" }).click()
        await search.fill("Task API")
        await page.getByRole("link", { name: /Lab: Build a Spring Boot Task API/ }).click()
        await expect(page.getByRole("heading", { name: "Lab: Build a Spring Boot Task API", level: 1 })).toBeVisible()

        const related = page.getByRole("region", { name: "Related content" })
        await related.getByRole("link").first().click()
        await expect(page).toHaveURL(/\/lab\/backend\/[a-z0-9-]+$/)
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    })

    test("does not expose empty planned routes and supports no-results plus clearing filters", async ({ page }) => {
        const response = await page.goto("/lab/backend/computer-linux-command-line-foundations")
        expect(response?.status()).toBe(404)
        await expect(page.getByRole("heading", { name: "404" })).toBeVisible()
        await expect(page.getByRole("heading", { name: "This page could not be found." })).toBeVisible()

        await page.goto("/lab/backend")
        const search = page.getByRole("textbox", { name: "Search backend curriculum" })
        const catalog = page.locator("#catalog")
        const resultCount = catalog.locator("[aria-live=polite]")
        const initialResultCount = await resultCount.textContent()
        expect(initialResultCount).toMatch(/^\d+ items?$/)
        await search.fill("definitely-no-backend-result")
        await expect(page.getByText("No matching backend content")).toBeVisible()
        await page.getByRole("button", { name: "Clear filters" }).click()
        await expect(search).toHaveValue("")
        await expect(resultCount).toHaveText(initialResultCount!)
    })

    test("persists local progress and supports previous/next navigation", async ({ page }) => {
        await page.goto("/lab/backend/java-backend-fundamentals")
        const progress = page.getByRole("button", { name: "Mark complete" })
        await progress.click()
        await expect(page.getByRole("button", { name: "Completed" })).toBeVisible()
        await page.reload()
        await expect(page.getByRole("button", { name: "Completed" })).toBeVisible()

        await page.getByRole("link", { name: /Next Client–Server and HTTP Request Lifecycle/ }).click()
        await expect(page.getByRole("heading", { name: "Client–Server and HTTP Request Lifecycle", level: 1 })).toBeVisible()
        await page.getByRole("link", { name: /Previous Java Backend Fundamentals/ }).click()
        await expect(page.getByRole("heading", { name: "Java Backend Fundamentals", level: 1 })).toBeVisible()
    })

    test("renders safely on mobile and exposes keyboard-operable navigation", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto("/lab/backend")
        await expect(page.getByRole("heading", { name: "From fundamentals to production systems" })).toBeVisible()
        // The trigger's accessible name toggles between "Open"/"Close lab menu" with its state.
        const openTrigger = page.getByRole("button", { name: "Open lab menu" })
        await expect(openTrigger).toBeVisible()
        await expect(openTrigger).toHaveAttribute("aria-expanded", "false")
        await openTrigger.click()

        const drawer = page.getByRole("dialog", { name: "Engineering Lab navigation" })
        await expect(drawer).toBeVisible()
        await expect(drawer.getByRole("navigation", { name: "Lab sections" })).toBeVisible()
        await expect(drawer.getByRole("link", { name: "Backend Path" })).toHaveAttribute("aria-current", "page")

        // Background content (including the header trigger) is aria-hidden and
        // cannot be interacted with while the modal drawer is open.
        await expect(page.locator("header")).toHaveAttribute("aria-hidden", "true")
        await expect(page.locator("body")).toHaveCSS("overflow", "hidden")

        await drawer.getByRole("button", { name: "Close lab menu" }).click()
        await expect(drawer).toBeHidden()
        // Focus returns to the trigger after closing, and it reports collapsed again.
        await expect(openTrigger).toBeFocused()
        await expect(openTrigger).toHaveAttribute("aria-expanded", "false")

        // Escape closes the drawer too, also restoring focus to the trigger.
        await openTrigger.click()
        await expect(drawer).toBeVisible()
        await page.keyboard.press("Escape")
        await expect(drawer).toBeHidden()
        await expect(openTrigger).toBeFocused()

        const search = page.getByRole("textbox", { name: "Search backend curriculum" })
        await search.focus()
        await page.keyboard.type("transactions")
        await expect(search).toHaveValue("transactions")
    })

    test("opens external references with safe browser isolation", async ({ page }) => {
        await page.goto("/lab/backend/java-backend-fundamentals")
        const reference = page.getByRole("region", { name: "Source metadata" }).getByRole("link").first()
        await expect(reference).toHaveAttribute("target", "_blank")
        await expect(reference).toHaveAttribute("rel", /noopener/)
        await expect(reference).toHaveAttribute("rel", /noreferrer/)
    })
})
