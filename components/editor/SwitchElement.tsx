"use client";

import type {
    CSSProperties,
    InputHTMLAttributes,
    LabelHTMLAttributes,
} from "react";
import type * as React from "react";

export interface SwitchElementProps
    extends Omit<
        React.LabelHTMLAttributes<HTMLLabelElement>,
        "style" | "onChange"
    > {
    label?: string;
    name?: string;
    value?: string;
    checked?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    disabled?: boolean;
    required?: boolean;
    inputProps?: Omit<
        InputHTMLAttributes<HTMLInputElement>,
        "type" | "name" | "value" | "checked" | "onChange" | "disabled" | "required"
    >;
    style?: CSSProperties;
}

export default function SwitchElement({
    label = "Toggle",
    name,
    value = "on",
    checked = false,
    onChange,
    disabled = false,
    required = false,
    inputProps,
    style,
    className,
    ...labelProps
}: SwitchElementProps) {
    return (
        <label
            {...labelProps}
            className={className}
            style={{
                ...style,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxSizing: "border-box",
                cursor: disabled ? "not-allowed" : "pointer",
            }}
        >
            <span
                style={{
                    position: "relative",
                    display: "inline-flex",
                    width: "42px",
                    height: "24px",
                    flex: "0 0 auto",
                }}
            >
                <input
                    {...inputProps}
                    type="checkbox"
                    role="switch"
                    name={name}
                    value={value}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        margin: 0,
                        opacity: 0,
                        cursor: disabled ? "not-allowed" : "pointer",
                    }}
                />

                <span
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "999px",
                        backgroundColor: checked ? "currentColor" : "#d1d5db",
                        transition: "background-color 150ms ease",
                        pointerEvents: "none",
                    }}
                >
                    <span
                        style={{
                            position: "absolute",
                            top: "3px",
                            left: checked ? "21px" : "3px",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                            transition: "left 150ms ease",
                        }}
                    />
                </span>
            </span>

            {label ? <span>{label}</span> : null}
        </label>
    );
}
