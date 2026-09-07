import type { ReactNode } from "react";

import type { NodeType, ProjectNode } from "@/model/type";

export type AccordionCreateNode = (
    type: NodeType,
    parentId: string,
    index: number,
) => ProjectNode;

export interface AccordionCompositeResult {
    root: ProjectNode;
    nodes: Record<string, ProjectNode>;
}

export interface AccordionItemResult {
    item: ProjectNode;
    nodes: Record<string, ProjectNode>;
}

const QUESTIONS = [
    "What is an Accordion?",
    "Can I put other elements inside it?",
    "Can multiple sections stay open?",
];

const ANSWERS = [
    "An Accordion is a component that organizes content into expandable and collapsible sections.",
    "Yes. The content area is made from normal builder nodes, so you can add text, images, buttons, icons and more.",
    "Yes. The Accordion configuration supports single-open and multiple-open behavior.",
];

export function createAccordionItem(
    parentId: string,
    index: number,
    createNode: AccordionCreateNode,
): AccordionItemResult {
    const nodes: Record<string, ProjectNode> = {};

    const itemNode = createNode("container", parentId, index);
    const headerNode = createNode("container", itemNode.id, 0);
    const headerTextNode = createNode("text", headerNode.id, 0);
    const headerIconNode = createNode("icon", headerNode.id, 1);
    const contentNode = createNode("container", itemNode.id, 1);
    const contentTextNode = createNode("text", contentNode.id, 0);

    Object.assign(itemNode, {
        name: `Accordion Item ${index + 1}`,
        accordionRole: "item",
        children: [headerNode.id, contentNode.id],
        styles: {
            width: "100%",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "#e5e7eb",
        },
    });

    Object.assign(headerNode, {
        name: `Accordion Header ${index + 1}`,
        accordionRole: "header",
        children: [headerTextNode.id, headerIconNode.id],
        styles: {
            width: "100%",
            minHeight: "56px",
            paddingTop: "16px",
            paddingRight: "18px",
            paddingBottom: "16px",
            paddingLeft: "18px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            backgroundColor: "#ffffff",
            cursor: "pointer",
        },
    });

    Object.assign(headerTextNode, {
        name: `Accordion Question ${index + 1}`,
        content: `Accordion Question ${index + 1}`,
        textElement: "p",
        styles: {
            marginTop: "0",
            marginRight: "0",
            marginBottom: "0",
            marginLeft: "0",
            fontSize: "16px",
            fontWeight: "600",
            lineHeight: "1.5",
            color: "#111827",
        },
    });

    Object.assign(headerIconNode, {
        name: `Accordion Icon ${index + 1}`,
        iconName: "chevron-down",
        iconSize: 20,
        iconStrokeWidth: 2,
        styles: {
            color: "#6b7280",
            flexShrink: "0",
        },
    });

    Object.assign(contentNode, {
        name: `Accordion Content ${index + 1}`,
        accordionRole: "content",
        children: [contentTextNode.id],
        styles: {
            width: "100%",
            paddingTop: "16px",
            paddingRight: "18px",
            paddingBottom: "18px",
            paddingLeft: "18px",
            backgroundColor: "#fafafa",
        },
    });

    Object.assign(contentTextNode, {
        name: `Accordion Answer ${index + 1}`,
        content: `Add content for Accordion Item ${index + 1}.`,
        textElement: "p",
        styles: {
            marginTop: "0",
            marginRight: "0",
            marginBottom: "0",
            marginLeft: "0",
            fontSize: "15px",
            lineHeight: "1.6",
            color: "#4b5563",
        },
    });

    nodes[itemNode.id] = itemNode;
    nodes[headerNode.id] = headerNode;
    nodes[headerTextNode.id] = headerTextNode;
    nodes[headerIconNode.id] = headerIconNode;
    nodes[contentNode.id] = contentNode;
    nodes[contentTextNode.id] = contentTextNode;

    return { item: itemNode, nodes };
}

