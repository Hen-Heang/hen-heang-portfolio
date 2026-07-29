export interface Achievement {
    id: string
    title: string
    issuer: string
    date: string
    type: 'certificate' | 'graduation' | 'award'
    description?: string
    image?: string
    link?: string
}

export interface AchievementGroup {
    year: string
    issuer: string
    achievements: Achievement[]
}

export const groupAchievementsByYearAndIssuer = (achievements: Achievement[]): AchievementGroup[] => {
    const groups: { [key: string]: { [issuer: string]: Achievement[] } } = {}

    achievements.forEach(achievement => {
        const { date: year, issuer } = achievement
        if (!groups[year]) groups[year] = {}
        if (!groups[year][issuer]) groups[year][issuer] = []
        groups[year][issuer].push(achievement)
    })

    const result: AchievementGroup[] = []
    Object.keys(groups)
        .sort((a, b) => parseInt(b) - parseInt(a))
        .forEach(year => {
            Object.keys(groups[year])
                .sort()
                .forEach(issuer => {
                    result.push({
                        year,
                        issuer,
                        achievements: groups[year][issuer].sort((a, b) => a.title.localeCompare(b.title))
                    })
                })
        })

    return result
}

export const rawAchievements: Achievement[] = [
    {
        id: "1",
        title: "Advanced Achievement Award",
        issuer: "Korea Software HRD Center",
        date: "2023",
        type: "graduation",
        description: "Graduated with honors in Computer Science with focus on web development and software engineering.",
        image: "/graduate-image.jpg",
    },
    {
        id: "3",
        title: "Bachelor of Science in Computer Science and Engineering",
        issuer: "Royal University of Phnom Penh",
        date: "2024",
        type: "graduation",
        description: "Completed Bachelor of Science in Computer Science and Engineering at Royal University of Phnom Penh. Examination: May 2024, Certificate issued: December 2024.",
        image: "/rupp-certificate-redacted.png",
    },
 {
        id: "2",
        title: "Advanced Achievement Award",
        issuer: "Korea Software HRD Center",
        date: "2023",
        type: "award",
        description: "Recognized for outstanding performance and advanced technical proficiency in software development during the intensive training program.",
        image: "/advance-award.jpeg",
    },
    {
        id: "10",
        title: "KSHRD Basic Course Certificate",
        issuer: "KSHRD",
        date: "2023",
        type: "certificate",
        description: "Completed the basic course training program at KSHRD, covering fundamental skills and knowledge.",
        image: "/certificate/kshrd-basic-course.webp",
    },
    {
        id: "11",
        title: "KSHRD Advanced Course Certificate",
        issuer: "KSHRD",
        date: "2023",
        type: "certificate",
        description: "Successfully completed the advanced course training program at KSHRD, demonstrating advanced skills and expertise.",
        image: "/certificate/kshrd-advance-course.webp",
    },
    {
        id: "12",
        title: "Claude 101",
        issuer: "Anthropic",
        date: "2026",
        type: "certificate",
        description: "Completed Anthropic's foundational course on working with Claude, covering core concepts of prompting, context, and getting reliable results from AI models in everyday workflows.",
        image: "/certificate/claude-101.png",
    },
    {
        id: "13",
        title: "Claude Code 101",
        issuer: "Anthropic",
        date: "2026",
        type: "certificate",
        description: "Completed Anthropic's hands-on course on Claude Code, learning to use an agentic coding assistant for real development tasks such as debugging, refactoring, and building features directly in the terminal — skills applied throughout this portfolio's development.",
        image: "/certificate/claude-code-101.png",
    },
    {
        id: "14",
        title: "Java (Basic) Certificate",
        issuer: "HackerRank",
        date: "2026",
        type: "certificate",
        description: "Passed HackerRank's Java (Basic) skill certification test, validating core knowledge of Java syntax, OOP fundamentals, and problem-solving with the language.",
        image: "/certificate/hackerrank-java-basic.png",
    },
    {
        id: "15",
        title: "Claude Code in Action",
        issuer: "Anthropic",
        date: "2026",
        type: "certificate",
        description: "Completed Anthropic's course on applying Claude Code to real, hands-on development workflows, building on the foundational Claude Code 101 course.",
        image: "/certificate/claude-code-in-action.png",
        link: "/certificate/claude-code-in-action.pdf",
    },
    {
        id: "16",
        title: "Mindfulness for Wellbeing — Certificate of Completion",
        issuer: "KOSIGN",
        date: "2024",
        type: "certificate",
        description: "Completed the one-day Mindfulness for Wellbeing personal development program delivered by VIPASSA on October 12, 2024, in Phnom Penh, Cambodia. The certificate was presented jointly with KOSIGN.",
        image: "/development-soft skill certification.png",
    },
    {
        id: "17",
        title: "Word, Excel, PowerPoint & Internet Certificate",
        issuer: "Addbook Computer Centre",
        date: "2021",
        type: "certificate",
        description: "Completed Addbook Computer Centre's practical computer course covering Microsoft Word, Excel, PowerPoint, and internet fundamentals from September to December 2021.",
        image: "/basic-computer-certificate-redacted.png",
    },
    {
        id: "18",
        title: "AI Foundations",
        issuer: "OpenAI Academy",
        date: "2026",
        type: "certificate",
        description: "Completed OpenAI Academy's AI Foundations course, covering foundational concepts of working with AI models.",
        image: "/certificate/openai-ai-foundations.png",
        link: "/certificate/openai-ai-foundations.pdf",
    },
]

export const groupedAchievements = groupAchievementsByYearAndIssuer(rawAchievements)

