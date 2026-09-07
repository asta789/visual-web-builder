import type { CSSProperties, HTMLAttributes } from "react";

export type TableCellAlign = "left" | "center" | "right";
export type TableCellVerticalAlign = "top" | "middle" | "bottom";

interface TableElementProps extends HTMLAttributes<HTMLDivElement> {
    data?: string[][];
    header?: boolean;
    striped?: boolean;
    borderWidth?: number;
    borderStyle?: "solid" | "dashed" | "dotted" | "double" | "none";
    borderColor?: string;
    cellPadding?: number;
    cellAlign?: TableCellAlign;
    cellVerticalAlign?: TableCellVerticalAlign;
    columnWidths?: string[];
    rowHeight?: number;
}

export default function TableElement({
    data = [["Header 1", "Header 2"], ["Cell 1", "Cell 2"]],
    header = true,
    striped = false,
    borderWidth = 1,
    borderStyle = "solid",
    borderColor = "#d1d5db",
    cellPadding = 10,
    cellAlign = "left",
    cellVerticalAlign = "middle",
    columnWidths = [],
    rowHeight = 0,
    style,
    className,
    ...props
}: TableElementProps) {
    const rows = data.length ? data : [[""]];
    const columnCount = Math.max(1, ...rows.map((row) => row.length));
    const safeBorderWidth = Math.max(0, borderWidth);
    const safePadding = Math.max(0, cellPadding);
    const safeRowHeight = Math.max(0, rowHeight);

    const tableStyle: CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
        ...style,
    };

    const cellStyle: CSSProperties = {
        padding: `${safePadding}px`,
        textAlign: cellAlign,
        verticalAlign: cellVerticalAlign,
        borderWidth: `${safeBorderWidth}px`,
        borderStyle,
        borderColor,
        overflowWrap: "anywhere",
        ...(safeRowHeight > 0 ? { minHeight: `${safeRowHeight}px` } : {}),
    };

    return (
        <div
            {...props}
            className={className}
            style={{
                width: "100%",
                overflowX: "auto",
                ...style,
            }}
        >
            <table style={tableStyle}>
                {columnWidths.length > 0 && (
                    <colgroup>
                        {Array.from({ length: columnCount }).map((_, index) => (
                            <col
                                key={index}
                                style={{
                                    width:
                                        columnWidths[index] ||
                                        `${100 / columnCount}%`,
                                }}
                            />
                        ))}
                    </colgroup>
                )}

                <tbody>
                    {rows.map((row, rowIndex) => {
                        const isHeader = header && rowIndex === 0;
                        const Tag = isHeader ? "th" : "td";

                        return (
                            <tr key={rowIndex}>
                                {Array.from({ length: columnCount }).map((_, columnIndex) => (
                                    <Tag
                                        key={columnIndex}
                                        style={{
                                            ...cellStyle,
                                            ...(striped && !isHeader && rowIndex % 2 === 0
                                                ? { backgroundColor: "#f9fafb" }
                                                : {}),
                                            fontWeight: isHeader ? 600 : undefined,
                                        }}
                                    >
                                        {row[columnIndex] ?? ""}
                                    </Tag>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
