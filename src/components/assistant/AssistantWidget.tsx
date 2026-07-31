"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Sparkles } from "lucide-react"

import { resolvePageContext } from "@/src/lib/ai/page-context"

/**
 * The chat panel (AI SDK hooks, Markdown renderer) is loaded lazily on first
 * open so visitors who never touch the assistant download none of it.
 */
const AssistantPanel = dynamic(() => import("./AssistantPanel"), {
    ssr: false,
    loading: () => (
        <div
            aria-hidden
            className="flex-1 animate-pulse motion-reduce:animate-none"
        />
    ),
})

export function AssistantWidget() {
    const [open, setOpen] = useState(false)
    const [wasOpened, setWasOpened] = useState(false)
    const pathname = usePathname()
    const { page, projectSlug } = resolvePageContext(pathname ?? "/")

    useEffect(() => {
        const onOpen = () => setOpen(true)
        window.addEventListener("hh:assistant-open", onOpen)
        return () => window.removeEventListener("hh:assistant-open", onOpen)
    }, [])

    return (
        <DialogPrimitive.Root
            open={open}
            onOpenChange={(next) => {
                setOpen(next)
                if (next) setWasOpened(true)
            }}
        >
            <DialogPrimitive.Trigger asChild>
                <button
                    type="button"
                    aria-label="Ask about my work"
                    className="fixed bottom-4 right-4 z-[70] flex h-11 w-11 items-center justify-center rounded-full bg-gradient-brand text-sm font-medium text-white shadow-lg transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand data-[state=open]:hidden sm:w-auto sm:gap-2 sm:py-3 sm:pl-3.5 sm:pr-4 lg:bottom-6 lg:right-6"
                >
                    <Sparkles size={16} aria-hidden />
                    <span className="hidden sm:inline">Ask about my work</span>
                </button>
            </DialogPrimitive.Trigger>

            {wasOpened && (
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 z-[109] bg-background/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none sm:bg-transparent" />
                    <DialogPrimitive.Content
                        aria-describedby={undefined}

                        className="fixed inset-0 z-[110] flex h-[100dvh] flex-col overflow-hidden rounded-none border-0 bg-surface/95 shadow-2xl backdrop-blur-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(620px,calc(100dvh-5rem))] sm:w-[400px] sm:rounded-3xl sm:border sm:border-border data-[state=closed]:sm:slide-out-to-bottom-4 data-[state=open]:sm:slide-in-from-bottom-4"
                    >
                        <DialogPrimitive.Title className="sr-only">
                            Portfolio Assistant
                        </DialogPrimitive.Title>
                        <AssistantPanel
                            onClose={() => setOpen(false)}
                            page={page}
                            projectSlug={projectSlug}
                        />
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            )}
        </DialogPrimitive.Root>
    )
}
