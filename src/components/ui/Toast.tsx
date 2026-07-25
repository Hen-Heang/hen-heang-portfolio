"use client"

import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2 } from "lucide-react"

interface ToastProps {
    message: string
    isVisible: boolean
}

export function Toast({ message, isVisible }: ToastProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-white shadow-2xl"
                >
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-xs font-medium tracking-tight">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
