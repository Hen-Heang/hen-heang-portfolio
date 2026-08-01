import { describe, expect, it } from "vitest"
import { skills } from "@/data/skills"
import { TechIcons } from "@/src/components/icons/TechIcons"

describe("all technologies catalog", () => {
    const technologies = skills.flatMap((category) => category.items)

    it("contains 27 unique skills across four categories", () => {
        expect(skills).toHaveLength(4)
        expect(technologies).toHaveLength(27)
        expect(new Set(technologies.map((item) => item.name)).size).toBe(27)
    })

    it("has an icon for every displayed technology", () => {
        for (const technology of technologies) {
            expect(TechIcons[technology.name], technology.name).toBeDefined()
        }
    })
})
