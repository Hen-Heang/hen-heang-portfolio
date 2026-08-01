import React from "react"
import { cn } from "@/src/lib/utils/utils"

interface ContainerProps {
    size?: "content" | "reading"
    className?: string
    children: React.ReactNode
}

/** Horizontal page container: 1280px for layouts, ~736px for prose. */
export function Container({
    size = "content",
    className,
    children,
}: ContainerProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full px-4 sm:px-6",
                size === "content" ? "max-w-content" : "max-w-reading",
                className,
            )}
        >
            {children}
        </div>
    )
}
