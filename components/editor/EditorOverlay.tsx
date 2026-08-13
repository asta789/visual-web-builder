"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { useEditorStore } from "@/store/editorStore";

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
}

type ResizeDirection =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

interface ResizeState {
    direction: ResizeDirection;

    startX: number;
    startY: number;

    startWidth: number;
    startHeight: number;

    startLeft: number;
    startTop: number;
}

interface DragState {
    startX: number;
    startY: number;

    startLeft: number;
    startTop: number;

    hasMoved: boolean;
}

export default function EditorOverlay() {
    const selectedNodeId =
        useEditorStore(
            (state) =>
                state.selectedNodeId
        );

    const updateNodeStyles =
        useEditorStore(
            (state) =>
                state.updateNodeStyles
        );

    const beginHistoryTransaction =
        useEditorStore(
            (state) =>
                state.beginHistoryTransaction
        );

    const endHistoryTransaction =
        useEditorStore(
            (state) =>
                state.endHistoryTransaction
        );

    const cancelHistoryTransaction =
        useEditorStore(
            (state) =>
                state.cancelHistoryTransaction
        );

    const [rect, setRect] =
        useState<Rect | null>(null);

    const resizeState =
        useRef<ResizeState | null>(
            null
        );

    const dragState =
        useRef<DragState | null>(
            null
        );

    const isResizing =
        useRef(false);

    const isDragging =
        useRef(false);

    /*
     * ============================================================
     * RECTANGLE
     * ============================================================
     */

    function updateRect() {
        if (!selectedNodeId) {
            setRect(null);
            return;
        }

        const element =
            document.querySelector(
                `[data-node-id="${selectedNodeId}"]`
            );

        if (!element) {
            setRect(null);
            return;
        }

        const bounds =
            element.getBoundingClientRect();

        setRect({
            top: bounds.top,
            left: bounds.left,
            width: bounds.width,
            height: bounds.height,
        });
    }

    /*
     * Update rectangle whenever
     * selection changes.
     */
    useEffect(() => {
        updateRect();
    }, [selectedNodeId]);

    /*
     * Keep overlay synchronized
     * with scrolling and resizing.
     */
    useEffect(() => {
        window.addEventListener(
            "resize",
            updateRect
        );

        window.addEventListener(
            "scroll",
            updateRect,
            true
        );

        return () => {
            window.removeEventListener(
                "resize",
                updateRect
            );

            window.removeEventListener(
                "scroll",
                updateRect,
                true
            );
        };
    }, [selectedNodeId]);

    /*
     * ============================================================
     * DRAGGING
     * ============================================================
     */

    function handleDragStart(
        event: React.PointerEvent
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (
            !selectedNodeId ||
            !rect ||
            isResizing.current
        ) {
            return;
        }

        const node =
            useEditorStore.getState()
                .project.nodes[
            selectedNodeId
            ];

        if (!node) {
            return;
        }

        const currentLeft =
            parseFloat(
                node.styles?.left ?? "0"
            ) || 0;

        const currentTop =
            parseFloat(
                node.styles?.top ?? "0"
            ) || 0;

        /*
         * Start one history transaction.
         *
         * All style updates generated
         * during this drag will belong
         * to this single transaction.
         */
        beginHistoryTransaction();

        isDragging.current = true;

        dragState.current = {
            startX: event.clientX,
            startY: event.clientY,

            startLeft: currentLeft,
            startTop: currentTop,

            hasMoved: false,
        };

        (
            event.currentTarget as HTMLElement
        ).setPointerCapture(
            event.pointerId
        );
    }

    function handleDragMove(
        event: React.PointerEvent
    ) {
        if (
            !isDragging.current ||
            !dragState.current ||
            !selectedNodeId
        ) {
            return;
        }

        const state =
            dragState.current;

        const deltaX =
            event.clientX -
            state.startX;

        const deltaY =
            event.clientY -
            state.startY;

        /*
         * Ignore extremely small pointer
         * movements caused by mouse noise.
         */
        if (
            Math.abs(deltaX) < 1 &&
            Math.abs(deltaY) < 1
        ) {
            return;
        }

        state.hasMoved = true;

        const newLeft =
            state.startLeft +
            deltaX;

        const newTop =
            state.startTop +
            deltaY;

        updateNodeStyles(
            selectedNodeId,
            {
                position: "relative",

                left: `${Math.round(
                    newLeft
                )}px`,

                top: `${Math.round(
                    newTop
                )}px`,
            }
        );

        requestAnimationFrame(
            updateRect
        );
    }

    function handleDragEnd(
        event: React.PointerEvent
    ) {
        if (!isDragging.current) {
            return;
        }

        const moved =
            dragState.current?.hasMoved ??
            false;

        isDragging.current = false;

        dragState.current = null;

        try {
            (
                event.currentTarget as HTMLElement
            ).releasePointerCapture(
                event.pointerId
            );
        } catch {
            /*
             * Pointer capture may already
             * have been released.
             */
        }

        /*
         * If the element actually moved,
         * commit the transaction as ONE
         * undo step.
         *
         * Otherwise cancel it so a simple
         * click does not create history.
         */
        if (moved) {
            endHistoryTransaction();
        } else {
            cancelHistoryTransaction();
        }

        updateRect();
    }

    /*
     * ============================================================
     * RESIZING
     * ============================================================
     */

    function handleResizeStart(
        event: React.PointerEvent,
        direction: ResizeDirection
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (
            !selectedNodeId ||
            !rect ||
            isDragging.current
        ) {
            return;
        }

        /*
         * Start one history transaction
         * for the entire resize operation.
         */
        beginHistoryTransaction();

        isResizing.current = true;

        resizeState.current = {
            direction,

            startX: event.clientX,
            startY: event.clientY,

            startWidth: rect.width,
            startHeight: rect.height,

            startLeft: rect.left,
            startTop: rect.top,
        };

        (
            event.currentTarget as HTMLElement
        ).setPointerCapture(
            event.pointerId
        );
    }

    function handleResizeMove(
        event: React.PointerEvent
    ) {
        if (
            !isResizing.current ||
            !resizeState.current ||
            !selectedNodeId
        ) {
            return;
        }

        const state =
            resizeState.current;

        const deltaX =
            event.clientX -
            state.startX;

        const deltaY =
            event.clientY -
            state.startY;

        let newWidth =
            state.startWidth;

        let newHeight =
            state.startHeight;

        /*
         * Bottom-right
         */
        if (
            state.direction ===
            "bottom-right"
        ) {
            newWidth =
                state.startWidth +
                deltaX;

            newHeight =
                state.startHeight +
                deltaY;
        }

        /*
         * Bottom-left
         */
        if (
            state.direction ===
            "bottom-left"
        ) {
            newWidth =
                state.startWidth -
                deltaX;

            newHeight =
                state.startHeight +
                deltaY;
        }

        /*
         * Top-right
         */
        if (
            state.direction ===
            "top-right"
        ) {
            newWidth =
                state.startWidth +
                deltaX;

            newHeight =
                state.startHeight -
                deltaY;
        }

        /*
         * Top-left
         */
        if (
            state.direction ===
            "top-left"
        ) {
            newWidth =
                state.startWidth -
                deltaX;

            newHeight =
                state.startHeight -
                deltaY;
        }

        /*
         * Minimum size.
         */
        newWidth = Math.max(
            20,
            newWidth
        );

        newHeight = Math.max(
            20,
            newHeight
        );

        updateNodeStyles(
            selectedNodeId,
            {
                width: `${Math.round(
                    newWidth
                )}px`,

                height: `${Math.round(
                    newHeight
                )}px`,
            }
        );

        requestAnimationFrame(
            updateRect
        );
    }

    function handleResizeEnd(
        event: React.PointerEvent
    ) {
        if (!isResizing.current) {
            return;
        }

        const state =
            resizeState.current;

        isResizing.current = false;

        resizeState.current = null;

        try {
            (
                event.currentTarget as HTMLElement
            ).releasePointerCapture(
                event.pointerId
            );
        } catch {
            /*
             * Pointer capture may already
             * have been released.
             */
        }

        /*
         * Determine whether the resize
         * actually changed dimensions.
         */
        const finalNode =
            selectedNodeId
                ? useEditorStore
                    .getState()
                    .project.nodes[
                selectedNodeId
                ]
                : null;

        const finalWidth =
            finalNode?.styles?.width
                ? parseFloat(
                    finalNode.styles.width
                )
                : state?.startWidth;

        const finalHeight =
            finalNode?.styles?.height
                ? parseFloat(
                    finalNode.styles.height
                )
                : state?.startHeight;

        const changed =
            state &&
            (
                Math.round(
                    finalWidth ?? 0
                ) !==
                Math.round(
                    state.startWidth
                ) ||
                Math.round(
                    finalHeight ?? 0
                ) !==
                Math.round(
                    state.startHeight
                )
            );

        /*
         * Commit one history entry only
         * if the size actually changed.
         */
        if (changed) {
            endHistoryTransaction();
        } else {
            cancelHistoryTransaction();
        }

        updateRect();
    }

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    if (
        !selectedNodeId ||
        !rect
    ) {
        return null;
    }

    const node =
        useEditorStore.getState()
            .project.nodes[
        selectedNodeId
        ];

    return (
        <div
            className="
                pointer-events-none
                fixed
                z-[9999]
            "
            style={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            }}
        >
            {/* ==================================================
                DRAG AREA
            ================================================== */}

            <div
                className="
                    pointer-events-auto
                    absolute
                    inset-0
                    cursor-move
                "
                onPointerDown={
                    handleDragStart
                }
                onPointerMove={
                    handleDragMove
                }
                onPointerUp={
                    handleDragEnd
                }
            />

            {/* ==================================================
                SELECTION BORDER
            ================================================== */}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    border-2
                    border-blue-500
                "
            />

            {/* ==================================================
                ELEMENT LABEL
            ================================================== */}

            <div
                className="
                    pointer-events-none
                    absolute
                    -top-5
                    left-0
                    rounded-t
                    bg-blue-500
                    px-1.5
                    py-0.5
                    text-[10px]
                    font-medium
                    text-white
                    whitespace-nowrap
                "
            >
                {node?.name ||
                    node?.type ||
                    "Element"}
            </div>

            {/* ==================================================
                TOP-LEFT
            ================================================== */}

            <ResizeHandle
                position="top-left"
                cursor="nwse-resize"
                onPointerDown={(
                    event
                ) =>
                    handleResizeStart(
                        event,
                        "top-left"
                    )
                }
                onPointerMove={
                    handleResizeMove
                }
                onPointerUp={
                    handleResizeEnd
                }
            />

            {/* ==================================================
                TOP-RIGHT
            ================================================== */}

            <ResizeHandle
                position="top-right"
                cursor="nesw-resize"
                onPointerDown={(
                    event
                ) =>
                    handleResizeStart(
                        event,
                        "top-right"
                    )
                }
                onPointerMove={
                    handleResizeMove
                }
                onPointerUp={
                    handleResizeEnd
                }
            />

            {/* ==================================================
                BOTTOM-LEFT
            ================================================== */}

            <ResizeHandle
                position="bottom-left"
                cursor="nesw-resize"
                onPointerDown={(
                    event
                ) =>
                    handleResizeStart(
                        event,
                        "bottom-left"
                    )
                }
                onPointerMove={
                    handleResizeMove
                }
                onPointerUp={
                    handleResizeEnd
                }
            />

            {/* ==================================================
                BOTTOM-RIGHT
            ================================================== */}

            <ResizeHandle
                position="bottom-right"
                cursor="nwse-resize"
                onPointerDown={(
                    event
                ) =>
                    handleResizeStart(
                        event,
                        "bottom-right"
                    )
                }
                onPointerMove={
                    handleResizeMove
                }
                onPointerUp={
                    handleResizeEnd
                }
            />
        </div>
    );
}

/* =========================================================
   RESIZE HANDLE
========================================================= */

interface ResizeHandleProps {
    position: ResizeDirection;

    cursor: string;

    onPointerDown: (
        event: React.PointerEvent
    ) => void;

    onPointerMove: (
        event: React.PointerEvent
    ) => void;

    onPointerUp: (
        event: React.PointerEvent
    ) => void;
}

function ResizeHandle({
    position,
    cursor,
    onPointerDown,
    onPointerMove,
    onPointerUp,
}: ResizeHandleProps) {
    const positionClass = {
        "top-left":
            "-top-1.5 -left-1.5",

        "top-right":
            "-top-1.5 -right-1.5",

        "bottom-left":
            "-bottom-1.5 -left-1.5",

        "bottom-right":
            "-bottom-1.5 -right-1.5",
    }[position];

    return (
        <div
            className={`
                pointer-events-auto
                absolute
                h-3
                w-3
                rounded-sm
                border
                border-white
                bg-blue-500
                ${positionClass}
            `}
            style={{
                cursor,
                touchAction: "none",
            }}
            onPointerDown={
                onPointerDown
            }
            onPointerMove={
                onPointerMove
            }
            onPointerUp={
                onPointerUp
            }
        />
    );
}