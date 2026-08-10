// See scripts/index-lab-content.ts for why `--conditions=react-server` is
// required on the tsx invocation (package.json's "eval:retrieval" script).
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

import { readFileSync } from "node:fs"
import { resolve } from "node:path"

try {
    const envFile = readFileSync(resolve(__dirname, "../.env.local"), "utf-8")
    for (const line of envFile.split("\n")) {
        const [key, ...rest] = line.split("=")
        if (key && rest.length) process.env[key.trim()] = rest.join("=").trim()
    }
} catch {
    // .env.local is optional — real env vars (CI, shell) still work without it.
}

import { keywordLabRetriever } from "../src/lib/ai/retrievers/keyword-retriever"
import { fileSearchLabRetriever } from "../src/lib/ai/retrievers/file-search-retriever"
import { labRetrievalCases, type LabRetrievalCase } from "../src/lib/ai/evals/lab-retrieval-cases"
import type { LabRetriever } from "../src/lib/ai/retrievers/types"

/**
 * Rough, clearly-labeled cost estimate for the report's "estimated cost"
 * line only (Step 18 of the retrieval-experiment task: cost math belongs in
 * eval/reporting utilities, never hardcoded into production logic). This
 * number is from training-time knowledge of OpenAI's vector store search
 * pricing, NOT fetched live — this environment has no way to confirm
 * current pricing against OpenAI's docs. Treat it as an order-of-magnitude
 * hint, not an invoice-accurate figure, and verify before relying on it.
 */
const ESTIMATED_USD_PER_FILE_SEARCH_CALL = 0.0025

export interface QuestionResult {
    caseId: string
    questionType: "direct" | "semantic"
    retriever: string
    query: string
    latencyMs: number
    /** null = no indexed ground truth for this case (see lab-retrieval-cases.ts) — informational only, excluded from accuracy. */
    hit: boolean | null
    resultCount: number
    error?: string
}

async function timedSearch(retriever: LabRetriever, query: string): Promise<{ latencyMs: number; slugs: string[]; error?: string }> {
    const start = performance.now()
    try {
        const results = await retriever.search(query, { limit: 5 })
        return { latencyMs: performance.now() - start, slugs: results.map((r) => r.slug) }
    } catch (error) {
        return { latencyMs: performance.now() - start, slugs: [], error: error instanceof Error ? error.message : String(error) }
    }
}

export async function runCase(
    retriever: LabRetriever,
    retrieverName: string,
    testCase: LabRetrievalCase,
    questionType: "direct" | "semantic",
): Promise<QuestionResult> {
    const query = testCase[questionType]
    const { latencyMs, slugs, error } = await timedSearch(retriever, query)
    const hit = testCase.expectedSlugs.length === 0 ? null : testCase.expectedSlugs.some((slug) => slugs.includes(slug))
    return { caseId: testCase.id, questionType, retriever: retrieverName, query, latencyMs, hit, resultCount: slugs.length, error }
}

export function summarize(results: QuestionResult[], retriever: string, questionType?: "direct" | "semantic") {
    const scoped = results.filter((r) => r.retriever === retriever && (questionType ? r.questionType === questionType : true))
    const scored = scoped.filter((r) => r.hit !== null)
    const hits = scored.filter((r) => r.hit === true).length
    const avgLatencyMs = scoped.length ? scoped.reduce((sum, r) => sum + r.latencyMs, 0) / scoped.length : 0
    const errors = scoped.filter((r) => Boolean(r.error)).length
    return {
        accuracy: scored.length ? `${Math.round((hits / scored.length) * 100)}%` : "n/a",
        scoredCount: scored.length,
        avgLatencyMs: Math.round(avgLatencyMs),
        errors,
    }
}

async function main() {
    const retrievers: { name: string; instance: LabRetriever }[] = [
        { name: "keyword", instance: keywordLabRetriever },
        { name: "file-search", instance: fileSearchLabRetriever },
    ]

    if (!process.env.OPENAI_PORTFOLIO_VECTOR_STORE_ID) {
        console.warn("OPENAI_PORTFOLIO_VECTOR_STORE_ID is not set — file-search rows will show errors. Run `npm run ai:index:lab` first.\n")
    }

    const allResults: QuestionResult[] = []
    for (const testCase of labRetrievalCases) {
        for (const { name, instance } of retrievers) {
            allResults.push(await runCase(instance, name, testCase, "direct"))
            allResults.push(await runCase(instance, name, testCase, "semantic"))
        }
    }

    console.log("\n=== Lab retrieval comparison: keyword vs file-search ===\n")
    console.log(`${labRetrievalCases.length} cases x 2 phrasings (direct/semantic) x ${retrievers.length} retrievers, limit=5 per search.\n`)

    console.table(
        retrievers.map(({ name }) => {
            const overall = summarize(allResults, name)
            const direct = summarize(allResults, name, "direct")
            const semantic = summarize(allResults, name, "semantic")
            return {
                retriever: name,
                "overall accuracy": overall.accuracy,
                "direct accuracy": direct.accuracy,
                "semantic accuracy": semantic.accuracy,
                "avg latency (ms)": overall.avgLatencyMs,
                errors: overall.errors,
            }
        }),
    )

    console.log("\nPer-question detail (evals/debugging only — never shown to visitors):")
    for (const r of allResults) {
        const mark = r.hit === null ? "n/a " : r.hit ? "OK  " : "MISS"
        console.log(`  [${mark}] ${r.retriever.padEnd(11)} ${r.questionType.padEnd(9)} ${r.latencyMs.toFixed(0).padStart(6)}ms  ${r.caseId}: "${r.query}"${r.error ? `  ERROR: ${r.error}` : ""}`)
    }

    const fileSearchCalls = allResults.filter((r) => r.retriever === "file-search" && !r.error).length
    console.log(`\nFile Search calls made this run: ${fileSearchCalls}`)
    console.log(`Estimated cost (rough, unverified against live pricing — see comment in this file): ~$${(fileSearchCalls * ESTIMATED_USD_PER_FILE_SEARCH_CALL).toFixed(4)}`)

    const informational = allResults.filter((r) => r.hit === null).length
    if (informational > 0) {
        console.log(`\nNote: ${informational} question(s) had no indexed ground truth (see lab-retrieval-cases.ts) and were excluded from accuracy scoring.`)
    }
}

if (require.main === module) {
    main().catch((error) => {
        console.error("Retrieval comparison failed:", error instanceof Error ? error.message : error)
        process.exitCode = 1
    })
}
