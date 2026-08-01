import { PageLayout } from "@/src/components/layout/PageLayout"
import { Hero } from "@/src/components/home/Hero"
import { SelectedWork } from "@/src/components/home/SelectedWork"
import { ProfessionalExperience } from "@/src/components/home/ProfessionalExperience"
import { TechnicalCapabilities } from "@/src/components/capabilities/TechnicalCapabilities"
import { AboutSummary } from "@/src/components/home/AboutSummary"
import { ContactCTASection } from "@/src/components/home/ContactCTASection"
import {
    getExperience,
    getProjects,
    getSiteContent,
} from "@/src/lib/db/portfolio"

// Re-render at most once a minute so admin edits show up without a redeploy.
export const revalidate = 60

// Recruiter-scan order: who he is, what he works with, the work, where he did
// it, the background, then a direct contact path. Each purpose appears once —
// the previous "Engineering Proof Strip", "Professional Profile", and
// "Engineering Growth" sections restated Selected Work, Experience, and
// Technical Capabilities respectively.
export default async function HomePage() {
    const [profile, projects, experience] = await Promise.all([
        getSiteContent("profile"),
        getProjects(),
        getExperience(),
    ])

    return (
        <PageLayout>
            <Hero profile={profile} projects={projects} />
            <TechnicalCapabilities
                projects={projects}
                experience={experience}
                variant="surface"
            />
            <SelectedWork projects={projects} />
            <ProfessionalExperience experience={experience} />
            <AboutSummary />
            <ContactCTASection />
        </PageLayout>
    )
}
