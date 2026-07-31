import { profileData } from "./profile"

// NOTE: `getSiteContent("dashboard")` (src/lib/db/portfolio.ts) is defined
// and schema-validated (DashboardContentSchema) but has no caller anywhere
// in app/ — this file's exports are not currently rendered on any route.
// `deployedProjects`/`workProjects` duplicate data already canonical in
// data/projects.ts and are not kept in sync with it (e.g. `screenshot` paths
// below don't exist under public/). Left in place rather than deleted since
// removing it also means removing DashboardContentSchema and the
// getSiteContent("dashboard") plumbing — a bigger change than this pass's
// homepage scope. Treat data/projects.ts as the source of truth for project
// content; don't add new consumers of this file without reconciling it first.

export const profile = {
    name: profileData.name,
    koreanName: profileData.koreanName,
    title: profileData.title,
    company: profileData.company,
    location: profileData.location,
    locationEmoji: profileData.locationEmoji,
    email: profileData.email,
    available: profileData.available,
    yearsExperience: profileData.yearsExperience,
    bio: profileData.bio,
    socials: profileData.socialLinks,
}

export interface BentoProject {
    id: string
    title: string
    subtitle: string
    description: string
    emoji: string
    url: string
    github?: string
    tech: (string | { name: string; color?: string })[]
    gradientFrom?: string
    gradientTo?: string
    borderColor?: string
    accentColor?: string
    screenshot?: string
    status?: "live" | "archived"
}

// Backend-focused selection: the three Spring Boot projects, ordered by
// how much backend work each one shows off. Exactly fills one grid row.
export const deployedProjects: BentoProject[] = [
    {
        id: "we-commerce",
        title: "We Commerce",
        subtitle: "Multi-Vendor Marketplace",
        description:
            "A multi-vendor marketplace on a Spring Boot REST API — cart, checkout, and simulated Cambodian payment flows (ABA Pay, KHQR) behind a Next.js storefront.",
        emoji: "🛒",
        url: "https://we-commerce-frontend.vercel.app",
        github: "https://github.com/Hen-Heang/we-commerce-frontend",
        tech: ["Spring Boot", "Next.js", "TypeScript", "TanStack Query"],
        gradientFrom: "#0a1628",
        gradientTo: "#122544",
        borderColor: "#1e3a5f",
        accentColor: "#3b82f6",
        screenshot: "/image/we-commerce-preview.svg"
    },
    {
        id: "h-phsar",
        title: "H-Phsar",
        subtitle: "B2B Marketplace API",
        description:
            "A B2B marketplace API connecting distributors and retailers — stores, catalogs, carts, an order state machine, and real-time notifications on Spring Boot 3.",
        emoji: "🏪",
        url: "https://github.com/Hen-Heang/h-phsar-api",
        github: "https://github.com/Hen-Heang/h-phsar-api",
        tech: ["Spring Boot 3", "Java 17", "PostgreSQL", "MyBatis"],
        gradientFrom: "#1a120a",
        gradientTo: "#2a1d10",
        borderColor: "#4a3520",
        accentColor: "#e76f00",
        screenshot: "/image/h-phsar-preview.svg",
        status: "archived"
    },
    {
        id: "hengo",
        title: "Hengo",
        subtitle: "AI Companion for Daily Growth",
        description:
            "Set goals, track to-dos, and learn workplace Korean — daily missions, an AI coach, spaced repetition, and XP progression on Next.js and Supabase.",
        emoji: "📈",
        url: "https://koriai-frontend.vercel.app/",
        github: "https://github.com/Hen-Heang/koriai-frontend",
        tech: ["Next.js", "Supabase", "TypeScript", "TanStack Query"],
        gradientFrom: "#0f0e2a",
        gradientTo: "#16204d",
        borderColor: "#28306b",
        accentColor: "#10b981",
        screenshot: "/screenshots/hengo-screenshot.svg"
    },
]

export const workProjects = [
    { id: "easycart", title: "EasyCart", subtitle: "E-comm Ecosystem", emoji: "🛒" },
]

export const techStack = profileData.linkedinCoreSkills

export const journey = [
    { year: "2020", company: "RUPP University", location: "Phnom Penh 🇰🇭", current: false },
    { year: "2023", company: "Korea Software HRD Center", location: "Cambodia", current: false },
    { year: "2024", company: "KOSIGN", location: "Cambodia 🇰🇭", current: false },
    { year: "2025", company: "Bizplay", location: "Seoul 🇰🇷", current: true },
]
