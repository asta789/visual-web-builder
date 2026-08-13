import { ProjectNode } from "@/model/type";

export interface MoveNodeResult {
    nodes: Record<string, ProjectNode>;
    success: boolean;
    reason?: string;
}

/**
 * Checks whether a node exists somewhere
 * inside another node's descendant tree.
 */
function isDescendant(
    nodes: Record<string, ProjectNode>,
    ancestorId: string,
    possibleDescendantId: string
): boolean {
    const ancestor = nodes[ancestorId];

    if (!ancestor) {
        return false;
    }

    for (const childId of ancestor.children ?? []) {
        if (childId === possibleDescendantId) {
            return true;
        }

        if (
            isDescendant(
                nodes,
                childId,
                possibleDescendantId
            )
        ) {
            return true;
        }
    }

    return false;
}

/**
 * Determines whether a node is allowed
 * to contain children.
 */
function canContainChildren(
    node: ProjectNode
): boolean {
    return (
        node.type === "page" ||
        node.type === "section" ||
        node.type === "container"
    );
}

/**
 * Moves a node to another parent.
 *
 * Example:
 *
 * Before:
 *
 * Section
 * ├── Text
 * └── Button
 *
 * After moving Button into Container:
 *
 * Section
 * ├── Text
 * └── Container
 *     └── Button
 */
export function moveNode(
    nodes: Record<string, ProjectNode>,
    nodeId: string,
    newParentId: string,
    newIndex?: number
): MoveNodeResult {
    const node = nodes[nodeId];

    const newParent =
        nodes[newParentId];

    /*
     * Basic existence validation.
     */
    if (!node) {
        return {
            nodes,
            success: false,
            reason: "Node does not exist.",
        };
    }

    if (!newParent) {
        return {
            nodes,
            success: false,
            reason: "Target parent does not exist.",
        };
    }

    /*
     * The page root cannot be moved.
     */
    if (node.type === "page") {
        return {
            nodes,
            success: false,
            reason: "The page root cannot be moved.",
        };
    }

    /*
     * The target must be capable of
     * containing children.
     */
    if (!canContainChildren(newParent)) {
        return {
            nodes,
            success: false,
            reason:
                "The target node cannot contain children.",
        };
    }

    /*
     * Prevent moving a node into itself.
     */
    if (nodeId === newParentId) {
        return {
            nodes,
            success: false,
            reason:
                "A node cannot be moved inside itself.",
        };
    }

    /*
     * Prevent circular hierarchy.
     *
     * Example:
     *
     * Container A
     *   └── Container B
     *
     * We cannot move A inside B.
     */
    if (
        isDescendant(
            nodes,
            nodeId,
            newParentId
        )
    ) {
        return {
            nodes,
            success: false,
            reason:
                "A node cannot be moved inside its own descendant.",
        };
    }

    /*
     * Create a completely new node map.
     * This keeps the operation immutable.
     */
    const nextNodes = {
        ...nodes,
    };

    /*
     * Remove the node from its old parent.
     */
    if (node.parentId) {
        const oldParent =
            nextNodes[node.parentId];

        if (oldParent) {
            nextNodes[node.parentId] = {
                ...oldParent,

                children: (
                    oldParent.children ?? []
                ).filter(
                    (childId) =>
                        childId !== nodeId
                ),
            };
        }
    }

    /*
     * Add the node to its new parent.
     */
    const currentChildren = [
        ...(newParent.children ?? []),
    ];

    /*
     * Prevent duplicate child references.
     */
    const filteredChildren =
        currentChildren.filter(
            (childId) =>
                childId !== nodeId
        );

    /*
     * If no index is supplied,
     * append to the end.
     */
    let targetIndex =
        newIndex ??
        filteredChildren.length;

    /*
     * Keep the index within valid bounds.
     */
    targetIndex = Math.max(
        0,
        Math.min(
            targetIndex,
            filteredChildren.length
        )
    );

    filteredChildren.splice(
        targetIndex,
        0,
        nodeId
    );

    nextNodes[newParentId] = {
        ...nextNodes[newParentId],

        children: filteredChildren,
    };

    /*
     * Update the node's parentId.
     */
    nextNodes[nodeId] = {
        ...nextNodes[nodeId],

        parentId: newParentId,
    };

    return {
        nodes: nextNodes,
        success: true,
    };
}