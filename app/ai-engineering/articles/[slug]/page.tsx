import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react"
import { profileData } from "@/data/profile"
import { getAIArticleBySlug, getAIArticleSlugs, getAIArticles, getAICategories, getRelatedArticles } from "@/src/lib/db/ai-engineering"
import { ArticleBody } from "@/src/components/ai-engineering/ArticleBody"
import { TableOfContents } from "@/src/components/ai-engineering/TableOfContents"
import { DifficultyBadge } from "@/src/components/ai-engineering/DifficultyBadge"
import { Tag } from "@/src/components/ai-engineering/Tag"
import { ArticleCard } from "@/src/components/ai-engineering/ArticleCard"
import { ShareButtons } from "@/src/components/ai-engineering/ShareButtons"

export const revalidate = 60

export async function generateStaticParams() {
    const slugs = await getAIArticleSlugs()
    return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const article = await getAIArticleBySlug(slug)
    if (!article) return {}
    const url = `${profileData.portfolioUrl}/ai-engineering/articles/${article.slug}`
    return {
        title: article.title,
        description: article.description,
        keywords: [...article.tags, ...article.technologies],
        alternates: { canonical: url },
        openGraph: {
            title: article.title,
            description: article.description,
            url,
            type: "article",
            publishedTime: article.publishedAt,
            authors: [article.author],
            tags: article.tags,
        },
        twitter: {
            card: "summary_large_image",
            title: article.title,
            description: article.description,
        },
    }
}

export default async function ArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const article = await getAIArticleBySlug(slug)
    if (!article) notFound()

    const [categories, allArticles] = await Promise.all([getAICategories(), getAIArticles()])
    const category = categories.find((c) => c.slug === article.category)
    const categoryBySlug = new Map(categories.map((c) => [c.slug, c]))
    const related = getRelatedArticles(article, allArticles)
    const url = `${profileData.portfolioUrl}/ai-engineering/articles/${article.slug}`

    const tocItems = article.body
        .filter((b): b is Extract<typeof b, { type: "heading" }> => b.type === "heading")
        .map((b) => ({ id: b.id, text: b.text, level: b.level }))

    const index = allArticles.findIndex((a) => a.slug === article.slug)
    const prevArticle = index > 0 ? allArticles[index - 1] : null
    const nextArticle = index < allArticles.length - 1 ? allArticles[index + 1] : null

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.description,
        author: { "@type": "Person", name: article.author, url: profileData.portfolioUrl },
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,
        keywords: article.tags.join(", "),
        url,
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="px-4 md:px-8 py-10 max-w-6xl mx-auto">
                <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-fg-muted">
                    <Link href="/lab" className="hover:text-fg transition-colors">
                        Engineering Lab
                    </Link>
                    <span>/</span>
                    <Link href="/ai-engineering" className="hover:text-fg transition-colors">
                        AI Engineering
                    </Link>
                    <span>/</span>
                    {category && (
                        <Link href={`/ai-engineering?category=${category.slug}`} className="hover:text-fg transition-colors">
                            {category.title}
                        </Link>
                    )}
                    <span>/</span>
                    <span className="text-fg-secondary">{article.title}</span>
                </nav>

                <div className="grid lg:grid-cols-[1fr_220px] gap-10">
                    <article>
                        <header className="mb-8">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-elevated text-xl">
                                    <span aria-hidden>{article.coverEmoji}</span>
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <DifficultyBadge difficulty={article.difficulty} />
                                    {category && (
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                                            {category.title}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h1 className="mb-3 text-2xl md:text-4xl font-bold leading-tight tracking-tight text-fg">
                                {article.title}
                            </h1>
                            <p className="mb-5 text-sm md:text-base leading-relaxed text-fg-secondary">{article.description}</p>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-fg-muted">
                                <span className="font-medium text-fg-secondary">{article.author}</span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {article.readingTime} min read
                                </span>
                                <ShareButtons url={url} title={article.title} />
                            </div>

                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {article.tags.map((tag) => (
                                    <Tag key={tag} label={tag} />
                                ))}
                            </div>
                        </header>

                        <ArticleBody blocks={article.body} />

                        {/* Prev / Next */}
                        <div className="mt-14 grid sm:grid-cols-2 gap-3 border-t border-border pt-8">
                            {prevArticle ? (
                                <Link
                                    href={`/ai-engineering/articles/${prevArticle.slug}`}
                                    className="group rounded-xl border border-border p-4 hover:border-border-strong transition-colors"
                                >
                                    <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
                                        <ArrowLeft size={11} /> Previous
                                    </span>
                                    <p className="text-sm font-medium text-fg group-hover:text-fg line-clamp-1">{prevArticle.title}</p>
                                </Link>
                            ) : (
                                <span />
                            )}
                            {nextArticle ? (
                                <Link
                                    href={`/ai-engineering/articles/${nextArticle.slug}`}
                                    className="group rounded-xl border border-border p-4 text-right hover:border-border-strong transition-colors"
                                >
                                    <span className="mb-1 flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
                                        Next <ArrowRight size={11} />
                                    </span>
                                    <p className="text-sm font-medium text-fg group-hover:text-fg line-clamp-1">{nextArticle.title}</p>
                                </Link>
                            ) : (
                                <span />
                            )}
                        </div>

                        {/* Related */}
                        {related.length > 0 && (
                            <div className="mt-14">
                                <h2 className="mb-4 text-lg font-bold text-fg">Related articles</h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {related.map((a) => (
                                        <ArticleCard key={a.slug} article={a} category={categoryBySlug.get(a.category)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    <TableOfContents items={tocItems} />
                </div>
            </div>
        </>
    )
}
