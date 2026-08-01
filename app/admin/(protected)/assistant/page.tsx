import type { Metadata } from "next"
import { KnowledgeSourcesPanel } from "@/src/components/admin/assistant/KnowledgeSourcesPanel"
import { ProfileFactsPanel } from "@/src/components/admin/assistant/ProfileFactsPanel"
import { FeedbackReviewPanel } from "@/src/components/admin/assistant/FeedbackReviewPanel"

export const metadata: Metadata = { title: "Portfolio Assistant — Admin", robots: { index: false, follow: false } }

export default function AdminAssistantPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[#fafafa] text-lg font-bold">Portfolio Assistant</h1>
                <p className="text-[#71717a] text-xs mt-1">
                    Manage what the chat assistant is allowed to know: knowledge sources, owner-approved facts, and visitor
                    feedback. Nothing here reaches the assistant or the public until you explicitly approve it.
                </p>
            </div>
            <KnowledgeSourcesPanel />
            <ProfileFactsPanel />
            <FeedbackReviewPanel />
        </div>
    )
}
