import type { Metadata } from "next"
import { profileData } from "@/data/profile"
import { getAISnippets } from "@/src/lib/db/ai-engineering"
import { SnippetsPageClient } from "@/src/components/ai-engineering/SnippetsPageClient"

export const revalidate = 60

export const metadata: Metadata = {
    title: "Code Snippets",
    description: "Reusable backend patterns — MyBatis dynamic SQL, idempotent payment endpoints, Thymeleaf fragments — with explanations and copy buttons.",
    alternates: {
        canonical: `${profileData.portfolioUrl}/ai-engineering/snippets`,
    },
}

export default async function SnippetsPage() {
    const snippets = await getAISnippets()
    const allTags = Array.from(new Set(snippets.flatMap((s) => s.tags))).sort()
    return (
        <>
            <SnippetsPageClient snippets={snippets} allTags={allTags} />
        </>
    )
}
