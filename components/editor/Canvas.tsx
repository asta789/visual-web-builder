"use client";

import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type MouseEvent,
    type PointerEvent,
} from "react";

import type {
    ProjectNode,
    BaseStyleProperties,
    LayoutMode,
    DesignToken,
} from "@/model/type";

import { useEditorStore } from "@/store/editorStore";
import { createTokenVariableMap } from "./design-tokens/tokenUtils";
import EditorOverlay from "./EditorOverlay";

/* =========================================================
   ANIMATION KEYFRAMES
========================================================= */

const ANIMATION_KEYFRAMES = `
@keyframes vwb-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes vwb-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
}

@keyframes vwb-slide-up {
    from { transform: translateY(30px); }
    to { transform: translateY(0); }
}

@keyframes vwb-slide-down {
    from { transform: translateY(-30px); }
    to { transform: translateY(0); }
}

@keyframes vwb-slide-left {
    from { transform: translateX(30px); }
    to { transform: translateX(0); }
}

@keyframes vwb-slide-right {
    from { transform: translateX(-30px); }
    to { transform: translateX(0); }
}

@keyframes vwb-zoom-in {
    from { transform: scale(0.8); }
    to { transform: scale(1); }
}

@keyframes vwb-zoom-out {
    from { transform: scale(1.2); }
    to { transform: scale(1); }
}

@keyframes vwb-bounce {
    0% { transform: translateY(0); }
    20% { transform: translateY(-25px); }
    40% { transform: translateY(0); }
    60% { transform: translateY(-12px); }
    80% { transform: translateY(0); }
    100% { transform: translateY(0); }
}

@keyframes vwb-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes vwb-shake {
    0% { transform: translateX(0); }
    20% { transform: translateX(-10px); }
    40% { transform: translateX(10px); }
    60% { transform: translateX(-8px); }
    80% { transform: translateX(8px); }
    100% { transform: translateX(0); }
}

@keyframes vwb-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
`;

/* =========================================================
   CANVAS
========================================================= */

interface CanvasProps {
    viewport:
    | "desktop"
    | "tablet"
    | "mobile";

    viewportWidth: number;
}

type ViewportType =
    | "desktop"
    | "tablet"
    | "mobile";

/* =========================================================
   RESPONSIVE STYLE RESOLUTION
========================================================= */

function getResolvedStyles(
    node: ProjectNode,
    viewport: ViewportType
): BaseStyleProperties {
    const baseStyles: BaseStyleProperties = {
        ...(node.styles ?? {}),
    };

    delete (
        baseStyles as BaseStyleProperties & {
            responsive?: unknown;
        }
    ).responsive;

    const responsiveStyles =
        node.styles?.responsive?.[viewport];

    if (!responsiveStyles) {
        return baseStyles;
    }

    return {
        ...baseStyles,
        ...responsiveStyles,
    };
}

/* =========================================================
   GRID EDITOR GUIDE
========================================================= */

interface GridGuideProps {
    columns: number;
    rows: number;
    columnGap: string;
    rowGap: string;
    isEmpty: boolean;
}

function GridGuide({
    columns,
    rows,
    columnGap,
    rowGap,
    isEmpty,
}: GridGuideProps) {
    const safeColumns =
        Math.max(
            1,
            Math.min(columns, 6)
        );

    const safeRows =
        Math.max(
            1,
            Math.min(rows, 6)
        );

    return (
        <div
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,

                minHeight:
                    isEmpty
                        ? "160px"
                        : undefined,

                display: "grid",

                gridTemplateColumns:
                    `repeat(${safeColumns}, minmax(0, 1fr))`,

                columnGap,

                rowGap,

                pointerEvents: "none",

                zIndex: 9999,
            }}
        >
            {Array.from({
                length: safeColumns,
            }).map(
                (_, index) => (
                    <div
                        key={index}
                        style={{
                            minWidth: 0,

                            borderLeft:
                                "1px dashed rgba(59, 130, 246, 0.35)",

                            borderRight:
                                "1px dashed rgba(59, 130, 246, 0.35)",

                            background:
                                "rgba(59, 130, 246, 0.025)",
                        }}
                    />
                )
            )}

            {/* Top boundary */}

            <div
                style={{
                    position:
                        "absolute",

                    top: 0,

                    left: 0,

                    right: 0,

                    borderTop:
                        "1px dashed rgba(59, 130, 246, 0.35)",
                }}
            />

            {/* Bottom boundary */}

            <div
                style={{
                    position:
                        "absolute",

                    bottom: 0,

                    left: 0,

                    right: 0,

                    borderBottom:
                        "1px dashed rgba(59, 130, 246, 0.35)",
                }}
            />
        </div>
    );
}

/* =========================================================
   DESIGN TOKEN CSS VARIABLES
========================================================= */

function getDesignTokenVariables(
    tokens: Record<string, DesignToken>
): CSSProperties {
    const variables = createTokenVariableMap(tokens ?? {});
    return variables as CSSProperties;
}

/* =========================================================
   RENDER NODE
========================================================= */

interface RenderNodeProps {
    nodeId: string;
    viewport: ViewportType;
}

/* =========================================================
   DRAG CONSTANTS
========================================================= */

const DRAG_THRESHOLD = 6;

/* =========================================================
   DRAG STATE
========================================================= */

interface NodeDragState {
    startX: number;
    startY: number;

    startLeft: number;
    startTop: number;

    scale: number;

    hasMoved: boolean;

    /*
     * This is the dragged node's own layout mode.
     *
     * It is retained for Free Position behavior,
     * but Grid behavior is determined from the
     * dragged node's PARENT layout mode.
     */
    layoutMode: LayoutMode;

    parentId: string | null;

    /*
     * Used only by Grid dragging.
     *
     * This stores the last insertion index so
     * moveNode() is not called repeatedly when
     * the pointer remains in the same position.
     */
    lastTargetIndex:
    | number
    | null;

    /*
     * True once the element has been converted to
     * absolute positioning for Free Position mode.
     */
    freePositionInitialized: boolean;
}

/* =========================================================
   RENDER NODE COMPONENT
========================================================= */

