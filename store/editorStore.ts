import { moveNode } from "@/store/treeOperations";
import { create } from "zustand";
import { defaultProject } from "@/model/defaultProject";
import {
    NodeType,
    Project,
    ProjectNode,
} from "@/model/type";

/* =========================================================
   HISTORY
========================================================= */

interface EditorSnapshot {
    project: Project;
    selectedNodeId: string | null;
}

interface EditorState {
    project: Project;

    selectedNodeId: string | null;

    /*
     * Undo / Redo history
     */
    past: EditorSnapshot[];

    future: EditorSnapshot[];

    /*
     * History transaction state.
     *
     * Used by drag/resize so an entire
     * interaction becomes ONE undo step.
     */
    transactionSnapshot:
    EditorSnapshot | null;

    transactionActive: boolean;

    selectNode: (
        nodeId: string | null
    ) => void;

    addNode: (
        type: NodeType,
        parentId?: string
    ) => void;

    updateNode: (
        nodeId: string,
        updates: Partial<ProjectNode>
    ) => void;

    updateNodeStyles: (
        nodeId: string,
        styles: Record<string, string>
    ) => void;

    deleteNode: (
        nodeId: string
    ) => void;

    duplicateNode: (
        nodeId: string
    ) => void;

    moveNode: (
        nodeId: string,
        newParentId: string,
        newIndex?: number
    ) => void;

    undo: () => void;

    redo: () => void;

    /*
     * History transactions
     */
    beginHistoryTransaction: () => void;

    endHistoryTransaction: () => void;

    cancelHistoryTransaction: () => void;
}

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_HISTORY = 100;

/* =========================================================
   SNAPSHOT HELPER
========================================================= */

function createSnapshot(
    state: EditorState
): EditorSnapshot {
    return {
        project: state.project,
        selectedNodeId:
            state.selectedNodeId,
    };
}

/* =========================================================
   HISTORY PUSH
========================================================= */

function pushHistory(
    state: EditorState
): EditorSnapshot[] {
    const snapshot =
        createSnapshot(state);

    const nextPast = [
        ...state.past,
        snapshot,
    ];

    if (
        nextPast.length >
        MAX_HISTORY
    ) {
        return nextPast.slice(
            nextPast.length -
            MAX_HISTORY
        );
    }

    return nextPast;
}

/* =========================================================
   NODE CREATION
========================================================= */

function createNode(
    type: NodeType,
    parentId: string,
    index: number
): ProjectNode {
    const id =
        `${type}-${Date.now()}-${index}`;

    const baseNode: ProjectNode = {
        id,
        type,
        name:
            type.charAt(0).toUpperCase() +
            type.slice(1),
        parentId,
    };

    switch (type) {
        case "section":
            return {
                ...baseNode,

                name: "Section",

                children: [],

                styles: {
                    paddingTop: "60px",
                    paddingRight: "40px",
                    paddingBottom: "60px",
                    paddingLeft: "40px",
                    backgroundColor:
                        "#ffffff",
                },
            };

        case "container":
            return {
                ...baseNode,

                name: "Container",

                children: [],

                styles: {
                    paddingTop: "20px",
                    paddingRight: "20px",
                    paddingBottom: "20px",
                    paddingLeft: "20px",
                },
            };

        case "text":
            return {
                ...baseNode,

                name: "Text",

                content: "New Text",

                styles: {
                    fontSize: "20px",
                    color: "#111111",
                },
            };

        case "button":
            return {
                ...baseNode,

                name: "Button",

                content: "Button",

                styles: {
                    backgroundColor:
                        "#111111",

                    color: "#ffffff",

                    paddingTop: "12px",
                    paddingRight: "24px",
                    paddingBottom: "12px",
                    paddingLeft: "24px",

                    borderRadius: "8px",
                },
            };

        case "image":
            return {
                ...baseNode,

                name: "Image",

                content: "Image",
            };

        case "page":
            return {
                ...baseNode,

                name: "Page",

                children: [],
            };

        default:
            return baseNode;
    }
}

