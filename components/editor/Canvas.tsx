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
} from "@/model/type";

import { useEditorStore } from "@/store/editorStore";
import EditorOverlay from "./EditorOverlay";

/* =========================================================
   BUILT-IN ANIMATION KEYFRAMES
========================================================= */

const ANIMATION_KEYFRAMES = `
@keyframes vwb-fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes vwb-fade-out {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

@keyframes vwb-slide-up {
    from {
        transform: translateY(30px);
    }

    to {
        transform: translateY(0);
    }
}

@keyframes vwb-slide-down {
    from {
        transform: translateY(-30px);
    }

    to {
        transform: translateY(0);
    }
}

@keyframes vwb-slide-left {
    from {
        transform: translateX(30px);
    }

    to {
        transform: translateX(0);
    }
}

@keyframes vwb-slide-right {
    from {
        transform: translateX(-30px);
    }

    to {
        transform: translateX(0);
    }
}

@keyframes vwb-zoom-in {
    from {
        transform: scale(0.8);
    }

    to {
        transform: scale(1);
    }
}

@keyframes vwb-zoom-out {
    from {
        transform: scale(1.2);
    }

    to {
        transform: scale(1);
    }
}

@keyframes vwb-bounce {
    0% {
        transform: translateY(0);
    }

    20% {
        transform: translateY(-25px);
    }

    40% {
        transform: translateY(0);
    }

    60% {
        transform: translateY(-12px);
    }

    80% {
        transform: translateY(0);
    }

    100% {
        transform: translateY(0);
    }
}

@keyframes vwb-pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

@keyframes vwb-shake {
    0% {
        transform: translateX(0);
    }

    20% {
        transform: translateX(-10px);
    }

    40% {
        transform: translateX(10px);
    }

    60% {
        transform: translateX(-8px);
    }

    80% {
        transform: translateX(8px);
    }

    100% {
        transform: translateX(0);
    }
}

@keyframes vwb-spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
`;

/* =========================================================
   CANVAS PROPS
========================================================= */

interface CanvasProps {
    viewport:
    | "desktop"
    | "tablet"
    | "mobile";

    viewportWidth: number;
}

/* =========================================================
   VIEWPORT TYPE
========================================================= */

type ViewportType =
    | "desktop"
    | "tablet"
    | "mobile";

/* =========================================================
   RESOLVED NODE STYLES
========================================================= */

function getResolvedStyles(
    node: ProjectNode,
    viewport: ViewportType
): BaseStyleProperties {
    const baseStyles: BaseStyleProperties = {
        ...(node.styles ?? {}),
    };

    /*
     * Responsive metadata is not a CSS property.
     */

    delete (
        baseStyles as BaseStyleProperties & {
            responsive?: unknown;
        }
    ).responsive;

    const responsiveStyles =
        node.styles?.responsive?.[
        viewport
        ];

    if (!responsiveStyles) {
        return baseStyles;
    }

    return {
        ...baseStyles,
        ...responsiveStyles,
    };
}

/* =========================================================
   RENDER NODE PROPS
========================================================= */

interface RenderNodeProps {
    nodeId: string;

    viewport: ViewportType;
}

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
}

/* =========================================================
   RENDER NODE
========================================================= */

