import type {
    CSSProperties,
    LabelHTMLAttributes,
} from "react";

type CheckboxElementProps =
    Omit<
        LabelHTMLAttributes<HTMLLabelElement>,
        "style"
    > & {
        label: string;
        value?: string;
        name?: string;
        checked?: boolean;
        required?: boolean;
        disabled?: boolean;
        style?: CSSProperties;
        className?: string;
        onCheckedChange?: (
            checked: boolean
        ) => void;
    };

export default function CheckboxElement({
    label,
    value,
    name,
    checked = false,
    required = false,
    disabled = false,
    style,
    className,
    onCheckedChange,
    ...labelProps
}: CheckboxElementProps) {
    /*
     * Keep border shorthand and per-side border properties
     * separate to avoid React warnings when both forms are
     * present during rerenders.
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

    return (
        <label
            {...labelProps}
            className={className}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",

                width: "100%",
                minHeight: "40px",

                boxSizing: "border-box",

                cursor: disabled
                    ? "not-allowed"
                    : "pointer",

                ...safeStyle,

                borderStyle:
                    borderStyle as CSSProperties["borderStyle"],
                borderWidth:
                    borderWidth,
                borderColor:
                    borderColor,

                borderTopStyle:
                    (borderTopStyle ?? borderStyle) as CSSProperties["borderTopStyle"],
                borderRightStyle:
                    (borderRightStyle ?? borderStyle) as CSSProperties["borderRightStyle"],
                borderBottomStyle:
                    (borderBottomStyle ?? borderStyle) as CSSProperties["borderBottomStyle"],
                borderLeftStyle:
                    (borderLeftStyle ?? borderStyle) as CSSProperties["borderLeftStyle"],

                borderTopWidth:
                    borderTopWidth ?? borderWidth,
                borderRightWidth:
                    borderRightWidth ?? borderWidth,
                borderBottomWidth:
                    borderBottomWidth ?? borderWidth,
                borderLeftWidth:
                    borderLeftWidth ?? borderWidth,

                borderTopColor:
                    borderTopColor ?? borderColor,
                borderRightColor:
                    borderRightColor ?? borderColor,
                borderBottomColor:
                    borderBottomColor ?? borderColor,
                borderLeftColor:
                    borderLeftColor ?? borderColor,
            }}
        >
            <input
                type="checkbox"
                value={value}
                name={name || undefined}
                checked={checked}
                required={required}
                disabled={disabled}
                onChange={(event) => {
                    onCheckedChange?.(
                        event.target.checked
                    );
                }}
                style={{
                    width: "18px",
                    height: "18px",
                    flexShrink: 0,
                    margin: 0,
                    cursor: disabled
                        ? "not-allowed"
                        : "pointer",
                    accentColor: "currentColor",
                }}
            />

            <span>
                {label}
            </span>
        </label>
    );
}