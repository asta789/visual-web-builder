"use client";

import { useEffect, useState } from "react";
import type { DesignToken, DesignTokenType } from "@/model/type";
import { DESIGN_TOKEN_TYPES } from "./tokenUtils";

interface TokenEditorProps {
    token?: DesignToken;
    onSave: (
        name: string,
        type: DesignTokenType,
        value: string
    ) => void;
    onCancel?: () => void;
}

const DEFAULT_VALUES: Record<DesignTokenType, string> = {
    color: "#2563eb",
    spacing: "16px",
    fontSize: "16px",
    fontWeight: "400",
    borderRadius: "8px",
    shadow: "0 4px 12px rgba(0,0,0,0.15)",
    custom: "",
};

export default function TokenEditor({
    token,
    onSave,
    onCancel,
}: TokenEditorProps) {
    const [name, setName] = useState(token?.name || "");
    const [type, setType] = useState<DesignTokenType>(
        token?.type || "color"
    );
    const [value, setValue] = useState(
        token?.value || DEFAULT_VALUES.color
    );

    useEffect(() => {
        setName(token?.name || "");
        setType(token?.type || "color");
        setValue(
            token?.value ||
                DEFAULT_VALUES[token?.type || "color"]
        );
    }, [token]);

    function handleTypeChange(nextType: DesignTokenType) {
        setType(nextType);

        if (!token) {
            setValue(DEFAULT_VALUES[nextType]);
        }
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        const trimmedName = name.trim();
        const trimmedValue = value.trim();

        if (!trimmedName || !trimmedValue) {
            return;
        }

        onSave(trimmedName, type, trimmedValue);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border bg-white p-4 shadow-sm"
        >
            <div>
                <div className="text-sm font-semibold text-gray-800">
                    {token ? "Edit Token" : "Create Token"}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                    Give the value a friendly name so you can reuse it
                    throughout your website.
                </p>
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Token Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                        setName(event.target.value)
                    }
                    placeholder="Primary Color"
                    className="w-full rounded-md border px-2.5 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoFocus
                />
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Type
                </label>
                <select
                    value={type}
                    onChange={(event) =>
                        handleTypeChange(
                            event.target.value as DesignTokenType
                        )
                    }
                    className="w-full rounded-md border bg-white px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                    {DESIGN_TOKEN_TYPES.map((item) => (
                        <option
                            key={item.value}
                            value={item.value}
                        >
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Value
                </label>

                {type === "color" ? (
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={
                                /^#[0-9A-Fa-f]{6}$/.test(value)
                                    ? value
                                    : "#2563eb"
                            }
                            onChange={(event) =>
                                setValue(event.target.value)
                            }
                            className="h-10 w-12 cursor-pointer rounded-md border p-0.5"
                        />
                        <input
                            type="text"
                            value={value}
                            onChange={(event) =>
                                setValue(event.target.value)
                            }
                            placeholder="#2563eb"
                            className="min-w-0 flex-1 rounded-md border px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(event) =>
                            setValue(event.target.value)
                        }
                        placeholder={DEFAULT_VALUES[type] || "CSS value"}
                        className="w-full rounded-md border px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                )}

                <p className="mt-1.5 text-[11px] text-gray-400">
                    {DESIGN_TOKEN_TYPES.find(
                        (item) => item.value === type
                    )?.description}
                </p>
            </div>

            <div className="flex gap-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 rounded-md border px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    disabled={!name.trim() || !value.trim()}
                    className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {token ? "Save Changes" : "Add Token"}
                </button>
            </div>
        </form>
    );
}