function RenderNode({
    nodeId,
    viewport,
}: RenderNodeProps) {
    const project =
        useEditorStore(
            (state) => state.project
        );

    const selectNode =
        useEditorStore(
            (state) => state.selectNode
        );

    const updateNodeStyles =
        useEditorStore(
            (state) => state.updateNodeStyles
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

    const selectedNodeId =
        useEditorStore(
            (state) =>
                state.selectedNodeId
        );

    const node =
        project.nodes[nodeId];

    const [isHovered, setIsHovered] =
        useState(false);

    /*
     * A click animation needs a distinct "none" render before it can be
     * applied again. This lets every click replay the animation, including
     * clicks made after a previous run has finished.
     */
    const [isClickAnimationActive, setIsClickAnimationActive] =
        useState(false);

    const [isFocused, setIsFocused] =
        useState(false);

    const dragState =
        useRef<NodeDragState | null>(
            null
        );

    const isDragging =
        useRef(false);

    if (!node) {
        return null;
    }

    /* =====================================================
       RESOLVE RESPONSIVE STYLES
    ===================================================== */

    const resolvedStyles =
        getResolvedStyles(
            node,
            viewport
        );

    /* =====================================================
       ANIMATION
    ===================================================== */

    const animationTrigger =
        resolvedStyles.animationTrigger ||
        "load";

    const animationValue =
        resolvedStyles.animation;

    const effectiveAnimation =
        animationTrigger === "hover"
            ? (
                isHovered
                    ? animationValue
                    : "none"
            )
            : animationTrigger === "click"
                ? (
                    isClickAnimationActive
                        ? animationValue
                        : "none"
                )
                : animationTrigger === "focus"
                    ? (
                        isFocused
                            ? animationValue
                            : "none"
                    )
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
       POINTER DOWN
       
       IMPORTANT:
       Dragging is now handled by the actual
       rendered element instead of an invisible
       overlay.

       This allows hover events to work.
    ===================================================== */

    function handlePointerDown(
        event: PointerEvent<HTMLElement>
    ) {
        /*
         * Only left mouse button.
         *
         * Pointer buttons:
         * 0 = primary/left
         */

        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {
            return;
        }

        event.stopPropagation();

        selectNode(node.id);

        const viewportElement =
            document.querySelector(
                "[data-viewport]"
            ) as HTMLElement | null;

        if (!viewportElement) {
            return;
        }

        const scale =
            getEditorScale();

        const currentLeft =
            parseFloat(
                node.styles?.left ??
                "0"
            ) || 0;

        const currentTop =
            parseFloat(
                node.styles?.top ??
                "0"
            ) || 0;

        beginHistoryTransaction();

        isDragging.current =
            true;

        dragState.current = {
            startX:
                event.clientX,

            startY:
                event.clientY,

            startLeft:
                currentLeft,

            startTop:
                currentTop,

            scale,

            hasMoved:
                false,
        };

        try {
            event.currentTarget.setPointerCapture(
                event.pointerId
            );
        } catch {
            /*
             * Pointer capture is not
             * available in some environments.
             */
        }
    }

    /* =====================================================
       POINTER MOVE
    ===================================================== */

    function handlePointerMove(
        event: PointerEvent<HTMLElement>
    ) {
        if (
            !isDragging.current ||
            !dragState.current
        ) {
            return;
        }

        event.stopPropagation();

        const state =
            dragState.current;

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
         * Don't treat tiny pointer
         * movement as a drag.
         */

        if (
            Math.abs(deltaX) < 1 &&
            Math.abs(deltaY) < 1
        ) {
            return;
        }

        state.hasMoved =
            true;

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
                    "relative",

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
       POINTER UP
    ===================================================== */

    function handlePointerUp(
        event: PointerEvent<HTMLElement>
    ) {
        if (
            !isDragging.current
        ) {
            return;
        }

        event.stopPropagation();

        const moved =
            dragState.current
                ?.hasMoved ??
            false;

        isDragging.current =
            false;

        dragState.current =
            null;

        try {
            event.currentTarget.releasePointerCapture(
                event.pointerId
            );
        } catch {
            /*
             * Pointer capture may already
             * have been released.
             */
        }

        if (moved) {
            endHistoryTransaction();
        } else {
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

        selectNode(node.id);

        if (
            animationTrigger === "click" &&
            animationValue &&
            animationValue !== "none"
        ) {
            setIsClickAnimationActive(false);

            requestAnimationFrame(() => {
                setIsClickAnimationActive(true);
            });
        }
    }

    /* =====================================================
       HOVER
    ===================================================== */

    function handleMouseEnter() {
        setIsHovered(true);
    }

    function handleMouseLeave() {
        setIsHovered(false);
    }

    function handleFocus() {
        setIsFocused(true);
    }

    function handleBlur() {
        setIsFocused(false);
    }

    /* =====================================================
       STYLE
    ===================================================== */

    const style: CSSProperties = {
        /* -------------------------------------------------
           SIZE
        ------------------------------------------------- */

        width:
            resolvedStyles.width,

        height:
            resolvedStyles.height,

        minWidth:
            resolvedStyles.minWidth,

        maxWidth:
            resolvedStyles.maxWidth,

        minHeight:
            resolvedStyles.minHeight,

        maxHeight:
            resolvedStyles.maxHeight,

        /* -------------------------------------------------
           POSITION
        ------------------------------------------------- */

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

        /* -------------------------------------------------
           MARGIN
        ------------------------------------------------- */

        marginTop:
            resolvedStyles.marginTop,

        marginRight:
            resolvedStyles.marginRight,

        marginBottom:
            resolvedStyles.marginBottom,

        marginLeft:
            resolvedStyles.marginLeft,

        /* -------------------------------------------------
           PADDING
        ------------------------------------------------- */

        paddingTop:
            resolvedStyles.paddingTop,

        paddingRight:
            resolvedStyles.paddingRight,

        paddingBottom:
            resolvedStyles.paddingBottom,

        paddingLeft:
            resolvedStyles.paddingLeft,

        /* -------------------------------------------------
           DISPLAY
        ------------------------------------------------- */

        display:
            resolvedStyles.display,

        /* -------------------------------------------------
           FLEX
        ------------------------------------------------- */

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

        gap:
            resolvedStyles.gap,

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

        /* -------------------------------------------------
           TYPOGRAPHY
        ------------------------------------------------- */

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

        /* -------------------------------------------------
           COLORS
        ------------------------------------------------- */

        color:
            resolvedStyles.color,

        backgroundColor:
            resolvedStyles.backgroundColor,

        backgroundImage:
            resolvedStyles.backgroundImage,

        /* -------------------------------------------------
           BORDER
        ------------------------------------------------- */

        borderRadius:
            resolvedStyles.borderRadius,

        borderStyle:
            resolvedStyles.borderStyle as
            CSSProperties["borderStyle"],

        borderWidth:
            resolvedStyles.borderWidth,

        borderColor:
            resolvedStyles.borderColor,

        /* -------------------------------------------------
           EFFECTS
        ------------------------------------------------- */

        opacity:
            resolvedStyles.opacity,

        boxShadow:
            resolvedStyles.boxShadow,

        transform:
            resolvedStyles.transform,

        /*
         * LOAD animation remains unchanged.
         *
         * HOVER animation is controlled by
         * effectiveAnimation.
         */

        animation:
            effectiveAnimation,

        transition:
            resolvedStyles.transition,

        /* -------------------------------------------------
           OVERFLOW
        ------------------------------------------------- */

        overflow:
            resolvedStyles.overflow as
            CSSProperties["overflow"],

        /* -------------------------------------------------
           INTERACTION
        ------------------------------------------------- */

        cursor:
            resolvedStyles.cursor,

        /* -------------------------------------------------
           IMAGE
        ------------------------------------------------- */

        objectFit:
            resolvedStyles.objectFit as
            CSSProperties["objectFit"],
    };

    /* =====================================================
       COMMON INTERACTION PROPS
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

        onMouseEnter:
            handleMouseEnter,

        onMouseLeave:
            handleMouseLeave,

        onFocus:
            handleFocus,

        onBlur:
            handleBlur,

        tabIndex:
            animationTrigger === "focus"
                ? 0
                : undefined,
    };

    const hoverClass =
        isHovered
            ? "outline outline-1 outline-blue-200"
            : "";

    /* =====================================================
       TEXT
    ===================================================== */

    if (node.type === "text") {
        return (
            <div
                {...interactionProps}
                style={style}
                className={hoverClass}
            >
                {node.content}
            </div>
        );
    }

    /* =====================================================
       BUTTON
    ===================================================== */

    if (node.type === "button") {
        return (
            <button
                {...interactionProps}
                style={style}
                className={hoverClass}
                type="button"
            >
                {node.content}
            </button>
        );
    }

    /* =====================================================
       IMAGE
    ===================================================== */

    if (node.type === "image") {
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
                    style={style}
                    className={`
                        flex
                        min-h-[120px]
                        items-center
                        justify-center
                        bg-gray-100
                        text-sm
                        text-gray-400
                        ${hoverClass}
                    `}
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
                }}
                className={hoverClass}
            />
        );
    }

    /* =====================================================
       STRUCTURAL NODES
    ===================================================== */

    if (
        node.type === "page" ||
        node.type === "section" ||
        node.type === "container" ||
        node.type === "navbar"
    ) {
        return (
            <div
                {...interactionProps}
                style={style}
                className={hoverClass}
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
            (state) => state.project
        );

    const selectNode =
        useEditorStore(
            (state) => state.selectNode
        );

    /* =====================================================
       CANVAS SIZE
    ===================================================== */

    const canvasRef =
        useRef<HTMLDivElement>(null);

    const [canvasWidth, setCanvasWidth] =
        useState(0);

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

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, []);

    /* =====================================================
       EDITOR SCALE
    ===================================================== */

    const horizontalPadding = 40;

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

    /* =====================================================
       SCALED DIMENSIONS
    ===================================================== */

    const viewportMinHeight = 900;

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
       CANVAS
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
                        }}
                        data-viewport={
                            viewport
                        }
                    >
                        <style>
                            {ANIMATION_KEYFRAMES}
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
