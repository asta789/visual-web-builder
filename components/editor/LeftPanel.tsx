"use client";

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
    ];

export default function LeftPanel() {
    const addNode = useEditorStore(
        (state) => state.addNode
    );

    return (
        <aside className="flex w-64 shrink-0 flex-col border-r bg-white">
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

            <div className="border-b p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Add
                </div>

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

            {/* ==================================================
                LAYERS
            ================================================== */}

            <LayersPanel />
        </aside>
    );
}
