"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Sparkles } from "lucide-react"

import { resolvePageContext } from "@/src/lib/ai/page-context"

/**
 * The chat panel (AI SDK hooks, markdown renderer) is loaded lazily on first
 * open so visitors who never touch the assistant download none of it.
 */
const AssistantPanel = dynamic(() => import("./AssistantPanel"), {
    ssr: false,
    loading: () => (
        <div aria-hidden className="flex-1 animate-pulse motion-reduce:animate-none" />
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
                console.log("DialogPrimitive.Root onOpenChange:", next)
                setOpen(next)
                if (next) setWasOpened(true)
            }}
        >
            <DialogPrimitive.Trigger
                type="button"
                aria-label="Ask about my work"
                className="fixed z-[70] bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-3 lg:bottom-6 lg:right-6 flex items-center justify-center gap-2 rounded-full lg:rounded-2xl bg-gemini-gradient p-3 lg:pl-3.5 lg:pr-4 lg:py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white data-[state=open]:hidden"
            >
                <Sparkles size={20} className="lg:w-4 lg:h-4" aria-hidden />
                <span className="hidden lg:inline">Ask about my work</span>
            </DialogPrimitive.Trigger>

            {wasOpened && (
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 z-[109] bg-background/40 sm:bg-transparent data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none" />
                    <DialogPrimitive.Content
                        aria-describedby={undefined}

                        className="fixed z-[110] inset-0 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:top-auto sm:w-[420px] flex flex-col h-[100dvh] sm:h-[min(700px,calc(100dvh-3rem))] overflow-hidden rounded-none sm:rounded-2xl bg-[#050816] pt-[env(safe-area-inset-top)] sm:pt-0 sm:border sm:border-slate-400/15 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:sm:slide-in-from-bottom-4 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:sm:slide-out-to-bottom-4 motion-reduce:animate-none"
                    >
                        <DialogPrimitive.Title className="sr-only">Portfolio Assistant</DialogPrimitive.Title>
                        <AssistantPanel onClose={() => setOpen(false)} page={page} projectSlug={projectSlug} />
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            )}
        </DialogPrimitive.Root>
    )
}
