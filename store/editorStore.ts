import { moveNode as moveTreeNode } from "@/store/treeOperations";
import { create } from "zustand";

import { defaultProject } from "@/model/defaultProject";
import {
    getEditableNodeIds,
    getTopLevelSelectedNodeIds,
    getValidSelectedNodeIds,
} from "@/components/editor/multi-select/selectionUtils";

import {
    BreakpointId,
    DesignToken,
    DesignTokenType,
    LayoutMode,
    NodeType,
    Project,
    ProjectAsset,
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

    selectedNodeIds: string[];
}

/* =========================================================
   EDITOR STATE
========================================================= */
interface EditorState {
    project: Project;

    selectedNodeId:
    | string
    | null;

    selectedNodeIds: string[];

    activeBreakpointId: BreakpointId;

    setActiveBreakpoint: (
        breakpointId: BreakpointId
    ) => void;

    /* =====================================================
       HISTORY
    ===================================================== */

    past: EditorSnapshot[];

    future: EditorSnapshot[];

    /* =====================================================
       HISTORY TRANSACTION
    ===================================================== */

    transactionSnapshot:
    | EditorSnapshot
    | null;

    transactionActive: boolean;

    transactionChanged: boolean;

    /* =====================================================
       SELECTION
    ===================================================== */

    selectNode: (
        nodeId: string | null
    ) => void;

    toggleNodeSelection: (
        nodeId: string
    ) => void;

    clearSelection: () => void;

    selectAllNodes: () => void;

    setSelectedNodes: (
        nodeIds: string[]
    ) => void;

    /* =====================================================
       PAGE OPERATIONS
    ===================================================== */

    createPage: (
        name?: string
    ) => void;

    deletePage: (
        pageId: string
    ) => void;

    renamePage: (
        pageId: string,
        name: string
    ) => void;

    duplicatePage: (
        pageId: string
    ) => void;

    setActivePage: (
        pageId: string
    ) => void;

    /* =====================================================
       NODE OPERATIONS
    ===================================================== */

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

    bulkUpdateNodeStyles: (
        nodeIds: string[],
        styles: Record<string, string>
    ) => void;

    setLayoutMode: (
        nodeId: string,
        mode: LayoutMode
    ) => void;

    /* =====================================================
       IMAGE ASSET
    ===================================================== */

    setImageAsset: (
        nodeId: string,
        asset: ProjectAsset
    ) => void;

    addAsset: (asset: ProjectAsset) => void;

    removeAsset: (assetId: string) => void;

    replaceProject: (project: Project) => void;

    /* =====================================================
       DESIGN TOKEN OPERATIONS
    ===================================================== */

    addDesignToken: (
        name: string,
        type: DesignTokenType,
        value: string
    ) => void;

    updateDesignToken: (
        tokenId: string,
        updates: Partial<DesignToken>
    ) => void;

    deleteDesignToken: (
        tokenId: string
    ) => void;

    /* =====================================================
       RESPONSIVE STYLE OPERATIONS
    ===================================================== */

    updateResponsiveNodeStyles: (
        nodeId: string,
        breakpoint: BreakpointId,
        styles: Record<string, string>
    ) => void;

    bulkUpdateResponsiveNodeStyles: (
        nodeIds: string[],
        breakpoint: BreakpointId,
        styles: Record<string, string>
    ) => void;

    deleteNode: (
        nodeId: string
    ) => void;

    deleteSelectedNodes: () => void;

    duplicateNode: (
        nodeId: string
    ) => void;

    moveNode: (
        nodeId: string,
        newParentId: string,
        newIndex?: number
    ) => void;

    /* =====================================================
       HISTORY
    ===================================================== */

    undo: () => void;

    redo: () => void;

    /* =====================================================
       HISTORY TRANSACTIONS
    ===================================================== */

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

        selectedNodeIds: [
            ...state.selectedNodeIds,
        ],
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
        `${type}-${Date.now()}-${index}-${Math.random()
            .toString(36)
            .slice(2, 7)}`;

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

