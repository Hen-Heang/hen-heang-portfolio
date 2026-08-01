"use client"

import { motion } from 'motion/react';
import {
    FacebookIcon,
    GithubIcon,
    InstagramIcon,
    LinkedinIcon,
    TelegramIcon,
    XIcon,
} from '@/src/components/icons/social';
import { usePersonalInfo } from "@/src/providers/site-content-provider";

export function SocialLinks() {
    const personalInfo = usePersonalInfo()
    const socialLinks = [
        {
            href: personalInfo.socialLinks.github,
            icon: GithubIcon,
            label: "GitHub"
        },
        {
            href: personalInfo.socialLinks.linkedin,
            icon: LinkedinIcon,
            label: "LinkedIn"
        },
        {
            href: personalInfo.socialLinks.telegram,
            icon: TelegramIcon,
            label: "Telegram"
        },
        {
            href: personalInfo.socialLinks.x,
            icon: XIcon,
            label: "X"
        },
        {
            href: personalInfo.socialLinks.facebook,
            icon: FacebookIcon,
            label: "Facebook"
        },
        {
            href: personalInfo.socialLinks.instagram,
            icon: InstagramIcon,
            label: "Instagram"
        }
    ].filter((link): link is { href: string; icon: typeof GithubIcon; label: string } =>
        Boolean(link.href)
    );

    return (
        <div className="flex gap-3">
            {socialLinks.map((link, index) => (
                <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 hover:border-zinc-900 dark:hover:border-zinc-100 hover:shadow-sm"
                    whileHover={{
                        y: -4,
                        transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                    <link.icon size={25} />
                    <span className="sr-only">{link.label}</span>
                </motion.a>
            ))}
        </div>
    );
}
