import { AlertTriangle, Info, Lightbulb } from "lucide-react"
import { CodeBlock } from "@/src/components/ai-engineering/CodeBlock"
import type { DocBlock, DocCalloutTone } from "@/src/lib/types/handbook"
import { DocFlow } from "./DocFlow"
import { RichText } from "./RichText"

const CALLOUT: Record<DocCalloutTone, { className: string; icon: typeof Info; label: string }> = {
    note: { className: "border-brand/40 bg-brand/[0.06]", icon: Info, label: "Note" },
    warn: { className: "border-error/40 bg-error/[0.06]", icon: AlertTriangle, label: "Watch out" },
    tip: { className: "border-warning/45 bg-warning/[0.07]", icon: Lightbulb, label: "Tip" },
}

function DocTable({ caption, columns, rows }: { caption?: string; columns: string[]; rows: string[][] }) {
    return (
        <figure className="my-7">
            {caption && (
                <figcaption className="mb-2 text-[13px] font-medium text-fg-muted">
                    <RichText text={caption} />
                </figcaption>
            )}
            <div className="w-full max-w-full overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[38rem] border-collapse text-left">
                    <thead>
                        <tr className="bg-surface-elevated">
                            {columns.map((column) => (
                                <th
                                    key={column}
                                    scope="col"
                                    className="border-b border-border px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-fg-secondary"
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-border last:border-0 odd:bg-surface/60">
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className={`px-4 py-3 align-top text-[15px] leading-6 ${
                                            cellIndex === 0 ? "font-medium text-fg" : "text-fg-secondary"
                                        }`}
                                    >
                                        <RichText text={cell} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </figure>
    )
}

export function DocBlockView({ block }: { block: DocBlock }) {
    switch (block.kind) {
        case "prose":
            return (
                <p className="mb-5 text-[17px] leading-[1.75] text-fg-secondary">
                    <RichText text={block.text} />
                </p>
            )

        case "heading":
            return (
                <h3
                    id={block.id}
                    className="mb-4 mt-10 scroll-mt-28 border-l-[3px] border-brand pl-3 text-[21px] font-bold leading-7 tracking-tight text-fg"
                >
                    {block.text}
                </h3>
            )

        case "list": {
            const Tag = block.ordered ? "ol" : "ul"
            return (
                <Tag
                    className={`mb-6 space-y-2.5 pl-5 text-[17px] leading-[1.7] text-fg-secondary ${
                        block.ordered ? "list-decimal marker:font-mono marker:text-sm marker:text-brand" : "list-disc marker:text-border-strong"
                    }`}
                >
                    {block.items.map((item, index) => (
                        <li key={index} className="pl-1">
                            {item.term && <span className="font-semibold text-fg">{item.term} — </span>}
                            <RichText text={item.detail} />
                        </li>
                    ))}
                </Tag>
            )
        }

        case "table":
            return <DocTable caption={block.caption} columns={block.columns} rows={block.rows} />

        case "compare":
            return (
                <DocTable
                    caption={block.caption}
                    columns={["", "Claude Code", "Codex"]}
                    rows={block.rows.map((row) => [row.aspect, row.claude, row.codex])}
                />
            )

        case "code":
            return <CodeBlock code={block.code} language={block.language} filename={block.filename} />

        case "tree":
            return (
                <figure className="my-7">
                    {block.caption && (
                        <figcaption className="mb-2 text-[13px] font-medium text-fg-muted">
                            <RichText text={block.caption} />
                        </figcaption>
                    )}
                    <div className="overflow-x-auto rounded-xl border border-border bg-surface px-4 py-3.5">
                        <ul className="min-w-[26rem] space-y-1 font-mono text-[13px] leading-6">
                            {block.lines.map((line, index) => (
                                <li key={index} className="flex items-baseline gap-3 whitespace-nowrap">
                                    <span
                                        className={line.emphasis ? "font-semibold text-brand" : "text-fg-secondary"}
                                        style={{ paddingLeft: `${line.depth * 1.25}rem` }}
                                    >
                                        {line.depth > 0 && <span className="text-border-strong">└─ </span>}
                                        {line.name}
                                    </span>
                                    {line.note && <span className="text-[12px] text-fg-muted">{line.note}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </figure>
            )

        case "callout": {
            const style = CALLOUT[block.tone]
            const Icon = style.icon
            return (
                <aside className={`my-7 rounded-xl border-l-[3px] border-y border-r p-4 ${style.className}`}>
                    <div className="flex items-start gap-3">
                        <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-fg-secondary" />
                        <div className="min-w-0">
                            <p className="text-[15px] font-semibold text-fg">
                                <span className="sr-only">{style.label}: </span>
                                {block.title}
                            </p>
                            <p className="mt-1 text-[15px] leading-6 text-fg-secondary">
                                <RichText text={block.text} />
                            </p>
                        </div>
                    </div>
                </aside>
            )
        }

        case "flow":
            return <DocFlow flow={block.flow} />
    }
}

export function DocBlockList({ blocks }: { blocks: DocBlock[] }) {
    return (
        <>
            {blocks.map((block, index) => (
                <DocBlockView key={index} block={block} />
            ))}
        </>
    )
}