        case "navbar":
            return {
                ...baseNode,

                name: "Navbar",

                children: [],

                styles: {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    paddingTop: "16px",
                    paddingRight: "24px",
                    paddingBottom: "16px",
                    paddingLeft: "24px",
                    backgroundColor: "#ffffff",
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
   PAGE ROOT CREATION
========================================================= */

function createPageRoot(
    rootNodeId: string,
    pageName: string
): ProjectNode {
    return {
        id: rootNodeId,

        type: "page",

        name: pageName,

        children: [],
    };
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
        node.type === "container" ||
        node.type === "navbar"
    );
}

/* =========================================================
   UNIQUE PAGE ID
========================================================= */

function createUniquePageId(
    pages: Project["pages"]
): string {
    let counter = 1;

    let id =
        `page-${Date.now()}`;

    while (pages[id]) {
        id =
            `page-${Date.now()}-${counter}`;

        counter++;
    }

    return id;
}

/* =========================================================
   UNIQUE NODE ID
========================================================= */

function createUniqueNodeId(
    nodes: Project["nodes"],
    prefix: string
): string {
    let id =
        `${prefix}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    while (nodes[id]) {
        id =
            `${prefix}-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`;
    }

    return id;
}

/* =========================================================
   UNIQUE DESIGN TOKEN ID
========================================================= */

function createUniqueDesignTokenId(
    tokens: Project["designTokens"] | undefined
): string {
    const safeTokens =
        tokens ?? {};

    let id =
        `token-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    while (safeTokens[id]) {
        id =
            `token-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`;
    }

    return id;
}

/* =========================================================
   UNIQUE PAGE NAME
========================================================= */

function createUniquePageName(
    pages: Project["pages"],
    requestedName: string
): string {
    const cleanName =
        requestedName.trim() ||
        "New Page";

    const existingNames =
        Object.values(pages).map(
            (page) =>
                page.name.toLowerCase()
        );

    if (
        !existingNames.includes(
            cleanName.toLowerCase()
        )
    ) {
        return cleanName;
    }

    let counter = 2;

    while (
        existingNames.includes(
            `${cleanName} ${counter}`
                .toLowerCase()
        )
    ) {
        counter++;
    }

    return `${cleanName} ${counter}`;
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

            selectedNodeIds: [],

            activeBreakpointId: "desktop",

            setActiveBreakpoint: (
                breakpointId: BreakpointId
            ) =>
                set({
                    activeBreakpointId:
                        breakpointId,
                }),

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

                    selectedNodeIds:
                        nodeId
                            ? [nodeId]
                            : [],
                }),

            toggleNodeSelection: (
                nodeId
            ) =>
                set((state) => {
                    const node =
                        state.project.nodes[nodeId];

                    if (
                        !node ||
                        node.type === "page"
                    ) {
                        return state;
                    }

                    const current =
                        getValidSelectedNodeIds(
                            state.selectedNodeIds,
                            state.project.nodes
                        );

                    const exists =
                        current.includes(nodeId);

                    const next = exists
                        ? current.filter(
                            (id) => id !== nodeId
                        )
                        : [...current, nodeId];

                    return {
                        selectedNodeIds: next,
                        selectedNodeId:
                            next.length > 0
                                ? nodeId === state.selectedNodeId &&
                                    exists
                                    ? next[next.length - 1] ?? null
                                    : nodeId
                                : null,
                    };
                }),

            clearSelection: () =>
                set({
                    selectedNodeId: null,
                    selectedNodeIds: [],
                }),

            selectAllNodes: () =>
                set((state) => {
                    const nodeIds =
                        getEditableNodeIds(
                            state.project.nodes
                        );

                    return {
                        selectedNodeIds: nodeIds,
                        selectedNodeId:
                            nodeIds[nodeIds.length - 1] ??
                            null,
                    };
                }),

            setSelectedNodes: (
                nodeIds
            ) =>
                set((state) => {
                    const validNodeIds =
                        getValidSelectedNodeIds(
                            [...new Set(nodeIds)],
                            state.project.nodes
                        );

                    return {
                        selectedNodeIds:
                            validNodeIds,

                        selectedNodeId:
                            validNodeIds[
                            validNodeIds.length - 1
                            ] ?? null,
                    };
                }),

            /* =================================================
               CREATE PAGE
            ================================================= */

            createPage: (
                requestedName
            ) =>
                set((state) => {

                    const pageId =
                        createUniquePageId(
                            state.project
                                .pages
                        );

                    const pageName =
                        createUniquePageName(
                            state.project
                                .pages,

                            requestedName ??
                            "New Page"
                        );

                    const rootNodeId =
                        createUniqueNodeId(
                            state.project
                                .nodes,

                            `${pageId}-root`
                        );

                    const rootNode =
                        createPageRoot(
                            rootNodeId,
                            pageName
                        );

                    /* -----------------------------------------
                       TRANSACTION MODE
                    ----------------------------------------- */

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project: {
                                ...state.project,

                                pages: {
                                    ...state
                                        .project
                                        .pages,

                                    [pageId]: {
                                        id:
                                            pageId,

                                        name:
                                            pageName,

                                        rootNodeId:
                                            rootNodeId,
                                    },
                                },

                                nodes: {
                                    ...state
                                        .project
                                        .nodes,

                                    [rootNodeId]:
                                        rootNode,
                                },

                                activePageId:
                                    pageId,
                            },

                            selectedNodeId:
                                null,

                            transactionChanged:
                                true,
                        };
                    }

                    /* -----------------------------------------
                       NORMAL HISTORY OPERATION
                    ----------------------------------------- */

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project: {
                            ...state.project,

                            pages: {
                                ...state
                                    .project
                                    .pages,

                                [pageId]: {
                                    id:
                                        pageId,

                                    name:
                                        pageName,

                                    rootNodeId:
                                        rootNodeId,
                                },
                            },

                            nodes: {
                                ...state
                                    .project
                                    .nodes,

                                [rootNodeId]:
                                    rootNode,
                            },

                            activePageId:
                                pageId,
                        },

                        selectedNodeId:
                            null,

                        selectedNodeIds:
                            [],

                        past,