/* =========================================================
   DESCENDANT COLLECTION
========================================================= */

function collectDescendants(
    nodes: Record<
        string,
        ProjectNode
    >,
    nodeId: string
): string[] {
    const node = nodes[nodeId];

    if (!node) {
        return [];
    }

    const descendants: string[] = [];

    for (const childId of
        node.children ?? []) {
        descendants.push(childId);

        descendants.push(
            ...collectDescendants(
                nodes,
                childId
            )
        );
    }

    return descendants;
}

/* =========================================================
   CHILDREN VALIDATION
========================================================= */

function canContainChildren(
    node: ProjectNode
): boolean {
    return (
        node.type === "page" ||
        node.type === "section" ||
        node.type === "container"
    );
}

/* =========================================================
   STORE
========================================================= */

export const useEditorStore =
    create<EditorState>((set) => ({
        /* =================================================
           INITIAL STATE
        ================================================= */

        project: defaultProject,

        selectedNodeId: null,

        past: [],

        future: [],

        transactionSnapshot:
            null,

        transactionActive:
            false,

        /* =================================================
           SELECTION
        ================================================= */

        selectNode: (nodeId) =>
            set({
                selectedNodeId:
                    nodeId,
            }),

        /* =================================================
           BEGIN HISTORY TRANSACTION
        ================================================= */

        beginHistoryTransaction: () =>
            set((state) => {
                /*
                 * Don't start another transaction
                 * if one is already active.
                 */
                if (
                    state.transactionActive
                ) {
                    return state;
                }

                return {
                    transactionActive:
                        true,

                    transactionSnapshot:
                        createSnapshot(
                            state
                        ),
                };
            }),

        /* =================================================
           END HISTORY TRANSACTION
        ================================================= */

        endHistoryTransaction: () =>
            set((state) => {
                if (
                    !state.transactionActive ||
                    !state.transactionSnapshot
                ) {
                    return state;
                }

                const initialSnapshot =
                    state.transactionSnapshot;

                /*
                 * Create a snapshot representing
                 * the state BEFORE the interaction.
                 */
                const nextPast = [
                    ...state.past,
                    initialSnapshot,
                ];

                /*
                 * Keep history bounded.
                 */
                const boundedPast =
                    nextPast.length >
                        MAX_HISTORY
                        ? nextPast.slice(
                            nextPast.length -
                            MAX_HISTORY
                        )
                        : nextPast;

                return {
                    past: boundedPast,

                    future: [],

                    transactionSnapshot:
                        null,

                    transactionActive:
                        false,
                };
            }),

        /* =================================================
           CANCEL HISTORY TRANSACTION
        ================================================= */

        cancelHistoryTransaction: () =>
            set({
                transactionSnapshot:
                    null,

                transactionActive:
                    false,
            }),

        /* =================================================
           ADD NODE
        ================================================= */

        addNode: (
            type,
            parentId
        ) =>
            set((state) => {
                const selectedId =
                    state.selectedNodeId;

                const selectedNode =
                    selectedId
                        ? state.project
                            .nodes[
                        selectedId
                        ]
                        : null;

                let targetParentId =
                    parentId;

                if (
                    !targetParentId &&
                    selectedNode
                ) {
                    if (
                        canContainChildren(
                            selectedNode
                        )
                    ) {
                        targetParentId =
                            selectedNode.id;
                    } else if (
                        selectedNode.parentId
                    ) {
                        targetParentId =
                            selectedNode.parentId;
                    }
                }

                if (!targetParentId) {
                    targetParentId =
                        "node-section";
                }

                const parent =
                    state.project.nodes[
                    targetParentId
                    ];

                if (!parent) {
                    return state;
                }

                if (
                    !canContainChildren(
                        parent
                    )
                ) {
                    return state;
                }

                const childCount =
                    parent.children
                        ?.length ?? 0;

                const newNode =
                    createNode(
                        type,
                        targetParentId,
                        childCount
                    );

                const past =
                    pushHistory(state);

                return {
                    project: {
                        ...state.project,

                        nodes: {
                            ...state.project
                                .nodes,

                            [newNode.id]:
                                newNode,

                            [targetParentId]: {
                                ...parent,

                                children: [
                                    ...(parent.children ??
                                        []),
                                    newNode.id,
                                ],
                            },
                        },
                    },

                    selectedNodeId:
                        newNode.id,

                    past,

                    future: [],
                };
            }),

        /* =================================================
           UPDATE NODE
        ================================================= */

        updateNode: (
            nodeId,
            updates
        ) =>
            set((state) => {
                const existingNode =
                    state.project.nodes[
                    nodeId
                    ];

                if (!existingNode) {
                    return state;
                }

                /*
                 * During a transaction, the initial
                 * snapshot was already saved by
                 * beginHistoryTransaction().
                 *
                 * Therefore don't add another
                 * history entry for every update.
                 */
                if (
                    state.transactionActive
                ) {
                    return {
                        project: {
                            ...state.project,

                            nodes: {
                                ...state.project
                                    .nodes,

                                [nodeId]: {
                                    ...existingNode,
                                    ...updates,
                                },
                            },
                        },
                    };
                }

                const past =
                    pushHistory(state);

                return {
                    project: {
                        ...state.project,

                        nodes: {
                            ...state.project
                                .nodes,

                            [nodeId]: {
                                ...existingNode,
                                ...updates,
                            },
                        },
                    },

                    past,

                    future: [],
                };
            }),

        /* =================================================
           UPDATE NODE STYLES
        ================================================= */

        updateNodeStyles: (
            nodeId,
            styles
        ) =>
            set((state) => {
                const existingNode =
                    state.project.nodes[
                    nodeId
                    ];

                if (!existingNode) {
                    return state;
                }

                /*
                 * Transaction mode:
                 *
                 * Update normally but don't
                 * create another history entry.
                 */
                if (
                    state.transactionActive
                ) {
                    return {
                        project: {
                            ...state.project,

                            nodes: {
                                ...state.project
                                    .nodes,

                                [nodeId]: {
                                    ...existingNode,

                                    styles: {
                                        ...(existingNode
                                            .styles ??
                                            {}),
                                        ...styles,
                                    },
                                },
                            },
                        },
                    };
                }

                const past =
                    pushHistory(state);

                return {
                    project: {
                        ...state.project,

                        nodes: {
                            ...state.project
                                .nodes,

                            [nodeId]: {
                                ...existingNode,

                                styles: {
                                    ...(existingNode
                                        .styles ??
                                        {}),
                                    ...styles,
                                },
                            },
                        },
                    },

                    past,

                    future: [],
                };
            }),

        /* =================================================
           DELETE NODE
        ================================================= */

        deleteNode: (nodeId) =>
            set((state) => {
                const node =
                    state.project.nodes[
                    nodeId
                    ];

                if (!node) {
                    return state;
                }

                if (
                    node.type === "page"
                ) {
                    return state;
                }

                const descendants =
                    collectDescendants(
                        state.project
                            .nodes,
                        nodeId
                    );

                const idsToDelete = [
                    nodeId,
                    ...descendants,
                ];

                const newNodes = {
                    ...state.project.nodes,
                };

                for (const id of
                    idsToDelete) {
                    delete newNodes[id];
                }

                if (node.parentId) {
                    const parent =
                        newNodes[
                        node.parentId
                        ];

                    if (parent) {
                        newNodes[
                            node.parentId
                        ] = {
                            ...parent,

                            children: (
                                parent.children ??
                                []
                            ).filter(
                                (
                                    childId
                                ) =>
                                    childId !==
                                    nodeId
                            ),
                        };
                    }
                }

                const past =
                    pushHistory(state);

                return {
                    project: {
                        ...state.project,

                        nodes: newNodes,
                    },

                    selectedNodeId:
                        null,

                    past,

                    future: [],
                };
            }),

        /* =================================================
           DUPLICATE NODE
        ================================================= */

        duplicateNode: (
            nodeId
        ) =>
            set((state) => {
                const original =
                    state.project.nodes[
                    nodeId
                    ];

                if (!original) {
                    return state;
                }

                if (
                    !original.parentId
                ) {
                    return state;
                }

                const parent =
                    state.project.nodes[
                    original.parentId
                    ];

                if (!parent) {
                    return state;
                }

                const newId =
                    `${original.type}-${Date.now()}-copy`;

                const duplicatedNode:
                    ProjectNode = {
                    ...original,

                    id: newId,

                    name: `${original.name ??
                        original.type
                        } Copy`,

                    parentId:
                        original.parentId,

                    children: [],
                };

                const children = [
                    ...(parent.children ??
                        []),
                ];

                const originalIndex =
                    children.indexOf(
                        nodeId
                    );

                const insertIndex =
                    originalIndex ===
                        -1
                        ? children.length
                        : originalIndex + 1;

                children.splice(
                    insertIndex,
                    0,
                    newId
                );

                const past =
                    pushHistory(state);

                return {
                    project: {
                        ...state.project,

                        nodes: {
                            ...state.project
                                .nodes,

                            [newId]:
                                duplicatedNode,

                            [parent.id]: {
                                ...parent,

                                children,
                            },
                        },
                    },

                    selectedNodeId:
                        newId,

                    past,

                    future: [],
                };
            }),

        /* =================================================
           MOVE NODE
        ================================================= */

        moveNode: (
            nodeId,
            newParentId,
            newIndex
        ) =>
            set((state) => {
                const result =
                    moveNode(
                        state.project
                            .nodes,
                        nodeId,
                        newParentId,
                        newIndex
                    );

                if (
                    !result.success
                ) {
                    console.warn(
                        "Move operation rejected:",
                        result.reason
                    );

                    return state;
                }

                const past =
                    pushHistory(state);

                return {
                    project: {
                        ...state.project,

                        nodes:
                            result.nodes,
                    },

                    selectedNodeId:
                        nodeId,

                    past,

                    future: [],
                };
            }),

        /* =================================================
           UNDO
        ================================================= */

        undo: () =>
            set((state) => {
                /*
                 * If a transaction is still open,
                 * finish it before undoing.
                 */
                if (
                    state.transactionActive &&
                    state.transactionSnapshot
                ) {
                    const previous =
                        state.transactionSnapshot;

                    const current =
                        createSnapshot(
                            state
                        );

                    return {
                        project:
                            previous.project,

                        selectedNodeId:
                            previous.selectedNodeId,

                        past: state.past,

                        future: [
                            ...state.future,
                            current,
                        ],

                        transactionSnapshot:
                            null,

                        transactionActive:
                            false,
                    };
                }

                if (
                    state.past.length ===
                    0
                ) {
                    return state;
                }

                const previous =
                    state.past[
                    state.past.length -
                    1
                    ];

                const current =
                    createSnapshot(
                        state
                    );

                return {
                    project:
                        previous.project,

                    selectedNodeId:
                        previous.selectedNodeId,

                    past: state.past.slice(
                        0,
                        -1
                    ),

                    future: [
                        ...state.future,
                        current,
                    ],
                };
            }),

        /* =================================================
           REDO
        ================================================= */

        redo: () =>
            set((state) => {
                if (
                    state.transactionActive
                ) {
                    return state;
                }

                if (
                    state.future.length ===
                    0
                ) {
                    return state;
                }

                const next =
                    state.future[
                    state.future.length -
                    1
                    ];

                const current =
                    createSnapshot(
                        state
                    );

                return {
                    project:
                        next.project,

                    selectedNodeId:
                        next.selectedNodeId,

                    future:
                        state.future.slice(
                            0,
                            -1
                        ),

                    past: [
                        ...state.past,
                        current,
                    ],
                };
            }),
    }));