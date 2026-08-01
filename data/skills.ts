import type { SkillCategory } from "@/src/lib/types"
export const skills: SkillCategory[] = [
    {
        category: "Frontend",
        items: [
            { name: "HTML", level: 5, experience: "2+ years" },
            { name: "CSS", level: 4, experience: "2+ years" },
            { name: "JavaScript", level: 4, experience: "2+ years" },
            { name: "jQuery", level: 4, experience: "2+ years" },
            { name: "Bootstrap", level: 4, experience: "2+ years" },
            { name: "TypeScript", level: 3, experience: "1.5 years" },
            { name: "React", level: 3, experience: "1.5 years" },
            { name: "Next.js", level: 3, experience: "1.5 years" },
            { name: "Tailwind CSS", level: 3, experience: "1.5 years" },
            { name: "TanStack Query", level: 3, experience: "1 year" },
        ],
    },
    {
        category: "Backend",
        items: [
            { name: "Java", level: 4, experience: "2+ years" },
            { name: "Spring Boot", level: 4, experience: "2+ years" },
            { name: "MyBatis", level: 4, experience: "2+ years" },
            { name: "REST APIs", level: 4, experience: "2+ years" },
            { name: "Spring Security", level: 3, experience: "1.5 years" },
            { name: "Spring Data JPA", level: 3, experience: "1.5 years" },
            { name: "Maven", level: 4, experience: "2+ years" },
        ],
    },
    {
        category: "Database",
        items: [
            { name: "SQL", level: 4, experience: "2+ years" },
            { name: "Oracle", level: 4, experience: "1+ year" },
            { name: "PostgreSQL", level: 4, experience: "1.5 years" },
            { name: "MySQL", level: 3, experience: "1 year" },
        ],
    },
    {
        category: "Tools",
        items: [
            { name: "Git", level: 4, experience: "2+ years" },
            { name: "GitHub", level: 4, experience: "2+ years" },
            { name: "IntelliJ IDEA", level: 4, experience: "2+ years" },
            { name: "WebStorm", level: 4, experience: "1.5 years" },
            { name: "Postman", level: 4, experience: "2+ years" },
            { name: "Swagger", level: 4, experience: "2+ years" },
        ],
    },
]
