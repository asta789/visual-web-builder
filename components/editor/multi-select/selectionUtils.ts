import type { ProjectNode } from "@/model/type";

export function getEditableNodeIds(
    nodes: Record<string, ProjectNode>
): string[] {
    return Object.values(nodes)
        .filter((node) => node.type !== "page")
        .map((node) => node.id);
}

export function getValidSelectedNodeIds(
    selectedNodeIds: string[],
    nodes: Record<string, ProjectNode>
): string[] {
    return selectedNodeIds.filter(
        (nodeId) =>
            Boolean(nodes[nodeId]) &&
            nodes[nodeId].type !== "page"
    );
}

export function getTopLevelSelectedNodeIds(
    selectedNodeIds: string[],
    nodes: Record<string, ProjectNode>
): string[] {
    const selected = new Set(selectedNodeIds);

    return selectedNodeIds.filter((nodeId) => {
        let parentId = nodes[nodeId]?.parentId;

        while (parentId) {
            if (selected.has(parentId)) {
                return false;
            }

            parentId = nodes[parentId]?.parentId;
        }

        return true;
    });
}