export function createAccordionComposite(
    rootNode: ProjectNode,
    createNode: AccordionCreateNode,
): AccordionCompositeResult {
    const nodes: Record<string, ProjectNode> = {};
    const items: ProjectNode[] = [];

    for (let index = 0; index < 3; index += 1) {
        const result = createAccordionItem(rootNode.id, index, createNode);
        const itemNode = result.item;
        const itemNodes = result.nodes;

        // Preserve the initial sample copy while using the reusable item factory.
        const headerTextNode = itemNodes[itemNode.children?.[0]
            ? (itemNodes[itemNode.children[0]]?.children?.[0] ?? "")
            : ""];
        const contentNode = itemNodes[itemNode.children?.[1] ?? ""];
        const contentTextNode = contentNode?.children?.[0]
            ? itemNodes[contentNode.children[0]]
            : undefined;

        if (headerTextNode) {
            Object.assign(headerTextNode, {
                content: QUESTIONS[index],
            });
        }
        if (contentTextNode) {
            Object.assign(contentTextNode, {
                content: ANSWERS[index],
            });
        }

        Object.assign(itemNode, {
            name: `Accordion Item ${index + 1}`,
            styles: {
                ...(itemNode.styles ?? {}),
                borderBottomWidth: index < 2 ? "1px" : "0",
            },
        });

        items.push(itemNode);
        Object.assign(nodes, itemNodes);
    }

    const root = {
        ...rootNode,
        name: "Accordion",
        accordionRole: "root" as const,
        accordionAllowMultiple: false,
        accordionDefaultOpen: 0,
        children: items.map((item) => item.id),
        styles: {
            width: "100%",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#e5e7eb",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            overflow: "hidden",
        },
    };

    return { root, nodes };
}

export function getAccordionItemIds(node: ProjectNode): string[] {
    return node.type === "accordion" ? node.children ?? [] : [];
}

export function getAccordionInitialOpenIds(node: ProjectNode): string[] {
    const items = getAccordionItemIds(node);
    if (!items.length) return [];

    const index = Math.max(
        0,
        Math.min(items.length - 1, Number(node.accordionDefaultOpen ?? 0) || 0),
    );

    return [items[index]];
}

export function toggleAccordionItemIds(
    openIds: string[],
    itemId: string,
    allowMultiple: boolean,
): string[] {
    const isOpen = openIds.includes(itemId);

    if (allowMultiple) {
        return isOpen
            ? openIds.filter((id) => id !== itemId)
            : [...openIds, itemId];
    }

    return isOpen ? [] : [itemId];
}

export function normalizeAccordionDefaultOpen(
    node: ProjectNode,
): number {
    const count = getAccordionItemIds(node).length;
    if (!count) return 0;

    return Math.max(
        0,
        Math.min(count - 1, Number(node.accordionDefaultOpen ?? 0) || 0),
    );
}

interface AccordionSettingsPanelProps {
    node: ProjectNode;
    updateNode: (nodeId: string, updates: Partial<ProjectNode>) => void;
    addItem?: () => void;
    deleteItem?: (itemId: string) => void;
}

export function AccordionSettingsPanel({
    node,
    updateNode,
    addItem,
    deleteItem,
}: AccordionSettingsPanelProps): ReactNode {
    if (node.type !== "accordion" || node.accordionRole !== "root") {
        return null;
    }

    const items = getAccordionItemIds(node);
    const defaultOpen = normalizeAccordionDefaultOpen(node);

    return (
        <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between gap-3 text-xs font-medium text-gray-600">
                <span>
                    Allow Multiple Open
                    <span className="ml-1 text-gray-400">
                        Keep several sections expanded
                    </span>
                </span>
                <input
                    type="checkbox"
                    checked={node.accordionAllowMultiple ?? false}
                    onChange={(event) =>
                        updateNode(node.id, {
                            accordionAllowMultiple: event.target.checked,
                        })
                    }
                    className="h-4 w-4"
                />
            </label>

            <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label className="text-xs font-medium text-gray-500">
                        Items
                    </label>
                    <button
                        type="button"
                        onClick={addItem}
                        disabled={!addItem}
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        + Add Item
                    </button>
                </div>

                <div className="space-y-1.5">
                    {items.map((itemId, index) => {
                        return (
                            <div
                                key={itemId}
                                className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2"
                            >
                                <span className="text-xs text-gray-700">
                                    Item {index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => deleteItem?.(itemId)}
                                    disabled={items.length <= 1 || !deleteItem}
                                    className="rounded px-1.5 py-1 text-[11px] font-medium text-gray-500 hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                    title={items.length <= 1 ? "Accordion must contain at least one item" : "Delete item"}
                                >
                                    Delete
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Default Open Item
                </label>
                <select
                    value={String(defaultOpen)}
                    onChange={(event) =>
                        updateNode(node.id, {
                            accordionDefaultOpen: Number(event.target.value),
                        })
                    }
                    className="w-full rounded-md border px-2.5 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={!items.length}
                >
                    {items.map((itemId, index) => (
                        <option key={itemId} value={index}>
                            Item {index + 1}
                        </option>
                    ))}
                </select>
            </div>

            <p className="text-[11px] leading-4 text-gray-400">
                Each item contains a normal editable header and content area. Use the Canvas and existing Inspector controls to edit them.
            </p>
        </div>
    );
}
