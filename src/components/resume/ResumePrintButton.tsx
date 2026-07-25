"use client"

import { Printer } from "lucide-react"

export function ResumePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      title="Opens the browser print dialog"
      className="
        flex items-center gap-2 px-5 py-2.5 rounded-lg
        bg-slate-900 text-white text-sm font-semibold
        hover:bg-slate-800 active:scale-[0.98] transition-all
      "
    >
      <Printer size={15} aria-hidden />
      Print / Save as PDF
    </button>
  )
}
