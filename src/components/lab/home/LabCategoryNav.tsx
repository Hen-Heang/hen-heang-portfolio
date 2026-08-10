import Link from "next/link"
import { BookOpen, LibraryBig, Sparkles, Terminal } from "lucide-react"

const browseLinks = [
    { href: "/lab/backend", icon: BookOpen, label: "Backend curriculum" },
    { href: "/lab/devops", icon: Terminal, label: "DevOps curriculum" },
    { href: "/ai-engineering", icon: Sparkles, label: "AI Engineering" },
    {
        href: "/lab/library",
        icon: LibraryBig,
        label: "Full searchable library",
    },
]

/** Compact browse preview — the full searchable catalog lives at /lab/library. */
export function LabCategoryNav() {
    return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {browseLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="group flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3 transition-colors hover:border-border-strong hover:bg-surface-hover"
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-transform group-hover:-translate-y-0.5">
                        <link.icon size={19} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold leading-5 text-fg">{link.label}</span>
                </Link>
            ))}
        </div>
    )
}
