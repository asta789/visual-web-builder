"use client";

import {
    useState,
    type CSSProperties,
    type MouseEvent,
} from "react";

import { useEditorStore } from "@/store/editorStore";
import EditorOverlay from "./EditorOverlay";

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
   RENDER NODE
========================================================= */

interface RenderNodeProps {
    nodeId: string;
}

function RenderNode({
    nodeId,
}: RenderNodeProps) {
    const project = useEditorStore(
        (state) => state.project
    );

    const selectNode = useEditorStore(
        (state) => state.selectNode
    );

    const node =
        project.nodes[nodeId];

    const [isHovered, setIsHovered] =
        useState(false);

    if (!node) {
        return null;
    }

    /* =====================================================
       STYLE
    ===================================================== */

    const style: CSSProperties = {
        width: node.styles?.width,
        height: node.styles?.height,

        position:
            node.styles?.position as CSSProperties["position"],

        top: node.styles?.top,
        right: node.styles?.right,
        bottom: node.styles?.bottom,
        left: node.styles?.left,

        zIndex:
            node.styles?.zIndex,

        marginTop:
            node.styles?.marginTop,
        marginRight:
            node.styles?.marginRight,
        marginBottom:
            node.styles?.marginBottom,
        marginLeft:
            node.styles?.marginLeft,

        paddingTop:
            node.styles?.paddingTop,
        paddingRight:
            node.styles?.paddingRight,
        paddingBottom:
            node.styles?.paddingBottom,
        paddingLeft:
            node.styles?.paddingLeft,

        display:
            node.styles?.display,

        flexDirection:
            node.styles?.flexDirection as CSSProperties["flexDirection"],

        justifyContent:
            node.styles?.justifyContent as CSSProperties["justifyContent"],

        alignItems:
            node.styles?.alignItems as CSSProperties["alignItems"],

        gap:
            node.styles?.gap,

        flexWrap:
            node.styles?.flexWrap as CSSProperties["flexWrap"],

        fontFamily:
            node.styles?.fontFamily,

        fontSize:
            node.styles?.fontSize,

        fontWeight:
            node.styles?.fontWeight,

        lineHeight:
            node.styles?.lineHeight,

        letterSpacing:
            node.styles?.letterSpacing,

        textAlign:
            node.styles?.textAlign as CSSProperties["textAlign"],

        textTransform:
            node.styles?.textTransform as CSSProperties["textTransform"],

        color:
            node.styles?.color,

        backgroundColor:
            node.styles?.backgroundColor,

        borderRadius:
            node.styles?.borderRadius,

        borderStyle:
            node.styles?.borderStyle as CSSProperties["borderStyle"],

        borderWidth:
            node.styles?.borderWidth,

        borderColor:
            node.styles?.borderColor,

        opacity:
            node.styles?.opacity,

        boxShadow:
            node.styles?.boxShadow,

        overflow:
            node.styles?.overflow as CSSProperties["overflow"],

        cursor:
            node.styles?.cursor,

        objectFit:
            node.styles?.objectFit as CSSProperties["objectFit"],
    };

    /* =====================================================
       INTERACTION
    ===================================================== */

    function handleClick(
        event: MouseEvent
    ) {
        event.stopPropagation();

        selectNode(node.id);
    }

    function handleMouseEnter() {
        setIsHovered(true);
    }

    function handleMouseLeave() {
        setIsHovered(false);
    }

    const hoverClass = isHovered
        ? "outline outline-1 outline-blue-200"
        : "";

    const interactionProps = {
        "data-node-id": node.id,

        onClick: handleClick,

        onMouseEnter:
            handleMouseEnter,

        onMouseLeave:
            handleMouseLeave,
    };

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

    /* =====================================================
       STRUCTURAL NODES
    ===================================================== */

    if (
        node.type === "page" ||
        node.type === "section" ||
        node.type === "container"
    ) {
        return (
            <div
                {...interactionProps}
                style={style}
                className={hoverClass}
            >
                {node.children?.map(
                    (childId: string) => (
                        <RenderNode
                            key={childId}
                            nodeId={childId}
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
    const project = useEditorStore(
        (state) => state.project
    );

    const selectNode = useEditorStore(
        (state) => state.selectNode
    );

    /*
     * Project.pages is a Record<string, ProjectPage>.
     *
     * Therefore we must use activePageId
     * to retrieve the current page.
     */
    const page =
        project.pages[
        project.activePageId
        ];

    if (!page) {
        return (
            <div
                className="
                    flex
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

    return (
        <div
            className="
                relative
                flex
                flex-1
                justify-center
                overflow-auto
                bg-gray-200
                p-10
            "
            onClick={() =>
                selectNode(null)
            }
        >
            {/* =================================================
                VIEWPORT
            ================================================= */}

            <div
                className="
                    relative
                    min-h-[900px]
                    shrink-0
                    bg-white
                    shadow-xl
                "
                style={{
                    width: `${viewportWidth}px`,
                }}
                data-viewport={viewport}
            >
                <RenderNode
                    nodeId={
                        page.rootNodeId
                    }
                />

                <EditorOverlay />
            </div>
        </div>
    );
}