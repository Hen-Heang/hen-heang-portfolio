import { ArrowRight, type LucideIcon } from "lucide-react"
import { cn } from "@/src/lib/utils/utils"

/**
 * Shared trailing arrow for Lab/project link-cards — nudges right and picks
 * up the brand color on hover. Pure CSS (`group-hover`), so it needs no
 * client boundary; the parent link only needs the `group` class.
 */
export function HoverArrow({
    icon: Icon = ArrowRight,
    size = 14,
    className,
}: {
    icon?: LucideIcon
    size?: number
    className?: string
}) {
    return (
        <Icon
            size={size}
            aria-hidden="true"
            className={cn(
                "shrink-0 text-fg-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand group-focus-visible:translate-x-1 group-focus-visible:text-brand motion-reduce:group-hover:translate-x-0 motion-reduce:group-focus-visible:translate-x-0",
                className,
            )}
        />
    )
}