                        future: [],
                    };
                }),

            /* =================================================
               DELETE PAGE
            ================================================= */

            deletePage: (
                pageId
            ) =>
                set((state) => {

                    const page =
                        state.project
                            .pages[
                        pageId
                        ];

                    if (!page) {
                        return state;
                    }

                    const pageIds =
                        Object.keys(
                            state.project
                                .pages
                        );

                    /*
                     * Never allow zero pages.
                     */
                    if (
                        pageIds.length <= 1
                    ) {
                        console.warn(
                            "Cannot delete the last page."
                        );

                        return state;
                    }

                    const newPages = {
                        ...state.project
                            .pages,
                    };

                    delete newPages[
                        pageId
                    ];

                    /*
                     * Remove entire page
                     * node tree.
                     */
                    const idsToDelete = [
                        page.rootNodeId,

                        ...collectDescendants(
                            state.project
                                .nodes,

                            page.rootNodeId
                        ),
                    ];

                    const newNodes = {
                        ...state.project
                            .nodes,
                    };

                    for (
                        const id of
                        idsToDelete
                    ) {
                        delete newNodes[
                            id
                        ];
                    }

                    let nextActivePageId =
                        state.project
                            .activePageId;

                    if (
                        nextActivePageId ===
                        pageId
                    ) {
                        const remainingPageId =
                            pageIds.find(
                                (
                                    id
                                ) =>
                                    id !==
                                    pageId
                            );

                        if (
                            !remainingPageId
                        ) {
                            return state;
                        }

                        nextActivePageId =
                            remainingPageId;
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

                                pages:
                                    newPages,

                                nodes:
                                    newNodes,

                                activePageId:
                                    nextActivePageId,
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

                            pages:
                                newPages,

                            nodes:
                                newNodes,

                            activePageId:
                                nextActivePageId,
                        },

                        selectedNodeId:
                            null,

                        selectedNodeIds:
                            [],

                        past,

                        future: [],
                    };
                }),

            /* =================================================
               RENAME PAGE
            ================================================= */

            renamePage: (
                pageId,
                name
            ) =>
                set((state) => {

                    const page =
                        state.project
                            .pages[
                        pageId
                        ];

                    if (!page) {
                        return state;
                    }

                    const trimmedName =
                        name.trim();

                    if (
                        !trimmedName
                    ) {
                        return state;
                    }

                    if (
                        page.name ===
                        trimmedName
                    ) {
                        return state;
                    }

                    const duplicate =
                        Object.values(
                            state.project
                                .pages
                        ).some(
                            (
                                existingPage
                            ) =>
                                existingPage
                                    .id !==
                                pageId &&
                                existingPage
                                    .name
                                    .toLowerCase() ===
                                trimmedName
                                    .toLowerCase()
                        );

                    if (duplicate) {
                        console.warn(
                            "A page with this name already exists."
                        );

                        return state;
                    }

                    const rootNode =
                        state.project
                            .nodes[
                        page.rootNodeId
                        ];

                    if (!rootNode) {
                        return state;
                    }

                    const updatedProject: Project = {
                        ...state.project,

                        pages: {
                            ...state
                                .project
                                .pages,

                            [pageId]: {
                                ...page,

                                name:
                                    trimmedName,
                            },
                        },

                        nodes: {
                            ...state
                                .project
                                .nodes,

                            [page.rootNodeId]:
                            {
                                ...rootNode,

                                name:
                                    trimmedName,
                            },
                        },
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project:
                            updatedProject,

                        past,

                        future: [],
                    };
                }),

            /* =================================================
               DUPLICATE PAGE
            ================================================= */

            duplicatePage: (
                pageId
            ) =>
                set((state) => {

                    const page =
                        state.project
                            .pages[
                        pageId
                        ];

                    if (!page) {
                        return state;
                    }

                    const sourceRoot =
                        state.project
                            .nodes[
                        page.rootNodeId
                        ];

                    if (!sourceRoot) {
                        return state;
                    }

                    const newPageId =
                        createUniquePageId(
                            state.project
                                .pages
                        );

                    const newPageName =
                        createUniquePageName(
                            state.project
                                .pages,

                            `${page.name} Copy`
                        );

                    const newRootId =
                        createUniqueNodeId(
                            state.project
                                .nodes,

                            `${newPageId}-root`
                        );

                    const newNodes = {
                        ...state.project
                            .nodes,
                    };

                    const nodeIdMap =
                        new Map<
                            string,
                            string
                        >();

                    const subtreeIds = [
                        page.rootNodeId,

                        ...collectDescendants(
                            state.project
                                .nodes,

                            page.rootNodeId
                        ),
                    ];

                    /*
                     * Create ID mapping.
                     */
                    for (
                        const oldId of
                        subtreeIds
                    ) {

                        const newId =
                            oldId ===
                                page.rootNodeId
                                ? newRootId
                                : createUniqueNodeId(
                                    newNodes,
                                    oldId
                                );

                        nodeIdMap.set(
                            oldId,
                            newId
                        );
                    }

                    /*
                     * Copy every node.
                     */
                    for (
                        const oldId of
                        subtreeIds
                    ) {

                        const oldNode =
                            state.project
                                .nodes[
                            oldId
                            ];

                        if (!oldNode) {
                            continue;
                        }

                        const newId =
                            nodeIdMap.get(
                                oldId
                            );

                        if (!newId) {
                            continue;
                        }

                        const newParentId =
                            oldNode.parentId
                                ? nodeIdMap.get(
                                    oldNode
                                        .parentId
                                )
                                : undefined;

                        const newChildren =
                            oldNode.children
                                ?.map(
                                    (
                                        childId
                                    ) =>
                                        nodeIdMap.get(
                                            childId
                                        )
                                )
                                .filter(
                                    (
                                        childId
                                    ): childId is string =>
                                        Boolean(
                                            childId
                                        )
                                );

                        newNodes[newId] = {
                            ...oldNode,

                            id:
                                newId,

                            name:
                                oldId ===
                                    page.rootNodeId
                                    ? newPageName
                                    : oldNode.name,

                            parentId:
                                newParentId,

                            children:
                                newChildren,
                        };
                    }

                    const newProject: Project = {
                        ...state.project,

                        pages: {
                            ...state
                                .project
                                .pages,

                            [newPageId]: {
                                id:
                                    newPageId,

                                name:
                                    newPageName,

                                rootNodeId:
                                    newRootId,
                            },
                        },

                        nodes:
                            newNodes,

                        activePageId:
                            newPageId,
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                newProject,

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
                        project:
                            newProject,

                        selectedNodeId:
                            null,

                        selectedNodeIds:
                            [],

                        past,

                        future: [],
                    };
                }),

            /* =================================================
               SET ACTIVE PAGE
            ================================================= */

            setActivePage: (
                pageId
            ) =>
                set((state) => {

                    const page =
                        state.project
                            .pages[
                        pageId
                        ];

                    if (!page) {
                        console.warn(
                            "Cannot activate unknown page:",
                            pageId
                        );

                        return state;
                    }

                    if (
                        state.project
                            .activePageId ===
                        pageId
                    ) {
                        return state;
                    }

                    return {
                        project: {
                            ...state.project,

                            activePageId:
                                pageId,
                        },

                        selectedNodeId:
                            null,

                        selectedNodeIds:
                            [],
                    };
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

                        const nextPast = [
                            ...state.past,

                            state
                                .transactionSnapshot,
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
                        }
                        else if (
                            selectedNode.parentId
                        ) {
                            targetParentId =
                                selectedNode
                                    .parentId;
                        }
                    }

                    /*
                     * Use active page root
                     * when no parent exists.
                     */
                    if (
                        !targetParentId
                    ) {
                        const activePage =
                            state.project
                                .pages[
                            state.project
                                .activePageId
                            ];

                        targetParentId =
                            activePage
                                ?.rootNodeId;
                    }

                    if (
                        !targetParentId
                    ) {
                        return state;
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

                    /*
                     * Pages are managed
                     * separately.
                     */
                    if (
                        type === "page"
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

                    const updatedProject: Project = {
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

                                children: [
                                    ...(
                                        parent
                                            .children ??
                                        []
                                    ),

                                    newNode.id,
                                ],
                            },
                        },
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            selectedNodeId:
                                newNode.id,

                            selectedNodeIds:
                                [newNode.id],

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project:
                            updatedProject,

                        selectedNodeId:
                            newNode.id,

                        selectedNodeIds:
                            [newNode.id],

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

                    if (!existingNode) {
                        return state;
                    }

                    const updatedProject: Project = {
                        ...state.project,

                        nodes: {
                            ...state
                                .project
                                .nodes,

                            [nodeId]: {
                                ...existingNode,

                                ...updates,
                            },
                        },
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project:
                            updatedProject,

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

                    if (!existingNode) {
                        return state;
                    }

                    const updatedNode:
                        ProjectNode = {
                        ...existingNode,

                        styles: {
                            ...(existingNode
                                .styles ??
                                {}),

                            ...styles,
                        },
                    };

                    const updatedProject: Project = {
                        ...state.project,

                        nodes: {
                            ...state
                                .project
                                .nodes,

                            [nodeId]:
                                updatedNode,
                        },
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project:
                            updatedProject,

                        past,

                        future: [],
                    };
                }),

            /* =========================================================
               BULK NODE STYLE UPDATE
            ========================================================= */

            bulkUpdateNodeStyles: (
                nodeIds,
                styles
            ) =>
                set((state) => {
                    const validNodeIds =
                        getValidSelectedNodeIds(
                            nodeIds,
                            state.project.nodes
                        );

                    if (
                        validNodeIds.length === 0 ||
                        Object.keys(styles).length === 0
                    ) {
                        return state;
                    }

                    const nodes = {
                        ...state.project.nodes,
                    };

                    validNodeIds.forEach(
                        (id) => {
                            const existingNode =
                                nodes[id];

                            if (!existingNode) {
                                return;
                            }

                            nodes[id] = {
                                ...existingNode,

                                styles: {
                                    ...(existingNode.styles ?? {}),
                                    ...styles,
                                },
                            };
                        }
                    );

                    const updatedProject: Project = {
                        ...state.project,
                        nodes,
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(state);

                    return {
                        project:
                            updatedProject,

                        past,

                        future: [],
                    };
                }),

            /* =================================================
               SET LAYOUT MODE
========================================================= */

            setLayoutMode: (
                nodeId,
                mode
            ) =>
                set((state) => {
                    const existingNode =
                        state.project.nodes[nodeId];

                    if (!existingNode) {
                        return state;
                    }

                    const existingStyles =
                        existingNode.styles ?? {};

                    const previousMode =
                        existingStyles.layoutMode ??
                        "automatic";

                    const nextStyles = {
                        ...existingStyles,
                    };

                    /* -------------------------------------------------
                       STRUCTURAL LAYOUT SETTINGS
                    ------------------------------------------------- */

                    switch (mode) {
                        case "automatic":
                            nextStyles.layoutMode =
                                "automatic";

                            nextStyles.display =
                                "flex";

                            nextStyles.flexDirection =
                                "column";

                            break;

                        case "horizontal":
                            nextStyles.layoutMode =
                                "horizontal";

                            nextStyles.display =
                                "flex";

                            nextStyles.flexDirection =
                                "row";

                            break;

                        case "vertical":
                            nextStyles.layoutMode =
                                "vertical";

                            nextStyles.display =
                                "flex";

                            nextStyles.flexDirection =
                                "column";

                            break;

                        case "grid":
                            /*
                             * Grid layout.
                             *
                             * IMPORTANT:
                             * Grid children must remain in normal
                             * CSS Grid flow.
                             *
                             * Therefore any stale Free Position
                             * coordinates are cleaned below.
                             */
                            nextStyles.layoutMode =
                                "grid";

                            nextStyles.display =
                                "grid";

                            /*
                             * Preserve existing Grid settings.
                             */
                            if (
                                !existingStyles.gridTemplateColumns
                            ) {
                                nextStyles.gridTemplateColumns =
                                    "repeat(3, minmax(0, 1fr))";
                            }

                            if (
                                !existingStyles.columnGap
                            ) {
                                nextStyles.columnGap =
                                    "20px";
                            }

                            if (
                                !existingStyles.rowGap
                            ) {
                                nextStyles.rowGap =
                                    "20px";
                            }

                            break;

                        case "free":
                            /*
                             * Free Position makes the parent the
                             * coordinate system for absolutely
                             * positioned children.
                             */
                            nextStyles.layoutMode =
                                "free";

                            nextStyles.position =
                                "relative";

                            break;
                    }

                    /* -------------------------------------------------
                       COPY NODE MAP
                    ------------------------------------------------- */

                    const nextNodes = {
                        ...state.project.nodes,

                        [nodeId]: {
                            ...existingNode,

                            styles:
                                nextStyles,
                        },
                    };

                    /* -------------------------------------------------
                       GRID CLEANUP
                    -------------------------------------------------
            
                       Whenever a container enters Grid mode, its
                       direct children must return to normal Grid flow.
            
                       This is intentionally NOT limited to:
            
                           previousMode === "free"
            
                       because older drag behavior may already have
                       converted children to absolute positioning
                       while the parent was in another layout mode.
            
                       We therefore clean stale positioning whenever
                       Grid becomes the active mode.
                    ------------------------------------------------- */

                    const childrenNeedGridCleanup =
                        mode === "grid" &&
                        (existingNode.children ?? []).some(
                            (childId) => {
                                const child =
                                    state.project.nodes[
                                    childId
                                    ];

                                if (!child) {
                                    return false;
                                }

                                const childStyles =
                                    child.styles ?? {};

                                return (
                                    childStyles.position ===
                                    "absolute" ||
                                    !!childStyles.top ||
                                    !!childStyles.right ||
                                    !!childStyles.bottom ||
                                    !!childStyles.left
                                );
                            }
                        );

                    if (childrenNeedGridCleanup) {
                        for (
                            const childId of
                            existingNode.children ?? []
                        ) {
                            const child =
                                nextNodes[childId];

                            if (!child) {
                                continue;
                            }

                            const childStyles =
                                child.styles ?? {};

                            /*
                             * Only remove positioning properties
                             * generated by Free Position / old drag
                             * behavior.
                             *
                             * We intentionally preserve all other
                             * child styles.
                             */
                            const cleanedStyles = {
                                ...childStyles,
                            };

                            delete cleanedStyles.position;
                            delete cleanedStyles.top;
                            delete cleanedStyles.right;
                            delete cleanedStyles.bottom;
                            delete cleanedStyles.left;

                            nextNodes[childId] = {
                                ...child,

                                styles:
                                    cleanedStyles,
                            };
                        }
                    }

                    /* -------------------------------------------------
                       LEAVING FREE POSITION
                    -------------------------------------------------
            
                       Keep the existing cleanup behavior for the
                       other flow layouts.
                    ------------------------------------------------- */

                    const childrenNeedFlowCleanup =
                        previousMode === "free" &&
                        mode !== "free" &&
                        mode !== "grid" &&
                        (existingNode.children ?? []).some(
                            (childId) => {
                                const child =
                                    state.project.nodes[
                                    childId
                                    ];

                                if (!child) {
                                    return false;
                                }

                                const childStyles =
                                    child.styles ?? {};

                                return (
                                    childStyles.position ===
                                    "absolute" ||
                                    !!childStyles.top ||
                                    !!childStyles.right ||
                                    !!childStyles.bottom ||
                                    !!childStyles.left
                                );
                            }
                        );

                    if (childrenNeedFlowCleanup) {
                        for (
                            const childId of
                            existingNode.children ?? []
                        ) {
                            const child =
                                nextNodes[childId];

                            if (!child) {
                                continue;
                            }

                            const childStyles =
                                child.styles ?? {};

                            const cleanedStyles = {
                                ...childStyles,
                            };

                            delete cleanedStyles.position;
                            delete cleanedStyles.top;
                            delete cleanedStyles.right;
                            delete cleanedStyles.bottom;
                            delete cleanedStyles.left;

                            nextNodes[childId] = {
                                ...child,

                                styles:
                                    cleanedStyles,
                            };
                        }
                    }

                    /* -------------------------------------------------
                       DETERMINE WHETHER ANYTHING ACTUALLY CHANGED
                    ------------------------------------------------- */

                    const relevantMatches =
                        mode === "automatic"
                            ? existingStyles.layoutMode ===
                            "automatic" &&
                            existingStyles.display ===
                            "flex" &&
                            existingStyles.flexDirection ===
                            "column"

                            : mode === "horizontal"
                                ? existingStyles.layoutMode ===
                                "horizontal" &&
                                existingStyles.display ===
                                "flex" &&
                                existingStyles.flexDirection ===
                                "row"

                                : mode === "vertical"
                                    ? existingStyles.layoutMode ===
                                    "vertical" &&
                                    existingStyles.display ===
                                    "flex" &&
                                    existingStyles.flexDirection ===
                                    "column"

                                    : mode === "free"
                                        ? existingStyles.layoutMode ===
                                        "free" &&
                                        existingStyles.position ===
                                        "relative"

                                        : existingStyles.layoutMode ===
                                        "grid" &&
                                        existingStyles.display ===
                                        "grid" &&
                                        !!existingStyles
                                            .gridTemplateColumns &&
                                        !!existingStyles
                                            .columnGap &&
                                        !!existingStyles
                                            .rowGap;

                    /*
                     * If the structural settings are already correct
                     * and no child cleanup is necessary, avoid a
                     * useless history entry.
                     */
                    const childrenNeedCleanup =
                        childrenNeedGridCleanup ||
                        childrenNeedFlowCleanup;

                    if (
                        relevantMatches &&
                        !childrenNeedCleanup
                    ) {
                        return state;
                    }

                    /* -------------------------------------------------
                       UPDATED PROJECT
                    ------------------------------------------------- */

                    const updatedProject: Project = {
                        ...state.project,

                        nodes:
                            nextNodes,
                    };

                    /* -------------------------------------------------
                       HISTORY TRANSACTION
                    ------------------------------------------------- */

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            transactionChanged:
                                true,
                        };
                    }

                    /* -------------------------------------------------
                       NORMAL HISTORY OPERATION
                    ------------------------------------------------- */

                    const past =
                        pushHistory(state);

                    return {
                        project:
                            updatedProject,

                        past,

                        future: [],
                    };
                }),

            /* =================================================
               SET IMAGE ASSET
            ================================================= */

            setImageAsset: (
                nodeId,
                asset
            ) =>
                set((state) => {

                    const existingNode =
                        state.project
                            .nodes[
                        nodeId
                        ];

                    if (!existingNode) {
                        return state;
                    }

                    if (
                        existingNode.type !==
                        "image"
                    ) {
                        return state;
                    }

                    const updatedProject:
                        Project = {
                        ...state.project,

                        assets: {
                            ...state
                                .project
                                .assets,

                            [asset.id]:
                                asset,
                        },

                        nodes: {
                            ...state
                                .project
                                .nodes,

                            [nodeId]: {
                                ...existingNode,

                                assetId:
                                    asset.id,
                            },
                        },
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project:
                            updatedProject,

                        past,

                        future: [],
                    };
                }),

            addAsset: (asset) =>
                set((state) => ({
                    project: {
                        ...state.project,
                        assets: {
                            ...state.project.assets,
                            [asset.id]: asset,
                        },
                    },
                })),

            removeAsset: (assetId) =>
                set((state) => {
                    if (!state.project.assets[assetId]) {
                        return state;
                    }

                    const assets = { ...state.project.assets };
                    delete assets[assetId];

                    const nodes = Object.fromEntries(
                        Object.entries(state.project.nodes).map(
                            ([nodeId, node]) => [
                                nodeId,
                                node.assetId === assetId
                                    ? { ...node, assetId: undefined }
                                    : node,
                            ]
                        )
                    );

                    return {
                        project: {
                            ...state.project,
                            assets,
                            nodes,
                        },
                    };
                }),

            replaceProject: (project) =>
                set({
                    project: {
                        ...project,

                        /*
                         * Projects created before Design Tokens
                         * was introduced do not contain this field.
                         *
                         * Normalize them at the store boundary so
                         * every token operation can safely assume
                         * that designTokens is an object.
                         */
                        designTokens:
                            project.designTokens ?? {},
                    },

                    selectedNodeId: null,

                    selectedNodeIds: [],

                    past: [],

                    future: [],

                    transactionSnapshot: null,

                    transactionActive: false,

                    transactionChanged: false,
                }),

            /* =================================================
               DESIGN TOKENS
            ================================================= */

            addDesignToken: (
                name,
                type,
                value
            ) =>
                set((state) => {
                    const trimmedName =
                        name.trim();

                    const trimmedValue =
                        value.trim();

                    if (
                        !trimmedName ||
                        !trimmedValue
                    ) {
                        return state;
                    }

                    const designTokens =
                        state.project.designTokens ?? {};



                    const existingNames =
                        Object.values(designTokens).map(
                            (token) =>
                                token.name.trim().toLowerCase()
                        );

                    if (
                        existingNames.includes(
                            trimmedName.toLowerCase()
                        )
                    ) {
                        console.warn(
                            "A design token with this name already exists."
                        );

                        return state;
                    }

                    const tokenId =
                        createUniqueDesignTokenId(
                            designTokens
                        );

                    const token: DesignToken = {
                        id: tokenId,
                        name: trimmedName,
                        type,
                        value: trimmedValue,
                    };

                    const updatedProject:
                        Project = {
                        ...state.project,

                        designTokens: {
                            ...designTokens,
                            [tokenId]: token,
                        },
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(state);

                    return {
                        project:
                            updatedProject,

                        past,

                        future: [],
                    };
                }),

            updateDesignToken: (
                tokenId,
                updates
            ) =>
                set((state) => {
                    const designTokens =
                        state.project.designTokens ?? {};

                    const existingToken =
                        designTokens[
                        tokenId
                        ];

                    if (!existingToken) {
                        return state;
                    }

                    const nextName =
                        updates.name !== undefined
                            ? updates.name.trim()
                            : existingToken.name;

                    const nextValue =
                        updates.value !== undefined
                            ? updates.value.trim()
                            : existingToken.value;

                    if (
                        !nextName ||
                        !nextValue
                    ) {
                        return state;
                    }

                    const duplicateName =
                        Object.values(
                            designTokens
                        ).some(
                            (token) =>
                                token.id !== tokenId &&
                                token.name
                                    .toLowerCase() ===
                                nextName.toLowerCase()
                        );

                    if (duplicateName) {
                        console.warn(
                            "A design token with this name already exists."
                        );

                        return state;
                    }

                    const updatedToken:
                        DesignToken = {
                        ...existingToken,

                        ...updates,

                        name: nextName,

                        value: nextValue,
                    };

                    const updatedProject:
                        Project = {
                        ...state.project,

                        designTokens: {
                            ...designTokens,

                            [tokenId]:
                                updatedToken,
                        },
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(state);

                    return {
                        project:
                            updatedProject,

                        past,

                        future: [],
                    };
                }),

            deleteDesignToken: (
                tokenId
            ) =>
                set((state) => {
                    const existingDesignTokens =
                        state.project.designTokens ?? {};

                    if (
                        !existingDesignTokens[
                        tokenId
                        ]
                    ) {
                        return state;
                    }

                    const designTokens = {
                        ...existingDesignTokens,
                    };

                    delete designTokens[
                        tokenId
                    ];

                    const updatedProject:
                        Project = {
                        ...state.project,

                        designTokens,
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(state);

                    return {
                        project:
                            updatedProject,

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
                            existingNode
                                .styles ??
                            {};

                        const existingResponsive =
                            existingStyles
                                .responsive ??
                            {};

                        const existingBreakpointStyles =
                            existingResponsive[
                            breakpoint
                            ] ??
                            {};

                        const updatedNode:
                            ProjectNode = {
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

                        const updatedProject:
                            Project = {
                            ...state.project,

                            nodes: {
                                ...state
                                    .project
                                    .nodes,

                                [nodeId]:
                                    updatedNode,
                            },
                        };

                        if (
                            state.transactionActive
                        ) {
                            return {
                                project:
                                    updatedProject,

                                transactionChanged:
                                    true,
                            };
                        }

                        const past =
                            pushHistory(
                                state
                            );

                        return {
                            project:
                                updatedProject,

                            past,

                            future: [],
                        };
                    }),

            /* =================================================
               BULK RESPONSIVE STYLE UPDATE
            ================================================= */

            bulkUpdateResponsiveNodeStyles:
                (
                    nodeIds,
                    breakpoint,
                    styles
                ) =>
                    set((state) => {
                        const validNodeIds =
                            getValidSelectedNodeIds(
                                nodeIds,
                                state.project.nodes
                            );

                        if (
                            validNodeIds.length === 0 ||
                            Object.keys(styles).length === 0
                        ) {
                            return state;
                        }

                        const nodes = {
                            ...state.project.nodes,
                        };

                        validNodeIds.forEach(
                            (id) => {
                                const existingNode =
                                    nodes[id];

                                if (!existingNode) {
                                    return;
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

                                nodes[id] = {
                                    ...existingNode,

                                    styles: {
                                        ...existingStyles,

                                        responsive: {
                                            ...existingResponsive,

                                            [breakpoint]: {
                                                ...existingBreakpointStyles,
                                                ...styles,
                                            },
                                        },
                                    },
                                };
                            }
                        );

                        const updatedProject: Project = {
                            ...state.project,
                            nodes,
                        };

                        if (
                            state.transactionActive
                        ) {
                            return {
                                project:
                                    updatedProject,

                                transactionChanged:
                                    true,
                            };
                        }

                        const past =
                            pushHistory(state);

                        return {
                            project:
                                updatedProject,

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
                     * Page roots cannot
                     * be deleted here.
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

                    const idsToDelete = [
                        nodeId,

                        ...descendants,
                    ];

                    const newNodes = {
                        ...state.project
                            .nodes,
                    };

                    for (
                        const id of
                        idsToDelete
                    ) {
                        delete newNodes[
                            id
                        ];
                    }

                    if (
                        node.parentId
                    ) {
                        const parent =
                            newNodes[
                            node.parentId
                            ];

                        if (parent) {
                            newNodes[
                                node.parentId
                            ] = {
                                ...parent,

                                children:
                                    (
                                        parent
                                            .children ??
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

                    const updatedProject:
                        Project = {
                        ...state.project,

                        nodes:
                            newNodes,
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

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
                        project:
                            updatedProject,

                        selectedNodeId:
                            null,

                        selectedNodeIds:
                            [],

                        past,

                        future: [],
                    };
                }),

            /* =================================================
               DELETE SELECTED NODES
            ================================================= */

            deleteSelectedNodes: () =>
                set((state) => {
                    const selectedIds =
                        getValidSelectedNodeIds(
                            state.selectedNodeIds,
                            state.project.nodes
                        );

                    if (
                        selectedIds.length === 0
                    ) {
                        return state;
                    }

                    const idsToDelete =
                        getTopLevelSelectedNodeIds(
                            selectedIds,
                            state.project.nodes
                        );

                    const newNodes = {
                        ...state.project.nodes,
                    };

                    idsToDelete.forEach(
                        (nodeId) => {
                            const node =
                                state.project.nodes[nodeId];

                            if (!node) {
                                return;
                            }

                            const descendants =
                                collectDescendants(
                                    state.project.nodes,
                                    nodeId
                                );

                            const allIds = [
                                nodeId,
                                ...descendants,
                            ];

                            allIds.forEach(
                                (id) => {
                                    delete newNodes[id];
                                }
                            );

                            if (node.parentId) {
                                const parent =
                                    newNodes[node.parentId];

                                if (parent) {
                                    newNodes[node.parentId] = {
                                        ...parent,

                                        children:
                                            (
                                                parent.children ??
                                                []
                                            ).filter(
                                                (childId) =>
                                                    childId !==
                                                    nodeId
                                            ),
                                    };
                                }
                            }
                        }
                    );

                    const updatedProject:
                        Project = {
                        ...state.project,

                        nodes:
                            newNodes,
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            selectedNodeId:
                                null,

                            selectedNodeIds:
                                [],

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(state);

                    return {
                        project:
                            updatedProject,

                        selectedNodeId:
                            null,

                        selectedNodeIds:
                            [],

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

                    if (
                        !original.parentId
                    ) {
                        return state;
                    }

                    const parent =
                        state.project
                            .nodes[
                        original.parentId
                        ];

                    if (!parent) {
                        return state;
                    }

                    const newId =
                        createUniqueNodeId(
                            state.project
                                .nodes,

                            original.type
                        );

                    const duplicatedNode:
                        ProjectNode = {
                        ...original,

                        id:
                            newId,

                        name:
                            `${original.name ??
                            original.type
                            } Copy`,

                        parentId:
                            original.parentId,

                        children: [],
                    };

                    const children = [
                        ...(
                            parent
                                .children ??
                            []
                        ),
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

                    const updatedProject:
                        Project = {
                        ...state.project,

                        nodes: {
                            ...state
                                .project
                                .nodes,

                            [newId]:
                                duplicatedNode,

                            [parent.id]: {
                                ...parent,

                                children,
                            },
                        },
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            selectedNodeId:
                                newId,

                            selectedNodeIds:
                                [newId],

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project:
                            updatedProject,

                        selectedNodeId:
                            newId,

                        selectedNodeIds:
                            [newId],

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

                    const updatedProject:
                        Project = {
                        ...state.project,

                        nodes:
                            result.nodes,
                    };

                    if (
                        state.transactionActive
                    ) {
                        return {
                            project:
                                updatedProject,

                            selectedNodeId:
                                nodeId,

                            selectedNodeIds:
                                [nodeId],

                            transactionChanged:
                                true,
                        };
                    }

                    const past =
                        pushHistory(
                            state
                        );

                    return {
                        project:
                            updatedProject,

                        selectedNodeId:
                            nodeId,

                        selectedNodeIds:
                            [nodeId],

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
                     * Cancel active transaction
                     * first.
                     */
                    if (
                        state.transactionActive &&
                        state.transactionSnapshot
                    ) {
                        const previous =
                            state
                                .transactionSnapshot;

                        return {
                            project:
                                previous.project,

                            selectedNodeId:
                                previous
                                    .selectedNodeId,

                            selectedNodeIds:
                                [
                                    ...previous
                                        .selectedNodeIds,
                                ],

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
                            previous
                                .selectedNodeId,

                        selectedNodeIds:
                            [
                                ...previous
                                    .selectedNodeIds,
                            ],

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
                            next
                                .selectedNodeId,

                        selectedNodeIds:
                            [
                                ...next
                                    .selectedNodeIds,
                            ],

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
