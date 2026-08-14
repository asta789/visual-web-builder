"use client";

import { useEffect, useState } from "react";

import LeftPanel from "./LeftPanel";
import Canvas from "./Canvas";
import RightPanel from "./RightPanel";

import { useEditorStore } from "@/store/editorStore";

/* =========================================================
   VIEWPORT TYPES
========================================================= */

export type ViewportType =
    | "desktop"
    | "tablet"
    | "mobile";

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
   EDITOR
========================================================= */

export default function Editor() {
    const selectedNodeId =
        useEditorStore(
            (state) =>
                state.selectedNodeId
        );

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

    /*
     * =========================================================
     * VIEWPORT
     *
     * This is editor UI state.
     *
     * It is intentionally NOT stored inside the project,
     * therefore changing viewport does not create an
     * undo/redo history entry.
     * =========================================================
     */

    const [viewport, setViewport] =
        useState<ViewportType>(
            "desktop"
        );

    /*
     * =========================================================
     * HISTORY STATE
     * =========================================================
     */

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

    /*
     * =========================================================
     * KEYBOARD SHORTCUTS
     * =========================================================
     */

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

            /*
             * -------------------------------------------------
             * UNDO
             *
             * Ctrl + Z
             * Cmd + Z
             * -------------------------------------------------
             */

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

            /*
             * -------------------------------------------------
             * REDO
             *
             * Ctrl + Shift + Z
             * Cmd + Shift + Z
             * -------------------------------------------------
             */

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

            /*
             * -------------------------------------------------
             * REDO
             *
             * Ctrl + Y
             * Cmd + Y
             * -------------------------------------------------
             */

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

            /*
             * -------------------------------------------------
             * Everything below this point should not run
             * while the user is typing.
             * -------------------------------------------------
             */

            if (isTyping) {
                return;
            }

            /*
             * -------------------------------------------------
             * Selection required
             * -------------------------------------------------
             */

            if (!selectedNodeId) {
                return;
            }

            /*
             * -------------------------------------------------
             * DELETE
             *
             * Delete
             * Backspace
             * -------------------------------------------------
             */

            if (
                event.key === "Delete" ||
                event.key === "Backspace"
            ) {
                event.preventDefault();

                deleteNode(
                    selectedNodeId
                );

                return;
            }

            /*
             * -------------------------------------------------
             * DUPLICATE
             *
             * Ctrl + D
             * Cmd + D
             * -------------------------------------------------
             */

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

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
            {/* =================================================
                LEFT PANEL
            ================================================= */}

            <LeftPanel />

            {/* =================================================
                MAIN EDITOR
            ================================================= */}

            <main className="flex min-w-0 flex-1 flex-col">
                {/* =================================================
                    TOP TOOLBAR
                ================================================= */}

                <header className="flex h-14 shrink-0 items-center border-b bg-white px-5">
                    {/* PROJECT NAME */}

                    <div className="font-semibold">
                        Visual Web Builder
                    </div>

                    {/* TOOLBAR */}

                    <div className="ml-auto flex items-center gap-2">
                        {/* =========================================
                            UNDO
                        ========================================= */}

                        <button
                            type="button"
                            onClick={undo}
                            disabled={
                                !canUndo
                            }
                            title="Undo (Ctrl+Z)"
                            className={`
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

                        {/* =========================================
                            REDO
                        ========================================= */}

                        <button
                            type="button"
                            onClick={redo}
                            disabled={
                                !canRedo
                            }
                            title="Redo (Ctrl+Shift+Z)"
                            className={`
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

                        {/* =========================================
                            SEPARATOR
                        ========================================= */}

                        <div className="mx-1 h-6 w-px bg-gray-200" />

                        {/* =========================================
                            VIEWPORT SWITCHER
                        ========================================= */}

                        <div className="flex items-center rounded-md border bg-gray-50 p-0.5">
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
                                                setViewport(
                                                    viewportType
                                                )
                                            }
                                            title={`${config.label} (${config.width}px)`}
                                            className={`
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

                        {/* =========================================
                            VIEWPORT WIDTH
                        ========================================= */}

                        <div className="hidden text-xs text-gray-400 lg:block">
                            {
                                VIEWPORTS[
                                    viewport
                                ].width
                            }
                            px
                        </div>

                        {/* =========================================
                            SEPARATOR
                        ========================================= */}

                        <div className="mx-1 h-6 w-px bg-gray-200" />

                        {/* =========================================
                            PREVIEW
                        ========================================= */}

                        <button
                            type="button"
                            className="
                                rounded-md
                                border
                                px-3
                                py-1.5
                                text-sm
                                hover:bg-gray-50
                            "
                        >
                            Preview
                        </button>

                        {/* =========================================
                            PUBLISH
                        ========================================= */}

                        <button
                            type="button"
                            className="
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
                </header>

                {/* =================================================
                    CANVAS
                ================================================= */}

                <Canvas
                    viewport={viewport}
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

            <RightPanel />
        </div>
    );
}