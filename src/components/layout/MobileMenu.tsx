"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Command, MessageCircle, X } from "lucide-react"
import { ThemeToggle } from "@/src/components/system/ThemeToggle"
import { NAV_LINKS } from "@/src/components/layout/SiteHeader"

interface MobileMenuProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onOpenCommandMenu?: () => void
    triggerRef?: React.RefObject<HTMLButtonElement | null>
}

/**
 * Full-screen mobile navigation sheet. Radix Dialog provides the focus trap
 * and Escape handling. Focus restoration is handled explicitly via
 * `onCloseAutoFocus` + `triggerRef` since the trigger button lives outside
 * this component (in SiteHeader), so Radix has no `Dialog.Trigger` of its
 * own to restore focus to.
 */
export function MobileMenu({
    open,
    onOpenChange,
    onOpenCommandMenu,
    triggerRef,
}: MobileMenuProps) {
    const pathname = usePathname()

    // Close when the route changes (a nav link was followed).
    useEffect(() => {
        onOpenChange(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- close on route change only
    }, [pathname])

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-[150] bg-background/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none" />
                <DialogPrimitive.Content
                    className="fixed inset-y-0 right-0 z-[151] flex w-full max-w-sm flex-col border-l border-border bg-background p-5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right motion-reduce:animate-none sm:p-6"
                    aria-describedby={undefined}
                    onCloseAutoFocus={(event) => {
                        event.preventDefault()
                        triggerRef?.current?.focus()
                    }}
                >
                    <div className="flex items-center justify-between">
                        <DialogPrimitive.Title className="font-mono text-sm font-medium text-fg-muted">
                            Navigation
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Close
                            aria-label="Close navigation menu"
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
                        >
                            <X size={20} aria-hidden />
                        </DialogPrimitive.Close>
                    </div>

                    <nav aria-label="Main" className="mt-6 flex flex-col gap-1">
                        {NAV_LINKS.map((link) => {
                            const Icon = link.icon
                            const active =
                                link.match.length > 0 &&
                                link.match.some(
                                    (m) =>
                                        pathname === m ||
                                        pathname.startsWith(`${m}/`),
                                )
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    aria-current={active ? "page" : undefined}
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-colors ${
                                        active
                                            ? "bg-surface-hover text-fg"
                                            : "text-fg-secondary hover:bg-surface-hover hover:text-fg"
                                    }`}
                                >
                                    <Icon
                                        className="h-5 w-5 shrink-0"
                                        aria-hidden
                                    />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="mt-auto flex flex-col gap-3">
                        {onOpenCommandMenu && (
                            <button
                                type="button"
                                onClick={() => {
                                    onOpenChange(false)
                                    onOpenCommandMenu()
                                }}
                                className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-fg-secondary transition-colors hover:border-border-strong hover:text-fg"
                            >
                                <Command size={14} aria-hidden />
                                Command menu
                            </button>
                        )}
                        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-2">
                            <span className="text-sm text-fg-secondary">
                                Theme
                            </span>
                            <ThemeToggle />
                        </div>
                        <Link
                            href="/contact"
                            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
                        >
                            <MessageCircle size={16} aria-hidden />
                            Contact
                        </Link>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}
