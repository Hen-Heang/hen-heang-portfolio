"use client"

import { motion } from 'motion/react';
import Github from '@/src/components/icons/github';
import LinkIn from '@/src/components/icons/linkIn';
import Telegram from '@/src/components/icons/telegram';
import X from '@/src/components/icons/x';
import { usePersonalInfo } from "@/src/providers/site-content-provider";

export function SocialLinks() {
    const personalInfo = usePersonalInfo()
    const socialLinks = [
        {
            href: personalInfo.socialLinks.github,
            icon: Github,
            label: "GitHub"
        },
        {
            href: personalInfo.socialLinks.linkedin,
            icon: LinkIn,
            label: "LinkedIn"
        },
        {
            href: personalInfo.socialLinks.telegram,
            icon: Telegram,
            label: "Telegram"
        },
        {
            href: personalInfo.socialLinks.x,
            icon: X,
            label: "X"
        }
    ];

    return (
        <div className="flex gap-3">
            {socialLinks.map((link, index) => (
                <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-950 transition-all duration-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-900 dark:hover:border-zinc-100 hover:shadow-sm"
                    whileHover={{ 
                        y: -4,
                        transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                    <link.icon />
                    <span className="sr-only">{link.label}</span>
                </motion.a>
            ))}
        </div>
    );
}
