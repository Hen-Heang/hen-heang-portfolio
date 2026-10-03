import type React from "react"
import { LabShell } from "@/src/components/lab/shell/LabShell"

// The AI Library is part of the Engineering Lab, so it shares the Lab's
// sidebar shell instead of switching back to the portfolio header.
export default function AIEngineeringLayout({ children }: { children: React.ReactNode }) {
    return <LabShell>{children}</LabShell>
}
