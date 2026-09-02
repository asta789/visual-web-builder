"use client";

import { useEffect } from "react";

import PageManager from "./PageManager";
import LeftPanel from "./LeftPanel";
import Canvas from "./Canvas";
import RightPanel from "./RightPanel";

import { useEditorStore } from "@/store/editorStore";

import {
    BreakpointId,
    Project,
    ProjectNode,
} from "@/model/type";

/* =========================================================
   DEVTOOLS STORE ACCESS
========================================================= */

if (typeof window !== "undefined") {
    (window as any).useEditorStore =
        useEditorStore;
}

/* =========================================================
   VIEWPORT TYPES
========================================================= */

export type ViewportType =
    BreakpointId;

export interface ViewportConfig {
    label: string;
    width: number;
}

/* =========================================================
   VIEWPORT CONFIGURATION
========================================================= */

export const VIEWPORTS: Record<
    ViewportType,
    ViewportConfig
> = {
    desktop: {
        label: "Desktop",
        width: 1200,
    },

    tablet: {
        label: "Tablet",
        width: 768,
    },

    mobile: {
        label: "Mobile",
        width: 390,
    },
};

/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
    value: string
): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   CSS PROPERTY CONVERSION
========================================================= */

function cssPropertyName(
    property: string
): string {
    return property.replace(
        /[A-Z]/g,
        (letter) =>
            `-${letter.toLowerCase()}`
    );
}

/* =========================================================
   ANIMATION PROPERTIES
========================================================= */

/*
 * Preview must resolve styles exactly as Canvas does. The
 * inspector writes edits into the current breakpoint override,
 * including desktop, rather than directly to node.styles.
 */
function getPreviewResolvedStyles(
    node: ProjectNode,
    viewport: ViewportType
) {
    const baseStyles = {
        ...(node.styles ?? {}),
    };

    delete (
        baseStyles as typeof baseStyles & {
            responsive?: unknown;
        }
    ).responsive;

    return {
        ...baseStyles,
        ...(node.styles?.responsive?.[
            viewport
        ] ?? {}),
    };
}

function getAnimationValue(
    node: ProjectNode,
    viewport: ViewportType
): string {
    const value =
        getPreviewResolvedStyles(
            node,
            viewport
        ).animation;

    if (
        typeof value !== "string" ||
        !value.trim()
    ) {
        return "none";
    }

    return value.trim();
}

/* =========================================================
   ANIMATION TRIGGER
========================================================= */

function getAnimationTrigger(
    node: ProjectNode,
    viewport: ViewportType
): string {
    const trigger =
        getPreviewResolvedStyles(
            node,
            viewport
        ).animationTrigger;

    if (
        typeof trigger !== "string"
    ) {
        return "load";
    }

    if (
        trigger === "hover" ||
        trigger === "click" ||
        trigger === "focus"
    ) {
        return trigger;
    }

    return "load";
}

/* =========================================================
   PREVIEW ANIMATION CLASS
========================================================= */

function getPreviewAnimationClass(
    node: ProjectNode
): string {
    const safeNodeId =
        String(node.id)
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "-"
            );

    return `preview-animation-${safeNodeId}`;
}

/* =========================================================
   STYLE SERIALIZATION
========================================================= */

function serializeStyles(
    node: ProjectNode,
    viewport: ViewportType
): string {
    const styles =
        getPreviewResolvedStyles(
            node,
            viewport
        );

    return Object.entries(styles)
        .filter(
            ([property]) =>
                property !== "responsive" &&
                property !== "animation" &&
                property !== "animationTrigger"
        )
        .map(
            ([property, value]) => {
                if (
                    value === undefined ||
                    value === null ||
                    value === ""
                ) {
                    return "";
                }

                return `${cssPropertyName(
                    property
                )}:${escapeHtml(
                    String(value)
                )}`;
            }
        )
        .filter(Boolean)
        .join(";");
}

/* =========================================================
   URL VALIDATION
========================================================= */

function getSafeUrl(
    value?: string
): string {
    if (!value) {
        return "";
    }

    const trimmed =
        value.trim();

    if (
        trimmed.startsWith("/") ||
        trimmed.startsWith("#") ||
        trimmed.startsWith("./") ||
        trimmed.startsWith("../") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("mailto:") ||
        trimmed.startsWith("tel:")
    ) {
        return trimmed;
    }

    return "";
}

/* =========================================================
   IMAGE SOURCE
========================================================= */

