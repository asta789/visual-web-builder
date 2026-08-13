"use client";

import { useEditorStore } from "@/store/editorStore";

interface StyleInputProps {
    label: string;
    value?: string;
    placeholder?: string;
    type?: "text" | "number";
    onChange: (value: string) => void;
}

function StyleInput({
    label,
    value,
    placeholder,
    type = "text",
    onChange,
}: StyleInputProps) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                {label}
            </label>

            <input
                type={type}
                value={value || ""}
                placeholder={placeholder}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="
                    w-full
                    rounded-md
                    border
                    px-2.5
                    py-2
                    text-sm
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-1
                    focus:ring-blue-500
                "
            />
        </div>
    );
}

interface StyleSelectProps {
    label: string;
    value?: string;
    options: {
        label: string;
        value: string;
    }[];
    onChange: (value: string) => void;
}

function StyleSelect({
    label,
    value,
    options,
    onChange,
}: StyleSelectProps) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                {label}
            </label>

            <select
                value={value || ""}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="
                    w-full
                    rounded-md
                    border
                    bg-white
                    px-2.5
                    py-2
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-1
                    focus:ring-blue-500
                "
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

interface ColorInputProps {
    label: string;
    value?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

function ColorInput({
    label,
    value,
    placeholder,
    onChange,
}: ColorInputProps) {
    const colorValue =
        value &&
            /^#[0-9A-Fa-f]{6}$/.test(value)
            ? value
            : "#000000";

    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                {label}
            </label>

            <div className="flex gap-2">
                <input
                    type="color"
                    value={colorValue}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    className="
                        h-9
                        w-10
                        cursor-pointer
                        rounded-md
                        border
                        p-0.5
                    "
                />

                <input
                    type="text"
                    value={value || ""}
                    placeholder={
                        placeholder ||
                        "#000000"
                    }
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    className="
                        min-w-0
                        flex-1
                        rounded-md
                        border
                        px-2.5
                        py-2
                        text-sm
                        outline-none
                        focus:border-blue-500
                        focus:ring-1
                        focus:ring-blue-500
                    "
                />
            </div>
        </div>
    );
}

interface InspectorSectionProps {
    title: string;
    children: React.ReactNode;
}