function RenderNode({
    nodeId,
    viewport,
}: RenderNodeProps) {
    const project =
        useEditorStore(
            (state) =>
                state.project
        );

    const selectedNodeId =
        useEditorStore(
            (state) =>
                state.selectedNodeId
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

    const updateNodeStyles =
        useEditorStore(
            (state) =>
                state.updateNodeStyles
        );

    const moveNode =
        useEditorStore(
            (state) =>
                state.moveNode
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

    const node =
        project.nodes[nodeId];

    const [
        isHovered,
        setIsHovered,
    ] = useState(false);

    const [
        isClickAnimationActive,
        setIsClickAnimationActive,
    ] = useState(false);

    const [
        isFocused,
        setIsFocused,
    ] = useState(false);

    const [
        isScrollAnimationActive,
        setIsScrollAnimationActive,
    ] = useState(false);

    const [
        isDragActive,
        setIsDragActive,
    ] = useState(false);

    const isPointerDown =
        useRef(false);

    const isDragging =
        useRef(false);

    const isMultiSelectGesture =
        useRef(false);

    const dragState =
        useRef<NodeDragState | null>(
            null
        );

    /* =====================================================
       RESOLVED STYLES
    ===================================================== */

    const resolvedStyles: BaseStyleProperties =
        node
            ? getResolvedStyles(node, viewport)
            : {};

    const layoutMode: LayoutMode =
        resolvedStyles.layoutMode ??
        "automatic";

    /* =====================================================
       ANIMATION
    ===================================================== */

    const animationTrigger =
        resolvedStyles.animationTrigger ||
        "load";

    const animationValue =
        resolvedStyles.animation;

    useEffect(() => {
        if (!node || animationTrigger !== "scroll") {
            return;
        }

        const element = document.querySelector(
            `[data-node-id="${node.id}"]`
        );

        if (!element || !("IntersectionObserver" in window)) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsScrollAnimationActive(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [animationTrigger, node, nodeId]);

    if (!node) {
        return null;
    }

    const effectiveAnimation =
        animationTrigger === "hover"
            ? isHovered
                ? animationValue
                : "none"
            : animationTrigger ===
                "click"
                ? isClickAnimationActive
                    ? animationValue
                    : "none"
                : animationTrigger ===
                    "focus"
                    ? isFocused
                        ? animationValue
                        : "none"
                    : animationTrigger === "scroll"
                        ? isScrollAnimationActive
                            ? animationValue
                            : "none"
                        : animationValue;

    /* =====================================================
       EDITOR SCALE
    ===================================================== */

    function getEditorScale() {
        const viewportElement =
            document.querySelector(
                "[data-viewport]"
            ) as HTMLElement | null;

        if (!viewportElement) {
            return 1;
        }

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

    /* =====================================================
       CURRENT MODEL POSITION
    ===================================================== */

    function getCurrentPosition() {
        const left =
            parseFloat(
                resolvedStyles.left ??
                "0"
            ) || 0;

        const top =
            parseFloat(
                resolvedStyles.top ??
                "0"
            ) || 0;

        return {
            left,
            top,
        };
    }

    /* =====================================================
       RENDERED POSITION RELATIVE TO PARENT
    ===================================================== */

    function getRenderedPositionRelativeToParent(
        element: HTMLElement
    ) {
        if (!node.parentId) {
            return null;
        }

        const parentElement =
            document.querySelector(
                `[data-node-id="${node.parentId}"]`
            ) as HTMLElement | null;

        if (!parentElement) {
            return null;
        }

        const scale =
            getEditorScale();

        const elementRect =
            element.getBoundingClientRect();

        const parentRect =
            parentElement.getBoundingClientRect();

        const parentLeft =
            parentRect.left +
            parentElement.clientLeft *
            scale;

        const parentTop =
            parentRect.top +
            parentElement.clientTop *
            scale;

        return {
            left:
                (elementRect.left -
                    parentLeft) /
                scale +
                parentElement.scrollLeft,

            top:
                (elementRect.top -
                    parentTop) /
                scale +
                parentElement.scrollTop,
        };
    }

    /* =====================================================
       CANVAS POSITION FOR ROOT-LEVEL ELEMENTS
    ===================================================== */

    function getRenderedPositionRelativeToViewport(
        element: HTMLElement
    ) {
        const viewportElement =
            document.querySelector(
                "[data-viewport]"
            ) as HTMLElement | null;

        if (!viewportElement) {
            return null;
        }

        const scale =
            getEditorScale();

        const elementRect =
            element.getBoundingClientRect();

        const viewportRect =
            viewportElement.getBoundingClientRect();

        return {
            left:
                (elementRect.left -
                    viewportRect.left) /
                scale +
                viewportElement.scrollLeft,

            top:
                (elementRect.top -
                    viewportRect.top) /
                scale +
                viewportElement.scrollTop,
        };
    }

    /* =====================================================
       GET PARENT LAYOUT MODE
    ===================================================== */

    function getParentLayoutMode():
        | LayoutMode
        | null {
        const state =
            dragState.current;

        if (!state?.parentId) {
            return null;
        }

        const parent =
            project.nodes[
            state.parentId
            ];

        if (!parent) {
            return null;
        }

        const parentStyles =
            getResolvedStyles(
                parent,
                viewport
            );

        return (
            parentStyles.layoutMode ??
            "automatic"
        );
    }

    /* =====================================================
       IS PARENT GRID
    ===================================================== */

    function isParentGrid() {
        return (
            getParentLayoutMode() ===
            "grid"
        );
    }

    /* =====================================================
       INITIALIZE FREE DRAG POSITION
    ===================================================== */

    function initializeFreeDragPosition(
        event: PointerEvent<HTMLElement>
    ) {
        const state =
            dragState.current;

        if (!state) {
            return;
        }

        if (
            state.freePositionInitialized
        ) {
            return;
        }

        let renderedPosition:
            | {
                left: number;
                top: number;
            }
            | null = null;

        if (state.parentId) {
            renderedPosition =
                getRenderedPositionRelativeToParent(
                    event.currentTarget
                );
        } else {
            renderedPosition =
                getRenderedPositionRelativeToViewport(
                    event.currentTarget
                );
        }

        if (!renderedPosition) {
            const position =
                getCurrentPosition();

            renderedPosition = {
                left:
                    position.left,

                top:
                    position.top,
            };
        }

        state.startLeft =
            renderedPosition.left;

        state.startTop =
            renderedPosition.top;

        /*
         * Free Position requires the parent to become
         * the coordinate system.
         */
        if (state.parentId) {
            const parent =
                project.nodes[
                state.parentId
                ];

            if (
                parent &&
                parent.styles
                    ?.position !==
                "relative" &&
                parent.styles
                    ?.position !==
                "absolute" &&
                parent.styles
                    ?.position !==
                "fixed" &&
                parent.styles
                    ?.position !==
                "sticky"
            ) {
                updateNodeStyles(
                    parent.id,
                    {
                        position:
                            "relative",
                    }
                );
            }
        }

        /*
         * IMPORTANT:
         *
         * Only Free Position converts the element
         * to absolute positioning.
         */
        updateNodeStyles(
            node.id,
            {
                position:
                    "absolute",

                left:
                    `${Math.round(
                        renderedPosition.left
                    )}px`,

                top:
                    `${Math.round(
                        renderedPosition.top
                    )}px`,
            }
        );

        state.freePositionInitialized =
            true;
    }

    /* =====================================================
   FLOW TARGET INDEX
   
   Used only by Horizontal / Vertical flow layouts.

   Horizontal:
   - compares pointer X against sibling centers.

   Vertical:
   - compares pointer Y against sibling centers.

   The returned index is adjusted for the fact that
   the dragged node is removed before insertion.
===================================================== */

    function getFlowTargetIndex(
        event: PointerEvent<HTMLElement>
    ) {
        const state =
            dragState.current;

        if (!state) {
            return null;
        }

        if (!state.parentId) {
            return null;
        }

        const parent =
            project.nodes[
            state.parentId
            ];

        if (!parent) {
            return null;
        }

        const children =
            parent.children ?? [];

        if (
            children.length <= 1
        ) {
            return null;
        }

        /*
         * Only Horizontal and Vertical should use
         * this flow-reordering algorithm.
         */
        if (
            state.layoutMode !==
            "horizontal" &&
            state.layoutMode !==
            "vertical"
        ) {
            return null;
        }

        const direction =
            state.layoutMode ===
                "horizontal"
                ? "horizontal"
                : "vertical";

        /*
         * Use direct children only.
         *
         * We intentionally follow Project Model order
         * rather than querying arbitrary descendants.
         */
        const siblings =
            children
                .filter(
                    (childId) =>
                        childId !==
                        node.id
                )
                .map(
                    (childId) => {
                        const element =
                            document.querySelector(
                                `[data-node-id="${childId}"]`
                            ) as HTMLElement | null;

                        if (!element) {
                            return null;
                        }

                        return {
                            id: childId,
                            index:
                                children.indexOf(
                                    childId
                                ),
                            element,
                        };
                    }
                )
                .filter(
                    (
                        item
                    ): item is {
                        id: string;
                        index: number;
                        element: HTMLElement;
                    } =>
                        item !== null
                );

        if (!siblings.length) {
            return null;
        }

        const pointer =
            direction ===
                "horizontal"
                ? event.clientX
                : event.clientY;

        const draggedIndex =
            children.indexOf(
                node.id
            );

        /*
         * Find the first sibling whose midpoint is
         * after the pointer.
         */
        for (
            const sibling of siblings
        ) {
            const rect =
                sibling.element.getBoundingClientRect();

            const midpoint =
                direction ===
                    "horizontal"
                    ? rect.left +
                    rect.width / 2
                    : rect.top +
                    rect.height / 2;

            if (
                pointer <
                midpoint
            ) {
                /*
                 * The target index is based on the
                 * current children array.
                 *
                 * Because the dragged node will be
                 * removed first, indexes after the
                 * dragged node shift left by one.
                 */
                if (
                    draggedIndex !==
                    -1 &&
                    sibling.index >
                    draggedIndex
                ) {
                    return (
                        sibling.index -
                        1
                    );
                }

                return sibling.index;
            }
        }

        /*
         * Pointer is after every sibling.
         *
         * Using children.length is intentional:
         * moveNode() removes the dragged item first,
         * so this becomes an append operation.
         */
        return children.length;
    }
    /* =====================================================
       GRID TARGET INDEX
    ===================================================== */

    function getGridTargetIndex(
        event: PointerEvent<HTMLElement>
    ): number | null {
        const state =
            dragState.current;

        if (!state) {
            return null;
        }

        if (!state.parentId) {
            return null;
        }

        const parent =
            project.nodes[
            state.parentId
            ];

        if (!parent) {
            return null;
        }

        const parentStyles =
            getResolvedStyles(
                parent,
                viewport
            );

        if (
            parentStyles.layoutMode !==
            "grid"
        ) {
            return null;
        }

        const children =
            parent.children ?? [];

        if (
            children.length <= 1
        ) {
            return 0;
        }

        /*
         * The dragged item is removed from the list
         * conceptually while calculating the target.
         *
         * This makes the target index directly usable
         * by moveNode().
         */
        const siblingIds =
            children.filter(
                (childId) =>
                    childId !== node.id
            );

        if (
            siblingIds.length === 0
        ) {
            return 0;
        }

        /*
         * Get rendered rectangles for the direct
         * Grid children only.
         */
        const siblings =
            siblingIds
                .map(
                    (childId) => {
                        const element =
                            document.querySelector(
                                `[data-node-id="${childId}"]`
                            ) as HTMLElement | null;

                        if (!element) {
                            return null;
                        }

                        const rect =
                            element.getBoundingClientRect();

                        return {
                            childId,
                            rect,
                        };
                    }
                )
                .filter(
                    (
                        item
                    ): item is {
                        childId: string;
                        rect: DOMRect;
                    } =>
                        item !== null
                );

        if (
            siblings.length === 0
        ) {
            return 0;
        }

        /*
         * CSS Grid auto-placement is row-major.
         *
         * Sort the rendered siblings into visual
         * row/column order.
         */
        siblings.sort(
            (a, b) => {
                const aCenterY =
                    a.rect.top +
                    a.rect.height / 2;

                const bCenterY =
                    b.rect.top +
                    b.rect.height / 2;

                const rowTolerance =
                    Math.max(
                        4,
                        Math.min(
                            a.rect.height,
                            b.rect.height
                        ) * 0.35
                    );

                if (
                    Math.abs(
                        aCenterY -
                        bCenterY
                    ) >
                    rowTolerance
                ) {
                    return (
                        aCenterY -
                        bCenterY
                    );
                }

                const aCenterX =
                    a.rect.left +
                    a.rect.width / 2;

                const bCenterX =
                    b.rect.left +
                    b.rect.width / 2;

                return (
                    aCenterX -
                    bCenterX
                );
            }
        );

        const pointerX =
            event.clientX;

        const pointerY =
            event.clientY;

        /*
         * Determine the insertion point.
         *
         * The returned index is relative to the
         * children array AFTER the dragged item
         * has been removed.
         */
        for (
            let index = 0;
            index <
            siblings.length;
            index++
        ) {
            const sibling =
                siblings[index];

            const rect =
                sibling.rect;

            const centerX =
                rect.left +
                rect.width / 2;

            const centerY =
                rect.top +
                rect.height / 2;

            /*
             * If pointer is above this item's row,
             * insert before this sibling.
             */
            if (
                pointerY <
                rect.top
            ) {
                return index;
            }

            /*
             * If pointer is inside this item's row,
             * use horizontal position.
             */
            if (
                pointerY >=
                rect.top &&
                pointerY <=
                rect.bottom
            ) {
                if (
                    pointerX <
                    centerX
                ) {
                    return index;
                }

                /*
                 * Pointer is on the right half.
                 * Continue to the next sibling.
                 */
                continue;
            }

            /*
             * Pointer is below the item.
             *
             * If the next item belongs to a lower row,
             * the pointer may belong after this item.
             */
            const next =
                siblings[index + 1];

            if (!next) {
                return siblings.length;
            }

            const nextCenterY =
                next.rect.top +
                next.rect.height / 2;

            const currentCenterY =
                centerY;

            const rowGapBoundary =
                (
                    currentCenterY +
                    nextCenterY
                ) / 2;

            if (
                pointerY <
                rowGapBoundary
            ) {
                return index + 1;
            }
        }

        /*
         * Pointer is after every sibling.
         */
        return siblings.length;
    }

    /* =====================================================
       GRID DRAG
    ===================================================== */

    function handleGridCanvasDrag(
        event: PointerEvent<HTMLElement>
    ) {
        const state =
            dragState.current;

        if (!state) {
            return;
        }

        if (!state.parentId) {
            return;
        }

        const parent =
            project.nodes[
            state.parentId
            ];

        if (!parent) {
            return;
        }

        const parentStyles =
            getResolvedStyles(
                parent,
                viewport
            );

        const parentLayoutMode =
            parentStyles.layoutMode ??
            "automatic";

        /*
         * Grid drag is active only when the PARENT
         * is Grid.
         */
        if (
            parentLayoutMode !==
            "grid"
        ) {
            return;
        }

        const children =
            parent.children ?? [];

        const currentIndex =
            children.indexOf(
                node.id
            );

        if (
            currentIndex === -1
        ) {
            return;
        }

        const targetIndex =
            getGridTargetIndex(
                event
            );

        if (
            targetIndex === null
        ) {
            return;
        }

        /*
         * If the target represents the same location,
         * there is nothing to do.
         */
        if (
            state.lastTargetIndex ===
            targetIndex
        ) {
            return;
        }

        /*
         * Determine the current position after
         * conceptually removing the dragged item.
         */
        const remainingChildren =
            children.filter(
                (childId) =>
                    childId !==
                    node.id
            );

        /*
         * If removing the dragged item and inserting
         * at the same position produces the same order,
         * do nothing.
         */
        const clampedTarget =
            Math.max(
                0,
                Math.min(
                    targetIndex,
                    remainingChildren.length
                )
            );

        const nextChildren = [
            ...remainingChildren,
        ];

        nextChildren.splice(
            clampedTarget,
            0,
            node.id
        );

        const currentChildren =
            children;

        const orderChanged =
            nextChildren.some(
                (
                    childId,
                    index
                ) =>
                    childId !==
                    currentChildren[
                    index
                    ]
            );

        if (!orderChanged) {
            state.lastTargetIndex =
                targetIndex;

            return;
        }

        /*
         * Remember the target before updating
         * the Project Model.
         */
        state.lastTargetIndex =
            targetIndex;

        /*
         * IMPORTANT:
         *
         * Grid drag changes ONLY the structural
         * child order.
         *
         * It does NOT change:
         *
         * - position
         * - left
         * - top
         * - right
         * - bottom
         *
         * CSS Grid remains responsible for placement.
         */
        moveNode(
            node.id,
            parent.id,
            clampedTarget
        );
    }

    /* =====================================================
   HORIZONTAL / VERTICAL FLOW DRAG
   
   Reorders the child structurally.

   IMPORTANT:
   This never changes:
   - position
   - left
   - top

   The flex layout remains responsible for
   positioning the element.
===================================================== */

    function handleFlowCanvasDrag(
        event: PointerEvent<HTMLElement>
    ) {
        const state =
            dragState.current;

        if (!state) {
            return;
        }

        if (!state.parentId) {
            return;
        }

        /*
         * Only Horizontal / Vertical flow modes.
         */
        if (
            state.layoutMode !==
            "horizontal" &&
            state.layoutMode !==
            "vertical"
        ) {
            return;
        }

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

        /*
         * Ignore tiny movement.
         */
        if (
            Math.abs(deltaX) <
            DRAG_THRESHOLD &&
            Math.abs(deltaY) <
            DRAG_THRESHOLD
        ) {
            return;
        }

        state.hasMoved =
            true;

        const targetIndex =
            getFlowTargetIndex(
                event
            );

        if (
            targetIndex ===
            null
        ) {
            return;
        }

        /*
         * Prevent moveNode() from firing repeatedly
         * while the pointer remains in the same slot.
         */
        if (
            state.lastTargetIndex ===
            targetIndex
        ) {
            return;
        }

        state.lastTargetIndex =
            targetIndex;

        moveNode(
            node.id,
            state.parentId,
            targetIndex
        );
    }

    /* =====================================================
       BEGIN ACTUAL DRAG
    ===================================================== */

    function beginActualDrag(
        event: PointerEvent<HTMLElement>
    ) {
        const state =
            dragState.current;

        if (!state) {
            return;
        }

        if (
            isDragging.current
        ) {
            return;
        }

        /*
         * One history transaction for the entire drag.
         */
        beginHistoryTransaction();

        isDragging.current =
            true;

        state.hasMoved =
            true;

        /*
         * IMPORTANT:
         *
         * Grid mode is determined from the PARENT,
         * not from the dragged child.
         */
        if (
            isParentGrid()
        ) {
            setIsDragActive(
                true
            );

            /*
             * Grid children stay in normal CSS Grid flow.
             */
            handleGridCanvasDrag(
                event
            );

            return;
        }

        /*
 * HORIZONTAL / VERTICAL
 *
 * Keep the element in normal flow.
 * The flex container remains responsible
 * for positioning it.
 */
        if (
            state.layoutMode ===
            "horizontal" ||
            state.layoutMode ===
            "vertical"
        ) {
            setIsDragActive(
                true
            );

            /*
             * Calculate the first target immediately.
             */
            handleFlowCanvasDrag(
                event
            );

            return;
        }

        /*
         * FREE POSITION
         *
         * Only Free Position converts the element
         * to absolute positioning.
         */
        initializeFreeDragPosition(
            event
        );

        setIsDragActive(
            true
        );
    }

    /* =====================================================
       POINTER DOWN
    ===================================================== */

    function handlePointerDown(
        event: PointerEvent<HTMLElement>
    ) {
        if (
            event.pointerType ===
            "mouse" &&
            event.button !== 0
        ) {
            return;
        }

        event.stopPropagation();

        const isMultiSelect =
            event.ctrlKey ||
            event.metaKey;

        if (isMultiSelect) {
            isMultiSelectGesture.current = true;
            toggleNodeSelection(node.id);
            return;
        }

        isMultiSelectGesture.current = false;

        selectNode(
            node.id
        );

        const viewportElement =
            document.querySelector(
                "[data-viewport]"
            ) as HTMLElement | null;

        if (!viewportElement) {
            return;
        }

        const scale =
            getEditorScale();

        const position =
            getCurrentPosition();

        /*
         * Determine the layout mode from the parent.
         *
         * A child is positioned/reordered according to
         * its parent's layout mode.
         */
        let dragLayoutMode =
            layoutMode;

        if (
            node.parentId
        ) {
            const parent =
                project.nodes[
                node.parentId
                ];

            if (parent) {
                const parentStyles =
                    getResolvedStyles(
                        parent,
                        viewport
                    );

                dragLayoutMode =
                    parentStyles.layoutMode ??
                    "automatic";
            }
        }

        isPointerDown.current =
            true;

        dragState.current = {
            startX:
                event.clientX,

            startY:
                event.clientY,

            startLeft:
                position.left,

            startTop:
                position.top,

            scale,

            hasMoved:
                false,

            layoutMode:
                dragLayoutMode,

            parentId:
                node.parentId ??
                null,

            lastTargetIndex:
                null,

            freePositionInitialized:
                false,
        };

        try {
            event.currentTarget.setPointerCapture(
                event.pointerId
            );
        } catch {
            /*
             * Pointer capture may be unavailable.
             */
        }
    }

    /* =====================================================
       FREE CANVAS DRAG
    ===================================================== */

    function handleFreeCanvasDrag(
        event: PointerEvent<HTMLElement>
    ) {
        const state =
            dragState.current;

        if (!state) {
            return;
        }

        const deltaX =
            (event.clientX -
                state.startX) /
            state.scale;

        const deltaY =
            (event.clientY -
                state.startY) /
            state.scale;

        if (
            !isDragging.current &&
            Math.abs(deltaX) <
            DRAG_THRESHOLD &&
            Math.abs(deltaY) <
            DRAG_THRESHOLD
        ) {
            return;
        }

        if (
            !isDragging.current
        ) {
            beginActualDrag(
                event
            );
        }

        if (
            !isDragging.current
        ) {
            return;
        }

        /*
         * If this is actually a Grid drag,
         * do NOT perform Free Position updates.
         */
        if (
            isParentGrid()
        ) {
            return;
        }

        const newLeft =
            state.startLeft +
            deltaX;

        const newTop =
            state.startTop +
            deltaY;

        updateNodeStyles(
            node.id,
            {
                position:
                    "absolute",

                left:
                    `${Math.round(
                        newLeft
                    )}px`,

                top:
                    `${Math.round(
                        newTop
                    )}px`,
            }
        );
    }

    /* =====================================================
       POINTER MOVE
    ===================================================== */

    function handlePointerMove(
        event: PointerEvent<HTMLElement>
    ) {
        if (
            !isPointerDown.current ||
            !dragState.current
        ) {
            return;
        }

        const state =
            dragState.current;

        const deltaX =
            (event.clientX -
                state.startX) /
            state.scale;

        const deltaY =
            (event.clientY -
                state.startY) /
            state.scale;

        const passedThreshold =
            Math.abs(deltaX) >=
            DRAG_THRESHOLD ||
            Math.abs(deltaY) >=
            DRAG_THRESHOLD;

        if (
            !isDragging.current &&
            !passedThreshold
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        /*
         * IMPORTANT:
         *
         * Grid mode belongs to the PARENT.
         *
         * A Grid child usually has:
         *
         * layoutMode = automatic
         *
         * while its parent has:
         *
         * layoutMode = grid
         *
         * Therefore we must check the parent here.
         */
        if (
            isParentGrid()
        ) {
            if (
                !isDragging.current
            ) {
                beginActualDrag(
                    event
                );
            }

            if (
                isDragging.current
            ) {
                handleGridCanvasDrag(
                    event
                );
            }

            return;
        }

        /*
 * HORIZONTAL / VERTICAL
 *
 * Reorder within the normal flow.
 */
        if (
            state.layoutMode ===
            "horizontal" ||
            state.layoutMode ===
            "vertical"
        ) {
            handleFlowCanvasDrag(
                event
            );

            return;
        }

        /*
         * FREE POSITION
         *
         * Coordinate-based dragging.
         */
        handleFreeCanvasDrag(
            event
        );
    }

    /* =====================================================
       POINTER UP
    ===================================================== */

    function handlePointerUp(
        event: PointerEvent<HTMLElement>
    ) {
        if (
            !isPointerDown.current
        ) {
            return;
        }

        event.stopPropagation();

        const actuallyDragged =
            isDragging.current;

        isPointerDown.current =
            false;

        isDragging.current =
            false;

        dragState.current =
            null;

        setIsDragActive(
            false
        );

        try {
            event.currentTarget.releasePointerCapture(
                event.pointerId
            );
        } catch {
            /*
             * Pointer capture may already have
             * been released.
             */
        }

        if (
            actuallyDragged
        ) {
            endHistoryTransaction();
        } else {
            cancelHistoryTransaction();
        }
    }

    /* =====================================================
       POINTER CANCEL
    ===================================================== */

    function handlePointerCancel(
        event: PointerEvent<HTMLElement>
    ) {
        if (
            !isPointerDown.current
        ) {
            return;
        }

        const actuallyDragged =
            isDragging.current;

        isPointerDown.current =
            false;

        isDragging.current =
            false;

        dragState.current =
            null;

        setIsDragActive(
            false
        );

        try {
            event.currentTarget.releasePointerCapture(
                event.pointerId
            );
        } catch {
            /*
             * Pointer capture may already have
             * been released.
             */
        }

        if (
            actuallyDragged
        ) {
            cancelHistoryTransaction();
        }
    }

    /* =====================================================
       CLICK
    ===================================================== */

    function handleClick(
        event: MouseEvent
    ) {
        event.stopPropagation();

        if (isMultiSelectGesture.current) {
            isMultiSelectGesture.current = false;
            return;
        }

        if (
            event.ctrlKey ||
            event.metaKey
        ) {
            toggleNodeSelection(node.id);
            return;
        }

        selectNode(
            node.id
        );

        if (
            animationTrigger ===
            "click" &&
            animationValue &&
            animationValue !==
            "none"
        ) {
            setIsClickAnimationActive(
                false
            );

            requestAnimationFrame(
                () => {
                    setIsClickAnimationActive(
                        true
                    );
                }
            );
        }
    }

    /* =====================================================
       HOVER
    ===================================================== */

    function handleMouseEnter() {
        setIsHovered(
            true
        );
    }

    function handleMouseLeave() {
        setIsHovered(
            false
        );
    }

    /* =====================================================
       FOCUS
    ===================================================== */

    function handleFocus() {
        setIsFocused(
            true
        );
    }

    function handleBlur() {
        setIsFocused(
            false
        );
    }

    /* =====================================================
       RENDER STYLE
    ===================================================== */

    const style: CSSProperties = {
        width:
            resolvedStyles.width,

        /*
         * When an aspect ratio is active, CSS must be allowed to
         * calculate the height from the current width. A previously
         * resized node may still have an explicit pixel height in
         * the project model; keeping that height would lock the box
         * and make changing 16:9 -> 3:2 appear to do nothing.
         *
         * The resize overlay is responsible for changing width while
         * an aspect ratio is active. CSS then derives the height.
         */
        height:
            resolvedStyles.aspectRatio
                ? "auto"
                : resolvedStyles.height,

        minWidth:
            resolvedStyles.minWidth,

        maxWidth:
            resolvedStyles.maxWidth,

        minHeight:
            resolvedStyles.minHeight,

        maxHeight:
            resolvedStyles.maxHeight,

        aspectRatio:
            resolvedStyles.aspectRatio,

        position:
            resolvedStyles.position as
            CSSProperties["position"],

        top:
            resolvedStyles.top,

        right:
            resolvedStyles.right,

        bottom:
            resolvedStyles.bottom,

        left:
            resolvedStyles.left,

        zIndex:
            resolvedStyles.zIndex,

        marginTop:
            resolvedStyles.marginTop,

        marginRight:
            resolvedStyles.marginRight,

        marginBottom:
            resolvedStyles.marginBottom,

        marginLeft:
            resolvedStyles.marginLeft,

        paddingTop:
            resolvedStyles.paddingTop,

        paddingRight:
            resolvedStyles.paddingRight,

        paddingBottom:
            resolvedStyles.paddingBottom,

        paddingLeft:
            resolvedStyles.paddingLeft,

        display:
            resolvedStyles.display,

        visibility:
            resolvedStyles.visibility as
            CSSProperties["visibility"],

        flexDirection:
            resolvedStyles.flexDirection as
            CSSProperties["flexDirection"],

        justifyContent:
            resolvedStyles.justifyContent as
            CSSProperties["justifyContent"],

        alignItems:
            resolvedStyles.alignItems as
            CSSProperties["alignItems"],

        alignSelf:
            resolvedStyles.alignSelf as
            CSSProperties["alignSelf"],

        alignContent:
            resolvedStyles.alignContent as
            CSSProperties["alignContent"],

        justifyItems:
            resolvedStyles.justifyItems as
            CSSProperties["justifyItems"],

        gridColumnStart:
            resolvedStyles.gridColumnStart,

        gridColumnEnd:
            resolvedStyles.gridColumnEnd,

        gridRowStart:
            resolvedStyles.gridRowStart,

        gridRowEnd:
            resolvedStyles.gridRowEnd,

        gap:
            resolvedStyles.gap,

        gridTemplateColumns:
            resolvedStyles.gridTemplateColumns,

        gridTemplateRows:
            resolvedStyles.gridTemplateRows,

        columnGap:
            resolvedStyles.columnGap,

        rowGap:
            resolvedStyles.rowGap,

        flexWrap:
            resolvedStyles.flexWrap as
            CSSProperties["flexWrap"],

        flexGrow:
            resolvedStyles.flexGrow,

        flexShrink:
            resolvedStyles.flexShrink,

        flexBasis:
            resolvedStyles.flexBasis,

        order:
            resolvedStyles.order,

        fontFamily:
            resolvedStyles.fontFamily,

        fontSize:
            resolvedStyles.fontSize,

        fontWeight:
            resolvedStyles.fontWeight,

        lineHeight:
            resolvedStyles.lineHeight,

        letterSpacing:
            resolvedStyles.letterSpacing,

        textAlign:
            resolvedStyles.textAlign as
            CSSProperties["textAlign"],

        textTransform:
            resolvedStyles.textTransform as
            CSSProperties["textTransform"],

        textDecoration:
            resolvedStyles.textDecoration,

        color:
            resolvedStyles.color,

        backgroundColor:
            resolvedStyles.backgroundColor,

        backgroundImage:
            resolvedStyles.backgroundImage,

        backgroundSize:
            resolvedStyles.backgroundSize,

        backgroundPosition:
            resolvedStyles.backgroundPosition,

        backgroundRepeat:
            resolvedStyles.backgroundRepeat as
            CSSProperties["backgroundRepeat"],

        backgroundAttachment:
            resolvedStyles.backgroundAttachment as
            CSSProperties["backgroundAttachment"],

        borderRadius:
            resolvedStyles.borderRadius,

        borderStyle:
            resolvedStyles.borderStyle as
            CSSProperties["borderStyle"],

        borderWidth:
            resolvedStyles.borderWidth,

        borderColor:
            resolvedStyles.borderColor,

        borderTopStyle:
            resolvedStyles.borderTopStyle as
            CSSProperties["borderTopStyle"],

        borderRightStyle:
            resolvedStyles.borderRightStyle as
            CSSProperties["borderRightStyle"],

        borderBottomStyle:
            resolvedStyles.borderBottomStyle as
            CSSProperties["borderBottomStyle"],

        borderLeftStyle:
            resolvedStyles.borderLeftStyle as
            CSSProperties["borderLeftStyle"],

        borderTopWidth:
            resolvedStyles.borderTopWidth,

        borderRightWidth:
            resolvedStyles.borderRightWidth,

        borderBottomWidth:
            resolvedStyles.borderBottomWidth,

        borderLeftWidth:
            resolvedStyles.borderLeftWidth,

        borderTopColor:
            resolvedStyles.borderTopColor,

        borderRightColor:
            resolvedStyles.borderRightColor,

        borderBottomColor:
            resolvedStyles.borderBottomColor,

        borderLeftColor:
            resolvedStyles.borderLeftColor,

        opacity:
            resolvedStyles.opacity,

        filter:
            resolvedStyles.filter,

        backdropFilter:
            resolvedStyles.backdropFilter,

        boxShadow:
            resolvedStyles.boxShadow,

        transform:
            resolvedStyles.transform,

        animation:
            isDragActive
                ? "none"
                : effectiveAnimation,

        transition:
            isDragActive
                ? "none"
                : resolvedStyles.transition,

        overflow:
            resolvedStyles.overflow as
            CSSProperties["overflow"],

        cursor:
            isDragActive
                ? "grabbing"
                : resolvedStyles.cursor ||
                "grab",

        objectFit:
            resolvedStyles.objectFit as
            CSSProperties["objectFit"],

        userSelect:
            "none",

        touchAction:
            "none",
    };

    /* =====================================================
       INTERACTION PROPS
    ===================================================== */

    const interactionProps = {
        "data-node-id":
            node.id,

        onClick:
            handleClick,

        onPointerDown:
            handlePointerDown,

        onPointerMove:
            handlePointerMove,

        onPointerUp:
            handlePointerUp,

        onPointerCancel:
            handlePointerCancel,

        onMouseEnter:
            handleMouseEnter,

        onMouseLeave:
            handleMouseLeave,

        onFocus:
            handleFocus,

        onBlur:
            handleBlur,

        tabIndex:
            animationTrigger ===
                "focus"
                ? 0
                : undefined,
    };

    /* =====================================================
       HOVER / DRAG CLASS
    ===================================================== */

    const hoverClass =
        isHovered
            ? "outline outline-1 outline-blue-200"
            : "";

    const selectionClass =
        selectedNodeIds.includes(node.id)
            ? "outline outline-2 outline-blue-500"
            : "";

    const dragClass =
        isDragActive
            ? "outline outline-2 outline-blue-500 ring-2 ring-blue-300 ring-offset-2 shadow-lg"
            : "";

    const interactionClass =
        `${hoverClass} ${selectionClass} ${dragClass}`.trim();

    /* =====================================================
       TEXT
    ===================================================== */

    if (
        node.type ===
        "text"
    ) {
        return (
            <div
                {...interactionProps}
                style={style}
                className={
                    interactionClass
                }
            >
                {node.content}
            </div>
        );
    }

    /* =====================================================
       BUTTON
    ===================================================== */

    if (
        node.type ===
        "button"
    ) {
        return (
            <button
                {...interactionProps}
                style={style}
                className={
                    interactionClass
                }
                type="button"
            >
                {node.content}
            </button>
        );
    }

    /* =====================================================
       IMAGE
    ===================================================== */

    if (
        node.type ===
        "image"
    ) {
        const asset =
            node.assetId
                ? project.assets[
                node.assetId
                ]
                : null;

        const imageSource =
            asset?.source ||
            node.content;

        if (!imageSource) {
            return (
                <div
                    {...interactionProps}
                    className={`
                        flex
                        min-h-[120px]
                        items-center
                        justify-center
                        bg-gray-100
                        text-sm
                        text-gray-400
                        ${interactionClass}
                    `}
                    style={style}
                >
                    Image
                </div>
            );
        }

        return (
            <img
                {...interactionProps}
                src={imageSource}
                alt={
                    resolvedStyles.alt ||
                    asset?.name ||
                    ""
                }
                style={{
                    ...style,

                    display:
                        style.display ||
                        "block",

                    objectFit:
                        resolvedStyles.objectFit as
                        CSSProperties["objectFit"],
                    objectPosition:
                        resolvedStyles.objectPosition as
                        CSSProperties["objectPosition"],
                }}
                className={
                    interactionClass
                }
                draggable={false}
            />
        );
    }

    /* =====================================================
       CONTAINER-LIKE NODES
    ===================================================== */

    if (
        node.type ===
        "page" ||
        node.type ===
        "section" ||
        node.type ===
        "container" ||
        node.type ===
        "navbar"
    ) {
        const isSelectedGrid =
            selectedNodeId ===
            node.id &&
            layoutMode ===
            "grid";

        const gridTemplateColumns =
            resolvedStyles.gridTemplateColumns ||
            "repeat(3, minmax(0, 1fr))";

        const gridMatch =
            gridTemplateColumns.match(
                /repeat\(\s*(\d+)/
            );

        const gridColumns =
            gridMatch
                ? Number(
                    gridMatch[1]
                )
                : 3;

        const gridTemplateRows =
            resolvedStyles.gridTemplateRows ||
            "repeat(2, minmax(0, auto))";

        const gridRowMatch =
            gridTemplateRows.match(
                /repeat\(\s*(\d+)/
            );

        const gridRows =
            gridRowMatch
                ? Number(
                    gridRowMatch[1]
                )
                : 2;

        const isGridEmpty =
            !node.children ||
            node.children.length ===
            0;

        return (
            <div
                {...interactionProps}
                style={{
                    ...style,

                    /*
                     * The Grid guide is absolute,
                     * therefore the selected Grid
                     * container needs a positioning
                     * context.
                     */
                    ...(isSelectedGrid &&
                        style.position !==
                        "absolute" &&
                        style.position !==
                        "fixed" &&
                        style.position !==
                        "sticky"
                        ? {
                            position:
                                "relative",
                        }
                        : {}),
                }}
                className={
                    interactionClass
                }
            >
                {node.children?.map(
                    (
                        childId: string
                    ) => (
                        <RenderNode
                            key={
                                childId
                            }
                            nodeId={
                                childId
                            }
                            viewport={
                                viewport
                            }
                        />
                    )
                )}

                {isSelectedGrid && (
                    <GridGuide
                        columns={
                            gridColumns
                        }
                        rows={
                            gridRows
                        }
                        columnGap={
                            resolvedStyles.columnGap ||
                            "20px"
                        }
                        rowGap={
                            resolvedStyles.rowGap ||
                            "20px"
                        }
                        isEmpty={
                            isGridEmpty
                        }
                    />
                )}
            </div>
        );
    }

    return null;
}

/* =========================================================
   CANVAS
========================================================= */

export default function Canvas({
    viewport,
    viewportWidth,
}: CanvasProps) {
    const project =
        useEditorStore(
            (state) =>
                state.project
        );

    const selectNode =
        useEditorStore(
            (state) =>
                state.selectNode
        );

    const canvasRef =
        useRef<HTMLDivElement>(
            null
        );

    const [
        canvasWidth,
        setCanvasWidth,
    ] = useState(0);

    /* =====================================================
       CANVAS WIDTH
    ===================================================== */

    useEffect(() => {
        const element =
            canvasRef.current;

        if (!element) {
            return;
        }

        const updateCanvasWidth =
            () => {
                setCanvasWidth(
                    element.clientWidth
                );
            };

        updateCanvasWidth();

        const observer =
            new ResizeObserver(
                updateCanvasWidth
            );

        observer.observe(
            element
        );

        return () =>
            observer.disconnect();
    }, []);

    /* =====================================================
       CANVAS SCALING
    ===================================================== */

    const horizontalPadding =
        40;

    const availableWidth =
        Math.max(
            canvasWidth -
            horizontalPadding,
            0
        );

    const editorScale =
        availableWidth > 0
            ? Math.min(
                1,
                availableWidth /
                viewportWidth
            )
            : 1;

    const viewportMinHeight =
        900;

    const scaledViewportWidth =
        viewportWidth *
        editorScale;

    const scaledViewportHeight =
        viewportMinHeight *
        editorScale;

    /* =====================================================
       ACTIVE PAGE
    ===================================================== */

    const page =
        project.pages[
        project.activePageId
        ];

    if (!page) {
        return (
            <div
                className="
                    flex
                    min-w-0
                    flex-1
                    items-center
                    justify-center
                    bg-gray-200
                    text-sm
                    text-gray-500
                "
            >
                No active page
            </div>
        );
    }

    /* =====================================================
       RENDER CANVAS
    ===================================================== */

    return (
        <div
            ref={canvasRef}
            className="
                relative
                min-w-0
                flex-1
                overflow-auto
                bg-gray-200
            "
            onClick={() =>
                selectNode(null)
            }
        >
            <div
                className="
                    flex
                    min-h-full
                    min-w-0
                    justify-center
                    p-5
                "
            >
                <div
                    className="
                        relative
                        shrink-0
                    "
                    style={{
                        width:
                            `${scaledViewportWidth}px`,

                        height:
                            `${scaledViewportHeight}px`,
                    }}
                >
                    <div
                        className="
                            relative
                            min-h-[900px]
                            bg-white
                            shadow-xl
                        "
                        style={{
                            width:
                                `${viewportWidth}px`,

                            transform:
                                `scale(${editorScale})`,

                            transformOrigin:
                                "top left",

                            ...getDesignTokenVariables(
                                project.designTokens
                            ),
                        }}
                        data-viewport={
                            viewport
                        }
                    >
                        <style>
                            {
                                ANIMATION_KEYFRAMES
                            }
                        </style>

                        <RenderNode
                            nodeId={
                                page.rootNodeId
                            }
                            viewport={
                                viewport
                            }
                        />

                        <EditorOverlay />
                    </div>
                </div>
            </div>
        </div>
    );
}
