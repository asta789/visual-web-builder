"use client";

import type { DesignToken, DesignTokenType } from "@/model/type";
import {
    DESIGN_TOKEN_TYPES,
    getTokenCssValue,
} from "./tokenUtils";

interface TokenPickerProps {
    tokens: Record<string, DesignToken>;
    allowedTypes?: DesignTokenType[];
    value?: string;
    onSelect: (value: string) => void;
    onClear?: () => void;
    label?: string;
}

export default function TokenPicker({
    tokens,
    allowedTypes,
    value,
    onSelect,
    onClear,
    label = "Design Token",
}: TokenPickerProps) {
    const availableTokens = Object.values(tokens).filter(
        (token) =>
            !allowedTypes ||
            allowedTypes.includes(token.type) ||
            token.type === "custom"
    );

    const selectedToken = availableTokens.find(
        (token) => getTokenCssValue(token) === value
    );

    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                {label}
            </label>

            <div className="flex gap-2">
                <select
                    value={selectedToken?.id || ""}
                    onChange={(event) => {
                        const token = availableTokens.find(
                            (item) =>
                                item.id === event.target.value
                        );

                        if (token) {
                            onSelect(getTokenCssValue(token));
                        }
                    }}
                    className="min-w-0 flex-1 rounded-md border bg-white px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                    <option value="">
                        Use Design Token...
                    </option>

                    {availableTokens.map((token) => (
                        <option
                            key={token.id}
                            value={token.id}
                        >
                            {token.name}
                        </option>
                    ))}
                </select>

                {onClear && value && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="rounded-md border px-2.5 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-50"
                        title="Clear token"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
