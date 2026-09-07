import type {
    CSSProperties,
    SelectHTMLAttributes,
} from "react";

export interface BuilderSelectOption {
    label: string;
    value: string;
}

export interface SelectElementProps
    extends Omit<
        SelectHTMLAttributes<HTMLSelectElement>,
        "value" | "defaultValue" | "multiple" | "onChange"
    > {
    options?: BuilderSelectOption[];
    value?: string;
    placeholder?: string;
    multiple?: boolean;
    style?: CSSProperties;
    className?: string;
}

/*
 * Native Select renderer.
 *
 * The editor owns interaction/selection on the outer wrapper.
 * This component is responsible only for rendering the native
 * <select> and applying the resolved visual styles.
 */
export default function SelectElement({
    options = [],
    value = "",
    placeholder,
    multiple = false,
    style,
    className,
    ...props
}: SelectElementProps) {
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

    const selectValue = multiple
        ? value
            ? [value]
            : []
        : value;

    return (
        <select
            {...props}
            value={selectValue}
            multiple={multiple}
            className={className}
            style={{
                width: "100%",
                height: "100%",
                minWidth: 0,
                minHeight: 0,
                boxSizing: "border-box",

                ...safeStyle,

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

                userSelect: "none",
            }}
        >
            {placeholder && !multiple && (
                <option
                    value=""
                    disabled
                >
                    {placeholder}
                </option>
            )}

            {options.map((option, index) => (
                <option
                    key={`${option.value}-${index}`}
                    value={option.value}
                >
                    {option.label}
                </option>
            ))}
        </select>
    );
}
