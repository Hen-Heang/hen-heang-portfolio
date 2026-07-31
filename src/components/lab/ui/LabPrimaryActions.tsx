import Link from "next/link"
import type { ComponentType } from "react"

export interface LabAction {
    href: string
    label: string
    icon?: ComponentType<{ size?: number; "aria-hidden"?: boolean }>
    variant?: "primary" | "secondary"
}

/** Shared CTA row shared across hub headers — same button hierarchy everywhere (one primary action, the rest secondary). */
export function LabPrimaryActions({ actions }: { actions: LabAction[] }) {
    return (
        <div className="mt-6 flex flex-wrap gap-3">
            {actions.map((action) => {
                const Icon = action.icon
                const primary = action.variant !== "secondary"
                return (
                    <Link
                        key={`${action.href}-${action.label}`}
                        href={action.href}
                        className={
                            primary
                                ? "inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-base font-semibold text-white transition-[filter] hover:brightness-110"
                                : "inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-base font-semibold text-fg-secondary transition-colors hover:border-border-strong hover:text-fg"
                        }
                    >
                        {Icon && <Icon size={15} aria-hidden={true} />} {action.label}
                    </Link>
                )
            })}
        </div>
    )
}
