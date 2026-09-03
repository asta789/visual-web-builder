"use client";

import { useMemo, useState } from "react";
import type { DesignToken, DesignTokenType } from "@/model/type";
import { useEditorStore } from "@/store/editorStore";
import TokenEditor from "./TokenEditor";
import {
    DESIGN_TOKEN_TYPES,
    findTokenUsage,
    getTokenCssValue,
    getTokenCssVariableName,
    tokenTypeLabel,
} from "./tokenUtils";

export default function DesignTokenManager() {
    const project = useEditorStore((state) => state.project);
    const addDesignToken = useEditorStore(
        (state) => state.addDesignToken
    );
    const updateDesignToken = useEditorStore(
        (state) => state.updateDesignToken
    );
    const deleteDesignToken = useEditorStore(
        (state) => state.deleteDesignToken
    );

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<
        DesignTokenType | "all"
    >("all");
    const [editingTokenId, setEditingTokenId] =
        useState<string | null>(null);
    const [showCreator, setShowCreator] = useState(false);
    const [message, setMessage] = useState("");

    const tokens = project.designTokens || {};

    const filteredTokens = useMemo(() => {
        const query = search.trim().toLowerCase();

        return Object.values(tokens)
            .filter((token) => {
                const matchesSearch =
                    !query ||
                    token.name.toLowerCase().includes(query) ||
                    token.value.toLowerCase().includes(query);

                const matchesType =
                    filter === "all" || token.type === filter;

                return matchesSearch && matchesType;
            })
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            );
    }, [tokens, search, filter]);

    const editingToken = editingTokenId
        ? tokens[editingTokenId]
        : undefined;

    function showTemporaryMessage(text: string) {
        setMessage(text);
        window.setTimeout(() => {
            setMessage((current) =>
                current === text ? "" : current
            );
        }, 2500);
    }

    function handleAdd(
        name: string,
        type: DesignTokenType,
        value: string
    ) {
        const before = Object.keys(tokens).length;
        addDesignToken(name, type, value);
        const after = Object.keys(
            useEditorStore.getState().project.designTokens || {}
        ).length;

        if (after > before) {
            setShowCreator(false);
            showTemporaryMessage("Token created.");
        } else {
            showTemporaryMessage(
                "A token with that name already exists."
            );
        }
    }

    function handleUpdate(
        name: string,
        type: DesignTokenType,
        value: string
    ) {
        if (!editingTokenId) {
            return;
        }

        updateDesignToken(editingTokenId, {
            name,
            type,
            value,
        });

        setEditingTokenId(null);
        showTemporaryMessage("Token updated.");
    }

    function handleDelete(token: DesignToken) {
        const usage = findTokenUsage(
            project,
            token.id
        );

        if (usage.length > 0) {
            showTemporaryMessage(
                `Cannot delete "${token.name}" because it is used by ${usage.length} element${usage.length === 1 ? "" : "s"}.`
            );
            return;
        }

        deleteDesignToken(token.id);
        showTemporaryMessage("Token deleted.");
    }

    return (
        <div className="flex h-full min-h-0 flex-col bg-gray-50">
            <div className="border-b bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-base font-semibold text-gray-800">
                            Design Tokens
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            Reusable values for colors, spacing,
                            typography and effects.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setShowCreator(true);
                            setEditingTokenId(null);
                        }}
                        className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                    >
                        + Add Token
                    </button>
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search tokens..."
                        className="min-w-0 rounded-md border bg-white px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    <select
                        value={filter}
                        onChange={(event) =>
                            setFilter(
                                event.target.value as
                                    | DesignTokenType
                                    | "all"
                            )
                        }
                        className="rounded-md border bg-white px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">All Types</option>
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
            </div>

            {message && (
                <div className="border-b bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700">
                    {message}
                </div>
            )}

            {showCreator && (
                <div className="border-b p-4">
                    <TokenEditor
                        onSave={handleAdd}
                        onCancel={() =>
                            setShowCreator(false)
                        }
                    />
                </div>
            )}

            {editingToken && (
                <div className="border-b p-4">
                    <TokenEditor
                        token={editingToken}
                        onSave={handleUpdate}
                        onCancel={() =>
                            setEditingTokenId(null)
                        }
                    />
                </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {filteredTokens.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white p-8 text-center">
                        <div className="text-2xl">🎨</div>
                        <div className="mt-2 text-sm font-semibold text-gray-700">
                            No design tokens yet
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            Create your first reusable value to
                            start building a consistent design system.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowCreator(true)}
                            className="mt-4 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                            Create First Token
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTokens.map((token) => {
                            const usage = findTokenUsage(
                                project,
                                token.id
                            );

                            return (
                                <div
                                    key={token.id}
                                    className="rounded-xl border bg-white p-3 shadow-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        {token.type === "color" ? (
                                            <div
                                                className="h-10 w-10 shrink-0 rounded-lg border"
                                                style={{
                                                    background:
                                                        token.value,
                                                }}
                                                title={token.value}
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-gray-50 text-sm">
                                                {token.type ===
                                                "shadow"
                                                    ? "✦"
                                                    : token.type ===
                                                      "spacing"
                                                    ? "↔"
                                                    : "Aa"}
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate text-sm font-semibold text-gray-800">
                                                    {token.name}
                                                </span>
                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                                                    {tokenTypeLabel(
                                                        token.type
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-1 break-all font-mono text-[11px] text-gray-400">
                                                {token.value}
                                            </div>

                                            <div className="mt-1 text-[10px] text-gray-300">
                                                {getTokenCssValue(
                                                    token
                                                )}
                                            </div>

                                            {usage.length > 0 && (
                                                <div className="mt-2 text-[10px] text-blue-500">
                                                    Used by{" "}
                                                    {usage.length}{" "}
                                                    element
                                                    {usage.length === 1
                                                        ? ""
                                                        : "s"}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 gap-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingTokenId(
                                                        token.id
                                                    );
                                                    setShowCreator(
                                                        false
                                                    );
                                                }}
                                                className="rounded-md border px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(
                                                        token
                                                    )
                                                }
                                                className="rounded-md border px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="border-t bg-white px-4 py-3">
                <div className="text-[11px] font-medium text-gray-500">
                    {Object.keys(tokens).length} token
                    {Object.keys(tokens).length === 1 ? "" : "s"}
                </div>
                <p className="mt-1 text-[10px] text-gray-400">
                    Token references stay connected even if you rename
                    the token.
                </p>
            </div>
        </div>
    );
}
