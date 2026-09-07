import type { ProjectNode } from "@/model/type";

export type CompositeRootType = "card" | "accordion";

export interface CompositeEditingContext {
    rootId: string | null;
    rootNode: ProjectNode | null;
    isComposite: boolean;
    isRoot: boolean;
    isLocked: boolean;
    isCanvasInteractionEnabled: boolean;
}

export function isCompositeRoot(node?: ProjectNode | null): boolean {
    if (!node) return false;
    return node.type === "card" || (node.type === "accordion" && node.accordionRole === "root");
}

export function getCompositeRootId(
    node: ProjectNode | null | undefined,
    nodes: Record<string, ProjectNode>,
): string | null {
    if (!node) return null;

    let current: ProjectNode | undefined = node;
    const visited = new Set<string>();

    while (current && !visited.has(current.id)) {
        visited.add(current.id);

        if (isCompositeRoot(current)) return current.id;
        if (!current.parentId) return null;

        current = nodes[current.parentId];
    }

    return null;
}

export function getCompositeEditingContext(
    node: ProjectNode | null | undefined,
    nodes: Record<string, ProjectNode>,
): CompositeEditingContext {
    const rootId = getCompositeRootId(node, nodes);
    const rootNode = rootId ? nodes[rootId] ?? null : null;
    const isComposite = !!rootNode;
    const isRoot = !!node && !!rootNode && node.id === rootNode.id;
    const isLocked = !!rootNode?.compositeEditingLocked;

    return {
        rootId,
        rootNode,
        isComposite,
        isRoot,
        isLocked,
        isCanvasInteractionEnabled:
            !isComposite || (isLocked ? !isRoot : isRoot),
    };
}

export function getFirstEditableDescendantId(
    rootNode: ProjectNode | null | undefined,
    nodes: Record<string, ProjectNode>,
): string | null {
    if (!rootNode) return null;

    const queue = [...(rootNode.children ?? [])];
    const visited = new Set<string>();

    while (queue.length) {
        const id = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);

        const child = nodes[id];
        if (!child) continue;

        return child.id;
    }

    return null;
}

export function getSelectionTargetId(
    nodeId: string,
    nodes: Record<string, ProjectNode>,
): string {
    const node = nodes[nodeId];
    if (!node) return nodeId;

    const context = getCompositeEditingContext(node, nodes);
    if (!context.isComposite || !context.isRoot || !context.isLocked) {
        return nodeId;
    }

    return getFirstEditableDescendantId(context.rootNode, nodes) ?? nodeId;
}
