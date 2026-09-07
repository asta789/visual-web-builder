import type { TextareaHTMLAttributes, CSSProperties } from "react";

export type BuilderTextareaResize =
    | "none"
    | "horizontal"
    | "vertical"
    | "both";

export interface TextareaElementProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    resize?: BuilderTextareaResize;
}

export default function TextareaElement({
    resize = "vertical",
    style,
    className,
    ...props
}: TextareaElementProps) {
    /*
     * React warns when shorthand border properties and side-specific border
     * properties are present together during rerenders.
     *
     * Remove the shorthand keys completely (rather than setting them to
     * undefined) and convert their values into per-side properties.
     */
    const {
        borderStyle,
        borderWidth,
        borderColor,
        borderTopStyle,
        borderRightStyle,
        borderBottomStyle,
        borderLeftStyle,
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth,
        borderLeftWidth,
        borderTopColor,
        borderRightColor,
        borderBottomColor,
        borderLeftColor,
        ...safeStyle
    } = style ?? {};

    const textareaStyle: CSSProperties = {
        ...safeStyle,

        boxSizing: "border-box",
        pointerEvents: "none",
        resize,

        // Border style — side-specific only.
        borderTopStyle: (
            borderTopStyle ?? borderStyle
        ) as CSSProperties["borderTopStyle"],
        borderRightStyle: (
            borderRightStyle ?? borderStyle
        ) as CSSProperties["borderRightStyle"],
        borderBottomStyle: (
            borderBottomStyle ?? borderStyle
        ) as CSSProperties["borderBottomStyle"],
        borderLeftStyle: (
            borderLeftStyle ?? borderStyle
        ) as CSSProperties["borderLeftStyle"],

        // Border width — side-specific only.
        borderTopWidth:
            borderTopWidth ?? borderWidth,
        borderRightWidth:
            borderRightWidth ?? borderWidth,
        borderBottomWidth:
            borderBottomWidth ?? borderWidth,
        borderLeftWidth:
            borderLeftWidth ?? borderWidth,

        // Border color — side-specific only.
        borderTopColor:
            borderTopColor ?? borderColor,
        borderRightColor:
            borderRightColor ?? borderColor,
        borderBottomColor:
            borderBottomColor ?? borderColor,
        borderLeftColor:
            borderLeftColor ?? borderColor,
    };

    return (
        <textarea
            {...props}
            style={textareaStyle}
            className={className}
            aria-label="Textarea element preview"
        />
    );
}
