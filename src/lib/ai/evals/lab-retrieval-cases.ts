/**
 * Paired direct/semantic questions for comparing Lab retrievers
 * (src/lib/ai/retrievers/) — the whole point of each pair is that the
 * "direct" phrasing shares vocabulary with the indexed content (keyword
 * search should do fine), while the "semantic" phrasing describes the same
 * underlying topic without using its name, testing exactly the gap a
 * semantic retriever is supposed to close.
 *
 * `expectedSlugs`: at least one should appear in a retriever's results for
 * that question to count as a correct retrieval. An empty array means there
 * is currently no indexed ground truth for the case (see the "ai-agents"
 * case below) — it's kept in the dataset for when that changes, but a
 * comparison run should treat it as informational only, not scored.
 */
export interface LabRetrievalCase {
    id: string
    category: "backend" | "devops" | "ai"
    direct: string
    semantic: string
    expectedSlugs: string[]
}

export const labRetrievalCases: LabRetrievalCase[] = [
    {
        id: "docker-containers",
        category: "devops",
        direct: "What has Hen learned about Docker?",
        semantic: "How does Hen isolate communication between containers?",
        expectedSlugs: ["docker", "dockerize-spring-boot"],
    },
    {
        id: "docker-compose",
        category: "devops",
        direct: "What has Hen learned about Docker Compose?",
        semantic: "How does Hen run his app and its database together with one command?",
        expectedSlugs: ["docker-compose", "docker-compose-full-stack"],
    },
    {
        id: "cicd-automation",
        category: "devops",
        direct: "Has Hen practiced CI/CD?",
        semantic: "How does Hen automate building and deploying software after a push?",
        expectedSlugs: ["cicd", "github-actions", "docker-cicd-spring-boot", "github-actions-cicd-pipeline"],
    },
    {
        id: "database-query-performance",
        category: "backend",
        direct: "What database topics has Hen studied?",
        semantic: "What has Hen learned about improving query performance?",
        expectedSlugs: ["postgresql-schema-indexing-fundamentals"],
    },
    {
        id: "spring-security-tokens",
        category: "backend",
        direct: "What has Hen learned about Spring Security?",
        semantic: "How has Hen practiced securing backend requests with tokens?",
        expectedSlugs: ["spring-security-authentication-flow"],
    },
    {
        id: "https-tls",
        category: "devops",
        direct: "What has Hen learned about HTTPS?",
        semantic: "How does Hen make sure traffic to his APIs can't be read in transit?",
        expectedSlugs: ["https"],
    },
    {
        id: "nginx-reverse-proxy",
        category: "devops",
        direct: "What has Hen learned about Nginx?",
        semantic: "How does Hen route incoming traffic to his backend app?",
        expectedSlugs: ["nginx", "nginx-reverse-proxy-https"],
    },
    {
        id: "backend-testing-strategy",
        category: "backend",
        direct: "What has Hen learned about testing Spring Boot apps?",
        semantic: "How does Hen decide which parts of his backend need automated tests?",
        expectedSlugs: ["backend-testing-strategy"],
    },
    {
        id: "ai-agents",
        category: "ai",
        direct: "What does Hen know about AI agents?",
        semantic: "How does Hen think about giving an AI system tools it can call on its own?",
        // No AI Engineering articles are indexed in an environment without Supabase
        // configured (getAIArticles() returns [] — see src/lib/ai/retrievers/lab-documents.ts).
        // Kept in the dataset for when that changes; not scored until then.
        expectedSlugs: [],
    },
]
