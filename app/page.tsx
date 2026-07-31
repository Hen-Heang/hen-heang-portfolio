import { PageLayout } from "@/src/components/layout/PageLayout"
import { Hero } from "@/src/components/home/Hero"
import { EngineeringProofStrip } from "@/src/components/home/EngineeringProofStrip"
import { SelectedWork } from "@/src/components/home/SelectedWork"
import { ProfessionalProfile } from "@/src/components/home/ProfessionalProfile"
import { EngineeringGrowth } from "@/src/components/home/EngineeringGrowth"
import { ContactCTASection } from "@/src/components/home/ContactCTASection"
import {
    getExperience,
    getProjects,
    getSiteContent,
} from "@/src/lib/db/portfolio"
import { getAIArticles } from "@/src/lib/db/ai-engineering"

// Re-render at most once a minute so admin edits show up without a redeploy.
export const revalidate = 60

// Recruiter-focused order: identity and proof, selected work, professional
// profile, active growth, then a direct contact path.
export default async function HomePage() {
    const [profile, projects, experience, articles] = await Promise.all([
        getSiteContent("profile"),
        getProjects(),
        getExperience(),
        getAIArticles(),
    ])

    return (
        <PageLayout>
            <Hero profile={profile} projects={projects} />
            <EngineeringProofStrip projects={projects} profile={profile} />
            <SelectedWork projects={projects} />
            <ProfessionalProfile experience={experience} />
            <EngineeringGrowth articles={articles} />
            <ContactCTASection />
        </PageLayout>
    )
}
