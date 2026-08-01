"use client"

import { Link2 } from "lucide-react"
import { LinkedinIcon, XIcon } from "@/src/components/icons/social"
import { useState } from "react"

export function ShareButtons({ url, title }: { url: string; title: string }) {
    const [copied, setCopied] = useState(false)

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
        } catch {
            // clipboard unavailable
        }
    }

    const shareLinks = [
        {
            label: "Share on X",
            icon: XIcon,
            href: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        },
        {
            label: "Share on LinkedIn",
            icon: LinkedinIcon,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        },
    ]

    return (
        <div className="flex items-center gap-2">
            {shareLinks.map(({ label, icon: Icon, href }) => (
                <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
                >
                    <Icon size={14} />
                </a>
            ))}
            <button
                type="button"
                onClick={copyLink}
                aria-label="Copy link"
                title="Copy link"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
            >
                <Link2 size={14} className={copied ? "text-emerald-500" : ""} />
            </button>
        </div>
    )
}
