import { describe, expect, it } from "vitest"
import { formatDocumentBody } from "./index-lab-content"
import type { LabDocument } from "../src/lib/ai/retrievers/lab-documents"

const doc: LabDocument = {
    slug: "docker",
    title: "Docker Fundamentals",
    category: "devops",
    contentType: "guide",
    technologies: ["Docker"],
    topics: ["containers", "images"],
    status: "published",
    summary: "How Docker packages an application.",
    content: "Docker packages an application together with everything it needs to run...",
    url: "https://henheang.site/lab/devops/topics/docker",
}

describe("formatDocumentBody", () => {
    it("includes the title, metadata, summary, and content as readable Markdown", () => {
        const body = formatDocumentBody(doc)
        expect(body).toContain("# Docker Fundamentals")
        expect(body).toContain("**Category:** devops")
        expect(body).toContain("**Technologies:** Docker")
        expect(body).toContain("**Topics:** containers, images")
        expect(body).toContain("**Portfolio URL:** https://henheang.site/lab/devops/topics/docker")
        expect(body).toContain("How Docker packages an application.")
        expect(body).toContain("Docker packages an application together")
    })

    it("omits empty technologies/topics lines instead of printing an empty list", () => {
        const body = formatDocumentBody({ ...doc, technologies: [], topics: [] })
        expect(body).not.toContain("**Technologies:**")
        expect(body).not.toContain("**Topics:**")
    })
})
