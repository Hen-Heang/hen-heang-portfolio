"use client"

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="en">
            <body className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-[#fafafa] p-4 font-sans">
                <div className="max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
                    <p className="text-sm text-[#a1a1aa] mb-6">
                        An unexpected error occurred while loading this page.
                    </p>
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="rounded-xl bg-[#2bbdd4] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#5dd7ea] transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    )
}