function getImageSource(
    node: ProjectNode
): string {
    if (!node.content) {
        return "";
    }

    const source =
        node.content.trim();

    if (
        source.startsWith(
            "data:image/"
        )
    ) {
        return source;
    }

    if (
        source.startsWith(
            "https://"
        ) ||
        source.startsWith(
            "http://"
        ) ||
        source.startsWith("/")
    ) {
        return source;
    }

    return "";
}

/* =========================================================
   PREVIEW ANIMATION CSS
========================================================= */

function createPreviewAnimationCss(
    project: Project,
    viewport: ViewportType
): string {
    const animationRules: string[] =
        [];

    Object.values(
        project.nodes
    ).forEach(
        (node) => {
            const animation =
                getAnimationValue(
                    node,
                    viewport
                );

            if (
                !animation ||
                animation === "none"
            ) {
                return;
            }

            const trigger =
                getAnimationTrigger(
                    node,
                    viewport
                );

            const animationClass =
                getPreviewAnimationClass(
                    node
                );

            if (
                trigger === "hover"
            ) {
                animationRules.push(`
                    .${animationClass}:hover {
                        animation: ${animation};
                    }
                `);
            } else if (
                trigger === "focus"
            ) {
                animationRules.push(`
                    .${animationClass}:focus {
                        animation: ${animation};
                    }
                `);
            } else if (
                trigger === "load"
            ) {
                animationRules.push(`
                    .${animationClass} {
                        animation: ${animation};
                    }
                `);
            }
        }
    );

    return animationRules.join("\n");
}

/* =========================================================
   ANIMATION KEYFRAMES
========================================================= */

