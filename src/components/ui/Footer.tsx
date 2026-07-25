"use client"

import {
    BriefcaseBusiness,
    FileText,
    FlaskConical,
    Github,
    Linkedin,
    Mail,
    MessageCircle,
    Route,
    Send,
    UserRound,
} from "lucide-react"
import { usePersonalInfo } from "@/src/providers/site-content-provider"
import Link from "next/link"
import X from "@/src/components/icons/x"

const navLinks = [
    { name: "Work", href: "/projects", icon: BriefcaseBusiness },
    { name: "Lab", href: "/lab", icon: FlaskConical },
    { name: "Journey", href: "/journey", icon: Route },
    { name: "About", href: "/about", icon: UserRound },
    { name: "Resume", href: "/resume", icon: FileText },
    { name: "Contact", href: "/contact", icon: MessageCircle },
]

export function Footer() {
    const personalInfo = usePersonalInfo()
    const currentYear = new Date().getFullYear()

    const socialLinks = [
        { href: personalInfo.socialLinks.github, icon: Github, label: "GitHub" },
        { href: personalInfo.socialLinks.linkedin, icon: Linkedin, label: "LinkedIn" },
        { href: personalInfo.socialLinks.telegram, icon: Send, label: "Telegram" },
        { href: personalInfo.socialLinks.x, icon: X, label: "X" },
    ]

    return (
        <footer className="border-t border-border bg-surface">
            <div className="mx-auto max-w-content px-6 py-16">
                <div className="grid gap-12 md:grid-cols-12">
                    <div className="md:col-span-6">
                        <Link
                            href="/"
                            className="font-mono text-lg font-semibold tracking-tight text-fg transition-colors hover:text-brand"
                        >
                            HH<span className="text-brand">.</span>
                        </Link>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-secondary">
                            {personalInfo.fullName} — backend engineer building enterprise systems
                            with Java and Spring Boot in {personalInfo.location}.
                        </p>
                    </div>

                    <div className="min-w-0 md:col-span-3">
                        <h2 className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-fg-muted">
                            Site
                        </h2>
                        <ul className="mt-4 space-y-3">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="inline-flex items-center gap-2 text-sm text-fg-secondary transition-colors hover:text-fg"
                                    >
                                        <link.icon size={15} aria-hidden />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="min-w-0 md:col-span-3">
                        <h2 className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-fg-muted">
                            Connect
                        </h2>
                        <ul className="mt-4 space-y-3">
                            {socialLinks.map((social) => (
                                <li key={social.label}>
                                    <a
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-fg-secondary transition-colors hover:text-fg"
                                    >
                                        <social.icon size={15} aria-hidden />
                                        {social.label}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a
                                    href={`mailto:${personalInfo.email}`}
                                    className="inline-flex min-w-0 items-center gap-2 text-sm text-fg-secondary transition-colors hover:text-fg"
                                >
                                    <Mail size={15} className="shrink-0" aria-hidden />
                                    <span className="min-w-0 break-all">{personalInfo.email}</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
                    <p className="text-xs text-fg-muted">
                        © {currentYear} {personalInfo.fullName} · {personalInfo.location} (GMT+9)
                    </p>
                    <Link
                        href="/admin"
                        className="text-xs text-fg-muted transition-colors hover:text-fg"
                    >
                        Admin
                    </Link>
                </div>
            </div>
        </footer>
    )
}
