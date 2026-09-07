"use client";

import { useState } from "react";

import { NodeType } from "@/model/type";
import { useEditorStore } from "@/store/editorStore";

import LayersPanel from "./LayersPanel";
import AssetLibrary from "./AssetLibrary";

const components: {
    type: NodeType;
    label: string;
}[] = [
        {
            type: "section",
            label: "Section",
        },
        {
            type: "container",
            label: "Container",
        },
        {
            type: "text",
            label: "Text",
        },
        {
            type: "image",
            label: "Image",
        },
        {
            type: "button",
            label: "Button",
        },
        {
            type: "navbar",
            label: "Navbar",
        },
        {
            type: "icon",
            label: "Icon",
        },
        {
            type: "video",
            label: "Video",
        },
        {
            type: "audio",
            label: "Audio",
        },
        {
            type: "divider",
            label: "Divider",
        },
        {
            type: "list",
            label: "List",
        },
        {
            type: "table",
            label: "Table",
        },
        {
            type: "input",
            label: "Input",
        },
        {
            type: "textarea",
            label: "Textarea",
        },
        {
            type: "select",
            label: "Select",
        },
        {
            type: "checkbox",
            label: "Checkbox",
        },
        {
            type: "radio",
            label: "Radio Group",
        },
        {
            type: "switch",
            label: "Switch",
        },
        {
            type: "card",
            label: "Card",
        },
        {
            type: "accordion",
            label: "Accordion",
        },

    ];

export default function LeftPanel() {
    const addNode = useEditorStore(
        (state) => state.addNode
    );
    const [isAddOpen, setIsAddOpen] = useState(true);

    return (
        <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col border-r bg-white">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="border-b px-4 py-4">
                <h2 className="font-semibold">
                    Components
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                    Click to add
                </p>
            </div>

            <AssetLibrary />

            {/* ==================================================
                COMPONENTS
            ================================================== */}

            <div className="shrink-0 border-b">
                <button
                    type="button"
                    onClick={() => setIsAddOpen((open) => !open)}
                    aria-expanded={isAddOpen}
                    className="flex w-full items-center justify-between px-3 py-3 text-left hover:bg-gray-50"
                >
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Add
                    </span>
                    <span
                        aria-hidden="true"
                        className={`text-sm text-gray-500 transition-transform ${isAddOpen ? "rotate-180" : ""
                            }`}
                    >
                        ▾
                    </span>
                </button>

                {isAddOpen && (
                    <div className="max-h-72 overflow-y-auto px-3 pb-3 pr-2">
                        <div className="grid grid-cols-2 gap-2">
                            {components.map(
                                (component) => (
                                    <button
                                        key={component.type}
                                        type="button"
                                        onClick={() =>
                                            addNode(
                                                component.type
                                            )
                                        }
                                        className="
                                            rounded-md
                                            border
                                            p-2
                                            text-xs
                                            hover:bg-gray-50
                                        "
                                    >
                                        {component.label}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ==================================================
                LAYERS
            ================================================== */}

            <div className="min-h-0 flex-1 overflow-hidden">
                <LayersPanel />
            </div>
        </aside>
    );
}
