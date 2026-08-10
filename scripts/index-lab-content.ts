// Must run before any project imports execute (mirrors scripts/seed.ts).
// Also requires `--conditions=react-server` on the tsx invocation (see
// package.json's "ai:index:lab" script) so the transitively-imported
// `server-only` guards resolve to their no-op export instead of throwing —
// that guard is meant to keep server code out of a browser bundle, not to
// block a Node script, but the package enforces it via package.json
// `exports` conditions rather than a runtime `typeof window` check.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"

try {
    const envFile = readFileSync(resolve(__dirname, "../.env.local"), "utf-8")
    for (const line of envFile.split("\n")) {
        const [key, ...rest] = line.split("=")
        if (key && rest.length) process.env[key.trim()] = rest.join("=").trim()
    }
} catch {
    // .env.local is optional — real env vars (CI, shell) still work without it.
}

import { buildLabDocuments, type LabDocument } from "../src/lib/ai/retrievers/lab-documents"
import { diffManifest, hashDocument, type Manifest } from "../src/lib/ai/retrievers/manifest"

const MANIFEST_PATH = resolve(__dirname, "../.tmp/ai-index/lab-manifest.json")
const API_BASE = "https://api.openai.com/v1"

function loadManifest(): Manifest {
    if (!existsSync(MANIFEST_PATH)) return {}
    try {
        return JSON.parse(readFileSync(MANIFEST_PATH, "utf-8")) as Manifest
    } catch {
        console.warn(`Could not parse existing manifest at ${MANIFEST_PATH} — starting fresh.`)
        return {}
    }
}

function saveManifest(manifest: Manifest): void {
    mkdirSync(dirname(MANIFEST_PATH), { recursive: true })
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
}

/** Plain-text document body — File Search chunks text content, so this is deliberately Markdown, not the structured LabDocument JSON. Metadata (category/contentType/technologies/topics/status/slug) is attached separately as vector-store file `attributes`, not duplicated into the body. */
export function formatDocumentBody(doc: LabDocument): string {
    return [
        `# ${doc.title}`,
        "",
        `**Category:** ${doc.category}`,
        `**Content type:** ${doc.contentType}`,
        doc.technologies.length ? `**Technologies:** ${doc.technologies.join(", ")}` : "",
        doc.topics.length ? `**Topics:** ${doc.topics.join(", ")}` : "",
        `**Portfolio URL:** ${doc.url}`,
        "",
        "## Summary",
        "",
        doc.summary,
        "",
        "## Content",
        "",
        doc.content,
    ]
        .filter((line) => line !== "")
        .join("\n")
}

async function apiRequest(apiKey: string, path: string, init: RequestInit): Promise<unknown> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${apiKey}`, ...init.headers },
    })
    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`${init.method ?? "GET"} ${path} failed: ${res.status} ${body}`)
    }
    if (res.status === 204) return null
    return res.json()
}

async function createVectorStore(apiKey: string, name: string): Promise<string> {
    const data = (await apiRequest(apiKey, "/vector_stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    })) as { id: string }
    return data.id
}

async function uploadFile(apiKey: string, doc: LabDocument): Promise<string> {
    const form = new FormData()
    form.append("purpose", "assistants")
    form.append("file", new Blob([formatDocumentBody(doc)], { type: "text/markdown" }), `${doc.slug}.md`)
    const res = await fetch(`${API_BASE}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
    })
    if (!res.ok) throw new Error(`file upload for "${doc.slug}" failed: ${res.status} ${await res.text().catch(() => "")}`)
    const data = (await res.json()) as { id: string }
    return data.id
}

async function attachToVectorStore(apiKey: string, vectorStoreId: string, fileId: string, doc: LabDocument): Promise<void> {
    await apiRequest(apiKey, `/vector_stores/${vectorStoreId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            file_id: fileId,
            attributes: { slug: doc.slug, category: doc.category, contentType: doc.contentType, status: doc.status },
        }),
    })
}

async function detachAndDeleteFile(apiKey: string, vectorStoreId: string, fileId: string): Promise<void> {
    await apiRequest(apiKey, `/vector_stores/${vectorStoreId}/files/${fileId}`, { method: "DELETE" }).catch(() => {})
    await apiRequest(apiKey, `/files/${fileId}`, { method: "DELETE" }).catch(() => {})
}

async function main() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        console.error("OPENAI_API_KEY is not set — add it to .env.local first.")
        process.exitCode = 1
        return
    }

    let vectorStoreId = process.env.OPENAI_PORTFOLIO_VECTOR_STORE_ID
    if (!vectorStoreId) {
        console.log("OPENAI_PORTFOLIO_VECTOR_STORE_ID is not set — creating a new vector store...")
        vectorStoreId = await createVectorStore(apiKey, "hen-heang-portfolio-engineering-lab")
        console.log(`Created vector store ${vectorStoreId}.`)
        console.log(`Add this to .env.local before running again: OPENAI_PORTFOLIO_VECTOR_STORE_ID=${vectorStoreId}`)
    }

    console.log("Reading Engineering Lab content...")
    const documents = await buildLabDocuments()
    console.log(`Generated ${documents.length} documents from the existing source of truth.`)

    const manifest = loadManifest()
    const hashed = documents.map((doc) => ({ doc, hash: hashDocument(doc) }))
    const actions = diffManifest(hashed.map(({ doc, hash }) => ({ slug: doc.slug, hash })), manifest)
    const docBySlug = new Map(hashed.map(({ doc, hash }) => [doc.slug, { doc, hash }]))

    const nextManifest: Manifest = { ...manifest }
    const results = { created: 0, updated: 0, unchanged: 0, deleted: 0, failed: 0 }

    for (const action of actions) {
        try {
            if (action.kind === "unchanged") {
                results.unchanged++
                continue
            }
            if (action.kind === "deleted") {
                await detachAndDeleteFile(apiKey, vectorStoreId, action.fileId)
                delete nextManifest[action.slug]
                results.deleted++
                continue
            }

            const entry = docBySlug.get(action.slug)
            if (!entry) continue // shouldn't happen — every new/changed action came from `hashed`

            if (action.kind === "changed") {
                await detachAndDeleteFile(apiKey, vectorStoreId, action.previousFileId)
            }

            const fileId = await uploadFile(apiKey, entry.doc)
            await attachToVectorStore(apiKey, vectorStoreId, fileId, entry.doc)
            nextManifest[action.slug] = { hash: entry.hash, fileId, uploadedAt: new Date().toISOString() }
            results[action.kind === "new" ? "created" : "updated"]++
        } catch (error) {
            console.error(`Failed to sync "${action.slug}":`, error instanceof Error ? error.message : error)
            results.failed++
        }
    }

    saveManifest(nextManifest)

    console.log("\nIndexing summary:")
    console.log(`  created:   ${results.created}`)
    console.log(`  updated:   ${results.updated}`)
    console.log(`  unchanged: ${results.unchanged} (skipped, no re-upload)`)
    console.log(`  deleted:   ${results.deleted}`)
    console.log(`  failed:    ${results.failed}`)
    console.log(`  total in vector store: ${Object.keys(nextManifest).length}`)

    if (results.failed > 0) process.exitCode = 1
}

// Guarded so importing this file (e.g. index-lab-content.test.ts, which only
// wants the pure `formatDocumentBody`) never triggers a real indexing run —
// `main()` only executes when this file is the process entry point.
if (require.main === module) {
    main().catch((error) => {
        console.error("Indexing failed:", error instanceof Error ? error.message : error)
        process.exitCode = 1
    })
}
