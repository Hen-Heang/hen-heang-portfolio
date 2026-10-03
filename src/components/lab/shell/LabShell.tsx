"use client"

import { useRef, useState } from "react"
import { usePathname } from "next/navigation"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { LabSidebar } from "./LabSidebar"
import { LabHeader } from "./LabHeader"
import { ScrollToTop } from "@/src/components/ui/ScrollToTop"
import { MobileMenu } from "@/src/components/layout/MobileMenu"
import { MobileTabBar } from "@/src/components/layout/MobileTabBar"

export function LabShell({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuButtonRef = useRef<HTMLButtonElement>(null)
    const siteMoreButtonRef = useRef<HTMLButtonElement>(null)
    const [siteMenuOpen, setSiteMenuOpen] = useState(false)
    const pathname = usePathname()
    const [renderedPathname, setRenderedPathname] = useState(pathname)

    // Close when the route changes (a nav link was followed). Adjusting
    // state during render (rather than in an effect) avoids an extra paint
    // with the drawer still open after navigation.
    if (pathname !== renderedPathname) {
        setRenderedPathname(pathname)
        setMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-background pb-[calc(7rem+env(safe-area-inset-bottom))] font-sans text-fg lg:pb-0">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 border-r border-border lg:block">
                <LabSidebar />
            </aside>

            {/* Mobile drawer */}
            <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 z-[129] bg-background/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none lg:hidden" />
                    <DialogPrimitive.Content
                        className="fixed inset-y-0 left-0 z-[130] w-60 border-r border-border bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left motion-reduce:animate-none lg:hidden"
                        aria-describedby={undefined}
                        onCloseAutoFocus={(event) => {
                            event.preventDefault()
                            menuButtonRef.current?.focus()
                        }}
                    >
                        <DialogPrimitive.Title className="sr-only">
                            Engineering Lab navigation
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Close
                            aria-label="Close lab menu"
                            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-fg-secondary transition-colors hover:border-border-strong hover:text-fg"
                        >
                            <X size={16} aria-hidden="true" />
                        </DialogPrimitive.Close>
                        <LabSidebar onNavigate={() => setMenuOpen(false)} />
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>

            {/* Content */}
            <div className="lg:pl-60">
                <LabHeader
                    menuOpen={menuOpen}
                    onMenuToggle={() => setMenuOpen((v) => !v)}
                    menuButtonRef={menuButtonRef}
                />
                <main>{children}</main>
            </div>

            <MobileMenu
                open={siteMenuOpen}
                onOpenChange={setSiteMenuOpen}
                triggerRef={siteMoreButtonRef}
                title="More"
            />
            <MobileTabBar
                onMore={() => setSiteMenuOpen(true)}
                moreButtonRef={siteMoreButtonRef}
                moreActive={siteMenuOpen}
            />
            <ScrollToTop />
        </div>
    )
}
