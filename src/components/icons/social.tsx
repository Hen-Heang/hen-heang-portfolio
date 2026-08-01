import React from "react"

/**
 * Official brand marks for the social platforms linked from the site.
 *
 * Each icon renders in one of two modes:
 *  - `brand` (default): the platform's official logo and brand colour, with a
 *    dark-mode variant where the official mark is near-black (GitHub, X).
 *  - `brand={false}`: the same official glyph in `currentColor`, for places
 *    where the icon sits inline with text.
 */

export type SocialIconProps = {
    size?: number
    brand?: boolean
    className?: string
}

const base = (size: number, className?: string) => ({
    width: size,
    height: size,
    className,
    "aria-hidden": true as const,
    focusable: "false" as const,
    xmlns: "http://www.w3.org/2000/svg",
})

export function GithubIcon({
    size = 24,
    brand = true,
    className,
}: SocialIconProps) {
    return (
        <svg {...base(size, className)} viewBox="0 0 24 24">
            <path
                className={brand ? "fill-[#181717] dark:fill-white" : undefined}
                fill={brand ? undefined : "currentColor"}
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
        </svg>
    )
}

export function LinkedinIcon({
    size = 24,
    brand = true,
    className,
}: SocialIconProps) {
    return (
        <svg {...base(size, className)} viewBox="0 0 24 24">
            <path
                fill={brand ? "#0A66C2" : "currentColor"}
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
        </svg>
    )
}

export function TelegramIcon({
    size = 24,
    brand = true,
    className,
}: SocialIconProps) {
    // Brand mode uses the official blue disc with the white paper plane; the
    // monochrome mode uses the plane glyph on its own.
    const gradientId = React.useId()

    if (!brand) {
        return (
            <svg {...base(size, className)} viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    d="M23.91 3.79 20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7l-5.45-1.7c-1.18-.35-1.19-1.16.26-1.75l21.26-8.2c.97-.43 1.9.24 1.53 1.73Z"
                />
            </svg>
        )
    }

    return (
        <svg {...base(size, className)} viewBox="0 0 256 256">
            <defs>
                <linearGradient id={gradientId} x1="50%" x2="50%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#2AABEE" />
                    <stop offset="100%" stopColor="#229ED9" />
                </linearGradient>
            </defs>
            <path
                fill={`url(#${gradientId})`}
                d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.038 128.038 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51 0-33.934-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0Z"
            />
            <path
                fill="#FFF"
                d="M57.94 126.648c37.32-16.256 62.2-26.974 74.64-32.152 35.56-14.786 42.94-17.354 47.76-17.441 1.06-.017 3.42.245 4.96 1.49 1.28 1.05 1.64 2.47 1.82 3.467.16.996.38 3.266.2 5.038-1.92 20.24-10.26 69.356-14.5 92.026-1.78 9.592-5.32 12.808-8.74 13.122-7.44.684-13.08-4.912-20.28-9.63-11.26-7.386-17.62-11.982-28.56-19.188-12.64-8.328-4.44-12.906 2.76-20.386 1.88-1.958 34.64-31.748 35.26-34.45.08-.338.16-1.598-.6-2.262-.74-.666-1.84-.438-2.64-.258-1.14.256-19.12 12.152-54 35.686-5.1 3.508-9.72 5.218-13.88 5.128-4.56-.098-13.36-2.584-19.9-4.708-8-2.606-14.38-3.984-13.82-8.41.28-2.304 3.46-4.662 9.52-7.072Z"
            />
        </svg>
    )
}

export function FacebookIcon({
    size = 24,
    brand = true,
    className,
}: SocialIconProps) {
    return (
        <svg {...base(size, className)} viewBox="0 0 24 24">
            <path
                fill={brand ? "#0866FF" : "currentColor"}
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073"
            />
        </svg>
    )
}

export function InstagramIcon({
    size = 24,
    brand = true,
    className,
}: SocialIconProps) {
    // Instagram's official mark is the outlined camera glyph on its brand
    // gradient; monochrome mode drops the gradient and inherits text colour.
    const gradientId = React.useId()
    const glyph =
        "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0m0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881"

    if (!brand) {
        return (
            <svg {...base(size, className)} viewBox="0 0 24 24">
                <path fill="currentColor" d={glyph} />
            </svg>
        )
    }

    return (
        <svg {...base(size, className)} viewBox="0 0 24 24">
            <defs>
                <radialGradient id={gradientId} cx="30%" cy="107%" r="150%">
                    <stop offset="0%" stopColor="#FDF497" />
                    <stop offset="5%" stopColor="#FDF497" />
                    <stop offset="45%" stopColor="#FD5949" />
                    <stop offset="60%" stopColor="#D6249F" />
                    <stop offset="90%" stopColor="#285AEB" />
                </radialGradient>
            </defs>
            <path fill={`url(#${gradientId})`} d={glyph} />
        </svg>
    )
}

export function XIcon({ size = 24, brand = true, className }: SocialIconProps) {
    return (
        <svg {...base(size, className)} viewBox="0 0 24 24">
            <path
                className={brand ? "fill-black dark:fill-white" : undefined}
                fill={brand ? undefined : "currentColor"}
                d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
            />
        </svg>
    )
}
