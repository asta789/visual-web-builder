import type {
    CSSProperties,
    LabelHTMLAttributes,
} from "react";

export interface RadioOption {
    label: string;
    value?: string;
    checked?: boolean;
}

type RadioElementProps =
    Omit<
        LabelHTMLAttributes<HTMLDivElement>,
        "style"
    > & {
        options: RadioOption[];
        name?: string;
        required?: boolean;
        disabled?: boolean;
        style?: CSSProperties;
        className?: string;
    };

export default function RadioElement({
    options,
    name,
    required = false,
    disabled = false,
    style,
    className,
    ...containerProps
}: RadioElementProps) {
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

    const normalizedOptions =
        options.length > 0
            ? options
            : [{ label: "Option 1", value: "option-1", checked: false }];

    return (
        <div
            {...containerProps}
            className={className}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                width: "100%",
                minHeight: "40px",
                boxSizing: "border-box",
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
            {normalizedOptions.map((option, index) => (
                <label
                    key={`${option.value ?? "radio"}-${index}`}
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
                    }}
                >
                    <input
                        type="radio"
                        value={option.value}
                        name={name || undefined}
                        checked={option.checked ?? false}
                        required={required}
                        disabled={disabled}
                        readOnly
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
                        {option.label}
                    </span>
                </label>
            ))}
        </div>
    );
}
