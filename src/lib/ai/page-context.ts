/**
 * Page-context hint shared between the client (AssistantWidget/Panel) and the
 * server (validation.ts, retrieval.ts). Deliberately has no `server-only`
 * import so the client bundle can use the same type/const as the API route —
 * and deliberately a small closed enum, never a freeform string, so a page
 * hint can only ever nudge retrieval, never smuggle instructions to the model.
 */
export const PAGE_CONTEXTS = ["home", "projects-index", "project-detail", "experience", "skills", "contact", "articles", "other"] as const

export type PageContext = (typeof PAGE_CONTEXTS)[number]

/** Maps a pathname to a coarse page context + optional project slug — a retrieval hint only, computed client-side and re-validated server-side. */
export function resolvePageContext(pathname: string): { page: PageContext; projectSlug?: string } {
    if (pathname === "/") return { page: "home" }
    if (pathname === "/projects") return { page: "projects-index" }
    if (pathname.startsWith("/projects/")) {
        const slug = pathname.split("/")[2]
        return slug ? { page: "project-detail", projectSlug: slug } : { page: "projects-index" }
    }
    if (pathname === "/resume" || pathname === "/cv" || pathname.startsWith("/journey")) return { page: "experience" }
    if (pathname === "/about" || pathname === "/profile") return { page: "skills" }
    if (pathname === "/contact") return { page: "contact" }
    if (pathname.startsWith("/lab") || pathname.startsWith("/ai-engineering")) return { page: "articles" }
    return { page: "other" }
}
