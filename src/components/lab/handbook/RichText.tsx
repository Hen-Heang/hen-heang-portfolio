import { Fragment } from "react"

/**
 * Handbook copy is stored as plain strings so the data layer stays free of
 * markup. Two inline forms are supported, which is all a reference document
 * needs: `backticks` become inline code, **double asterisks** become bold.
 * Anything else renders literally — there is deliberately no HTML escape hatch.
 */
const INLINE = /(`[^`]+`|\*\*[^*]+\*\*)/g

export function RichText({ text }: { text: string }) {
    return (
        <>
            {text
                .split(INLINE)
                .filter(Boolean)
                .map((part, index) => {
                    if (part.length > 1 && part.startsWith("`") && part.endsWith("`")) {
                        return (
                            <code
                                key={index}
                                className="rounded border border-border/70 bg-surface px-[0.34em] py-[0.08em] font-mono text-[0.86em] text-brand"
                            >
                                {part.slice(1, -1)}
                            </code>
                        )
                    }
                    if (part.length > 3 && part.startsWith("**") && part.endsWith("**")) {
                        return (
                            <strong key={index} className="font-semibold text-fg">
                                {part.slice(2, -2)}
                            </strong>
                        )
                    }
                    return <Fragment key={index}>{part}</Fragment>
                })}
        </>
    )
}
