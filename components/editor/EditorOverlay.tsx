"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { useEditorStore } from "@/store/editorStore";

/* =========================================================
   RECT
========================================================= */

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

/* =========================================================
   RESIZE STATE
========================================================= */

interface ResizeState {
    direction: ResizeDirection;

    startX: number;
    startY: number;

    startWidth: number;
    startHeight: number;

    scale: number;

    aspectRatio: number | null;
}

/* =========================================================
   EDITOR OVERLAY
========================================================= */

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

    const isResizing =
        useRef(false);

    /* =========================================================
       FIND VIEWPORT
    ========================================================= */

    function getViewportElement() {
        return document.querySelector(
            "[data-viewport]"
        ) as HTMLElement | null;
    }

    /* =========================================================
       GET EDITOR SCALE
    ========================================================= */

    function getEditorScale(
        viewportElement: HTMLElement
    ) {
        const logicalWidth =
            parseFloat(
                viewportElement.style.width
            );

        const visibleWidth =
            viewportElement
                .getBoundingClientRect()
                .width;

        if (
            !logicalWidth ||
            logicalWidth <= 0
        ) {
            return 1;
        }

        return (
            visibleWidth /
            logicalWidth
        );
    }

    /* =========================================================
       UPDATE RECTANGLE
    ========================================================= */

    function updateRect() {
        if (!selectedNodeId) {
            setRect(null);
            return;
        }

        const element =
            document.querySelector(
                `[data-node-id="${selectedNodeId}"]`
            ) as HTMLElement | null;

        const viewportElement =
            getViewportElement();

        if (
            !element ||
            !viewportElement
        ) {
            setRect(null);
            return;
        }

        const bounds =
            element.getBoundingClientRect();

        const viewportBounds =
            viewportElement
                .getBoundingClientRect();

        const scale =
            getEditorScale(
                viewportElement
            );

        const relativeLeft =
            (
                bounds.left -
                viewportBounds.left
            ) / scale;

        const relativeTop =
            (
                bounds.top -
                viewportBounds.top
            ) / scale;

        const logicalWidth =
            bounds.width /
            scale;

        const logicalHeight =
            bounds.height /
            scale;

        setRect({
            top:
                relativeTop,

            left:
                relativeLeft,

            width:
                logicalWidth,

            height:
                logicalHeight,
        });
    }

    /* =========================================================
       SELECTION CHANGE
    ========================================================= */

    useEffect(() => {
        const frame =
            requestAnimationFrame(
                updateRect
            );

        return () =>
            cancelAnimationFrame(
                frame
            );
    }, [
        selectedNodeId,
    ]);

    /* =========================================================
       KEEP OVERLAY SYNCHRONIZED
    ========================================================= */

    useEffect(() => {
        function handleUpdate() {
            updateRect();
        }

        window.addEventListener(
            "resize",
            handleUpdate
        );

        window.addEventListener(
            "scroll",
            handleUpdate,
            true
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleUpdate
            );

            window.removeEventListener(
                "scroll",
                handleUpdate,
                true
            );
        };
    }, [
        selectedNodeId,
    ]);

    /* =========================================================
       ASPECT RATIO
    ========================================================= */

    function getActiveAspectRatio(): number | null {
        if (!selectedNodeId) {
            return null;
        }

        const selectedNode =
            useEditorStore
                .getState()
                .project
                .nodes[
            selectedNodeId
            ];

        if (!selectedNode) {
            return null;
        }

        const viewportElement =
            getViewportElement();

        if (!viewportElement) {
            return null;
        }

        const viewportWidth =
            viewportElement.clientWidth;

        const responsiveStyles =
            selectedNode.styles
                ?.responsive;

        /*
         * EditorOverlay does not receive the current
         * viewport id directly. Resolve the effective
         * aspect ratio from the responsive override
         * currently represented by the viewport width.
         */
        const viewportId =
            viewportWidth <= 767
                ? "mobile"
                : viewportWidth <= 1023
                    ? "tablet"
                    : "desktop";

        const responsiveAspectRatio =
            responsiveStyles?.[
                viewportId
            ]?.aspectRatio;

        const aspectRatio =
            responsiveAspectRatio ??
            selectedNode.styles
                ?.aspectRatio;

        if (
            !aspectRatio ||
            !aspectRatio.trim()
        ) {
            return null;
        }

        const parts =
            aspectRatio
                .split("/")
                .map(
                    (part) =>
                        Number(
                            part.trim()
                        )
                );

        if (
            parts.length !== 2 ||
            !Number.isFinite(parts[0]) ||
            !Number.isFinite(parts[1]) ||
            parts[0] <= 0 ||
            parts[1] <= 0
        ) {
            return null;
        }

        return parts[0] / parts[1];
    }

    /* =========================================================
       RESIZE START
    ========================================================= */

    function handleResizeStart(
        event: React.PointerEvent,
        direction: ResizeDirection
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (
            !selectedNodeId ||
            !rect
        ) {
            return;
        }

        if (isResizing.current) {
            return;
        }

        const viewportElement =
            getViewportElement();

        if (!viewportElement) {
            return;
        }

        const scale =
            getEditorScale(
                viewportElement
            );

        beginHistoryTransaction();

        isResizing.current =
            true;

        resizeState.current = {
            direction,

            startX:
                event.clientX,

            startY:
                event.clientY,

            startWidth:
                rect.width,

            startHeight:
                rect.height,

            scale,

            aspectRatio:
                getActiveAspectRatio(),
        };

        try {
            (
                event.currentTarget as HTMLElement
            ).setPointerCapture(
                event.pointerId
            );
        } catch {
            /*
             * Pointer capture may already
             * be unavailable.
             */
        }
    }

    /* =========================================================
       RESIZE MOVE
    ========================================================= */

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

        event.preventDefault();
        event.stopPropagation();

        const state =
            resizeState.current;

        const deltaX =
            (
                event.clientX -
                state.startX
            ) / state.scale;

        const deltaY =
            (
                event.clientY -
                state.startY
            ) / state.scale;

        let newWidth =
            state.startWidth;

        let newHeight =
            state.startHeight;

        /* -----------------------------------------------------
           BOTTOM RIGHT
        ----------------------------------------------------- */

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

        /* -----------------------------------------------------
           BOTTOM LEFT
        ----------------------------------------------------- */

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

        /* -----------------------------------------------------
           TOP RIGHT
        ----------------------------------------------------- */

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

        /* -----------------------------------------------------
           TOP LEFT
        ----------------------------------------------------- */

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

        /* -----------------------------------------------------
           ASPECT RATIO
        ----------------------------------------------------- */

        if (
            state.aspectRatio &&
            Number.isFinite(
                state.aspectRatio
            ) &&
            state.aspectRatio > 0
        ) {
            /*
             * Preserve the selected element's starting
             * aspect ratio while resizing from any corner.
             *
             * The dominant pointer movement determines
             * the new size, then the other dimension is
             * calculated from the ratio.
             */
            const widthChange =
                Math.abs(
                    newWidth -
                    state.startWidth
                );

            const heightChange =
                Math.abs(
                    newHeight -
                    state.startHeight
                );

            if (
                widthChange >=
                heightChange
            ) {
                newHeight =
                    newWidth /
                    state.aspectRatio;
            } else {
                newWidth =
                    newHeight *
                    state.aspectRatio;
            }

            /*
             * Keep the minimum size while preserving
             * the ratio.
             */
            if (newWidth < 20) {
                newWidth = 20;
                newHeight =
                    newWidth /
                    state.aspectRatio;
            }

            if (newHeight < 20) {
                newHeight = 20;
                newWidth =
                    newHeight *
                    state.aspectRatio;
            }
        }

        /* -----------------------------------------------------
           MINIMUM SIZE
        ----------------------------------------------------- */

        newWidth =
            Math.max(
                20,
                newWidth
            );

        newHeight =
            Math.max(
                20,
                newHeight
            );

        updateNodeStyles(
            selectedNodeId,
            {
                width:
                    `${Math.round(
                        newWidth
                    )}px`,

                height:
                    `${Math.round(
                        newHeight
                    )}px`,
            }
        );

        requestAnimationFrame(
            updateRect
        );
    }

    /* =========================================================
       RESIZE END
    ========================================================= */

    function handleResizeEnd(
        event: React.PointerEvent
    ) {
        if (
            !isResizing.current
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const state =
            resizeState.current;

        isResizing.current =
            false;

        resizeState.current =
            null;

        try {
            (
                event.currentTarget as HTMLElement
            ).releasePointerCapture(
                event.pointerId
            );
        } catch {
            /*
             * Pointer capture may already
             * be released.
             */
        }

        const finalNode =
            selectedNodeId
                ? useEditorStore
                    .getState()
                    .project
                    .nodes[
                selectedNodeId
                ]
                : null;

        const finalWidth =
            finalNode
                ?.styles
                ?.width
                ? parseFloat(
                    finalNode.styles.width
                )
                : state?.startWidth;

        const finalHeight =
            finalNode
                ?.styles
                ?.height
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

        if (changed) {
            endHistoryTransaction();
        } else {
            cancelHistoryTransaction();
        }

        updateRect();
    }

    /* =========================================================
       NO SELECTION
    ========================================================= */

    if (
        !selectedNodeId ||
        !rect
    ) {
        return null;
    }

    const node =
        useEditorStore
            .getState()
            .project
            .nodes[
        selectedNodeId
        ];

    /* =========================================================
       RENDER
       
       IMPORTANT:
       
       The overlay itself is pointer-events-none.
       
       Therefore it cannot block the actual
       button/text/image/container underneath.
       
       Resize handles explicitly enable
       pointer-events-auto.
    ========================================================= */

    return (
        <div
            className="
                pointer-events-none
                absolute
                z-[9999]
            "
            style={{
                top:
                    `${rect.top}px`,

                left:
                    `${rect.left}px`,

                width:
                    `${rect.width}px`,

                height:
                    `${rect.height}px`,
            }}
        >
            {/* =================================================
                SELECTION BORDER
            ================================================= */}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    border-2
                    border-blue-500
                "
            />

            {/* =================================================
                ELEMENT LABEL
            ================================================= */}

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
                    whitespace-nowrap
                    text-white
                "
            >
                {node?.name ||
                    node?.type ||
                    "Element"}
            </div>

            {/* =================================================
                TOP LEFT
            ================================================= */}

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

            {/* =================================================
                TOP RIGHT
            ================================================= */}

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

            {/* =================================================
                BOTTOM LEFT
            ================================================= */}

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

            {/* =================================================
                BOTTOM RIGHT
            ================================================= */}

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
                touchAction:
                    "none",
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