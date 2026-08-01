import { describe, expect, it } from "vitest"
import {
    ProfileContentSchema,
    CvContentSchema,
    ProjectSchema,
    SkillCategorySchema,
    ExperienceItemSchema,
    EducationItemSchema,
    AchievementSchema,
} from "./content"
import { profileData } from "@/data/profile"
import { cvData } from "@/data/cv-data"
import { projects } from "@/data/projects"
import { skills } from "@/data/skills"
import { experiences } from "@/data/experience"
import { education } from "@/data/education"
import { rawAchievements } from "@/data/achievements"

describe("content schemas", () => {
    it("accepts the real static profile/cv content", () => {
        expect(ProfileContentSchema.safeParse(profileData).success).toBe(true)
        expect(CvContentSchema.safeParse(cvData).success).toBe(true)
    })

    it("accepts every real static project/skill/experience/education/achievement", () => {
        for (const p of projects) expect(ProjectSchema.safeParse(p).success).toBe(true)
        for (const s of skills) expect(SkillCategorySchema.safeParse(s).success).toBe(true)
        for (const e of experiences) expect(ExperienceItemSchema.safeParse(e).success).toBe(true)
        for (const e of education) expect(EducationItemSchema.safeParse(e).success).toBe(true)
        for (const a of rawAchievements) expect(AchievementSchema.safeParse(a).success).toBe(true)
    })

    it("rejects malformed profile content (missing required fields)", () => {
        const result = ProfileContentSchema.safeParse({ name: "Jane" })
        expect(result.success).toBe(false)
    })

    it("rejects a project with an invalid github URL", () => {
        const result = ProjectSchema.safeParse({
            slug: "x",
            title: "X",
            description: "d",
            technologies: [],
            image: "",
            github: "not-a-url",
        })
        expect(result.success).toBe(false)
    })

    it("rejects a skill category with a non-numeric level", () => {
        const result = SkillCategorySchema.safeParse({
            category: "Backend",
            items: [{ name: "Java", level: "high", experience: "2 years" }],
        })
        expect(result.success).toBe(false)
    })
})
