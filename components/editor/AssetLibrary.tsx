"use client";

import { useRef } from "react";

import type { ProjectAsset } from "@/model/type";
import { useEditorStore } from "@/store/editorStore";

function createAssetId() {
    return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AssetLibrary() {
    const inputRef = useRef<HTMLInputElement>(null);
    const project = useEditorStore((state) => state.project);
    const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
    const addAsset = useEditorStore((state) => state.addAsset);
    const removeAsset = useEditorStore((state) => state.removeAsset);
    const setImageAsset = useEditorStore((state) => state.setImageAsset);

    const selectedNode = selectedNodeId
        ? project.nodes[selectedNodeId]
        : null;

    function importImage(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file || !file.type.startsWith("image/")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== "string") return;

            const asset: ProjectAsset = {
                id: createAssetId(),
                name: file.name,
                type: file.type,
                size: file.size,
                source: reader.result,
            };

            addAsset(asset);
            if (selectedNode?.type === "image") {
                setImageAsset(selectedNode.id, asset);
            }
        };
        reader.readAsDataURL(file);
    }

    const assets = Object.values(project.assets);

    return (
        <section className="border-b p-3">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Assets</span>
                <button type="button" onClick={() => inputRef.current?.click()} className="text-xs font-medium text-blue-600 hover:text-blue-800">
                    Import
                </button>
            </div>
            <input ref={inputRef} type="file" accept="image/*" onChange={importImage} className="hidden" />

            {assets.length === 0 ? (
                <p className="text-xs leading-5 text-gray-500">Import an image to reuse it across the project.</p>
            ) : (
                <div className="space-y-2">
                    {assets.map((asset) => (
                        <div key={asset.id} className="flex gap-2 rounded border p-1.5">
                            <img src={asset.source} alt="" className="h-10 w-10 rounded object-cover" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium">{asset.name}</p>
                                <p className="text-[10px] text-gray-500">{asset.type || "image"} · {Math.ceil(asset.size / 1024)} KB</p>
                                <div className="mt-1 flex gap-2 text-[10px] font-medium">
                                    <button type="button" disabled={selectedNode?.type !== "image"} onClick={() => selectedNode && setImageAsset(selectedNode.id, asset)} className="text-blue-600 disabled:cursor-not-allowed disabled:text-gray-300">Use</button>
                                    <button type="button" onClick={() => removeAsset(asset.id)} className="text-red-500">Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
