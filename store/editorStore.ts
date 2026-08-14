import { moveNode as moveTreeNode } from "@/store/treeOperations";
import { create } from "zustand";

import { defaultProject } from "@/model/defaultProject";

import {
    BreakpointId,
    NodeType,
    Project,
    ProjectNode,
} from "@/model/type";

/* =========================================================
   HISTORY
========================================================= */

interface EditorSnapshot {
    project: Project;

    selectedNodeId:
    | string
    | null;
}

/* =========================================================
   EDITOR STATE
========================================================= */

interface EditorState {
    project: Project;

    selectedNodeId:
    | string
    | null;

    /*
     * =====================================================
     * HISTORY
     * =====================================================
     */

    past: EditorSnapshot[];

    future: EditorSnapshot[];

    /*
     * =====================================================
     * HISTORY TRANSACTION
     * =====================================================
     */

    transactionSnapshot:
    | EditorSnapshot
    | null;

    transactionActive: boolean;

    transactionChanged: boolean;

    /*
     * =====================================================
     * SELECTION
     * =====================================================
     */

    selectNode: (
        nodeId: string | null
    ) => void;

    /*
     * =====================================================
     * NODE OPERATIONS
     * =====================================================
     */

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

    /*
     * =====================================================
     * RESPONSIVE STYLE OPERATIONS
     * =====================================================
     *
     * These modify ONLY the selected breakpoint's
     * responsive override object.
     *
     * They do NOT modify base styles.
     */

