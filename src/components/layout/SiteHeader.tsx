"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import { motion } from "motion/react"
import {
    BriefcaseBusiness,
    Command,
    FileText,
    FlaskConical,
    Menu,
    MessageCircle,
    Route,
    UserRound,
} from "lucide-react"
import { ThemeToggle } from "@/src/components/system/ThemeToggle"
import { MobileMenu } from "@/src/components/layout/MobileMenu"

const CommandMenu = dynamic(
    () => import("@/src/components/system/CommandMenu"),
    { ssr: false },
)

export const NAV_LINKS = [
    {
        label: "Work",
        href: "/projects",
        match: ["/projects"],
        icon: BriefcaseBusiness,
    },
    {
        label: "Lab",
        href: "/lab",
        match: ["/lab", "/ai-engineering"],
        icon: FlaskConical,
    },
    { label: "Journey", href: "/journey", match: ["/journey"], icon: Route },
    { label: "About", href: "/about", match: ["/about"], icon: UserRound },
    {
        label: "Resume",
        href: "/resume",
        match: ["/resume", "/cv"],
        icon: FileText,
    },
]

const DESKTOP_NAV_LINKS = NAV_LINKS.filter((link) => link.label !== "Journey")

function isActive(pathname: string, match: string[]): boolean {
    return match.some((m) => pathname === m || pathname.startsWith(`${m}/`))
}

/**
 * Site-wide sticky navigation. Transparent over the page top; gains a
 * blurred background and hairline border once the page scrolls.
 */
export function SiteHeader() {
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuButtonRef = useRef<HTMLButtonElement>(null)
    const [commandOpen, setCommandOpen] = useState(false)
    // Only mount the lazy command-menu chunk once it has been requested.
    const [commandRequested, setCommandRequested] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === "k"
            ) {
                event.preventDefault()
                setCommandRequested(true)
                setCommandOpen((v) => !v)
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    const openCommandMenu = () => {
        setCommandRequested(true)
        setCommandOpen(true)
    }

    return (
        <header
            className={`sticky top-0 z-[100] transition-colors duration-200 ${
                scrolled
                    ? "border-b border-border bg-background/80 backdrop-blur-md"
                    : "border-b border-transparent bg-transparent"
            }`}
        >
            <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 transition-opacity hover:opacity-80"
                    aria-label="Hen Heang — home"
                >
                    <Image
                        src="/image/heang_new.png"
                        alt="Hen Heang"
                        width={48}
                        height={48}
                        priority
                        className="h-12 w-12 rounded-full object-cover ring-1 ring-border"
                    />
                    <span className="hidden text-sm font-semibold tracking-tight text-fg sm:inline">
                        Hen Heang
                    </span>
                </Link>

                <nav
                    aria-label="Main"
                    className="hidden items-center gap-0.5 rounded-full border border-border/60 bg-surface/60 p-1 lg:flex"
                >
                    {DESKTOP_NAV_LINKS.map((link) => {
                        const active = isActive(pathname, link.match)
                        const Icon = link.icon
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                aria-current={active ? "page" : undefined}
                                className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                                    active
                                        ? "text-fg"
                                        : "text-fg-secondary hover:text-fg"
                                }`}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="nav-active-pill"
                                        className="absolute inset-0 rounded-full bg-surface-hover shadow-sm ring-1 ring-border"
                                        transition={{
                                            duration: 0.24,
                                            ease: "easeOut",
                                        }}
                                    />
                                )}
                                <Icon
                                    className="relative z-10 h-3.5 w-3.5"
                                    aria-hidden
                                />
                                <span className="relative z-10">
                                    {link.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={openCommandMenu}
                        aria-label="Open command menu, keyboard shortcut Command or Control K"
                        aria-keyshortcuts="Meta+K Control+K"
                        className="hidden h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 font-mono text-xs text-fg-muted transition-colors hover:border-border-strong hover:text-fg lg:flex"
                    >
                        <Command size={13} aria-hidden />
                        <span aria-hidden>⌘K</span>
                    </button>
                    <ThemeToggle />
                    <Link
                        href="/contact"
                        className="ml-1 hidden h-9 items-center gap-2 rounded-lg bg-gradient-brand px-4 text-sm font-medium text-white transition-[filter] hover:brightness-110 lg:flex"
                    >
                        <MessageCircle size={15} aria-hidden />
                        Contact
                    </Link>
                    <button
                        ref={menuButtonRef}
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open navigation menu"
                        aria-expanded={menuOpen}
                        aria-haspopup="dialog"
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg lg:hidden"
                    >
                        <Menu size={20} aria-hidden />
                    </button>
                </div>
            </div>

            <MobileMenu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                onOpenCommandMenu={openCommandMenu}
                triggerRef={menuButtonRef}
            />
            {commandRequested && (
                <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
            )}
        </header>
    )
}
