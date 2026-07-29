"use client"

import { useEffect, useRef } from "react"
import { useMotionValue, useReducedMotion, useSpring } from "motion/react"
import { cn } from "@/src/lib/utils/utils"

interface NumberTickerProps {
    value: number
    delay?: number
    className?: string
    decimalPlaces?: number
}

export function NumberTicker({
    value,
    delay = 0,
    className,
    decimalPlaces = 0,
}: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const motionValue = useMotionValue(0)
    const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 })
    const prefersReducedMotion = useReducedMotion()

    // Animate on mount rather than on scroll-into-view: these tickers sit above
    // the fold, and gating on a nested IntersectionObserver raced the parent's
    // own entrance animation, sometimes leaving the stat stuck at 0.
    useEffect(() => {
        if (prefersReducedMotion) {
            motionValue.jump(value)
            springValue.jump(value)
            return
        }
        const t = setTimeout(() => motionValue.set(value), delay * 1000)
        // The spring runs on requestAnimationFrame; if the tab is throttled it
        // can stall indefinitely. Force the final value once the animation
        // should long be over so a stat never stays stuck at 0.
        const settle = setTimeout(() => springValue.jump(value), delay * 1000 + 2500)
        return () => {
            clearTimeout(t)
            clearTimeout(settle)
        }
    }, [motionValue, springValue, delay, value, prefersReducedMotion])

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Intl.NumberFormat("en-US", {
                    minimumFractionDigits: decimalPlaces,
                    maximumFractionDigits: decimalPlaces,
                }).format(Number(latest.toFixed(decimalPlaces)))
            }
        })
    }, [springValue, decimalPlaces])

    return (
        <span ref={ref} className={cn("inline-block tabular-nums", className)}>
            {prefersReducedMotion ? value : 0}
        </span>
    )
}
