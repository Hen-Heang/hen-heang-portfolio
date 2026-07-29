"use client"

import { motion } from "motion/react"

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg"
    className?: string
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8", 
        lg: "w-12 h-12"
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <motion.div
                className={`${sizeClasses[size]} border-2 border-cyan-200 dark:border-cyan-800 border-t-cyan-500 dark:border-t-cyan-400 rounded-full`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear"
                }}
            />
        </div>
    )
}

export function LoadingDots({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className="w-2 h-2 bg-cyan-500 rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: index * 0.2,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}

export function LoadingPulse({ className = "" }: { className?: string }) {
    return (
        <motion.div
            className={`w-8 h-8 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full ${className}`}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
            }}
            transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut"
            }}
        />
    )
}

export function LoadingWave({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[0, 1, 2, 3, 4].map((index) => (
                <motion.div
                    key={index}
                    className="w-1 h-6 bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-full"
                    animate={{
                        scaleY: [1, 2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: index * 0.1,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}
