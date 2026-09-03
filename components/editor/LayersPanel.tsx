"use client";

import { useState } from "react";
import { ProjectNode } from "@/model/type";
import { useEditorStore } from "@/store/editorStore";

/* =========================================================
   LAYER ITEM
========================================================= */

interface LayerItemProps {
    node: ProjectNode;
    depth: number;
}

type DropPosition =
    | "before"
    | "after"
    | null;

function LayerItem({
    node,
    depth,
}: LayerItemProps) {
    const [expanded, setExpanded] =
        useState(true);

    const [dropPosition, setDropPosition] =
        useState<DropPosition>(null);

    const project =
        useEditorStore(
            (state) => state.project
        );

    const selectedNodeIds =
        useEditorStore(
            (state) =>
                state.selectedNodeIds
        );

    const selectNode =
        useEditorStore(
            (state) =>
                state.selectNode
        );

    const toggleNodeSelection =
        useEditorStore(
            (state) =>
                state.toggleNodeSelection
        );

    const moveNode =
        useEditorStore(
            (state) =>
                state.moveNode
        );

    const isSelected =
        selectedNodeIds.includes(node.id);

    const children =
        (node.children ?? [])
            .map(
                (childId) =>
                    project.nodes[
                    childId
                    ]
            )
            .filter(
                (
                    child
                ): child is ProjectNode =>
                    Boolean(child)
            );

    const hasChildren =
        children.length > 0;

    /* =====================================================
       SELECT
    ===================================================== */

    const handleSelect = (
        event: React.MouseEvent
    ) => {
        if (
            event.ctrlKey ||
            event.metaKey
        ) {
            toggleNodeSelection(node.id);
            return;
        }

        selectNode(node.id);
    };

    /* =====================================================
       EXPAND / COLLAPSE
    ===================================================== */

    const handleToggle = (
        event: React.MouseEvent
    ) => {
        event.stopPropagation();

        setExpanded(
            (current) => !current
        );
    };

    /* =====================================================
       DRAG START
    ===================================================== */

    const handleDragStart = (
        event: React.DragEvent
    ) => {
        event.dataTransfer.setData(
            "text/plain",
            node.id
        );

        event.dataTransfer.effectAllowed =
            "move";
    };

    /* =====================================================
       DRAG OVER
    ===================================================== */

    const handleDragOver = (
        event: React.DragEvent
    ) => {
        event.preventDefault();
        event.stopPropagation();

        const draggedNodeId =
            event.dataTransfer.getData(
                "text/plain"
            );

        if (!draggedNodeId) {
            return;
        }

        /*
         * A node cannot be dropped
         * onto itself.
         */
        if (
            draggedNodeId ===
            node.id
        ) {
            setDropPosition(null);
            return;
        }

        /*
         * Structural nodes can receive
         * children.
         */
        const canReceiveChildren =
            node.type === "page" ||
            node.type === "section" ||
            node.type === "container" ||
            node.type === "navbar";

        /*
         * Dropping on a structural node
         * means moving inside it.
         */
        if (canReceiveChildren) {
            setDropPosition(null);
            return;
        }

        /*
         * Text / Button / Image:
         *
         * Determine whether the user is
         * dropping above or below.
         */
        const rect =
            event.currentTarget.getBoundingClientRect();

        const middle =
            rect.top +
            rect.height / 2;

        if (
            event.clientY < middle
        ) {
            setDropPosition(
                "before"
            );
        } else {
            setDropPosition(
                "after"
            );
        }
    };

    /* =====================================================
       DRAG LEAVE
    ===================================================== */

    const handleDragLeave = () => {
        setDropPosition(null);
    };

    /* =====================================================
       DROP
    ===================================================== */

    const handleDrop = (
        event: React.DragEvent
    ) => {
        event.preventDefault();
        event.stopPropagation();

        const draggedNodeId =
            event.dataTransfer.getData(
                "text/plain"
            );

        if (!draggedNodeId) {
            setDropPosition(null);
            return;
        }

        /*
         * Prevent dropping onto itself.
         */
        if (
            draggedNodeId ===
            node.id
        ) {
            setDropPosition(null);
            return;
        }

        /* =================================================
           CASE 1
           DROP ON STRUCTURAL NODE

           Move inside node.
        ================================================= */

        const canReceiveChildren =
            node.type === "page" ||
            node.type === "section" ||
            node.type === "container" ||
            node.type === "navbar";

        if (canReceiveChildren) {
            moveNode(
                draggedNodeId,
                node.id
            );

            setExpanded(true);
            setDropPosition(null);

            return;
        }

        /* =================================================
           CASE 2
           DROP ON TEXT / BUTTON / IMAGE

           Reorder as sibling.
        ================================================= */

        const parentId =
            node.parentId;

        /*
         * Root cannot be reordered.
         */
        if (!parentId) {
            setDropPosition(null);
            return;
        }

        const parent =
            project.nodes[
            parentId
            ];

        if (!parent) {
            setDropPosition(null);
            return;
        }

        const siblings = [
            ...(parent.children ?? []),
        ];

        const targetIndex =
            siblings.indexOf(
                node.id
            );

        if (
            targetIndex === -1
        ) {
            setDropPosition(null);
            return;
        }

        const draggedIndex =
            siblings.indexOf(
                draggedNodeId
            );

        let newIndex =
            targetIndex;

        /* =================================================
           INSERT BEFORE
        ================================================= */

        if (
            dropPosition ===
            "before"
        ) {
            newIndex =
                targetIndex;

            /*
             * If dragged node is already
             * before target, removing it
             * shifts target left.
             */
            if (
                draggedIndex !== -1 &&
                draggedIndex <
                targetIndex
            ) {
                newIndex =
                    targetIndex - 1;
            }
        }

        /* =================================================
           INSERT AFTER
        ================================================= */

        if (
            dropPosition ===
            "after"
        ) {
            newIndex =
                targetIndex + 1;

            /*
             * If dragged node is already
             * before target, account for
             * its removal.
             */
            if (
                draggedIndex !== -1 &&
                draggedIndex <
                targetIndex
            ) {
                newIndex =
                    targetIndex;
            }
        }

        /*
         * Perform sibling move.
         */
        moveNode(
            draggedNodeId,
            parentId,
            newIndex
        );

        setDropPosition(null);
    };

    /* =====================================================
       DRAG END
    ===================================================== */

    const handleDragEnd = () => {
        setDropPosition(null);
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div>
            <div
                className="relative"
                style={{
                    paddingLeft:
                        `${8 + depth * 16}px`,
                }}
            >
                {/* =================================================
                    BEFORE INDICATOR
                ================================================= */}

                {dropPosition ===
                    "before" && (
                        <div
                            className="
                            pointer-events-none
                            absolute
                            left-2
                            right-2
                            top-0
                            z-20
                            h-0.5
                            bg-blue-500
                        "
                        />
                    )}

                {/* =================================================
                    NODE ROW
                ================================================= */}

                <div
                    draggable={
                        node.type !==
                        "page"
                    }
                    onClick={
                        handleSelect
                    }
                    onDragStart={
                        handleDragStart
                    }
                    onDragOver={
                        handleDragOver
                    }
                    onDragLeave={
                        handleDragLeave
                    }
                    onDrop={
                        handleDrop
                    }
                    onDragEnd={
                        handleDragEnd
                    }
                    className={`
                        relative
                        flex
                        items-center
                        gap-1
                        rounded-md
                        px-2
                        py-1.5
                        text-sm
                        cursor-pointer
                        select-none
                        transition-colors
                        ${isSelected
                            ? "bg-blue-500/20 text-blue-400"
                            : "text-gray-300 hover:bg-gray-800"
                        }
                    `}
                >
                    {/* =================================================
                        EXPAND BUTTON
                    ================================================= */}

                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={
                                handleToggle
                            }
                            className="
                                flex
                                h-5
                                w-5
                                shrink-0
                                items-center
                                justify-center
                                rounded
                                text-gray-400
                                hover:bg-gray-700
                            "
                        >
                            {expanded
                                ? "▾"
                                : "▸"}
                        </button>
                    ) : (
                        <span
                            className="
                                h-5
                                w-5
                                shrink-0
                            "
                        />
                    )}

                    {/* =================================================
                        NODE ICON
                    ================================================= */}

                    <span
                        className="
                            flex
                            h-5
                            w-5
                            shrink-0
                            items-center
                            justify-center
                            text-xs
                            text-gray-500
                        "
                    >
                        {getNodeIcon(
                            node.type
                        )}
                    </span>

                    {/* =================================================
                        NODE NAME
                    ================================================= */}

                    <span className="truncate">
                        {node.name ??
                            node.type}
                    </span>
                </div>

                {/* =================================================
                    AFTER INDICATOR
                ================================================= */}

                {dropPosition ===
                    "after" && (
                        <div
                            className="
                            pointer-events-none
                            absolute
                            bottom-0
                            left-2
                            right-2
                            z-20
                            h-0.5
                            bg-blue-500
                        "
                        />
                    )}
            </div>

            {/* =================================================
                CHILDREN
            ================================================= */}

            {expanded &&
                hasChildren && (
                    <div>
                        {children.map(
                            (child) => (
                                <LayerItem
                                    key={
                                        child.id
                                    }
                                    node={
                                        child
                                    }
                                    depth={
                                        depth +
                                        1
                                    }
                                />
                            )
                        )}
                    </div>
                )}
        </div>
    );
}