const ANIMATION_KEYFRAMES = `
/* =========================================================
   VISUAL WEB BUILDER ANIMATIONS
========================================================= */

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
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes vwb-slide-down {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes vwb-slide-left {
    from {
        opacity: 0;
        transform: translateX(30px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes vwb-slide-right {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes vwb-zoom-in {
    from {
        opacity: 0;
        transform: scale(0.8);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes vwb-zoom-out {
    from {
        opacity: 0;
        transform: scale(1.2);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes vwb-bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-20px);
    }

    60% {
        transform: translateY(-10px);
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
    0%,
    100% {
        transform: translateX(0);
    }

    20% {
        transform: translateX(-8px);
    }

    40% {
        transform: translateX(8px);
    }

    60% {
        transform: translateX(-8px);
    }

    80% {
        transform: translateX(8px);
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
   PREVIEW NODE RENDERER
========================================================= */

function renderPreviewNode(
    project: Project,
    nodeId: string,
    viewport: ViewportType
): string {
    const node =
        project.nodes[nodeId];

    if (!node) {
        return "";
    }

    /* =====================================================
       NORMAL STYLES
    ===================================================== */

    const styles =
        serializeStyles(
            node,
            viewport
        );

    const styleAttribute =
        styles
            ? ` style="${styles}"`
            : "";

    /* =====================================================
       ANIMATION
    ===================================================== */

    const animation =
        getAnimationValue(
            node,
            viewport
        );

    const animationTrigger =
        getAnimationTrigger(
            node,
            viewport
        );

    const hasAnimation =
        animation !== "none" &&
        animation.trim() !== "";

    const animationClass =
        hasAnimation
            ? getPreviewAnimationClass(
                node
            )
            : "";

    const classAttribute =
        animationClass
            ? ` class="${animationClass}"`
            : "";

    const animationTriggerAttribute =
        hasAnimation &&
        animationTrigger === "click"
            ? ` data-animation-trigger="click" data-animation-value="${escapeHtml(animation)}"`
            : "";

    const focusableAttribute =
        hasAnimation &&
        animationTrigger === "focus"
            ? ' tabindex="0"'
            : "";

    /*
     * IMPORTANT:
     *
     * Hover animations are controlled
     * by CSS :hover in Preview.
     *
     * Load animations are also controlled
     * by CSS on the generated element.
     *
     * The trigger itself is not written
     * into the normal inline style.
     */

    /* =====================================================
       TEXT
    ===================================================== */

    if (node.type === "text") {
        return `
            <div${classAttribute}${animationTriggerAttribute}${focusableAttribute}${styleAttribute}>
                ${escapeHtml(
            node.content ?? ""
        )}
            </div>
        `;
    }

    /* =====================================================
       BUTTON
    ===================================================== */

    if (node.type === "button") {
        const href =
            getSafeUrl(
                node.styles?.href
            );

        const target =
            node.styles?.target ===
                "_blank"
                ? "_blank"
                : "_self";

        if (href) {
            return `
                <a
                    href="${escapeHtml(
                href
            )}"
                    target="${target}"
                    ${target === "_blank"
                    ? 'rel="noopener noreferrer"'
                    : ""
                }
                    ${classAttribute}
                    ${animationTriggerAttribute}
                    ${focusableAttribute}
                    ${styleAttribute}
                >
                    ${escapeHtml(
                    node.content ??
                    "Button"
                )}
                </a>
            `;
        }

        return `
            <button
                type="button"
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                ${styleAttribute}
            >
                ${escapeHtml(
            node.content ??
            "Button"
        )}
            </button>
        `;
    }

    /* =====================================================
       IMAGE
    ===================================================== */

    if (node.type === "image") {
        const source =
            getImageSource(node);

        if (source) {
            const alt =
                node.styles?.alt ??
                "";

            return `
                <img
                    src="${escapeHtml(
                source
            )}"
                    alt="${escapeHtml(
                alt
            )}"
                    ${classAttribute}
                    ${animationTriggerAttribute}
                    ${focusableAttribute}
                    ${styleAttribute}
                />
            `;
        }

        return `
            <div
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                ${styleAttribute}
                style="${styles
                ? `${styles};`
                : ""
            }min-height:120px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#9ca3af;font-size:14px"
            >
                Image
            </div>
        `;
    }

    /* =====================================================
       STRUCTURAL NODES
    ===================================================== */

    if (
        node.type === "page" ||
        node.type === "section" ||
        node.type === "container"
    ) {
        const children =
            (node.children ?? [])
                .map(
                    (childId) =>
                        renderPreviewNode(
                            project,
                            childId,
                            viewport
                        )
                )
                .join("");

        return `
            <div${classAttribute}${animationTriggerAttribute}${focusableAttribute}${styleAttribute}>
                ${children}
            </div>
        `;
    }

    return "";
}

/* =========================================================
   PREVIEW HTML
========================================================= */

function createPreviewDocument(
    project: Project,
    viewport: ViewportType
): string {
    const page =
        project.pages[
        project.activePageId
        ];

    if (!page) {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Preview</title>

                    <style>
                        ${ANIMATION_KEYFRAMES}
                    </style>
                </head>

                <body>
                    <h1>No active page</h1>
                </body>
            </html>
        `;
    }

    /* =====================================================
       RENDER PAGE
    ===================================================== */

    const content =
        renderPreviewNode(
            project,
            page.rootNodeId,
            viewport
        );

    /* =====================================================
       CREATE ANIMATION CSS
    ===================================================== */

    const animationCss =
        createPreviewAnimationCss(
            project,
            viewport
        );

    /* =====================================================
       PAGE TITLE
    ===================================================== */

    const pageTitle =
        page.name ||
        "Website Preview";

    /* =====================================================
       COMPLETE PREVIEW DOCUMENT
    ===================================================== */

    return `
        <!DOCTYPE html>

        <html lang="en">

        <head>

            <meta
                charset="UTF-8"
            />

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />

            <title>
                ${escapeHtml(
        pageTitle
    )}
            </title>

            <style>

                /* =========================================
                   GLOBAL RESET
                ========================================= */

                * {
                    box-sizing: border-box;
                }

                html,
                body {
                    margin: 0;
                    padding: 0;
                    min-height: 100%;
                }

                body {
                    background: #ffffff;
                    color: #111111;
                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;
                }

                img {
                    max-width: 100%;
                }

                button,
                a {
                    font: inherit;
                }

                a {
                    text-decoration: none;
                }

                /* =========================================
                   ANIMATION KEYFRAMES
                ========================================= */

                ${ANIMATION_KEYFRAMES}

                /* =========================================
                   NODE ANIMATIONS
                ========================================= */

                ${animationCss}

            </style>

            <script>
                document.addEventListener("click", function (event) {
                    var target = event.target;

                    if (!(target instanceof Element)) {
                        return;
                    }

                    var element = target.closest(
                        '[data-animation-trigger="click"]'
                    );

                    if (!element) {
                        return;
                    }

                    var animation = element.getAttribute(
                        "data-animation-value"
                    );

                    if (!animation) {
                        return;
                    }

                    element.style.animation = "none";
                    void element.offsetWidth;
                    element.style.animation = animation;
                });
            </script>

        </head>

        <body>

            ${content}

        </body>

        </html>
    `;
}

/* =========================================================
   OPEN PREVIEW
========================================================= */

function openPreview(
    project: Project,
    viewport: ViewportType
): void {
    const previewWindow =
        window.open(
            "",
            "_blank"
        );

    if (!previewWindow) {
        window.alert(
            "Preview could not be opened. Please allow pop-ups for this site."
        );

        return;
    }

    const previewHtml =
        createPreviewDocument(
            project,
            viewport
        );

    previewWindow.document.open();

    previewWindow.document.write(
        previewHtml
    );

    previewWindow.document.close();

    try {
        previewWindow.opener =
            null;
    } catch {
        // Some browsers prevent modifying window.opener.
    }

    previewWindow.focus();
}