    updateResponsiveNodeStyles: (
        nodeId: string,
        breakpoint: BreakpointId,
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

    /*
     * =====================================================
     * HISTORY
     * =====================================================
     */

    undo: () => void;

    redo: () => void;

    /*
     * =====================================================
     * HISTORY TRANSACTIONS
     * =====================================================
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
    const node =
        nodes[nodeId];

    if (!node) {
        return [];
    }

    const descendants: string[] =
        [];

    for (
        const childId of
        node.children ?? []
    ) {
        descendants.push(
            childId
        );

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
    create<EditorState>(
        (set) => ({
            /* =================================================
               INITIAL STATE
            ================================================= */

            project:
                defaultProject,

            selectedNodeId:
                null,

            past: [],

            future: [],

            transactionSnapshot:
                null,

            transactionActive:
                false,

            transactionChanged:
                false,

            /* =================================================
               SELECTION
            ================================================= */

            selectNode: (
                nodeId
            ) =>
                set({
                    selectedNodeId:
                        nodeId,
                }),

            /* =================================================
               BEGIN HISTORY TRANSACTION
            ================================================= */

            beginHistoryTransaction:
                () =>
                    set((state) => {
                        if (
                            state.transactionActive
                        ) {
                            return state;
                        }

                        return {
                            transactionActive:
                                true,

                            transactionChanged:
                                false,

                            transactionSnapshot:
                                createSnapshot(
                                    state
                                ),
                        };
                    }),

            /* =================================================
               END HISTORY TRANSACTION
            ================================================= */

            endHistoryTransaction:
                () =>
                    set((state) => {
                        if (
                            !state.transactionActive ||
                            !state.transactionSnapshot
                        ) {
                            return state;
                        }

                        if (
                            !state.transactionChanged
                        ) {
                            return {
                                transactionSnapshot:
                                    null,

                                transactionActive:
                                    false,

                                transactionChanged:
                                    false,
                            };
                        }

                        const nextPast =
                            [
                                ...state.past,

                                state.transactionSnapshot,
                            ];

                        const boundedPast =
                            nextPast.length >
                                MAX_HISTORY
                                ? nextPast.slice(
                                    nextPast.length -
                                    MAX_HISTORY
                                )
                                : nextPast;

                        return {
                            past:
                                boundedPast,

                            future: [],

                            transactionSnapshot:
                                null,

                            transactionActive:
                                false,

                            transactionChanged:
                                false,
                        };
                    }),

            /* =================================================
               CANCEL HISTORY TRANSACTION
            ================================================= */

            cancelHistoryTransaction:
                () =>
                    set((state) => {
                        if (
                            !state.transactionActive
                        ) {
                            return state;
                        }

                        if (
                            !state.transactionSnapshot
                        ) {
                            return {
                                transactionActive:
                                    false,

                                transactionChanged:
                                    false,

                                transactionSnapshot:
                                    null,
                            };
                        }

                        return {
                            project:
                                state
                                    .transactionSnapshot
                                    .project,

                            selectedNodeId:
                                state
                                    .transactionSnapshot
                                    .selectedNodeId,

                            transactionSnapshot:
                                null,

                            transactionActive:
                                false,

                            transactionChanged:
                                false,
                        };
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

                    if (
                        !targetParentId
                    ) {
                        targetParentId =
                            "node-section";
                    }

                    const parent =
                        state.project
                            .nodes[
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
                            ?.length ??
                        0;

                    const newNode =
                        createNode(
                            type,
                            targetParentId,
                            childCount
                        );

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project: {
                                ...state.project,

                                nodes: {
                                    ...state
                                        .project
                                        .nodes,

                                    [newNode.id]:
                                        newNode,

                                    [targetParentId]:
                                    {
                                        ...parent,

                                        children:
                                            [
                                                ...(parent.children ??
                                                    []),

                                                newNode.id,
                                            ],
                                    },
                                },
                            },

                            selectedNodeId:
                                newNode.id,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project: {
                            ...state.project,

                            nodes: {
                                ...state
                                    .project
                                    .nodes,

                                [newNode.id]:
                                    newNode,

                                [targetParentId]:
                                {
                                    ...parent,

                                    children:
                                        [
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
                        state.project
                            .nodes[
                        nodeId
                        ];

                    if (
                        !existingNode
                    ) {
                        return state;
                    }

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project: {
                                ...state.project,

                                nodes: {
                                    ...state
                                        .project
                                        .nodes,

                                    [nodeId]:
                                    {
                                        ...existingNode,

                                        ...updates,
                                    },
                                },
                            },

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project: {
                            ...state.project,

                            nodes: {
                                ...state
                                    .project
                                    .nodes,

                                [nodeId]:
                                {
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
                        state.project
                            .nodes[
                        nodeId
                        ];

                    if (
                        !existingNode
                    ) {
                        return state;
                    }

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project: {
                                ...state.project,

                                nodes: {
                                    ...state
                                        .project
                                        .nodes,

                                    [nodeId]:
                                    {
                                        ...existingNode,

                                        styles: {
                                            ...(existingNode.styles ??
                                                {}),

                                            ...styles,
                                        },
                                    },
                                },
                            },

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project: {
                            ...state.project,

                            nodes: {
                                ...state
                                    .project
                                    .nodes,

                                [nodeId]:
                                {
                                    ...existingNode,

                                    styles: {
                                        ...(existingNode.styles ??
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
               UPDATE RESPONSIVE NODE STYLES
            ================================================= */

            updateResponsiveNodeStyles:
                (
                    nodeId,
                    breakpoint,
                    styles
                ) =>
                    set((state) => {
                        const existingNode =
                            state.project
                                .nodes[
                            nodeId
                            ];

                        if (
                            !existingNode
                        ) {
                            return state;
                        }

                        const existingStyles =
                            existingNode.styles ??
                            {};

                        const existingResponsive =
                            existingStyles.responsive ??
                            {};

                        const existingBreakpointStyles =
                            existingResponsive[
                            breakpoint
                            ] ?? {};

                        /*
                         * Create the new node state.
                         *
                         * Only the selected breakpoint
                         * receives the new values.
                         *
                         * Base styles remain untouched.
                         *
                         * Other breakpoints remain untouched.
                         */
                        const updatedNode =
                        {
                            ...existingNode,

                            styles: {
                                ...existingStyles,

                                responsive: {
                                    ...existingResponsive,

                                    [breakpoint]:
                                    {
                                        ...existingBreakpointStyles,

                                        ...styles,
                                    },
                                },
                            },
                        };

                        /*
                         * Transaction mode.
                         */
                        if (
                            state.transactionActive
                        ) {
                            return {
                                project: {
                                    ...state.project,

                                    nodes: {
                                        ...state
                                            .project
                                            .nodes,

                                        [nodeId]:
                                            updatedNode,
                                    },
                                },

                                transactionChanged:
                                    true,
                            };
                        }

                        /*
                         * Normal history operation.
                         */
                        const past =
                            pushHistory(
                                state
                            );

                        return {
                            project: {
                                ...state.project,

                                nodes: {
                                    ...state
                                        .project
                                        .nodes,

                                    [nodeId]:
                                        updatedNode,
                                },
                            },

                            past,

                            future: [],
                        };
                    }),

            /* =================================================
               DELETE NODE
            ================================================= */

            deleteNode: (
                nodeId
            ) =>
                set((state) => {
                    const node =
                        state.project
                            .nodes[
                        nodeId
                        ];

                    if (!node) {
                        return state;
                    }

                    /*
                     * Pages cannot be deleted.
                     */
                    if (
                        node.type ===
                        "page"
                    ) {
                        return state;
                    }

                    const descendants =
                        collectDescendants(
                            state.project
                                .nodes,

                            nodeId
                        );

                    const idsToDelete =
                        [
                            nodeId,

                            ...descendants,
                        ];

                    const newNodes = {
                        ...state.project
                            .nodes,
                    };

                    /*
                     * Remove node and
                     * descendants.
                     */
                    for (
                        const id of
                        idsToDelete
                    ) {
                        delete newNodes[
                            id
                        ];
                    }

                    /*
                     * Remove deleted node
                     * from its parent.
                     */
                    if (
                        node.parentId
                    ) {
                        const parent =
                            newNodes[
                            node
                                .parentId
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

                    /*
                     * Transaction mode.
                     */
                    if (
                        state.transactionActive
                    ) {
                        return {
                            project: {
                                ...state.project,

                                nodes:
                                    newNodes,
                            },

                            selectedNodeId:
                                null,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project: {
                            ...state.project,

                            nodes:
                                newNodes,
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
                        state.project
                            .nodes[
                        nodeId
                        ];

                    if (!original) {
                        return state;
                    }

                    /*
                     * Root nodes cannot
                     * be duplicated.
                     */
                    if (
                        !original.parentId
                    ) {
                        return state;
                    }

                    const parent =
                        state.project
                            .nodes[
                        original
                            .parentId
                        ];

                    if (!parent) {
                        return state;
                    }

                    const newId =
                        `${original.type}-${Date.now()}-copy`;

                    /*
                     * Current behavior duplicates
                     * the selected node itself.
                     */
                    const duplicatedNode:
                        ProjectNode = {
                        ...original,

                        id: newId,

                        name:
                            `${original.name ??
                            original.type
                            } Copy`,

                        parentId:
                            original.parentId,

                        children: [],
                    };

                    const children =
                        [
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
                            : originalIndex +
                            1;

                    children.splice(
                        insertIndex,
                        0,
                        newId
                    );

                    /*
                     * Transaction mode.
                     */
                    if (
                        state.transactionActive
                    ) {
                        return {
                            project: {
                                ...state.project,

                                nodes: {
                                    ...state
                                        .project
                                        .nodes,

                                    [newId]:
                                        duplicatedNode,

                                    [parent.id]:
                                    {
                                        ...parent,

                                        children,
                                    },
                                },
                            },

                            selectedNodeId:
                                newId,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project: {
                            ...state.project,

                            nodes: {
                                ...state
                                    .project
                                    .nodes,

                                [newId]:
                                    duplicatedNode,

                                [parent.id]:
                                {
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
                        moveTreeNode(
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

                    /*
                     * Transaction mode.
                     */
                    if (
                        state.transactionActive
                    ) {
                        return {
                            project: {
                                ...state.project,

                                nodes:
                                    result.nodes,
                            },

                            selectedNodeId:
                                nodeId,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

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
                     * Cancel active transaction.
                     */
                    if (
                        state.transactionActive &&
                        state.transactionSnapshot
                    ) {
                        const previous =
                            state.transactionSnapshot;

                        return {
                            project:
                                previous.project,

                            selectedNodeId:
                                previous.selectedNodeId,

                            transactionSnapshot:
                                null,

                            transactionActive:
                                false,

                            transactionChanged:
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

                        past:
                            state.past.slice(
                                0,
                                -1
                            ),

                        future: [
                            ...state.future,

                            current,
                        ],

                        transactionSnapshot:
                            null,

                        transactionActive:
                            false,

                        transactionChanged:
                            false,
                    };
                }),

            /* =================================================
               REDO
            ================================================= */

            redo: () =>
                set((state) => {
                    /*
                     * Never redo while a
                     * transaction is active.
                     */
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

                    const nextPast = [
                        ...state.past,

                        current,
                    ];

                    const boundedPast =
                        nextPast.length >
                            MAX_HISTORY
                            ? nextPast.slice(
                                nextPast.length -
                                MAX_HISTORY
                            )
                            : nextPast;

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

                        past:
                            boundedPast,

                        transactionSnapshot:
                            null,

                        transactionActive:
                            false,

                        transactionChanged:
                            false,
                    };
                }),
        })
    );