/* =========================================================
   NODE ICON
========================================================= */

function getNodeIcon(
    type: ProjectNode["type"]
): string {
    switch (type) {
        case "page":
            return "▣";

        case "section":
            return "▤";

        case "container":
            return "□";

        case "text":
            return "T";

        case "button":
            return "▭";

        case "image":
            return "▧";

        default:
            return "•";
    }
}

/* =========================================================
   LAYERS PANEL
========================================================= */

export default function LayersPanel() {
    const project =
        useEditorStore(
            (state) =>
                state.project
        );

    /*
     * =====================================================
     * ACTIVE PAGE
     *
     * IMPORTANT:
     * Do NOT search all project.nodes for a root node.
     *
     * Each page owns its own rootNodeId.
     * =====================================================
     */

    const activePage =
        project.pages[
        project.activePageId
        ];

    const rootNode =
        activePage
            ? project.nodes[
            activePage.rootNodeId
            ]
            : undefined;

    if (!activePage || !rootNode) {
        return (
            <aside
                className="
                    flex
                    h-full
                    w-full
                    flex-col
                    border-r
                    border-gray-800
                    bg-gray-950
                "
            >
                <div
                    className="
                        flex
                        h-10
                        shrink-0
                        items-center
                        border-b
                        border-gray-800
                        px-3
                    "
                >
                    <span
                        className="
                            text-sm
                            font-medium
                            text-gray-200
                        "
                    >
                        Layers
                    </span>
                </div>

                <div
                    className="
                        p-3
                        text-sm
                        text-gray-500
                    "
                >
                    No layers
                </div>
            </aside>
        );
    }

    return (
        <aside
            className="
                flex
                h-full
                w-full
                flex-col
                border-r
                border-gray-800
                bg-gray-950
            "
        >
            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    flex
                    h-10
                    shrink-0
                    items-center
                    border-b
                    border-gray-800
                    px-3
                "
            >
                <span
                    className="
                        text-sm
                        font-medium
                        text-gray-200
                    "
                >
                    Layers
                </span>
            </div>

            {/* =================================================
                TREE
            ================================================= */}

            <div
                className="
                    flex-1
                    overflow-y-auto
                    overflow-x-hidden
                    p-1
                "
            >
                <LayerItem
                    node={rootNode}
                    depth={0}
                />
            </div>
        </aside>
    );
}