/* =========================================================
   EDITOR
========================================================= */

export default function Editor() {
    /* =====================================================
       PROJECT
    ===================================================== */

    const project =
        useEditorStore(
            (state) =>
                state.project
        );

    /* =====================================================
       SELECTION
    ===================================================== */

    const selectedNodeId =
        useEditorStore(
            (state) =>
                state.selectedNodeId
        );

    /* =====================================================
       NODE OPERATIONS
    ===================================================== */

    const deleteNode =
        useEditorStore(
            (state) =>
                state.deleteNode
        );

    const duplicateNode =
        useEditorStore(
            (state) =>
                state.duplicateNode
        );

    /* =====================================================
       HISTORY
    ===================================================== */

    const undo =
        useEditorStore(
            (state) =>
                state.undo
        );

    const redo =
        useEditorStore(
            (state) =>
                state.redo
        );

    const canUndo =
        useEditorStore(
            (state) =>
                state.past.length > 0
        );

    const canRedo =
        useEditorStore(
            (state) =>
                state.future.length > 0
        );

    /* =====================================================
       ACTIVE VIEWPORT
    ===================================================== */

    const viewport =
        useEditorStore(
            (state) =>
                state.activeBreakpointId
        );

    const setActiveBreakpoint =
        useEditorStore(
            (state) =>
                state.setActiveBreakpoint
        );

    /* =====================================================
       KEYBOARD SHORTCUTS
    ===================================================== */

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent
        ) {
            const target =
                event.target as HTMLElement;

            const isTyping =
                target.tagName ===
                "INPUT" ||
                target.tagName ===
                "TEXTAREA" ||
                target.isContentEditable;

            /* ---------------------------------------------
               UNDO
            --------------------------------------------- */

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                !event.shiftKey &&
                event.key.toLowerCase() ===
                "z"
            ) {
                event.preventDefault();

                undo();

                return;
            }

            /* ---------------------------------------------
               REDO
            --------------------------------------------- */

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.shiftKey &&
                event.key.toLowerCase() ===
                "z"
            ) {
                event.preventDefault();

                redo();

                return;
            }

            /* ---------------------------------------------
               REDO - CTRL + Y
            --------------------------------------------- */

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                "y"
            ) {
                event.preventDefault();

                redo();

                return;
            }

            /* ---------------------------------------------
               STOP WHILE TYPING
            --------------------------------------------- */

            if (isTyping) {
                return;
            }

            /* ---------------------------------------------
               SELECTION REQUIRED
            --------------------------------------------- */

            if (!selectedNodeId) {
                return;
            }

            /* ---------------------------------------------
               DELETE
            --------------------------------------------- */

            if (
                event.key ===
                "Delete" ||
                event.key ===
                "Backspace"
            ) {
                event.preventDefault();

                deleteNode(
                    selectedNodeId
                );

                return;
            }

            /* ---------------------------------------------
               DUPLICATE
            --------------------------------------------- */

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                "d"
            ) {
                event.preventDefault();

                duplicateNode(
                    selectedNodeId
                );

                return;
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        selectedNodeId,
        deleteNode,
        duplicateNode,
        undo,
        redo,
    ]);

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div
            className="
                flex
                h-screen
                w-screen
                min-w-0
                overflow-hidden
                bg-gray-100
            "
        >
            {/* =================================================
                LEFT PANEL
            ================================================= */}

            <LeftPanel />

            {/* =================================================
                MAIN EDITOR
            ================================================= */}

            <main
                className="
                    flex
                    min-w-0
                    flex-1
                    flex-col
                    overflow-hidden
                "
            >
                {/* =================================================
                    TOP TOOLBAR
                ================================================= */}

                <header
                    className="
                        flex
                        h-14
                        min-w-0
                        shrink-0
                        items-center
                        gap-3
                        border-b
                        bg-white
                        px-2
                        sm:px-3
                        lg:px-5
                    "
                >
                    {/* =============================================
                        PROJECT NAME
                    ============================================= */}

                    <div
                        className="
                            hidden
                            min-w-0
                            shrink
                            truncate
                            font-semibold
                            sm:block
                        "
                    >
                        Visual Web Builder
                    </div>

                    {/* =============================================
                        PAGE MANAGER
                    ============================================= */}

                    <div
                        className="
                            min-w-0
                            shrink-0
                        "
                    >
                        <PageManager />
                    </div>

                    {/* =============================================
                        TOOLBAR SCROLL AREA
                    ============================================= */}

                    <div
                        className="
                            min-w-0
                            flex-1
                            overflow-x-auto
                            overflow-y-hidden
                            scrollbar-thin
                        "
                    >
                        <div
                            className="
                                flex
                                min-w-max
                                items-center
                                justify-end
                                gap-2
                                px-1
                            "
                        >
                            {/* =================================
                                UNDO
                            ================================= */}

                            <button
                                type="button"
                                onClick={
                                    undo
                                }
                                disabled={
                                    !canUndo
                                }
                                title="Undo (Ctrl+Z)"
                                className={`
                                    shrink-0
                                    rounded-md
                                    border
                                    px-3
                                    py-1.5
                                    text-sm
                                    transition
                                    ${canUndo
                                        ? "cursor-pointer hover:bg-gray-50"
                                        : "cursor-not-allowed opacity-40"
                                    }
                                `}
                            >
                                Undo
                            </button>

                            {/* =================================
                                REDO
                            ================================= */}

                            <button
                                type="button"
                                onClick={
                                    redo
                                }
                                disabled={
                                    !canRedo
                                }
                                title="Redo (Ctrl+Shift+Z)"
                                className={`
                                    shrink-0
                                    rounded-md
                                    border
                                    px-3
                                    py-1.5
                                    text-sm
                                    transition
                                    ${canRedo
                                        ? "cursor-pointer hover:bg-gray-50"
                                        : "cursor-not-allowed opacity-40"
                                    }
                                `}
                            >
                                Redo
                            </button>

                            {/* =================================
                                SEPARATOR
                            ================================= */}

                            <div className="mx-1 h-6 w-px shrink-0 bg-gray-200" />

                            {/* =================================
                                VIEWPORT SWITCHER
                            ================================= */}

                            <div
                                className="
                                    flex
                                    shrink-0
                                    items-center
                                    rounded-md
                                    border
                                    bg-gray-50
                                    p-0.5
                                "
                            >
                                {(
                                    Object.keys(
                                        VIEWPORTS
                                    ) as ViewportType[]
                                ).map(
                                    (
                                        viewportType
                                    ) => {
                                        const config =
                                            VIEWPORTS[
                                            viewportType
                                            ];

                                        const isActive =
                                            viewport ===
                                            viewportType;

                                        return (
                                            <button
                                                key={
                                                    viewportType
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setActiveBreakpoint(
                                                        viewportType
                                                    )
                                                }
                                                title={`${config.label} (${config.width}px)`}
                                                className={`
                                                    shrink-0
                                                    rounded
                                                    px-3
                                                    py-1.5
                                                    text-xs
                                                    font-medium
                                                    transition
                                                    ${isActive
                                                        ? "bg-white text-gray-900 shadow-sm"
                                                        : "text-gray-500 hover:text-gray-900"
                                                    }
                                                `}
                                            >
                                                {
                                                    config.label
                                                }
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            {/* =================================
                                VIEWPORT WIDTH
                            ================================= */}

                            <div
                                className="
                                    shrink-0
                                    text-xs
                                    text-gray-400
                                "
                            >
                                {
                                    VIEWPORTS[
                                        viewport
                                    ].width
                                }
                                px
                            </div>

                            {/* =================================
                                SEPARATOR
                            ================================= */}

                            <div className="mx-1 h-6 w-px shrink-0 bg-gray-200" />

                            {/* =================================
                                PREVIEW
                            ================================= */}

                            <button
                                type="button"
                                onClick={() =>
                                    openPreview(
                                        project,
                                        viewport
                                    )
                                }
                                title="Open website preview"
                                className="
                                    shrink-0
                                    rounded-md
                                    border
                                    px-3
                                    py-1.5
                                    text-sm
                                    transition
                                    hover:bg-gray-50
                                "
                            >
                                Preview
                            </button>

                            {/* =================================
                                PUBLISH
                            ================================= */}

                            <button
                                type="button"
                                className="
                                    shrink-0
                                    rounded-md
                                    bg-black
                                    px-3
                                    py-1.5
                                    text-sm
                                    text-white
                                    hover:bg-gray-800
                                "
                            >
                                Publish
                            </button>
                        </div>
                    </div>
                </header>

                {/* =================================================
                    CANVAS
                ================================================= */}

                <Canvas
                    viewport={
                        viewport
                    }
                    viewportWidth={
                        VIEWPORTS[
                            viewport
                        ].width
                    }
                />
            </main>

            {/* =================================================
                RIGHT PANEL
            ================================================= */}

            <RightPanel
                viewport={
                    viewport
                }
            />
        </div>
    );
}
