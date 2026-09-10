import { Suspense } from "react"
import type { Metadata } from "next"
import { profileData } from "@/data/profile"
import { getAIArticles, getAICategories, getAIPrompts, getAISnippets, getAllTags, getAllTechnologies } from "@/src/lib/db/ai-engineering"
import { PageLayout } from "@/src/components/layout/PageLayout"
import { AIEngineeringHubClient } from "@/src/components/ai-engineering/AIEngineeringHubClient"

export const revalidate = 60

export const metadata: Metadata = {
    title: "AI Engineering Library",
    description: "A reference library of AI-assisted engineering articles, prompts, snippets, code reviews, and experiments. The structured AX learning path lives in Engineering Lab.",
    alternates: {
        canonical: `${profileData.portfolioUrl}/ai-engineering`,
    },
    openGraph: {
        title: "AI Engineering Library | Hen Heang",
        description: "Articles, prompts, snippets, and experiments supporting a backend-first AI-assisted engineering workflow.",
        url: `${profileData.portfolioUrl}/ai-engineering`,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Engineering Library | Hen Heang",
        description: "Articles, prompts, snippets, and experiments supporting a backend-first AI-assisted engineering workflow.",
    },
}

export default async function AIEngineeringPage() {
    const [articles, categories, prompts, snippets] = await Promise.all([getAIArticles(), getAICategories(), getAIPrompts(), getAISnippets()])

    return (
        <PageLayout showFooter={false}>
            <Suspense>
                <AIEngineeringHubClient articles={articles} categories={categories} allTags={getAllTags(articles)} allTechnologies={getAllTechnologies(articles)} promptCount={prompts.length} snippetCount={snippets.length} />
            </Suspense>
        </PageLayout>
    )
}
