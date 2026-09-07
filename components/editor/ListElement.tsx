"use client";

import type {
    CSSProperties,
    HTMLAttributes,
} from "react";

export type BuilderListMarkerStyle =
    | "disc"
    | "circle"
    | "square"
    | "decimal"
    | "lower-alpha"
    | "upper-alpha"
    | "lower-roman"
    | "upper-roman"
    | "none";

interface ListElementProps
    extends HTMLAttributes<HTMLDivElement> {
    items?: string[];
    ordered?: boolean;
    markerStyle?: BuilderListMarkerStyle;
    start?: number;
    itemGap?: number;
    style?: CSSProperties;
}

function getMarkerStyle(
    markerStyle: BuilderListMarkerStyle | undefined,
    ordered: boolean,
): CSSProperties["listStyleType"] {
    if (markerStyle) return markerStyle;
    return ordered ? "decimal" : "disc";
}

export default function ListElement({
    items = ["First item", "Second item", "Third item"],
    ordered = false,
    markerStyle,
    start,
    itemGap = 8,
    style,
    className,
    ...interactionProps
}: ListElementProps) {
    const safeItems =
        items.length > 0
            ? items
            : ["List item"];

    const listStyleType =
        getMarkerStyle(markerStyle, ordered);

    const listStyle: CSSProperties = {
        width: "100%",
        boxSizing: "border-box",
        margin: 0,
        paddingLeft:
            listStyleType === "none"
                ? "0"
                : "1.5em",
        listStyleType,
        listStylePosition: "outside",
    };

    const listItems = safeItems.map(
        (item, index) => (
            <li
                key={`${index}-${item}`}
                style={{
                    marginTop:
                        index === 0
                            ? undefined
                            : `${Math.max(
                                  0,
                                  Number(itemGap) || 0,
                              )}px`,
                }}
            >
                {item || "List item"}
            </li>
        ),
    );

    return (
        <div
            {...interactionProps}
            style={style}
            className={className}
        >
            {ordered ? (
                <ol
                    start={
                        typeof start === "number"
                            ? start
                            : undefined
                    }
                    style={listStyle}
                >
                    {listItems}
                </ol>
            ) : (
                <ul style={listStyle}>
                    {listItems}
                </ul>
            )}
        </div>
    );
}
