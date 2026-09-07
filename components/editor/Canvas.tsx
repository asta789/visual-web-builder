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

import IconElement, { type BuilderIconName } from "./IconElement";
import VideoElement from "./VideoElement";
import AudioElement from "./AudioElement";
import DividerElement from "./DividerElement";
import ListElement, { type BuilderListMarkerStyle } from "./ListElement";
import TableElement from "./TableElement";
import InputElement, { type BuilderInputType } from "./InputElement";
import TextareaElement, { type BuilderTextareaResize } from "./TextareaElement";
import SelectElement from "./SelectElement";
import CheckboxElement from "./CheckboxElement";
import RadioElement from "./RadioElements";
import SwitchElement from "./SwitchElement";

import { useEditorStore } from "@/store/editorStore";
import { createTokenVariableMap } from "./design-tokens/tokenUtils";
import { mergeReusableStyleClasses } from "./reusable-styles/styleClassUtils";
import {
    getCompositeEditingContext,
} from "./composite/CompositeEditingLock";
import EditorOverlay from "./EditorOverlay";
import {
    getAccordionInitialOpenIds,
    toggleAccordionItemIds,
} from "./accordion/AccordionModule";

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
    viewport: ViewportType,
    reusableStyles?: Parameters<typeof mergeReusableStyleClasses>[1]
): BaseStyleProperties {
    /*
     * Canvas and Preview must resolve the same style layers:
     *
     * 1. reusable style classes
     * 2. node-local base styles
     * 3. reusable class responsive styles
     * 4. node-local responsive styles
     *
     * Node-local styles intentionally win over reusable classes.
     */
    const classStyles = mergeReusableStyleClasses(
        node,
        reusableStyles
    );

    const baseStyles: BaseStyleProperties = {
        ...(classStyles ?? {}),
        ...(node.styles ?? {}),
    };

    delete (
        baseStyles as BaseStyleProperties & {
            responsive?: unknown;
        }
    ).responsive;

    const reusableResponsiveStyles =
        classStyles?.responsive?.[viewport] ?? {};

    const nodeResponsiveStyles =
        node.styles?.responsive?.[viewport] ?? {};

    return {
        ...baseStyles,
        ...reusableResponsiveStyles,
        ...nodeResponsiveStyles,
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

    /** The actual node moved by this canvas gesture. */
    dragNodeId: string;

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

    const updateNode =
        useEditorStore(
            (state) =>
                state.updateNode
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

    const compositeEditing = getCompositeEditingContext(
        node,
        project.nodes,
    );

    const [
        openAccordionItems,
        setOpenAccordionItems,
    ] = useState<string[]>(() =>
        node?.type === "accordion"
            ? getAccordionInitialOpenIds(node)
            : [],
    );

    useEffect(() => {
        if (node?.type !== "accordion") return;

        setOpenAccordionItems(getAccordionInitialOpenIds(node));
    }, [
        node?.type,
        node?.id,
        node?.accordionDefaultOpen,
        node?.accordionAllowMultiple,
        node?.children,
    ]);

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
            ? getResolvedStyles(
                node,
                viewport,
                project.reusableStyles
            )
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
        element: HTMLElement,
        parentId: string,
    ) {
        const parentElement =
            document.querySelector(
                `[data-node-id="${parentId}"]`
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
                viewport,
                project.reusableStyles
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

        const dragElement =
            document.querySelector(
                `[data-node-id="${state.dragNodeId}"]`
            ) as HTMLElement | null;

        const positionElement =
            dragElement ?? event.currentTarget;

        if (state.parentId) {
            renderedPosition =
                getRenderedPositionRelativeToParent(
                    positionElement,
                    state.parentId,
                );
        } else {
            renderedPosition =
                getRenderedPositionRelativeToViewport(
                    positionElement
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
            state.dragNodeId,
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
                        state.dragNodeId
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
                state.dragNodeId
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
                viewport,
                project.reusableStyles
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
                    childId !== state.dragNodeId
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
                viewport,
                project.reusableStyles
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
                state.dragNodeId
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
                    state.dragNodeId
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
            state.dragNodeId,
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
            state.dragNodeId,
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

        if (!compositeEditing.isCanvasInteractionEnabled) {
            return;
        }

        event.stopPropagation();

        const interactionNode = node;

        const isMultiSelect =
            event.ctrlKey ||
            event.metaKey;

        if (isMultiSelect) {
            /*
             * Do not change Zustand selection state during pointerdown.
             * Updating selection here can cause the canvas tree to re-render
             * while the current pointer gesture is still being processed.
             * In nested nodes (for example Button inside Section), that can
             * make the following event resolve against the parent and select
             * it unexpectedly.
             *
             * Defer the actual selection change to handleClick(), after the
             * pointer gesture has completed.
             */
            isMultiSelectGesture.current = true;
            return;
        }

        isMultiSelectGesture.current = false;

        selectNode(
            interactionNode.id
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
            interactionNode.id === node.id
                ? getCurrentPosition()
                : (() => {
                    const styles = getResolvedStyles(
                        interactionNode,
                        viewport,
                        project.reusableStyles,
                    );
                    return {
                        left: parseFloat(styles.left ?? "0") || 0,
                        top: parseFloat(styles.top ?? "0") || 0,
                    };
                })();

        /*
         * Determine the layout mode from the parent.
         *
         * A child is positioned/reordered according to
         * its parent's layout mode.
         */
        let dragLayoutMode =
            layoutMode;

        if (
            interactionNode.parentId
        ) {
            const parent =
                project.nodes[
                interactionNode.parentId
                ];

            if (parent) {
                const parentStyles =
                    getResolvedStyles(
                        parent,
                        viewport,
                        project.reusableStyles
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
                interactionNode.parentId ??
                null,

            dragNodeId: interactionNode.id,

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
            state.dragNodeId,
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
        if (!compositeEditing.isCanvasInteractionEnabled) {
            return;
        }

        event.stopPropagation();

        if (isMultiSelectGesture.current) {
            isMultiSelectGesture.current = false;
            toggleNodeSelection(node.id);
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
            (resolvedStyles.borderTopStyle ??
                resolvedStyles.borderStyle) as
            CSSProperties["borderTopStyle"],

        borderRightStyle:
            (resolvedStyles.borderRightStyle ??
                resolvedStyles.borderStyle) as
            CSSProperties["borderRightStyle"],

        borderBottomStyle:
            (resolvedStyles.borderBottomStyle ??
                resolvedStyles.borderStyle) as
            CSSProperties["borderBottomStyle"],

        borderLeftStyle:
            (resolvedStyles.borderLeftStyle ??
                resolvedStyles.borderStyle) as
            CSSProperties["borderLeftStyle"],

        borderTopWidth:
            resolvedStyles.borderTopWidth ??
            resolvedStyles.borderWidth,

        borderRightWidth:
            resolvedStyles.borderRightWidth ??
            resolvedStyles.borderWidth,

        borderBottomWidth:
            resolvedStyles.borderBottomWidth ??
            resolvedStyles.borderWidth,

        borderLeftWidth:
            resolvedStyles.borderLeftWidth ??
            resolvedStyles.borderWidth,

        borderTopColor:
            resolvedStyles.borderTopColor ??
            resolvedStyles.borderColor,

        borderRightColor:
            resolvedStyles.borderRightColor ??
            resolvedStyles.borderColor,

        borderBottomColor:
            resolvedStyles.borderBottomColor ??
            resolvedStyles.borderColor,

        borderLeftColor:
            resolvedStyles.borderLeftColor ??
            resolvedStyles.borderColor,

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
            !compositeEditing.isCanvasInteractionEnabled
                ? "default"
                : isDragActive
                    ? "grabbing"
                    : resolvedStyles.cursor || "grab",

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
        "data-node-id": node.id,
        "data-accordion-role": node.accordionRole,
        ...(compositeEditing.isCanvasInteractionEnabled
            ? {
                onClick: handleClick,
                onPointerDown: handlePointerDown,
                onPointerMove: handlePointerMove,
                onPointerUp: handlePointerUp,
                onPointerCancel: handlePointerCancel,
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
                onFocus: handleFocus,
                onBlur: handleBlur,
                tabIndex: animationTrigger === "focus" ? 0 : undefined,
            }
            : {}),
    };

    /* =====================================================
       HOVER / DRAG CLASS
    ===================================================== */

    const hoverClass =
        isHovered
            ? "outline outline-1 outline-blue-200"
            : "";

    const selectionClass =
        compositeEditing.isCanvasInteractionEnabled &&
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
        const TextTag =
            node.textElement ||
            "div";

        return (
            <TextTag
                {...interactionProps}
                style={style}
                className={
                    interactionClass
                }
            >
                {node.content}
            </TextTag>
        );
    }

    /* =====================================================
       ICON
    ===================================================== */

    if (node.type === "icon") {
        return (
            <IconElement
                {...interactionProps}
                name={(node.iconName || "star") as BuilderIconName}
                size={node.iconSize || 32}
                strokeWidth={node.iconStrokeWidth || 2}
                style={style}
                className={interactionClass}
            />
        );
    }

    /* =====================================================
       VIDEO
    ===================================================== */

    if (node.type === "video") {
        return (
            <VideoElement
                {...interactionProps}
                source={node.videoSource}
                poster={node.videoPoster}
                controls={node.videoControls ?? true}
                autoPlay={node.videoAutoplay ?? false}
                muted={node.videoMuted ?? true}
                loop={node.videoLoop ?? false}
                preload={node.videoPreload ?? "metadata"}
                style={{
                    ...style,
                    objectFit:
                        resolvedStyles.objectFit as CSSProperties["objectFit"],
                    objectPosition:
                        resolvedStyles.objectPosition as CSSProperties["objectPosition"],
                }}
                className={interactionClass}
            />
        );
    }

    /* =====================================================
       AUDIO
    ===================================================== */

    if (node.type === "audio") {
        return (
            <AudioElement
                {...interactionProps}
                source={node.audioSource}
                controls={node.audioControls ?? true}
                autoPlay={node.audioAutoplay ?? false}
                muted={node.audioMuted ?? false}
                loop={node.audioLoop ?? false}
                preload={node.audioPreload ?? "metadata"}
                volume={node.audioVolume ?? 1}
                style={style}
                className={interactionClass}
            />
        );
    }

    /* =====================================================
       DIVIDER
    ===================================================== */

    if (node.type === "divider") {
        return (
            <DividerElement
                {...interactionProps}
                orientation={node.dividerOrientation ?? "horizontal"}
                thickness={node.dividerThickness ?? 2}
                lineStyle={node.dividerStyle ?? "solid"}
                color={node.dividerColor ?? "#d1d5db"}
                align={node.dividerAlign ?? "center"}
                style={style}
                className={interactionClass}
            />
        );
    }

    /* =====================================================
       LIST
    ===================================================== */

    if (node.type === "list") {
        return (
            <ListElement
                {...interactionProps}
                items={node.listItems}
                ordered={node.listOrdered ?? false}
                markerStyle={
                    node.listMarkerStyle as BuilderListMarkerStyle | undefined
                }
                start={node.listStart ?? 1}
                itemGap={node.listItemGap ?? 8}
                style={style}
                className={interactionClass}
            />
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    if (node.type === "table") {
        return (
            <TableElement
                {...interactionProps}
                data={node.tableData}
                header={node.tableHeader ?? true}
                striped={node.tableStriped ?? false}
                borderWidth={node.tableBorderWidth ?? 1}
                borderStyle={node.tableBorderStyle ?? "solid"}
                borderColor={node.tableBorderColor ?? "#d1d5db"}
                cellPadding={node.tableCellPadding ?? 10}
                cellAlign={node.tableCellAlign ?? "left"}
                cellVerticalAlign={node.tableCellVerticalAlign ?? "middle"}
                columnWidths={node.tableColumnWidths ?? []}
                rowHeight={node.tableRowHeight ?? 0}
                style={style}
                className={interactionClass}
            />
        );
    }

    /* =====================================================
       INPUT
    ===================================================== */

    if (node.type === "input") {
        return (
            <div
                {...interactionProps}
                style={{
                    ...style,
                    boxSizing: "border-box",
                }}
                className={interactionClass}
            >
                <InputElement
                    inputType={
                        (node.inputType ?? "text") as BuilderInputType
                    }
                    placeholder={node.inputPlaceholder ?? ""}
                    value={node.inputValue ?? ""}
                    name={node.inputName ?? undefined}
                    required={node.inputRequired ?? false}
                    disabled={node.inputDisabled ?? false}
                    readOnly={node.inputReadOnly ?? false}
                    min={
                        node.inputType === "number"
                            ? node.inputMin || undefined
                            : undefined
                    }
                    max={
                        node.inputType === "number"
                            ? node.inputMax || undefined
                            : undefined
                    }
                    step={
                        node.inputType === "number"
                            ? node.inputStep || undefined
                            : undefined
                    }
                    style={{
                        width: "100%",
                        height: "100%",
                        minWidth: 0,
                        minHeight: 0,
                        boxSizing: "border-box",
                        fontFamily: style.fontFamily,
                        fontSize: style.fontSize,
                        fontWeight: style.fontWeight,
                        lineHeight: style.lineHeight,
                        letterSpacing: style.letterSpacing,
                        textAlign: style.textAlign,
                        textTransform: style.textTransform,
                        textDecoration: style.textDecoration,
                        color: style.color,
                        backgroundColor: style.backgroundColor,
                        backgroundImage: style.backgroundImage,
                        backgroundSize: style.backgroundSize,
                        backgroundPosition: style.backgroundPosition,
                        backgroundRepeat: style.backgroundRepeat,
                        backgroundAttachment: style.backgroundAttachment,
                        borderRadius: style.borderRadius,
                        // Use per-side border properties for Textarea instead of
                        // mixing borderStyle shorthand with side-specific styles.
                        // React warns when a shorthand and a conflicting side
                        // property are updated together across renders.
                        borderTopStyle: (style.borderTopStyle ?? style.borderStyle) as CSSProperties["borderTopStyle"],
                        borderRightStyle: (style.borderRightStyle ?? style.borderStyle) as CSSProperties["borderRightStyle"],
                        borderBottomStyle: (style.borderBottomStyle ?? style.borderStyle) as CSSProperties["borderBottomStyle"],
                        borderLeftStyle: (style.borderLeftStyle ?? style.borderStyle) as CSSProperties["borderLeftStyle"],
                        borderTopWidth: style.borderTopWidth,
                        borderRightWidth: style.borderRightWidth,
                        borderBottomWidth: style.borderBottomWidth,
                        borderLeftWidth: style.borderLeftWidth,
                        borderTopColor: style.borderTopColor,
                        borderRightColor: style.borderRightColor,
                        borderBottomColor: style.borderBottomColor,
                        borderLeftColor: style.borderLeftColor,
                        boxShadow: style.boxShadow,
                        opacity: style.opacity,
                        filter: style.filter,
                        backdropFilter: style.backdropFilter,
                        paddingTop: style.paddingTop,
                        paddingRight: style.paddingRight,
                        paddingBottom: style.paddingBottom,
                        paddingLeft: style.paddingLeft,
                        cursor: style.cursor,
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                    className="h-full w-full"
                />
            </div>
        );
    }

    /* =====================================================
       TEXTAREA
    ===================================================== */

    if (node.type === "textarea") {
        /*
         * The outer interaction wrapper must NOT receive the node's border.
         * It already renders the selection/hover outline, while the native
         * textarea is responsible for the actual visual border.
         *
         * Keeping the node border on both elements creates two visible
         * borders in the editor even though Preview only renders one.
         */
        const textareaWrapperStyle: CSSProperties = {
            ...style,

            // The wrapper is an editor-only interaction layer.
            // Keep node geometry (including margin) here, but do NOT let
            // the wrapper render the textarea's visual box-model properties.
            // Padding belongs only to the native textarea below.
            borderStyle: undefined,
            borderWidth: undefined,
            borderColor: undefined,
            borderTopStyle: undefined,
            borderRightStyle: undefined,
            borderBottomStyle: undefined,
            borderLeftStyle: undefined,
            borderTopWidth: undefined,
            borderRightWidth: undefined,
            borderBottomWidth: undefined,
            borderLeftWidth: undefined,
            borderTopColor: undefined,
            borderRightColor: undefined,
            borderBottomColor: undefined,
            borderLeftColor: undefined,

            // Prevent padding from being applied twice in Canvas.
            // Preview applies padding directly to the textarea itself.
            paddingTop: undefined,
            paddingRight: undefined,
            paddingBottom: undefined,
            paddingLeft: undefined,

            boxSizing: "border-box",
        };

        return (
            <div
                {...interactionProps}
                style={textareaWrapperStyle}
                className={interactionClass}
            >
                <TextareaElement
                    placeholder={node.textareaPlaceholder ?? ""}
                    defaultValue={node.textareaValue ?? ""}
                    name={node.textareaName || undefined}
                    required={node.textareaRequired ?? false}
                    disabled={node.textareaDisabled ?? false}
                    readOnly={node.textareaReadOnly ?? false}
                    minLength={node.textareaMinLength && node.textareaMinLength > 0 ? node.textareaMinLength : undefined}
                    maxLength={node.textareaMaxLength && node.textareaMaxLength > 0 ? node.textareaMaxLength : undefined}
                    rows={node.textareaRows ?? 5}
                    resize={(node.textareaResize ?? "vertical") as BuilderTextareaResize}
                    style={{
                        width: "100%",
                        height: "100%",
                        minWidth: 0,
                        minHeight: 0,
                        boxSizing: "border-box",
                        fontFamily: style.fontFamily,
                        fontSize: style.fontSize,
                        fontWeight: style.fontWeight,
                        lineHeight: style.lineHeight,
                        letterSpacing: style.letterSpacing,
                        textAlign: style.textAlign,
                        textTransform: style.textTransform,
                        textDecoration: style.textDecoration,
                        color: style.color,
                        backgroundColor: style.backgroundColor,
                        backgroundImage: style.backgroundImage,
                        backgroundSize: style.backgroundSize,
                        backgroundPosition: style.backgroundPosition,
                        backgroundRepeat: style.backgroundRepeat,
                        backgroundAttachment: style.backgroundAttachment,
                        borderRadius: style.borderRadius,

                        // Only per-side border properties are passed to the
                        // native textarea. Never pass borderStyle/borderWidth/
                        // borderColor alongside these properties.
                        borderTopStyle: (style.borderTopStyle ?? style.borderStyle) as CSSProperties["borderTopStyle"],
                        borderRightStyle: (style.borderRightStyle ?? style.borderStyle) as CSSProperties["borderRightStyle"],
                        borderBottomStyle: (style.borderBottomStyle ?? style.borderStyle) as CSSProperties["borderBottomStyle"],
                        borderLeftStyle: (style.borderLeftStyle ?? style.borderStyle) as CSSProperties["borderLeftStyle"],
                        borderTopWidth: style.borderTopWidth ?? style.borderWidth,
                        borderRightWidth: style.borderRightWidth ?? style.borderWidth,
                        borderBottomWidth: style.borderBottomWidth ?? style.borderWidth,
                        borderLeftWidth: style.borderLeftWidth ?? style.borderWidth,
                        borderTopColor: style.borderTopColor ?? style.borderColor,
                        borderRightColor: style.borderRightColor ?? style.borderColor,
                        borderBottomColor: style.borderBottomColor ?? style.borderColor,
                        borderLeftColor: style.borderLeftColor ?? style.borderColor,

                        boxShadow: style.boxShadow,
                        opacity: style.opacity,
                        filter: style.filter,
                        backdropFilter: style.backdropFilter,
                        paddingTop: style.paddingTop,
                        paddingRight: style.paddingRight,
                        paddingBottom: style.paddingBottom,
                        paddingLeft: style.paddingLeft,
                        cursor: style.cursor,
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                    className="h-full w-full"
                />
            </div>
        );
    }

    /* =====================================================
       SELECT
    ===================================================== */

    if (node.type === "select") {
        return (
            <SelectElement
                {...interactionProps}
                options={node.selectOptions ?? []}
                value={node.selectValue ?? ""}
                placeholder={node.selectPlaceholder}
                name={node.selectName}
                required={node.selectRequired ?? false}
                disabled={node.selectDisabled ?? false}
                multiple={node.selectMultiple ?? false}
                style={style}
                className={interactionClass}
            />
        );
    }

    /* =====================================================
       CHECKBOX
    ===================================================== */

    if (node.type === "checkbox") {
        return (
            <CheckboxElement
                {...interactionProps}
                label={node.checkboxLabel ?? "Checkbox"}
                value={node.checkboxValue ?? "on"}
                name={node.checkboxName}
                checked={node.checkboxChecked ?? false}
                required={node.checkboxRequired ?? false}
                disabled={node.checkboxDisabled ?? false}
                style={style}
                className={interactionClass}
            />
        );
    }

    /* =====================================================
       RADIO
    ===================================================== */

    if (node.type === "radio") {
        return (
            <RadioElement
                {...interactionProps}
                options={node.radioOptions ?? []}
                name={node.radioName ?? "radio-group"}
                required={node.radioRequired ?? false}
                disabled={node.radioDisabled ?? false}
                style={style}
                className={interactionClass}
            />
        );
    }

    /* =====================================================
       SWITCH
    ===================================================== */

    if (node.type === "switch") {
        return (
            <SwitchElement
                {...interactionProps}
                label={node.switchLabel ?? "Toggle"}
                name={node.switchName}
                value={node.switchValue ?? "on"}
                checked={node.switchChecked ?? false}
                onChange={(event) =>
                    updateNode(node.id, {
                        switchChecked: event.target.checked,
                    })
                }
                required={node.switchRequired ?? false}
                disabled={node.switchDisabled ?? false}
                style={style}
                className={interactionClass}
            />
        );
    }

    /* =====================================================
       BUTTON
    ===================================================== */

    if (
        node.type ===
        "button"
    ) {
        const buttonType =
            node.buttonType === "submit" ||
                node.buttonType === "reset"
                ? node.buttonType
                : "button";

        return (
            <button
                {...interactionProps}
                style={style}
                className={
                    interactionClass
                }
                type={buttonType}
                aria-disabled={
                    node.buttonDisabled
                        ? "true"
                        : undefined
                }
                data-button-disabled={
                    node.buttonDisabled
                        ? "true"
                        : undefined
                }
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
       ACCORDION
    ===================================================== */

    if (node.type === "accordion") {
        const items = node.children ?? [];
        const allowMultiple = node.accordionAllowMultiple ?? false;
        const safeRootId = node.id.replace(/[^a-zA-Z0-9_-]/g, "-");

        function toggleAccordionItem(itemId: string) {
            setOpenAccordionItems((current) =>
                toggleAccordionItemIds(
                    current,
                    itemId,
                    allowMultiple,
                ),
            );
        }

        return (
            <div
                {...interactionProps}
                style={style}
                className={`${interactionClass} vwb-accordion-${safeRootId}`}
                data-composite-editing-locked={
                    compositeEditing.isLocked ? "true" : undefined
                }
            >
                <style>
                    {` .vwb-accordion-${safeRootId} .vwb-accordion-item-closed [data-accordion-role="content"] { display: none !important; }
`}
                </style>

                {items.map((itemId) => {
                    const item = project.nodes[itemId];
                    if (!item) return null;

                    const headerId = (item.children ?? []).find(
                        (childId) => project.nodes[childId]?.accordionRole === "header",
                    );

                    const isOpen = openAccordionItems.includes(itemId);

                    return (
                        <div
                            key={itemId}
                            className={isOpen ? "vwb-accordion-item-open" : "vwb-accordion-item-closed"}
                            onClickCapture={(event) => {
                                const target = event.target;
                                if (!(target instanceof Element)) return;

                                const header = target.closest('[data-accordion-role="header"]');
                                if (!header || !headerId) return;

                                /*
                                 * In locked mode the Accordion header is still an
                                 * editable composite child. Its own children (for
                                 * example Question 1/2/3 text or the chevron icon)
                                 * must be allowed to receive the click themselves.
                                 * The item-level capture handler only owns clicks
                                 * on the header node itself, such as its empty/padded
                                 * area.
                                 */
                                if (compositeEditing.isLocked) {
                                    const targetNodeElement = target.closest('[data-node-id]');
                                    const targetNodeId = targetNodeElement?.getAttribute('data-node-id');

                                    if (targetNodeId && targetNodeId !== headerId) {
                                        return;
                                    }
                                }

                                event.stopPropagation();
                                if (compositeEditing.isLocked) {
                                    selectNode(headerId);
                                } else {
                                    selectNode(node.id);
                                }
                                toggleAccordionItem(itemId);
                            }}
                        >
                            <RenderNode
                                nodeId={itemId}
                                viewport={viewport}
                            />
                        </div>
                    );
                })}
            </div>
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
        "navbar" ||
        node.type ===
        "card"
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