function InspectorSection({
    title,
    children,
}: InspectorSectionProps) {
    return (
        <div className="border-b pb-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {title}
            </h3>

            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
}

export default function RightPanel() {
    const project = useEditorStore(
        (state) => state.project
    );

    const selectedNodeId =
        useEditorStore(
            (state) =>
                state.selectedNodeId
        );

    const updateNode =
        useEditorStore(
            (state) =>
                state.updateNode
        );

    const updateNodeStyles =
        useEditorStore(
            (state) =>
                state.updateNodeStyles
        );

    const node = selectedNodeId
        ? project.nodes[
        selectedNodeId
        ]
        : null;

    function updateStyle(
        property: string,
        value: string
    ) {
        if (!node) {
            return;
        }

        updateNodeStyles(node.id, {
            [property]: value,
        });
    }

    function updateContent(
        value: string
    ) {
        if (!node) {
            return;
        }

        updateNode(node.id, {
            content: value,
        });
    }

    return (
        <aside className="flex w-80 shrink-0 flex-col border-l bg-white">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="shrink-0 border-b px-4 py-4">
                <h2 className="font-semibold">
                    Properties
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                    Edit selected element
                </p>
            </div>

            {/* ==================================================
                NO SELECTION
            ================================================== */}

            {!node && (
                <div className="p-5 text-sm text-gray-500">
                    Select an element on the
                    canvas.
                </div>
            )}

            {/* ==================================================
                INSPECTOR
            ================================================== */}

            {node && (
                <div className="flex-1 overflow-auto">
                    <div className="space-y-5 p-4">

                        {/* ==================================================
                            ELEMENT
                        ================================================== */}

                        <InspectorSection title="Element">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                    Type
                                </label>

                                <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm capitalize">
                                    {node.type}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        node.name ||
                                        ""
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateNode(
                                            node.id,
                                            {
                                                name: event
                                                    .target
                                                    .value,
                                            }
                                        )
                                    }
                                    className="
                                        w-full
                                        rounded-md
                                        border
                                        px-2.5
                                        py-2
                                        text-sm
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-1
                                        focus:ring-blue-500
                                    "
                                />
                            </div>
                        </InspectorSection>

                        {/* ==================================================
                            CONTENT
                        ================================================== */}

                        {(node.type ===
                            "text" ||
                            node.type ===
                            "button") && (
                                <InspectorSection title="Content">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                            {node.type ===
                                                "text"
                                                ? "Text"
                                                : "Button Text"}
                                        </label>

                                        <textarea
                                            value={
                                                node.content ||
                                                ""
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateContent(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="
                                            min-h-24
                                            w-full
                                            resize-y
                                            rounded-md
                                            border
                                            p-2.5
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-blue-500
                                            focus:ring-1
                                            focus:ring-blue-500
                                        "
                                        />
                                    </div>
                                </InspectorSection>
                            )}

                        {/* ==================================================
                            IMAGE
                        ================================================== */}

                        {node.type ===
                            "image" && (
                                <InspectorSection title="Image">
                                    <StyleInput
                                        label="Image Source"
                                        value={
                                            node.content
                                        }
                                        placeholder="https://..."
                                        onChange={
                                            updateContent
                                        }
                                    />

                                    <StyleInput
                                        label="Alt Text"
                                        value={
                                            node.styles
                                                ?.alt
                                        }
                                        placeholder="Image description"
                                        onChange={(
                                            value
                                        ) =>
                                            updateStyle(
                                                "alt",
                                                value
                                            )
                                        }
                                    />

                                    <StyleSelect
                                        label="Object Fit"
                                        value={
                                            node.styles
                                                ?.objectFit
                                        }
                                        options={[
                                            {
                                                label: "Default",
                                                value: "",
                                            },
                                            {
                                                label: "Contain",
                                                value: "contain",
                                            },
                                            {
                                                label: "Cover",
                                                value: "cover",
                                            },
                                            {
                                                label: "Fill",
                                                value: "fill",
                                            },
                                            {
                                                label: "None",
                                                value: "none",
                                            },
                                        ]}
                                        onChange={(
                                            value
                                        ) =>
                                            updateStyle(
                                                "objectFit",
                                                value
                                            )
                                        }
                                    />
                                </InspectorSection>
                            )}

                        {/* ==================================================
                            BUTTON LINK
                        ================================================== */}

                        {node.type ===
                            "button" && (
                                <InspectorSection title="Link">
                                    <StyleInput
                                        label="URL"
                                        value={
                                            node.styles
                                                ?.href
                                        }
                                        placeholder="https://example.com"
                                        onChange={(
                                            value
                                        ) =>
                                            updateStyle(
                                                "href",
                                                value
                                            )
                                        }
                                    />

                                    <StyleSelect
                                        label="Target"
                                        value={
                                            node.styles
                                                ?.target
                                        }
                                        options={[
                                            {
                                                label: "Same Window",
                                                value: "_self",
                                            },
                                            {
                                                label: "New Tab",
                                                value: "_blank",
                                            },
                                        ]}
                                        onChange={(
                                            value
                                        ) =>
                                            updateStyle(
                                                "target",
                                                value
                                            )
                                        }
                                    />
                                </InspectorSection>
                            )}

                        {/* ==================================================
                            LAYOUT
                        ================================================== */}

                        <InspectorSection title="Layout">
                            <StyleSelect
                                label="Display"
                                value={
                                    node.styles
                                        ?.display
                                }
                                options={[
                                    {
                                        label: "Default",
                                        value: "",
                                    },
                                    {
                                        label: "Block",
                                        value: "block",
                                    },
                                    {
                                        label: "Inline",
                                        value: "inline",
                                    },
                                    {
                                        label: "Inline Block",
                                        value: "inline-block",
                                    },
                                    {
                                        label: "Flex",
                                        value: "flex",
                                    },
                                    {
                                        label: "Grid",
                                        value: "grid",
                                    },
                                    {
                                        label: "None",
                                        value: "none",
                                    },
                                ]}
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "display",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Width"
                                value={
                                    node.styles
                                        ?.width
                                }
                                placeholder="auto"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "width",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Min Width"
                                value={
                                    node.styles
                                        ?.minWidth
                                }
                                placeholder="0px"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "minWidth",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Max Width"
                                value={
                                    node.styles
                                        ?.maxWidth
                                }
                                placeholder="none"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "maxWidth",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Height"
                                value={
                                    node.styles
                                        ?.height
                                }
                                placeholder="auto"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "height",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Min Height"
                                value={
                                    node.styles
                                        ?.minHeight
                                }
                                placeholder="0px"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "minHeight",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Max Height"
                                value={
                                    node.styles
                                        ?.maxHeight
                                }
                                placeholder="none"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "maxHeight",
                                        value
                                    )
                                }
                            />

                            <StyleSelect
                                label="Position"
                                value={
                                    node.styles
                                        ?.position
                                }
                                options={[
                                    {
                                        label: "Default",
                                        value: "",
                                    },
                                    {
                                        label: "Static",
                                        value: "static",
                                    },
                                    {
                                        label: "Relative",
                                        value: "relative",
                                    },
                                    {
                                        label: "Absolute",
                                        value: "absolute",
                                    },
                                    {
                                        label: "Fixed",
                                        value: "fixed",
                                    },
                                    {
                                        label: "Sticky",
                                        value: "sticky",
                                    },
                                ]}
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "position",
                                        value
                                    )
                                }
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <StyleInput
                                    label="Top"
                                    value={
                                        node.styles
                                            ?.top
                                    }
                                    placeholder="auto"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "top",
                                            value
                                        )
                                    }
                                />

                                <StyleInput
                                    label="Left"
                                    value={
                                        node.styles
                                            ?.left
                                    }
                                    placeholder="auto"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "left",
                                            value
                                        )
                                    }
                                />

                                <StyleInput
                                    label="Right"
                                    value={
                                        node.styles
                                            ?.right
                                    }
                                    placeholder="auto"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "right",
                                            value
                                        )
                                    }
                                />

                                <StyleInput
                                    label="Bottom"
                                    value={
                                        node.styles
                                            ?.bottom
                                    }
                                    placeholder="auto"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "bottom",
                                            value
                                        )
                                    }
                                />
                            </div>
                        </InspectorSection>

                        {/* ==================================================
                            FLEX
                        ================================================== */}

                        {node.styles
                            ?.display ===
                            "flex" && (
                                <InspectorSection title="Flex Layout">
                                    <StyleSelect
                                        label="Direction"
                                        value={
                                            node.styles
                                                ?.flexDirection
                                        }
                                        options={[
                                            {
                                                label: "Row",
                                                value: "row",
                                            },
                                            {
                                                label: "Row Reverse",
                                                value: "row-reverse",
                                            },
                                            {
                                                label: "Column",
                                                value: "column",
                                            },
                                            {
                                                label: "Column Reverse",
                                                value: "column-reverse",
                                            },
                                        ]}
                                        onChange={(
                                            value
                                        ) =>
                                            updateStyle(
                                                "flexDirection",
                                                value
                                            )
                                        }
                                    />

                                    <StyleSelect
                                        label="Justify Content"
                                        value={
                                            node.styles
                                                ?.justifyContent
                                        }
                                        options={[
                                            {
                                                label: "Start",
                                                value: "flex-start",
                                            },
                                            {
                                                label: "Center",
                                                value: "center",
                                            },
                                            {
                                                label: "End",
                                                value: "flex-end",
                                            },
                                            {
                                                label: "Space Between",
                                                value: "space-between",
                                            },
                                            {
                                                label: "Space Around",
                                                value: "space-around",
                                            },
                                            {
                                                label: "Space Evenly",
                                                value: "space-evenly",
                                            },
                                        ]}
                                        onChange={(
                                            value
                                        ) =>
                                            updateStyle(
                                                "justifyContent",
                                                value
                                            )
                                        }
                                    />

                                    <StyleSelect
                                        label="Align Items"
                                        value={
                                            node.styles
                                                ?.alignItems
                                        }
                                        options={[
                                            {
                                                label: "Stretch",
                                                value: "stretch",
                                            },
                                            {
                                                label: "Start",
                                                value: "flex-start",
                                            },
                                            {
                                                label: "Center",
                                                value: "center",
                                            },
                                            {
                                                label: "End",
                                                value: "flex-end",
                                            },
                                        ]}
                                        onChange={(
                                            value
                                        ) =>
                                            updateStyle(
                                                "alignItems",
                                                value
                                            )
                                        }
                                    />

                                    <StyleInput
                                        label="Gap"
                                        value={
                                            node.styles
                                                ?.gap
                                        }
                                        placeholder="0px"
                                        onChange={(
                                            value
                                        ) =>
                                            updateStyle(
                                                "gap",
                                                value
                                            )
                                        }
                                    />

                                    <StyleSelect
                                        label="Wrap"
                                        value={
                                            node.styles
                                                ?.flexWrap
                                        }
                                        options={[
                                            {
                                                label: "No Wrap",
                                                value: "nowrap",
                                            },
                                            {
                                                label: "Wrap",
                                                value: "wrap",
                                            },
                                            {
                                                label: "Wrap Reverse",
                                                value: "wrap-reverse",
                                            },
                                        ]}
                                        onChange={(
                                            value
                                        ) =>
                                            updateStyle(
                                                "flexWrap",
                                                value
                                            )
                                        }
                                    />
                                </InspectorSection>
                            )}

                        {/* ==================================================
                            MARGIN
                        ================================================== */}

                        <InspectorSection title="Margin">
                            <div className="grid grid-cols-2 gap-3">
                                <StyleInput
                                    label="Top"
                                    value={
                                        node.styles
                                            ?.marginTop
                                    }
                                    placeholder="0px"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "marginTop",
                                            value
                                        )
                                    }
                                />

                                <StyleInput
                                    label="Right"
                                    value={
                                        node.styles
                                            ?.marginRight
                                    }
                                    placeholder="0px"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "marginRight",
                                            value
                                        )
                                    }
                                />

                                <StyleInput
                                    label="Bottom"
                                    value={
                                        node.styles
                                            ?.marginBottom
                                    }
                                    placeholder="0px"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "marginBottom",
                                            value
                                        )
                                    }
                                />

                                <StyleInput
                                    label="Left"
                                    value={
                                        node.styles
                                            ?.marginLeft
                                    }
                                    placeholder="0px"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "marginLeft",
                                            value
                                        )
                                    }
                                />
                            </div>
                        </InspectorSection>

                        {/* ==================================================
                            PADDING
                        ================================================== */}

                        <InspectorSection title="Padding">
                            <div className="grid grid-cols-2 gap-3">
                                <StyleInput
                                    label="Top"
                                    value={
                                        node.styles
                                            ?.paddingTop
                                    }
                                    placeholder="0px"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "paddingTop",
                                            value
                                        )
                                    }
                                />

                                <StyleInput
                                    label="Right"
                                    value={
                                        node.styles
                                            ?.paddingRight
                                    }
                                    placeholder="0px"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "paddingRight",
                                            value
                                        )
                                    }
                                />

                                <StyleInput
                                    label="Bottom"
                                    value={
                                        node.styles
                                            ?.paddingBottom
                                    }
                                    placeholder="0px"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "paddingBottom",
                                            value
                                        )
                                    }
                                />

                                <StyleInput
                                    label="Left"
                                    value={
                                        node.styles
                                            ?.paddingLeft
                                    }
                                    placeholder="0px"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "paddingLeft",
                                            value
                                        )
                                    }
                                />
                            </div>
                        </InspectorSection>

                        {/* ==================================================
                            TYPOGRAPHY
                        ================================================== */}

                        <InspectorSection title="Typography">
                            <StyleInput
                                label="Font Family"
                                value={
                                    node.styles
                                        ?.fontFamily
                                }
                                placeholder="Arial, sans-serif"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "fontFamily",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Font Size"
                                value={
                                    node.styles
                                        ?.fontSize
                                }
                                placeholder="16px"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "fontSize",
                                        value
                                    )
                                }
                            />

                            <StyleSelect
                                label="Font Weight"
                                value={
                                    node.styles
                                        ?.fontWeight
                                }
                                options={[
                                    {
                                        label: "Default",
                                        value: "",
                                    },
                                    {
                                        label: "Light",
                                        value: "300",
                                    },
                                    {
                                        label: "Normal",
                                        value: "400",
                                    },
                                    {
                                        label: "Medium",
                                        value: "500",
                                    },
                                    {
                                        label: "Semibold",
                                        value: "600",
                                    },
                                    {
                                        label: "Bold",
                                        value: "700",
                                    },
                                    {
                                        label: "Extra Bold",
                                        value: "800",
                                    },
                                    {
                                        label: "Black",
                                        value: "900",
                                    },
                                ]}
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "fontWeight",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Line Height"
                                value={
                                    node.styles
                                        ?.lineHeight
                                }
                                placeholder="1.5"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "lineHeight",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Letter Spacing"
                                value={
                                    node.styles
                                        ?.letterSpacing
                                }
                                placeholder="0px"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "letterSpacing",
                                        value
                                    )
                                }
                            />

                            <StyleSelect
                                label="Text Align"
                                value={
                                    node.styles
                                        ?.textAlign
                                }
                                options={[
                                    {
                                        label: "Default",
                                        value: "",
                                    },
                                    {
                                        label: "Left",
                                        value: "left",
                                    },
                                    {
                                        label: "Center",
                                        value: "center",
                                    },
                                    {
                                        label: "Right",
                                        value: "right",
                                    },
                                    {
                                        label: "Justify",
                                        value: "justify",
                                    },
                                ]}
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "textAlign",
                                        value
                                    )
                                }
                            />

                            <StyleSelect
                                label="Text Transform"
                                value={
                                    node.styles
                                        ?.textTransform
                                }
                                options={[
                                    {
                                        label: "Default",
                                        value: "",
                                    },
                                    {
                                        label: "None",
                                        value: "none",
                                    },
                                    {
                                        label: "Uppercase",
                                        value: "uppercase",
                                    },
                                    {
                                        label: "Lowercase",
                                        value: "lowercase",
                                    },
                                    {
                                        label: "Capitalize",
                                        value: "capitalize",
                                    },
                                ]}
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "textTransform",
                                        value
                                    )
                                }
                            />
                        </InspectorSection>

                        {/* ==================================================
                            COLORS
                        ================================================== */}

                        <InspectorSection title="Colors">
                            <ColorInput
                                label="Text Color"
                                value={
                                    node.styles
                                        ?.color
                                }
                                placeholder="#111111"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "color",
                                        value
                                    )
                                }
                            />

                            <ColorInput
                                label="Background"
                                value={
                                    node.styles
                                        ?.backgroundColor
                                }
                                placeholder="#ffffff"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "backgroundColor",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Opacity"
                                value={
                                    node.styles
                                        ?.opacity
                                }
                                placeholder="1"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "opacity",
                                        value
                                    )
                                }
                            />
                        </InspectorSection>

                        {/* ==================================================
                            BORDER
                        ================================================== */}

                        <InspectorSection title="Border">
                            <StyleSelect
                                label="Style"
                                value={
                                    node.styles
                                        ?.borderStyle
                                }
                                options={[
                                    {
                                        label: "None",
                                        value: "none",
                                    },
                                    {
                                        label: "Solid",
                                        value: "solid",
                                    },
                                    {
                                        label: "Dashed",
                                        value: "dashed",
                                    },
                                    {
                                        label: "Dotted",
                                        value: "dotted",
                                    },
                                    {
                                        label: "Double",
                                        value: "double",
                                    },
                                ]}
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "borderStyle",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Width"
                                value={
                                    node.styles
                                        ?.borderWidth
                                }
                                placeholder="0px"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "borderWidth",
                                        value
                                    )
                                }
                            />

                            <ColorInput
                                label="Color"
                                value={
                                    node.styles
                                        ?.borderColor
                                }
                                placeholder="#000000"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "borderColor",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Radius"
                                value={
                                    node.styles
                                        ?.borderRadius
                                }
                                placeholder="0px"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "borderRadius",
                                        value
                                    )
                                }
                            />
                        </InspectorSection>

                        {/* ==================================================
                            SHADOW
                        ================================================== */}

                        <InspectorSection title="Shadow">
                            <StyleSelect
                                label="Preset"
                                value={
                                    node.styles
                                        ?.boxShadow
                                }
                                options={[
                                    {
                                        label: "None",
                                        value: "none",
                                    },
                                    {
                                        label: "Small",
                                        value: "0 1px 3px rgba(0,0,0,0.12)",
                                    },
                                    {
                                        label: "Medium",
                                        value: "0 4px 12px rgba(0,0,0,0.15)",
                                    },
                                    {
                                        label: "Large",
                                        value: "0 10px 30px rgba(0,0,0,0.18)",
                                    },
                                    {
                                        label: "Extra Large",
                                        value: "0 20px 50px rgba(0,0,0,0.2)",
                                    },
                                ]}
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "boxShadow",
                                        value
                                    )
                                }
                            />
                        </InspectorSection>

                        {/* ==================================================
                            OVERFLOW
                        ================================================== */}

                        <InspectorSection title="Overflow">
                            <StyleSelect
                                label="Overflow"
                                value={
                                    node.styles
                                        ?.overflow
                                }
                                options={[
                                    {
                                        label: "Default",
                                        value: "",
                                    },
                                    {
                                        label: "Visible",
                                        value: "visible",
                                    },
                                    {
                                        label: "Hidden",
                                        value: "hidden",
                                    },
                                    {
                                        label: "Auto",
                                        value: "auto",
                                    },
                                    {
                                        label: "Scroll",
                                        value: "scroll",
                                    },
                                ]}
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "overflow",
                                        value
                                    )
                                }
                            />
                        </InspectorSection>

                        {/* ==================================================
                            Z INDEX
                        ================================================== */}

                        <InspectorSection title="Advanced">
                            <StyleInput
                                label="Z Index"
                                value={
                                    node.styles
                                        ?.zIndex
                                }
                                placeholder="auto"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "zIndex",
                                        value
                                    )
                                }
                            />

                            <StyleInput
                                label="Cursor"
                                value={
                                    node.styles
                                        ?.cursor
                                }
                                placeholder="default"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "cursor",
                                        value
                                    )
                                }
                            />
                        </InspectorSection>
                    </div>
                </div>
            )}
        </aside>
    );
}