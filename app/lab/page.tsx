import type { Metadata } from "next"
import { profileData } from "@/data/profile"
import { projects } from "@/data/projects"
import { roadmap as devopsRoadmap } from "@/data/lab/devops/roadmap"
import { labs as devopsLabs } from "@/data/lab/devops/labs"
import { getEngineeringLabIndex } from "@/src/lib/db/engineering-lab"
import { getBackendSummaries } from "@/src/lib/backend/catalog"
import { LabNav } from "@/src/components/lab/ui/LabNav"
import { LabHero } from "@/src/components/lab/home/LabHero"
import { LabCategoryNav } from "@/src/components/lab/home/LabCategoryNav"
import { ApplyInProjects } from "@/src/components/lab/home/ApplyInProjects"
import { HandsOnPractice } from "@/src/components/lab/home/HandsOnPractice"
import { LabSearchClient } from "@/src/components/lab/home/LabSearchClient"
import { LabLearningDashboard } from "@/src/components/lab/home/LabLearningDashboard"
import { ContinueLearning } from "@/src/components/lab/home/ContinueLearning"
import { ProgressSummary } from "@/src/components/lab/home/ProgressSummary"

export const revalidate = 60

export const metadata: Metadata = {
    title: "Engineering Lab",
    description: "Exploring backend systems, architecture, AI engineering, and modern software development practices — how I design, build, test, and operate software.",
    alternates: { canonical: `${profileData.portfolioUrl}/lab` },
    openGraph: {
        title: "Engineering Lab | Hen Heang",
        description: "Exploring backend systems, architecture, AI engineering, and modern software development practices.",
        url: `${profileData.portfolioUrl}/lab`,
        type: "website",
    },
}

export default async function EngineeringLabPage() {
    const { items } = await getEngineeringLabIndex()
    const backendItems = getBackendSummaries()
    const backendLabs = backendItems.filter((item) => item.type === "lab" && item.status === "published")

    const appliedProjects = projects
        .filter((p) => p.featured)
        .slice(0, 2)
        .map((p) => ({
            slug: p.slug,
            title: p.title,
            description: p.description,
            image: p.slug === "h-phsar" ? "/image/h-phsar-preview.svg" : p.image,
            imageFit: p.slug === "h-phsar" ? "cover" : p.imageFit,
            conceptsDemonstrated: p.engineeringFocus ?? [],
        }))

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
            <LabNav active="overview" />
            <LabHero />
            <ContinueLearning backendItems={backendItems} devopsTopics={devopsRoadmap} />
            <LabLearningDashboard backendItems={backendItems} devopsTopics={devopsRoadmap} />
            <LabSearchClient items={items}>
                <LabCategoryNav />
            </LabSearchClient>
            <HandsOnPractice devopsLabs={devopsLabs} backendLabs={backendLabs} />
            <ApplyInProjects projects={appliedProjects} />
            <ProgressSummary backendItems={backendItems} devopsTopics={devopsRoadmap} />
        </div>
    )
}
