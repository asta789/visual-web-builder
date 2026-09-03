"use client";

import { useEditorStore } from "@/store/editorStore";

export default function MultiSelectionBar() {
    const selectedNodeIds = useEditorStore(
        (state) => state.selectedNodeIds
    );

    const selectAllNodes = useEditorStore(
        (state) => state.selectAllNodes
    );

    const clearSelection = useEditorStore(
        (state) => state.clearSelection
    );

    if (selectedNodeIds.length <= 1) {
        return null;
    }

    return (
        <div
            className="
                flex
                shrink-0
                items-center
                gap-2
                border-b
                border-blue-100
                bg-blue-50
                px-3
                py-2
                text-xs
                text-blue-800
            "
        >
            <span className="font-semibold">
                {selectedNodeIds.length} elements selected
            </span>

            <span className="text-blue-600">
                Style changes will apply to all selected elements.
            </span>

            <div className="ml-auto flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={selectAllNodes}
                    className="
                        rounded-md
                        border
                        border-blue-200
                        bg-white
                        px-2.5
                        py-1
                        font-medium
                        hover:bg-blue-100
                    "
                >
                    Select All
                </button>

                <button
                    type="button"
                    onClick={clearSelection}
                    className="
                        rounded-md
                        border
                        border-blue-200
                        bg-white
                        px-2.5
                        py-1
                        font-medium
                        hover:bg-blue-100
                    "
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
