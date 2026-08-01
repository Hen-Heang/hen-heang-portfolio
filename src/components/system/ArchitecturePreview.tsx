import React from "react"
import { ArrowDown } from "lucide-react"
import { cn } from "@/src/lib/utils/utils"

interface ArchitecturePreviewProps {
    layers: string[]
    note?: string
    compact?: boolean
    className?: string
}

/**
 * Stacked architecture-layer diagram rendered from a project's real
 * `architecture` data (server component — pure markup).
 */
export function ArchitecturePreview({
    layers,
    note,
    compact = false,
    className,
}: ArchitecturePreviewProps) {
    return (
        <figure
            className={cn(
                "rounded-xl border border-border bg-surface p-5 sm:p-6",
                className,
            )}
            aria-label={`Architecture flow: ${layers.join(" to ")}`}
        >
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-fg-muted">
                architecture
            </p>
            <div className={cn("flex flex-col", compact ? "gap-1" : "gap-1.5")}>
                {layers.map((layer, i) => (
                    <React.Fragment key={layer}>
                        {i > 0 && (
                            <ArrowDown
                                size={13}
                                className="mx-auto shrink-0 text-fg-muted"
                                aria-hidden
                            />
                        )}
                        <div
                            className={cn(
                                "rounded-lg border border-border bg-background/60 text-center font-mono text-sm text-fg-secondary",
                                compact ? "px-3 py-1.5" : "px-4 py-2.5",
                            )}
                        >
                            {layer}
                        </div>
                    </React.Fragment>
                ))}
            </div>
            {note && (
                <figcaption className="mt-4 text-[13px] leading-relaxed text-fg-muted">
                    {note}
                </figcaption>
            )}
        </figure>
    )
}
