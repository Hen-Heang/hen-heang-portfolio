import { describe, expect, it } from "vitest"
import {
    searchLabContent,
    getLabItemsByCategory,
    getLabItemsByTechnology,
    getRecentlyLearnedTopics,
    getLabItem,
} from "./lab-knowledge"

describe("searchLabContent", () => {
    it("finds Docker content across the Lab", async () => {
        const results = await searchLabContent("Docker")
        expect(results.length).toBeGreaterThan(0)
        for (const result of results) {
            expect(result.source).toBe("engineering-lab")
            expect(result.slug.length).toBeGreaterThan(0)
        }
    })

    it("reuses the existing alias dictionary (springboot -> spring boot)", async () => {
        const results = await searchLabContent("springboot")
        expect(results.some((r) => r.title.toLowerCase().includes("spring"))).toBe(true)
    })

    it("scopes results to one Lab section when a category is given", async () => {
        const results = await searchLabContent("security", { category: "devops" })
        for (const result of results) expect(result.category).toBe("devops")
    })

    it("caps results at the requested (or default) limit", async () => {
        const results = await searchLabContent("a", { limit: 3 })
        expect(results.length).toBeLessThanOrEqual(3)
    })

    it("surfaces Kubernetes only as planned/roadmap content, never as a published, hands-on item", async () => {
        const results = await searchLabContent("Kubernetes")
        const backendMatch = results.find((r) => r.category === "backend")
        expect(backendMatch).toBeDefined()
        expect(backendMatch?.status).toBe("planned")
    })
})

describe("getLabItemsByCategory / getLabItemsByTechnology", () => {
    it("returns only backend items for the backend category", async () => {
        const results = await getLabItemsByCategory("backend", 5)
        expect(results.length).toBeGreaterThan(0)
        for (const result of results) expect(result.category).toBe("backend")
    })

    it("resolves a technology alias the same way search does", async () => {
        const results = await getLabItemsByTechnology("postgres")
        expect(results.some((r) => r.technologies.some((t) => t.toLowerCase().includes("postgresql")))).toBe(true)
    })
})

describe("getRecentlyLearnedTopics", () => {
    it("only returns backend or ai items, since devops Lab content has no date field", async () => {
        const results = await getRecentlyLearnedTopics(5)
        expect(results.length).toBeGreaterThan(0)
        for (const result of results) expect(["backend", "ai"]).toContain(result.category)
    })
})

describe("getLabItem", () => {
    it("returns a published backend excerpt", async () => {
        const result = await getLabItem("spring-boot-layered-architecture")
        expect("error" in result).toBe(false)
        if (!("error" in result)) {
            expect(result.category).toBe("backend")
            expect(result.status).toBe("published")
            expect(result.excerpt.length).toBeGreaterThan(0)
        }
    })

    it("returns a planned backend item without pretending it's published", async () => {
        const result = await getLabItem("computer-linux-command-line-foundations")
        expect("error" in result).toBe(false)
        if (!("error" in result)) expect(result.status).toBe("planned")
    })

    it("returns a devops topic excerpt", async () => {
        const result = await getLabItem("docker")
        expect("error" in result).toBe(false)
        if (!("error" in result)) {
            expect(result.category).toBe("devops")
            expect(result.excerpt.length).toBeGreaterThan(0)
        }
    })

    it("returns a devops lab excerpt", async () => {
        const result = await getLabItem("dockerize-spring-boot")
        expect("error" in result).toBe(false)
        if (!("error" in result)) {
            expect(result.category).toBe("devops")
            expect(result.type).toBe("lab")
        }
    })

    it("returns an error instead of inventing content for an unknown slug", async () => {
        const result = await getLabItem("this-slug-does-not-exist")
        expect("error" in result).toBe(true)
    })

    it("never returns an excerpt longer than the compact budget", async () => {
        const result = await getLabItem("spring-boot-layered-architecture")
        if (!("error" in result)) expect(result.excerpt.length).toBeLessThanOrEqual(701)
    })
})
