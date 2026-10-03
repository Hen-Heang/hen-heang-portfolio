import React from "react"
import { SiteHeader } from "@/src/components/layout/SiteHeader"
import { Footer } from "@/src/components/ui/Footer"
import { ScrollToTop } from "@/src/components/ui/ScrollToTop"

interface PageLayoutProps {
    children: React.ReactNode
    showFooter?: boolean
    className?: string
}

/**
 * Site-wide page shell (server component). Content is rendered server-side;
 * the only client island in the shell is the sticky SiteHeader.
 */
export function PageLayout({
    children,
    showFooter = true,
    className = "",
}: PageLayoutProps) {
    return (
        <div
            className={`min-h-screen bg-background pb-[calc(7rem+env(safe-area-inset-bottom))] font-sans text-fg lg:pb-0 ${className}`}
        >
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-fg"
            >
                Skip to content
            </a>
            <SiteHeader />
            <main id="main">{children}</main>
            {showFooter && <Footer />}
            <ScrollToTop />
        </div>
    )
}
