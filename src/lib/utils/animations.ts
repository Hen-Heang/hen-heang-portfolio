export const subtleEase = [0.21, 0.47, 0.32, 0.98] as const
export const subtleDuration = 0.4
export const staggerDelay = 0.06

export const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: staggerDelay,
        },
    },
}

export const staggerItem = {
    hidden: { opacity: 0.85, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: subtleDuration,
            ease: subtleEase,
        },
    },
}
