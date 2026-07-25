import type { Metadata } from "next"
import { CVPage } from "@/src/components/cv/CVPage"
import { getSiteContent } from "@/src/lib/db/portfolio"
import { profileData } from "@/data/profile"

// Re-render at most once a minute so admin edits show up without a redeploy
export const revalidate = 60

export const metadata: Metadata = {
  title: "CV — Hen Heang | Backend Developer",
  description:
    "Professional CV of Hen Heang — Backend Developer specialising in Java, Spring Boot, MyBatis, and PostgreSQL/Oracle. Based in Seoul, South Korea.",
  alternates: {
    canonical: `${profileData.portfolioUrl}/cv`,
  },
  openGraph: {
    title: "CV — Hen Heang",
    description: "Backend Developer · Java · Spring Boot · PostgreSQL",
    type: "profile",
  },
}

export default async function CVRoute() {
  const cv = await getSiteContent("cv")
  return <CVPage cv={cv} />
}
