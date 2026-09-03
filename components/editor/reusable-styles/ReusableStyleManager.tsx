"use client";

import { useMemo, useState } from "react";

import { useEditorStore } from "@/store/editorStore";
import {
    getStyleClassUsageCount,
    sanitizeReusableStyles,
} from "./styleClassUtils";

interface ReusableStyleManagerProps {
    onClose?: () => void;
}

export default function ReusableStyleManager({
    onClose,
}: ReusableStyleManagerProps) {
    const project = useEditorStore((state) => state.project);
    const selectedNodeId = useEditorStore(
        (state) => state.selectedNodeId
    );
    const selectedNodeIds = useEditorStore(
        (state) => state.selectedNodeIds
    );
    const addClass = useEditorStore(
        (state) => state.addReusableStyleClass
    );
    const createFromNode = useEditorStore(
        (state) => state.createReusableStyleClassFromNode
    );
    const updateClass = useEditorStore(
        (state) => state.updateReusableStyleClass
    );
    const deleteClass = useEditorStore(
        (state) => state.deleteReusableStyleClass
    );
    const duplicateClass = useEditorStore(
        (state) => state.duplicateReusableStyleClass
    );
    const attach = useEditorStore(
        (state) => state.attachReusableStyleClassToNodes
    );
    const detach = useEditorStore(
        (state) => state.detachReusableStyleClassFromNodes
    );
    const setActive = useEditorStore(
        (state) => state.setActiveReusableStyleId
    );
    const setSelectedNodes = useEditorStore(
        (state) => state.setSelectedNodes
    );

    const [newName, setNewName] = useState("");
    const [search, setSearch] = useState("");

    const classes = useMemo(() => {
        const query = search.trim().toLowerCase();
        return Object.values(project.reusableStyles ?? {})
            .filter((styleClass) =>
                !query
                    ? true
                    : styleClass.name
                        .toLowerCase()
                        .includes(query)
            )
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            );
    }, [project.reusableStyles, search]);

    const primaryNodeId =
        selectedNodeId ?? selectedNodeIds[0] ?? null;

    function createBlank() {
        const requestedName = newName.trim();
        const existingNames = new Set(
            Object.values(project.reusableStyles ?? {}).map(
                (styleClass) => styleClass.name.trim().toLowerCase()
            )
        );

        let name = requestedName || "New Style";
        let counter = 2;

        while (existingNames.has(name.toLowerCase())) {
            name = `New Style ${counter}`;
            counter++;
        }

        addClass(name, {});
        setNewName("");
    }

    function createFromSelection() {
        if (!primaryNodeId) return;

        const suggested =
            project.nodes[primaryNodeId]?.name ||
            "Reusable Style";

        const name =
            newName.trim() ||
            `${suggested} Style`;

        createFromNode(primaryNodeId, name);
        setNewName("");
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                    <div className="text-sm font-semibold text-gray-900">
                        Reusable Styles
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-400">
                        Shared styling for multiple elements
                    </div>
                </div>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                    >
                        Close
                    </button>
                )}
            </div>

            <div className="space-y-3 border-b p-4">
                <input
                    value={newName}
                    onChange={(event) =>
                        setNewName(event.target.value)
                    }
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            createBlank();
                        }
                    }}
                    placeholder="Style class name"
                    className="w-full rounded-md border px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={createBlank}
                        className="rounded-md border px-2 py-2 text-xs font-medium hover:bg-gray-50"
                    >
                        + Blank Style
                    </button>
                    <button
                        type="button"
                        onClick={createFromSelection}
                        disabled={!primaryNodeId}
                        className="rounded-md bg-black px-2 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Create from Selected
                    </button>
                </div>

                <div className="rounded-md bg-blue-50 p-2.5 text-[11px] leading-4 text-blue-700">
                    “Create from Selected” converts the selected element's visual styling into a reusable class and links the element to it.
                </div>

                <input
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search styles..."
                    className="w-full rounded-md border px-2.5 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4">
                {classes.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-5 text-center text-xs text-gray-500">
                        No reusable styles found.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {classes.map((styleClass) => {
                            const usage =
                                getStyleClassUsageCount(
                                    project,
                                    styleClass.id
                                );
                            const selected =
                                !!primaryNodeId &&
                                project.nodes[
                                    primaryNodeId
                                ]?.styleClassIds?.includes(
                                    styleClass.id
                                );

                            const usageNodeIds = Object.values(
                                project.nodes
                            )
                                .filter((node) =>
                                    node.styleClassIds?.includes(
                                        styleClass.id
                                    )
                                )
                                .map((node) => node.id);

                            const selectedDetachNodeIds =
                                selectedNodeIds.length > 0
                                    ? selectedNodeIds.filter((nodeId) =>
                                        project.nodes[nodeId]?.styleClassIds?.includes(
                                            styleClass.id
                                        )
                                    )
                                    : selected
                                        ? [primaryNodeId as string]
                                        : [];

                            return (
                                <div
                                    key={styleClass.id}
                                    className={`rounded-lg border p-3 ${selected ? "border-blue-200 bg-blue-50" : "bg-white"}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="min-w-0 flex-1">
                                            <input
                                                value={styleClass.name}
                                                onChange={(event) =>
                                                    updateClass(
                                                        styleClass.id,
                                                        {
                                                            name: event.target.value,
                                                        }
                                                    )
                                                }
                                                className="w-full bg-transparent text-sm font-semibold outline-none"
                                            />
                                            <div className="mt-1 text-[10px] text-gray-400">
                                                {usage} {usage === 1 ? "element" : "elements"} using this style
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {Object.entries(
                                            sanitizeReusableStyles(
                                                styleClass.styles
                                            )
                                        )
                                            .filter(
                                                ([key]) =>
                                                    key !== "responsive"
                                            )
                                            .slice(0, 4)
                                            .map(([key, value]) => (
                                                <span
                                                    key={key}
                                                    className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500"
                                                >
                                                    {key}: {String(value)}
                                                </span>
                                            ))}
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (primaryNodeId) {
                                                    attach(
                                                        styleClass.id,
                                                        selectedNodeIds.length > 0
                                                            ? selectedNodeIds
                                                            : [primaryNodeId]
                                                    );
                                                }
                                            }}
                                            disabled={!primaryNodeId}
                                            className="rounded border px-2 py-1.5 text-[10px] font-medium hover:bg-gray-50 disabled:opacity-40"
                                        >
                                            Apply to Selected
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                /*
                                                 * The Inspector is element-based, so it needs a
                                                 * real node selection even when the user opened the
                                                 * Styles panel with nothing selected on the canvas.
                                                 * Select every element using this class, then put
                                                 * the class into Inspector editing mode.
                                                 */
                                                if (usageNodeIds.length === 0) {
                                                    window.alert(
                                                        "This style is not used by any element yet. Apply it to an element first, then edit it in the Inspector."
                                                    );
                                                    return;
                                                }

                                                /*
                                                 * Select every element using this class.
                                                 * This gives the Inspector a real multi-selection,
                                                 * so even if a property is edited through the normal
                                                 * element-style path, the change still reaches every
                                                 * class instance. The active class is also set so
                                                 * Inspector edits are written back to the reusable class.
                                                 */
                                                setActive(styleClass.id);
                                                setSelectedNodes(usageNodeIds);
                                                onClose?.();
                                            }}
                                            disabled={usage === 0}
                                            className="rounded bg-black px-2 py-1.5 text-[10px] font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Edit in Inspector
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                duplicateClass(
                                                    styleClass.id
                                                )
                                            }
                                            className="rounded border px-2 py-1.5 text-[10px] font-medium hover:bg-gray-50"
                                        >
                                            Duplicate
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (selectedDetachNodeIds.length > 0) {
                                                    detach(
                                                        styleClass.id,
                                                        selectedDetachNodeIds
                                                    );
                                                }
                                            }}
                                            disabled={
                                                selectedDetachNodeIds.length === 0
                                            }
                                            className="rounded border border-amber-200 px-2 py-1.5 text-[10px] font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Detach Selected
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (usageNodeIds.length === 0) return;

                                                const confirmed = window.confirm(
                                                    `Detach this style from ${usageNodeIds.length} ${usageNodeIds.length === 1 ? "element" : "elements"}? Their current appearance will be preserved.`
                                                );

                                                if (confirmed) {
                                                    detach(
                                                        styleClass.id,
                                                        usageNodeIds
                                                    );
                                                }
                                            }}
                                            disabled={usage === 0}
                                            className="rounded border px-2 py-1.5 text-[10px] font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Detach All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (usage > 0) {
                                                    window.alert(
                                                        "Detach this style from its elements before deleting it."
                                                    );
                                                    return;
                                                }
                                                deleteClass(
                                                    styleClass.id
                                                );
                                            }}
                                            className="rounded border border-red-200 px-2 py-1.5 text-[10px] font-medium text-red-600 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
