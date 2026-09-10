import type { Metadata } from "next"
import { ResumePage } from "@/src/components/resume/ResumePage"
import { getSiteContent } from "@/src/lib/db/portfolio"
import { profileData } from "@/data/profile"

// Re-render at most once a minute so admin edits show up without a redeploy
export const revalidate = 60

export const metadata: Metadata = {
    title: "Resume — Hen Heang | Backend / AX Software Engineer",
    description: "ATS-friendly resume of Hen Heang, a backend-first Backend / AX Software Engineer working with Java, Spring Boot, MyBatis, PostgreSQL, Oracle, and AI-assisted development.",
    alternates: {
        canonical: `${profileData.portfolioUrl}/resume`,
    },
}

export default async function ResumeRoute() {
    const cv = await getSiteContent("cv")
    return <ResumePage cv={cv} />
}
