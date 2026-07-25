import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { ThemeProvider } from "@/src/components/ThemeProvider"
import { SiteContentProvider } from "@/src/providers/site-content-provider"
import { MotionProvider } from "@/src/providers/motion-provider"
import { RouteScrollReset } from "@/src/components/utils/RouteScrollReset"
import { AssistantWidget } from "@/src/components/assistant"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { profileData } from "@/data/profile"
import { getSiteContent } from "@/src/lib/db/portfolio"
import "./globals.css"

// Re-render at most once a minute so admin edits show up without a redeploy.
export const revalidate = 60
const enableVercelTelemetry = process.env.VERCEL === "1"

const inter = localFont({
    src: [
        { path: "../public/fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
        { path: "../public/fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
        { path: "../public/fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
        { path: "../public/fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
    ],
    variable: "--font-inter",
    display: "swap",
    fallback: ["system-ui", "-apple-system", "sans-serif"],
})

const jetbrainsMono = localFont({
    src: [
        { path: "../public/fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
        { path: "../public/fonts/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
    ],
    variable: "--font-mono",
    display: "swap",
    fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
})

export const metadata: Metadata = {
    metadataBase: new URL(profileData.portfolioUrl),
    title: {
        default: `${profileData.fullName} — ${profileData.title}`,
        template: `%s | ${profileData.fullName}`,
    },
    description: profileData.description,
    keywords: profileData.knowsAbout.concat([
        profileData.title, profileData.fullName, profileData.location, profileData.company, "Portfolio",
    ]),
    authors: [{ name: profileData.fullName, url: profileData.portfolioUrl }],
    alternates: {
        canonical: profileData.portfolioUrl,
    },
    icons: {
        icon: "/icon",
        apple: "/apple-icon",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: profileData.portfolioUrl,
        siteName: `${profileData.fullName} — Portfolio`,
        title: `${profileData.fullName} — ${profileData.title}`,
        description: profileData.description,
    },
    twitter: {
        card: "summary_large_image",
        title: `${profileData.fullName} — ${profileData.title}`,
        description: profileData.description,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
}

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profileData.fullName,
    url: profileData.portfolioUrl,
    jobTitle: profileData.title,
    worksFor: { "@type": "Organization", name: profileData.company },
    address: { "@type": "PostalAddress", addressLocality: "Seoul", addressCountry: "KR" },
    email: profileData.email,
    sameAs: [
        profileData.socialLinks.github,
        profileData.socialLinks.linkedin,
    ],
    knowsAbout: profileData.knowsAbout,
    subjectOf: {
        "@type": "WebPage",
        name: "Resume",
        url: profileData.cvUrl,
    },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const [profile, cv] = await Promise.all([
        getSiteContent("profile"),
        getSiteContent("cv"),
    ])

    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <MotionProvider>
                    <SiteContentProvider initialContent={{ profile, cv }}>
                        <RouteScrollReset />
                        {children}
                        <AssistantWidget />
                    </SiteContentProvider>
                </MotionProvider>
            </ThemeProvider>
            {enableVercelTelemetry && <Analytics />}
            {enableVercelTelemetry && <SpeedInsights />}
        </body>
        </html>
    )
}
