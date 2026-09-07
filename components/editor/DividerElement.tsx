"use client";

import type { CSSProperties, HTMLAttributes } from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerLineStyle = "solid" | "dashed" | "dotted" | "double";
export type DividerAlign = "left" | "center" | "right" | "top" | "bottom";

interface DividerElementProps extends HTMLAttributes<HTMLDivElement> {
    orientation?: DividerOrientation;
    thickness?: number;
    lineStyle?: DividerLineStyle;
    color?: string;
    align?: DividerAlign;
    style?: CSSProperties;
}

function getAlignment(
    orientation: DividerOrientation,
    align: DividerAlign,
): CSSProperties {
    // The divider line is full-size on its main axis, so alignment
    // must use justifyContent to move it along the wrapper's main axis.
    // horizontal divider -> top / center / bottom (vertical axis)
    // vertical divider -> left / center / right (horizontal axis)
    if (orientation === "vertical") {
        return {
            justifyContent:
                align === "left"
                    ? "flex-start"
                    : align === "right"
                        ? "flex-end"
                        : "center",
        };
    }

    return {
        justifyContent:
            align === "top"
                ? "flex-start"
                : align === "bottom"
                    ? "flex-end"
                    : "center",
    };
}

export default function DividerElement({
    orientation = "horizontal",
    thickness = 2,
    lineStyle = "solid",
    color = "#d1d5db",
    align = "center",
    style,
    className,
    ...props
}: DividerElementProps) {
    const safeThickness = Math.max(1, Number(thickness) || 1);

    const wrapperStyle: CSSProperties =
        orientation === "vertical"
            ? {
                ...style,
                display: "flex",
                flexDirection: "row",
                ...getAlignment(orientation, align),
            }
            : {
                ...style,
                display: "flex",
                flexDirection: "column",
                ...getAlignment(orientation, align),
            };

    const lineStyleObject: CSSProperties =
        orientation === "vertical"
            ? {
                width: `${safeThickness}px`,
                height: "100%",
                borderLeft: `${safeThickness}px ${lineStyle} ${color}`,
            }
            : {
                width: "100%",
                height: `${safeThickness}px`,
                borderTop: `${safeThickness}px ${lineStyle} ${color}`,
            };

    return (
        <div
            {...props}
            className={className}
            style={wrapperStyle}
            aria-hidden="true"
        >
            <div
                style={{
                    ...lineStyleObject,
                    boxSizing: "border-box",
                    flex: "0 0 auto",
                }}
            />
        </div>
    );
}
