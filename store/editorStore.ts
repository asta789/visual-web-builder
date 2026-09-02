import { moveNode as moveTreeNode } from "@/store/treeOperations";
import { create } from "zustand";

import { defaultProject } from "@/model/defaultProject";

import {
    BreakpointId,
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
}

/* =========================================================
   EDITOR STATE
========================================================= */

interface EditorState {
    project: Project;

    selectedNodeId:
    | string
    | null;

    /* =====================================================
       ACTIVE RESPONSIVE BREAKPOINT
    ===================================================== */

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

    /* =====================================================
       IMAGE ASSET
    ===================================================== */

    setImageAsset: (
        nodeId: string,
        asset: ProjectAsset
    ) => void;

    /* =====================================================
       RESPONSIVE STYLE OPERATIONS
    ===================================================== */

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
                    width: "100%",
                    minHeight: "64px",

                    display: "flex",
                    alignItems: "center",

                    paddingTop: "12px",
                    paddingRight: "24px",
                    paddingBottom: "12px",
                    paddingLeft: "24px",

                    backgroundColor:
                        "#ffffff",

                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#e5e7eb",
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

            activeBreakpointId:
                "desktop",

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
               ACTIVE BREAKPOINT
            ================================================= */

            setActiveBreakpoint: (
                breakpointId
            ) =>
                set((state) => {

                    if (
                        state.activeBreakpointId ===
                        breakpointId
                    ) {
                        return state;
                    }

                    /*
                     * Active breakpoint is editor-only state.
                     *
                     * It intentionally does not:
                     * - modify the Project Model
                     * - create an undo history entry
                     * - modify redo history
                     * - modify transaction state
                     */
                    return {
                        activeBreakpointId:
                            breakpointId,
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
                            Project =
                        {
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