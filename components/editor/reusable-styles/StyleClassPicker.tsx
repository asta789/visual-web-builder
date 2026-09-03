"use client";

import { useEditorStore } from "@/store/editorStore";
import { nodeUsesStyleClass } from "./styleClassUtils";

interface StyleClassPickerProps {
    compact?: boolean;
}

export default function StyleClassPicker({
    compact = false,
}: StyleClassPickerProps) {
    const project = useEditorStore((state) => state.project);
    const selectedNodeId = useEditorStore(
        (state) => state.selectedNodeId
    );
    const selectedNodeIds = useEditorStore(
        (state) => state.selectedNodeIds
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

    const nodeIds =
        selectedNodeIds.length > 0
            ? selectedNodeIds
            : selectedNodeId
              ? [selectedNodeId]
              : [];

    const classes = Object.values(
        project.reusableStyles ?? {}
    );

    if (nodeIds.length === 0) {
        return (
            <div className="rounded-md border border-dashed bg-gray-50 p-3 text-xs text-gray-500">
                Select an element to use a reusable style class.
            </div>
        );
    }

    return (
        <div className={compact ? "space-y-2" : "space-y-3"}>
            {classes.length === 0 ? (
                <div className="rounded-md border border-dashed bg-gray-50 p-3 text-xs text-gray-500">
                    No reusable style classes yet. Create one from the Styles manager.
                </div>
            ) : (
                <div className="space-y-1.5">
                    {classes.map((styleClass) => {
                        const primaryNode =
                            project.nodes[nodeIds[0]];
                        const checked = nodeUsesStyleClass(
                            primaryNode,
                            styleClass.id
                        );
                        const allChecked = nodeIds.every((id) =>
                            nodeUsesStyleClass(
                                project.nodes[id],
                                styleClass.id
                            )
                        );

                        return (
                            <div
                                key={styleClass.id}
                                className="flex items-center gap-2 rounded-md border bg-white px-2.5 py-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={allChecked}
                                    ref={(element) => {
                                        if (element) {
                                            element.indeterminate =
                                                checked && !allChecked;
                                        }
                                    }}
                                    onChange={(event) => {
                                        if (event.target.checked) {
                                            attach(
                                                styleClass.id,
                                                nodeIds
                                            );
                                        } else {
                                            detach(
                                                styleClass.id,
                                                nodeIds
                                            );
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setActive(styleClass.id)
                                    }
                                    className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:text-blue-600"
                                    title="Edit this reusable style in the inspector"
                                >
                                    {styleClass.name}
                                </button>

                                <span className="shrink-0 text-[10px] text-gray-400">
                                    {nodeIds.filter((id) =>
                                        nodeUsesStyleClass(
                                            project.nodes[id],
                                            styleClass.id
                                        )
                                    ).length}/{nodeIds.length}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
