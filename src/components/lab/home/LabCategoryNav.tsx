import Link from "next/link"
import { Bot, Container, LibraryBig, ServerCog } from "lucide-react"
import { HoverArrow } from "@/src/components/lab/ui/HoverArrow"
import { cn, interactiveCard } from "@/src/lib/utils/utils"

const browseLinks = [
    {
        href: "/lab/backend",
        icon: ServerCog,
        label: "Backend curriculum",
        detail: "Java · Spring Boot · Data",
        accent: "bg-brand/10 text-brand",
    },
    {
        href: "/lab/devops",
        icon: Container,
        label: "DevOps curriculum",
        detail: "Docker · CI/CD · Cloud",
        accent: "bg-success/10 text-success",
    },
    {
        href: "/ai-engineering",
        icon: Bot,
        label: "AI Engineering",
        detail: "Agents · MCP · RAG",
        accent: "bg-warning/10 text-warning",
    },
    {
        href: "/lab/library",
        icon: LibraryBig,
        label: "Full searchable library",
        detail: "Guides · Labs · References",
        accent: "bg-surface-elevated text-fg-secondary",
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
                    className={cn(
                        "group flex min-h-20 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5",
                        interactiveCard,
                    )}
                >
                    <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100 ${link.accent}`}
                    >
                        <link.icon size={14} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-base font-semibold text-fg">
                            {link.label}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-wider text-fg-muted">
                            {link.detail}
                        </span>
                    </span>
                    <HoverArrow />
                </Link>
            ))}
        </div>
    )
}
