import { describe, expect, it } from "vitest"
import { handbookMeta, handbookParts, handbookSections, handbookSources } from "./index"

describe("agent coding handbook", () => {
    it("gives every section a unique anchor id", () => {
        const ids = handbookSections.map((section) => section.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it("gives every part a unique id", () => {
        const ids = handbookParts.map((part) => part.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it("numbers the body sections 1..N in reading order", () => {
        const numbered = handbookSections
            .map((section) => Number(section.number))
            .filter((value) => Number.isFinite(value))
        expect(numbered).toEqual(numbered.map((_, index) => index + 1))
    })

    it("covers the topics the handbook promises", () => {
        const ids = new Set(handbookSections.map((section) => section.id))
        for (const required of [
            "the-loop",
            "install",
            "side-by-side",
            "context-window",
            "instruction-files",
            "rules-and-memory",
            "skills",
            "subagents",
            "mcp",
            "config-files",
            "permissions",
            "hooks",
            "development-loop",
            "quality-gates",
            "automation",
            "parallel",
            "improve",
            "cheat-sheet",
        ]) {
            expect(ids).toContain(required)
        }
    })

    it("keeps every section non-empty and titled", () => {
        for (const section of handbookSections) {
            expect(section.title.length).toBeGreaterThan(0)
            expect(section.lead.length).toBeGreaterThan(0)
            expect(section.blocks.length).toBeGreaterThan(0)
        }
    })

    it("keeps subsection heading ids unique across the document", () => {
        const headingIds = handbookSections.flatMap((section) =>
            section.blocks.filter((block) => block.kind === "heading").map((block) => block.id),
        )
        expect(new Set(headingIds).size).toBe(headingIds.length)
    })

    it("gives every table row the same width as its header", () => {
        for (const section of handbookSections) {
            for (const block of section.blocks) {
                if (block.kind !== "table") continue
                for (const row of block.rows) {
                    expect(row).toHaveLength(block.columns.length)
                }
            }
        }
    })

    it("only draws flow return edges between nodes that exist", () => {
        for (const section of handbookSections) {
            for (const block of section.blocks) {
                if (block.kind !== "flow") continue
                const nodeIds = new Set(block.flow.rows.flat().map((node) => node.id))
                for (const edge of block.flow.returns ?? []) {
                    expect(nodeIds).toContain(edge.from)
                    expect(nodeIds).toContain(edge.to)
                }
                expect(block.flow.legend.length).toBeGreaterThan(0)
            }
        }
    })

    it("gives every flow node a unique id within its diagram", () => {
        for (const section of handbookSections) {
            for (const block of section.blocks) {
                if (block.kind !== "flow") continue
                const ids = block.flow.rows.flat().map((node) => node.id)
                expect(new Set(ids).size).toBe(ids.length)
            }
        }
    })

    it("balances inline markup so RichText never renders a stray delimiter", () => {
        const strings = handbookSections.flatMap((section) => [
            section.title,
            section.lead,
            ...section.blocks.flatMap((block) => {
                switch (block.kind) {
                    case "prose":
                        return [block.text]
                    case "callout":
                        return [block.title, block.text]
                    case "list":
                        return block.items.flatMap((item) => [item.term ?? "", item.detail])
                    case "table":
                        return [block.caption ?? "", ...block.columns, ...block.rows.flat()]
                    case "compare":
                        return [block.caption ?? "", ...block.rows.flatMap((row) => [row.aspect, row.claude, row.codex])]
                    default:
                        return []
                }
            }),
        ])

        for (const text of strings) {
            expect((text.match(/`/g) ?? []).length % 2, `unbalanced backticks in: ${text}`).toBe(0)
            // RichText matches code spans before bold, so `**/*.ts` is a code
            // span and not a stray bold marker. Strip spans before counting.
            const outsideCode = text.replace(/`[^`]+`/g, "")
            expect((outsideCode.match(/\*\*/g) ?? []).length % 2, `unbalanced bold markers in: ${text}`).toBe(0)
        }
    })

    it("lists only https sources with unique urls", () => {
        const urls = handbookSources.map((source) => source.url)
        expect(new Set(urls).size).toBe(urls.length)
        for (const source of handbookSources) {
            expect(source.url.startsWith("https://")).toBe(true)
            expect(source.topics.length).toBeGreaterThan(0)
        }
    })

    it("stamps a resolvable updated date", () => {
        expect(handbookMeta.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(Number.isNaN(Date.parse(handbookMeta.updated))).toBe(false)
    })
})
