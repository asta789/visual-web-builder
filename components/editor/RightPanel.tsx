"use client";

import {
    useRef,
    useState,
    type ReactNode,
} from "react";

import type {
    BreakpointId,
    LayoutMode,
    ProjectAsset,
} from "@/model/type";

import { useEditorStore } from "@/store/editorStore";
import TokenPicker from "./design-tokens/TokenPicker";

/* =========================================================
   RIGHT PANEL PROPS
========================================================= */

interface RightPanelProps {
    viewport: BreakpointId;
}

/* =========================================================
   STYLE INPUT
========================================================= */

interface StyleInputProps {
    label: string;
    value?: string;
    placeholder?: string;
    type?: "text" | "number";
    min?: string;
    max?: string;
    step?: string;
    onChange: (value: string) => void;
}

function StyleInput({
    label,
    value,
    placeholder,
    type = "text",
    min,
    max,
    step,
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
                min={min}
                max={max}
                step={step}
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

/* =========================================================
   DIMENSION INPUT
========================================================= */

interface DimensionInputProps {
    label: string;
    value?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

function DimensionInput({
    label,
    value,
    placeholder,
    onChange,
}: DimensionInputProps) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                {label}
            </label>

            <div className="relative">
                <input
                    type="text"
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
                        pr-10
                        text-sm
                        outline-none
                        transition
                        focus:border-blue-500
                        focus:ring-1
                        focus:ring-blue-500
                    "
                />

                <span
                    className="
                        pointer-events-none
                        absolute
                        right-2.5
                        top-1/2
                        -translate-y-1/2
                        text-[10px]
                        font-medium
                        uppercase
                        text-gray-400
                    "
                >
                    CSS
                </span>
            </div>
        </div>
    );
}

/* =========================================================
   STYLE SELECT
========================================================= */

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

/* =========================================================
   TRANSFORM INPUT
========================================================= */

interface TransformInputProps {
    label: string;
    value: string;
    unit: string;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: string) => void;
}

function TransformInput({
    label,
    value,
    unit,
    min,
    max,
    step = 1,
    onChange,
}: TransformInputProps) {
    return (
        <div>
            <label className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-500
            ">
                {label}
            </label>

            <div className="flex gap-2">
                <input
                    type="number"
                    value={value}
                    min={min}
                    max={max}
                    step={step}
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
                        transition
                        focus:border-blue-500
                        focus:ring-1
                        focus:ring-blue-500
                    "
                />

                <div className="
                    flex
                    w-12
                    items-center
                    justify-center
                    rounded-md
                    border
                    bg-gray-50
                    text-xs
                    font-medium
                    text-gray-400
                ">
                    {unit}
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   COLOR INPUT
========================================================= */

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
                        onChange(event.target.value)
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
                        placeholder || "#000000"
                    }
                    onChange={(event) =>
                        onChange(event.target.value)
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

/* =========================================================
   DESIGN TOKEN COLOR CONTROL
========================================================= */

interface DesignTokenColorControlProps {
    value?: string;
    onChange: (value: string) => void;
}

function DesignTokenColorControl({
    value,
    onChange,
}: DesignTokenColorControlProps) {
    const project = useEditorStore((state) => state.project);
    const [open, setOpen] = useState(false);

    const isToken =
        Boolean(
            value &&
            value.trim().startsWith("var(--token-")
        );

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={() =>
                    setOpen((current) => !current)
                }
                className="
                    w-full
                    rounded-md
                    border
                    bg-white
                    px-2.5
                    py-2
                    text-left
                    text-xs
                    font-medium
                    text-gray-600
                    transition
                    hover:bg-gray-50
                "
            >
                {open
                    ? "Hide Design Tokens"
                    : isToken
                        ? "🎨 Change Design Token"
                        : "🎨 Use Design Token"}
            </button>

            {open && (
                <div className="rounded-lg border bg-gray-50 p-3">
                    <TokenPicker
                        tokens={project.designTokens ?? {}}
                        value={value}
                        allowedTypes={["color"]}
                        onSelect={onChange}
                        onClear={() => onChange("")}
                    />
                </div>
            )}

            {isToken && (
                <div className="
                    rounded-md
                    border
                    border-blue-100
                    bg-blue-50
                    px-2.5
                    py-2
                    text-[11px]
                    text-blue-600
                ">
                    Linked to a design token.
                </div>
            )}
        </div>
    );
}


/* =========================================================
   GRADIENT BUILDER
========================================================= */

interface GradientBuilderProps {
    value?: string;
    onChange: (value: string) => void;
}

function GradientBuilder({
    value,
    onChange,
}: GradientBuilderProps) {
    const [gradientType, setGradientType] =
        useState<"linear" | "radial">(
            value?.startsWith("radial-gradient")
                ? "radial"
                : "linear"
        );

    const [angle, setAngle] =
        useState("90");

    const [colorOne, setColorOne] =
        useState("#ff0000");

    const [colorTwo, setColorTwo] =
        useState("#0000ff");

    const [colorThree, setColorThree] =
        useState("");

    const [useThirdColor, setUseThirdColor] =
        useState(false);

    function buildGradient(
        type: "linear" | "radial",
        nextAngle: string,
        nextColorOne: string,
        nextColorTwo: string,
        nextColorThree: string,
        nextUseThirdColor: boolean
    ) {
        const colors = nextUseThirdColor &&
            nextColorThree
            ? `${nextColorOne}, ${nextColorTwo}, ${nextColorThree}`
            : `${nextColorOne}, ${nextColorTwo}`;

        if (type === "radial") {
            return `radial-gradient(circle, ${colors})`;
        }

        const numericAngle =
            nextAngle || "90";

        return `linear-gradient(${numericAngle}deg, ${colors})`;
    }

    function updateGradient(
        changes: Partial<{
            type: "linear" | "radial";
            angle: string;
            colorOne: string;
            colorTwo: string;
            colorThree: string;
            useThirdColor: boolean;
        }>
    ) {
        const nextType =
            changes.type ?? gradientType;

        const nextAngle =
            changes.angle ?? angle;

        const nextColorOne =
            changes.colorOne ?? colorOne;

        const nextColorTwo =
            changes.colorTwo ?? colorTwo;

        const nextColorThree =
            changes.colorThree ??
            colorThree;

        const nextUseThirdColor =
            changes.useThirdColor ??
            useThirdColor;

        if (changes.type) {
            setGradientType(
                changes.type
            );
        }

        if (changes.angle !== undefined) {
            setAngle(
                changes.angle
            );
        }

        if (changes.colorOne !== undefined) {
            setColorOne(
                changes.colorOne
            );
        }

        if (changes.colorTwo !== undefined) {
            setColorTwo(
                changes.colorTwo
            );
        }

        if (changes.colorThree !== undefined) {
            setColorThree(
                changes.colorThree
            );
        }

        if (
            changes.useThirdColor !==
            undefined
        ) {
            setUseThirdColor(
                changes.useThirdColor
            );
        }

        const gradient =
            buildGradient(
                nextType,
                nextAngle,
                nextColorOne,
                nextColorTwo,
                nextColorThree,
                nextUseThirdColor
            );

        onChange(gradient);
    }

    function applyPreset(
        first: string,
        second: string
    ) {
        updateGradient({
            colorOne: first,
            colorTwo: second,
        });
    }

    return (
        <div className="space-y-4 rounded-lg border bg-gray-50 p-3">

            {/* =====================================================
                TYPE
            ===================================================== */}

            <StyleSelect
                label="Gradient Type"
                value={gradientType}
                options={[
                    {
                        label: "Linear",
                        value: "linear",
                    },
                    {
                        label: "Radial",
                        value: "radial",
                    },
                ]}
                onChange={(value) =>
                    updateGradient({
                        type:
                            value === "radial"
                                ? "radial"
                                : "linear",
                    })
                }
            />

            {/* =====================================================
                ANGLE
            ===================================================== */}

            {gradientType === "linear" && (
                <StyleInput
                    label="Direction"
                    value={angle}
                    type="number"
                    min="0"
                    max="360"
                    step="1"
                    placeholder="90"
                    onChange={(value) =>
                        updateGradient({
                            angle: value,
                        })
                    }
                />
            )}

            {/* =====================================================
                COLOR 1
            ===================================================== */}

            <ColorInput
                label="Start Color"
                value={colorOne}
                onChange={(value) =>
                    updateGradient({
                        colorOne: value,
                    })
                }
            />

            {/* =====================================================
                COLOR 2
            ===================================================== */}

            <ColorInput
                label="End Color"
                value={colorTwo}
                onChange={(value) =>
                    updateGradient({
                        colorTwo: value,
                    })
                }
            />

            {/* =====================================================
                THIRD COLOR
            ===================================================== */}

            <div>
                <label className="
                    mb-2
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-medium
                    text-gray-500
                ">
                    <input
                        type="checkbox"
                        checked={useThirdColor}
                        onChange={(event) =>
                            updateGradient({
                                useThirdColor:
                                    event.target
                                        .checked,
                            })
                        }
                    />

                    Use third color
                </label>

                {useThirdColor && (
                    <ColorInput
                        label="Middle Color"
                        value={colorThree}
                        onChange={(value) =>
                            updateGradient({
                                colorThree:
                                    value,
                            })
                        }
                    />
                )}
            </div>

            {/* =====================================================
                LIVE PREVIEW
            ===================================================== */}

            <div>
                <label className="
                    mb-1.5
                    block
                    text-xs
                    font-medium
                    text-gray-500
                ">
                    Preview
                </label>

                <div
                    className="
                        h-20
                        w-full
                        rounded-lg
                        border
                        shadow-sm
                    "
                    style={{
                        backgroundImage:
                            value ||
                            buildGradient(
                                gradientType,
                                angle,
                                colorOne,
                                colorTwo,
                                colorThree,
                                useThirdColor
                            ),
                    }}
                />
            </div>

            {/* =====================================================
                PRESETS
            ===================================================== */}

            <div>
                <label className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    text-gray-500
                ">
                    Quick Presets
                </label>

                <div className="grid grid-cols-2 gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            applyPreset(
                                "#ff0000",
                                "#0000ff"
                            )
                        }
                        className="
                            h-8
                            rounded-md
                            border
                        "
                        style={{
                            background:
                                "linear-gradient(90deg, #ff0000, #0000ff)",
                        }}
                        title="Red to Blue"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            applyPreset(
                                "#ff7e5f",
                                "#feb47b"
                            )
                        }
                        className="
                            h-8
                            rounded-md
                            border
                        "
                        style={{
                            background:
                                "linear-gradient(90deg, #ff7e5f, #feb47b)",
                        }}
                        title="Sunset"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            applyPreset(
                                "#667eea",
                                "#764ba2"
                            )
                        }
                        className="
                            h-8
                            rounded-md
                            border
                        "
                        style={{
                            background:
                                "linear-gradient(90deg, #667eea, #764ba2)",
                        }}
                        title="Purple"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            applyPreset(
                                "#11998e",
                                "#38ef7d"
                            )
                        }
                        className="
                            h-8
                            rounded-md
                            border
                        "
                        style={{
                            background:
                                "linear-gradient(90deg, #11998e, #38ef7d)",
                        }}
                        title="Green"
                    />

                </div>
            </div>

            {/* =====================================================
                GENERATED CSS
            ===================================================== */}

            <div>
                <label className="
                    mb-1.5
                    block
                    text-xs
                    font-medium
                    text-gray-500
                ">
                    Generated CSS
                </label>

                <div className="
                    break-all
                    rounded-md
                    border
                    bg-white
                    px-2.5
                    py-2
                    text-[11px]
                    text-gray-500
                ">
                    {value ||
                        buildGradient(
                            gradientType,
                            angle,
                            colorOne,
                            colorTwo,
                            colorThree,
                            useThirdColor
                        )}
                </div>
            </div>

        </div>
    );
}
/* =========================================================
   BACKGROUND IMAGE CONTROLS
========================================================= */

interface BackgroundImageControlsProps {
    imageUrl?: string;
    size?: string;
    position?: string;
    repeat?: string;
    attachment?: string;
    assets: ProjectAsset[];
    onImageUrlChange: (value: string) => void;
    onImportFromPC: () => void;
    onOpenAssetLibrary: () => void;
    onSelectAsset: (asset: ProjectAsset) => void;
    onSizeChange: (value: string) => void;
    onPositionChange: (value: string) => void;
    onRepeatChange: (value: string) => void;
    onAttachmentChange: (value: string) => void;
}

function BackgroundImageControls({
    imageUrl,
    size,
    position,
    repeat,
    attachment,
    assets,
    onImageUrlChange,
    onImportFromPC,
    onOpenAssetLibrary,
    onSelectAsset,
    onSizeChange,
    onPositionChange,
    onRepeatChange,
    onAttachmentChange,
}: BackgroundImageControlsProps) {
    const imageAssets = assets.filter((asset) =>
        asset.type.startsWith("image/")
    );

    return (
        <div className="space-y-4 rounded-lg border bg-gray-50 p-3">
            <div>
                <label className="mb-2 block text-xs font-medium text-gray-500">
                    Background Image
                </label>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={onImportFromPC}
                        className="rounded-md border bg-white px-2.5 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        📁 Import from PC
                    </button>
                    <button
                        type="button"
                        onClick={onOpenAssetLibrary}
                        className="rounded-md border bg-white px-2.5 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        🖼️ Asset Library
                    </button>
                </div>

                <p className="mt-2 text-[11px] text-gray-400">
                    Or use an image URL
                </p>
                <StyleInput
                    label="Image URL"
                    value={imageUrl}
                    placeholder="https://example.com/image.jpg"
                    onChange={onImageUrlChange}
                />
            </div>

            {imageAssets.length > 0 && (
                <div className="rounded-md border bg-white p-2">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Your Images
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {imageAssets.map((asset) => (
                            <button
                                key={asset.id}
                                type="button"
                                onClick={() => onSelectAsset(asset)}
                                title={asset.name}
                                className="group overflow-hidden rounded-md border bg-gray-50 text-left transition hover:border-blue-400"
                            >
                                <img
                                    src={asset.source}
                                    alt={asset.name}
                                    className="h-16 w-full object-cover"
                                />
                                <span className="block truncate px-1.5 py-1 text-[10px] text-gray-500">
                                    {asset.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <StyleSelect
                label="Size"
                value={size || "cover"}
                options={[
                    { label: "Auto", value: "auto" },
                    { label: "Cover", value: "cover" },
                    { label: "Contain", value: "contain" },
                    { label: "Custom", value: "custom" },
                ]}
                onChange={(value) => {
                    onSizeChange(
                        value === "custom" ? "100% 100%" : value
                    );
                }}
            />

            {size && !["auto", "cover", "contain"].includes(size) && (
                <StyleInput
                    label="Custom Size"
                    value={size}
                    placeholder="100% 100%"
                    onChange={onSizeChange}
                />
            )}

            <StyleSelect
                label="Position"
                value={position || "center"}
                options={[
                    { label: "Center", value: "center" },
                    { label: "Top", value: "top" },
                    { label: "Bottom", value: "bottom" },
                    { label: "Left", value: "left" },
                    { label: "Right", value: "right" },
                    { label: "Top Left", value: "top left" },
                    { label: "Top Right", value: "top right" },
                    { label: "Bottom Left", value: "bottom left" },
                    { label: "Bottom Right", value: "bottom right" },
                    { label: "Custom", value: "custom" },
                ]}
                onChange={(value) => {
                    onPositionChange(
                        value === "custom" ? "50% 50%" : value
                    );
                }}
            />

            {position && ![
                "center",
                "top",
                "bottom",
                "left",
                "right",
                "top left",
                "top right",
                "bottom left",
                "bottom right",
            ].includes(position) && (
                    <StyleInput
                        label="Custom Position"
                        value={position}
                        placeholder="50% 50%"
                        onChange={onPositionChange}
                    />
                )}

            <StyleSelect
                label="Repeat"
                value={repeat || "no-repeat"}
                options={[
                    { label: "No Repeat", value: "no-repeat" },
                    { label: "Repeat", value: "repeat" },
                    { label: "Repeat X", value: "repeat-x" },
                    { label: "Repeat Y", value: "repeat-y" },
                ]}
                onChange={onRepeatChange}
            />

            <StyleSelect
                label="Attachment"
                value={attachment || "scroll"}
                options={[
                    { label: "Scroll", value: "scroll" },
                    { label: "Fixed", value: "fixed" },
                    { label: "Local", value: "local" },
                ]}
                onChange={onAttachmentChange}
            />
        </div>
    );
}

/* =========================================================
   GRID CONTROLS
========================================================= */

interface GridControlsProps {
    columns: number;
    rows: string;
    columnGap: number;
    rowGap: number;

    justifyItems: string;
    justifyContent: string;
    alignItems: string;
    alignContent: string;

    onColumnsChange: (value: number) => void;
    onRowsChange: (value: string) => void;
    onColumnGapChange: (value: number) => void;
    onRowGapChange: (value: number) => void;

    onJustifyItemsChange: (value: string) => void;
    onJustifyContentChange: (value: string) => void;
    onAlignItemsChange: (value: string) => void;
    onAlignContentChange: (value: string) => void;
}


function GridControls({
    columns,
    rows,
    columnGap,
    rowGap,
    justifyItems,
    justifyContent,
    alignItems,
    alignContent,
    onColumnsChange,
    onRowsChange,
    onColumnGapChange,
    onRowGapChange,
    onJustifyItemsChange,
    onJustifyContentChange,
    onAlignItemsChange,
    onAlignContentChange,
}: GridControlsProps) {
    const alignmentOptions = {
        justifyItems: [
            { label: "Default", value: "" },
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
            { label: "Stretch", value: "stretch" },
        ],
        alignItems: [
            { label: "Default", value: "" },
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
            { label: "Stretch", value: "stretch" },
            { label: "Baseline", value: "baseline" },
        ],
        justifyContent: [
            { label: "Default", value: "" },
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
            { label: "Space Between", value: "space-between" },
            { label: "Space Around", value: "space-around" },
            { label: "Space Evenly", value: "space-evenly" },
        ],
        alignContent: [
            { label: "Default", value: "" },
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
            { label: "Stretch", value: "stretch" },
            { label: "Space Between", value: "space-between" },
            { label: "Space Around", value: "space-around" },
            { label: "Space Evenly", value: "space-evenly" },
        ],
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="mb-2 block text-xs font-medium text-gray-500">
                    Columns
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onColumnsChange(value)}
                            className={`rounded-md border px-2 py-1.5 text-xs font-medium transition ${columns === value
                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {value}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="mb-2 block text-xs font-medium text-gray-500">
                    Rows
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((value) => {
                        const rowCount = Number(
                            rows?.match(/repeat\(\s*(\d+)/)?.[1] || 2
                        );
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() =>
                                    onRowsChange(
                                        `repeat(${value}, minmax(0, auto))`
                                    )
                                }
                                className={`rounded-md border px-2 py-1.5 text-xs font-medium transition ${rowCount === value
                                    ? "border-blue-500 bg-blue-50 text-blue-600"
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {value}
                            </button>
                        );
                    })}
                </div>
                <p className="mt-1.5 text-[11px] text-gray-400">
                    Choose how many rows your grid has.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">
                        Column Gap
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="80"
                        step="1"
                        value={columnGap}
                        onChange={(event) =>
                            onColumnGapChange(Number(event.target.value))
                        }
                        className="w-full"
                    />
                    <div className="mt-1 text-[11px] text-gray-400">
                        {columnGap}px
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">
                        Row Gap
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="80"
                        step="1"
                        value={rowGap}
                        onChange={(event) =>
                            onRowGapChange(Number(event.target.value))
                        }
                        className="w-full"
                    />
                    <div className="mt-1 text-[11px] text-gray-400">
                        {rowGap}px
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-gray-50 p-3">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Grid Alignment
                </div>

                <div className="space-y-3">
                    <StyleSelect
                        label="Justify Items"
                        value={justifyItems}
                        options={alignmentOptions.justifyItems}
                        onChange={onJustifyItemsChange}
                    />
                    <StyleSelect
                        label="Align Items"
                        value={alignItems}
                        options={alignmentOptions.alignItems}
                        onChange={onAlignItemsChange}
                    />
                    <StyleSelect
                        label="Justify Content"
                        value={justifyContent}
                        options={alignmentOptions.justifyContent}
                        onChange={onJustifyContentChange}
                    />
                    <StyleSelect
                        label="Align Content"
                        value={alignContent}
                        options={alignmentOptions.alignContent}
                        onChange={onAlignContentChange}
                    />
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   BOX MODEL EDITOR
========================================================= */

interface BoxModelEditorProps {
    title: string;
    values: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    onChange: (
        side:
            | "top"
            | "right"
            | "bottom"
            | "left",
        value: string
    ) => void;
}

function BoxModelEditor({
    title,
    values,
    onChange,
}: BoxModelEditorProps) {
    const [linked, setLinked] =
        useState(false);

    function handleChange(
        side:
            | "top"
            | "right"
            | "bottom"
            | "left",
        value: string
    ) {
        if (linked) {
            onChange("top", value);
            onChange("right", value);
            onChange("bottom", value);
            onChange("left", value);

            return;
        }

        onChange(side, value);
    }

    return (
        <div>

            <div className="
                mb-3
                flex
                items-center
                justify-between
            ">
                <label className="
                    text-xs
                    font-medium
                    text-gray-500
                ">
                    {title}
                </label>

                <button
                    type="button"
                    onClick={() =>
                        setLinked(
                            (current) =>
                                !current
                        )
                    }
                    className={`
                        rounded-md
                        border
                        px-2
                        py-1
                        text-xs
                        font-medium
                        transition
                        ${linked
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                        }
                    `}
                >
                    {linked
                        ? "🔗 Linked"
                        : "🔓 Unlinked"}
                </button>
            </div>

            <div className="
                rounded-lg
                border
                bg-gray-50
                p-3
            ">

                <div className="
                    mx-auto
                    max-w-[120px]
                ">
                    <StyleInput
                        label="Top"
                        value={values.top}
                        placeholder="0px"
                        onChange={(value) =>
                            handleChange(
                                "top",
                                value
                            )
                        }
                    />
                </div>

                <div className="
                    mt-3
                    grid
                    grid-cols-[1fr_80px_1fr]
                    items-center
                    gap-2
                ">

                    <StyleInput
                        label="Left"
                        value={values.left}
                        placeholder="0px"
                        onChange={(value) =>
                            handleChange(
                                "left",
                                value
                            )
                        }
                    />

                    <div className="
                        flex
                        h-16
                        items-center
                        justify-center
                        rounded-md
                        border
                        border-dashed
                        bg-white
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-wide
                        text-gray-400
                    ">
                        Box
                    </div>

                    <StyleInput
                        label="Right"
                        value={values.right}
                        placeholder="0px"
                        onChange={(value) =>
                            handleChange(
                                "right",
                                value
                            )
                        }
                    />

                </div>

                <div className="
                    mx-auto
                    mt-3
                    max-w-[120px]
                ">
                    <StyleInput
                        label="Bottom"
                        value={values.bottom}
                        placeholder="0px"
                        onChange={(value) =>
                            handleChange(
                                "bottom",
                                value
                            )
                        }
                    />
                </div>

            </div>
        </div>
    );
}

/* =========================================================
   FILTER EDITOR
========================================================= */

interface FilterEditorProps {
    value?: string;
    onChange: (value: string) => void;
    backdrop?: boolean;
}

const FILTER_DEFINITIONS = [
    {
        key: "blur",
        label: "Blur",
        unit: "px",
        min: 0,
        max: 30,
        step: 1,
        defaultValue: 0,
    },
    {
        key: "brightness",
        label: "Brightness",
        unit: "%",
        min: 0,
        max: 200,
        step: 1,
        defaultValue: 100,
    },
    {
        key: "contrast",
        label: "Contrast",
        unit: "%",
        min: 0,
        max: 200,
        step: 1,
        defaultValue: 100,
    },
    {
        key: "grayscale",
        label: "Grayscale",
        unit: "%",
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 0,
    },
    {
        key: "hue-rotate",
        label: "Hue Rotate",
        unit: "deg",
        min: 0,
        max: 360,
        step: 1,
        defaultValue: 0,
    },
    {
        key: "invert",
        label: "Invert",
        unit: "%",
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 0,
    },
    {
        key: "saturate",
        label: "Saturate",
        unit: "%",
        min: 0,
        max: 200,
        step: 1,
        defaultValue: 100,
    },
    {
        key: "sepia",
        label: "Sepia",
        unit: "%",
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 0,
    },
] as const;

type FilterKey = (typeof FILTER_DEFINITIONS)[number]["key"];

function parseFilterFunction(
    value: string | undefined,
    key: FilterKey,
    fallback: number
) {
    if (!value) {
        return fallback;
    }

    const escapedKey = key.replace("-", "\\-");
    const match = value.match(
        new RegExp(
            `${escapedKey}\\((-?\\d*\\.?\\d+)`
        )
    );

    if (!match) {
        return fallback;
    }

    const parsed = Number(match[1]);

    return Number.isFinite(parsed)
        ? parsed
        : fallback;
}

function updateFilterFunction(
    value: string | undefined,
    key: FilterKey,
    nextValue: number,
    unit: string
) {
    const current = (value || "").trim();

    const functionPattern = new RegExp(
        `${key.replace("-", "\\-")}\\([^)]*\\)`,
        "i"
    );

    const nextFunction =
        `${key}(${nextValue}${unit})`;

    if (functionPattern.test(current)) {
        return current
            .replace(
                functionPattern,
                nextFunction
            )
            .replace(/\s+/g, " ")
            .trim();
    }

    return `${current} ${nextFunction}`.trim();
}

function FilterEditor({
    value,
    onChange,
    backdrop = false,
}: FilterEditorProps) {
    const hasValue =
        Boolean(value && value.trim());

    return (
        <div className="space-y-4 rounded-lg border bg-gray-50 p-3">
            <div className="text-[11px] text-gray-400">
                {backdrop
                    ? "Apply visual effects to the content behind this element."
                    : "Apply visual effects directly to this element."}
            </div>

            {FILTER_DEFINITIONS.map((definition) => {
                const currentValue =
                    parseFilterFunction(
                        value,
                        definition.key,
                        definition.defaultValue
                    );

                return (
                    <div key={definition.key}>
                        <div className="mb-1.5 flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-500">
                                {definition.label}
                            </label>

                            <span className="text-[11px] text-gray-400">
                                {currentValue}
                                {definition.unit}
                            </span>
                        </div>

                        <input
                            type="range"
                            min={definition.min}
                            max={definition.max}
                            step={definition.step}
                            value={currentValue}
                            onChange={(event) => {
                                const nextValue =
                                    Number(
                                        event.target.value
                                    );

                                onChange(
                                    updateFilterFunction(
                                        value,
                                        definition.key,
                                        nextValue,
                                        definition.unit
                                    )
                                );
                            }}
                            className="w-full"
                        />
                    </div>
                );
            })}

            {hasValue && (
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">
                        Generated CSS
                    </label>

                    <div className="break-all rounded-md border bg-white px-2.5 py-2 text-[11px] text-gray-500">
                        {value}
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => onChange("")}
                className="
                    w-full
                    rounded-md
                    border
                    px-3
                    py-2
                    text-sm
                    font-medium
                    text-gray-500
                    transition
                    hover:bg-gray-50
                "
            >
                Reset {backdrop ? "Backdrop Filter" : "Filter"}
            </button>
        </div>
    );
}

/* =========================================================
   PER-SIDE BORDER EDITOR
========================================================= */

interface BorderSideEditorProps {
    getStyleValue: (property: string) => string | undefined;
    updateStyle: (property: string, value: string) => void;
}

const BORDER_STYLE_OPTIONS = [
    { label: "Use Overall", value: "" },
    { label: "None", value: "none" },
    { label: "Solid", value: "solid" },
    { label: "Dashed", value: "dashed" },
    { label: "Dotted", value: "dotted" },
    { label: "Double", value: "double" },
];

function BorderSideEditor({
    getStyleValue,
    updateStyle,
}: BorderSideEditorProps) {
    const sides = [
        {
            key: "Top",
            style: "borderTopStyle",
            width: "borderTopWidth",
            color: "borderTopColor",
        },
        {
            key: "Right",
            style: "borderRightStyle",
            width: "borderRightWidth",
            color: "borderRightColor",
        },
        {
            key: "Bottom",
            style: "borderBottomStyle",
            width: "borderBottomWidth",
            color: "borderBottomColor",
        },
        {
            key: "Left",
            style: "borderLeftStyle",
            width: "borderLeftWidth",
            color: "borderLeftColor",
        },
    ] as const;

    return (
        <div className="space-y-3 rounded-lg border bg-gray-50 p-3">
            <div>
                <div className="text-xs font-semibold text-gray-600">
                    Individual Sides
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                    Override the overall border for any individual side.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {sides.map((side) => (
                    <div
                        key={side.key}
                        className="space-y-3 rounded-md border bg-white p-3"
                    >
                        <div className="text-xs font-semibold text-gray-500">
                            {side.key}
                        </div>

                        <StyleSelect
                            label="Style"
                            value={
                                getStyleValue(side.style)
                            }
                            options={BORDER_STYLE_OPTIONS}
                            onChange={(value) =>
                                updateStyle(
                                    side.style,
                                    value
                                )
                            }
                        />

                        <DimensionInput
                            label="Width"
                            value={
                                getStyleValue(side.width)
                            }
                            placeholder="0px"
                            onChange={(value) =>
                                updateStyle(
                                    side.width,
                                    value
                                )
                            }
                        />

                        <ColorInput
                            label="Color"
                            value={
                                getStyleValue(side.color)
                            }
                            placeholder="#000000"
                            onChange={(value) =>
                                updateStyle(
                                    side.color,
                                    value
                                )
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}


/* =========================================================
   MULTI-LAYER SHADOW EDITOR
========================================================= */

interface ShadowLayer {
    id: string;
    x: string;
    y: string;
    blur: string;
    spread: string;
    color: string;
    inset: boolean;
}

interface ShadowEditorProps {
    value?: string;
    onChange: (value: string) => void;
}

function splitShadowLayers(value?: string) {
    const input = (value || "").trim();

    if (!input || input === "none") {
        return [];
    }

    const layers: string[] = [];
    let current = "";
    let depth = 0;

    for (const character of input) {
        if (character === "(") {
            depth += 1;
        } else if (character === ")") {
            depth = Math.max(0, depth - 1);
        }

        if (character === "," && depth === 0) {
            if (current.trim()) {
                layers.push(current.trim());
            }
            current = "";
            continue;
        }

        current += character;
    }

    if (current.trim()) {
        layers.push(current.trim());
    }

    return layers;
}

function parseShadowLayer(
    value: string,
    index: number
): ShadowLayer {
    const colorMatch = value.match(
        /(?:rgba?|hsla?)\([^)]*\)|#[0-9a-fA-F]{3,8}|\b(?:transparent|currentColor)\b/i
    );

    const color =
        colorMatch?.[0] || "rgba(0,0,0,0.15)";

    let remaining = value
        .replace(colorMatch?.[0] || "", "")
        .trim();

    const inset = /\binset\b/i.test(remaining);

    remaining = remaining
        .replace(/\binset\b/gi, "")
        .trim();

    const dimensions = remaining
        .split(/\s+/)
        .filter(Boolean);

    return {
        id: `${index}-${value}`,
        x: dimensions[0] || "0px",
        y: dimensions[1] || "4px",
        blur: dimensions[2] || "12px",
        spread: dimensions[3] || "0px",
        color,
        inset,
    };
}

function parseShadowLayers(
    value?: string
): ShadowLayer[] {
    return splitShadowLayers(value).map(
        (layer, index) =>
            parseShadowLayer(layer, index)
    );
}

function buildShadowLayer(
    layer: ShadowLayer
) {
    const parts = [
        layer.inset ? "inset" : "",
        layer.x.trim() || "0px",
        layer.y.trim() || "4px",
        layer.blur.trim() || "12px",
        layer.spread.trim() || "0px",
        layer.color.trim() || "rgba(0,0,0,0.15)",
    ].filter(Boolean);

    return parts.join(" ");
}

function buildShadowValue(
    layers: ShadowLayer[]
) {
    if (layers.length === 0) {
        return "none";
    }

    return layers
        .map(buildShadowLayer)
        .join(", ");
}

function ShadowEditor({
    value,
    onChange,
}: ShadowEditorProps) {
    const layers = parseShadowLayers(value);

    function updateLayer(
        index: number,
        changes: Partial<ShadowLayer>
    ) {
        const nextLayers = layers.map(
            (layer, layerIndex) =>
                layerIndex === index
                    ? {
                        ...layer,
                        ...changes,
                    }
                    : layer
        );

        onChange(
            buildShadowValue(nextLayers)
        );
    }

    function addLayer() {
        const nextLayer: ShadowLayer = {
            id: `${Date.now()}`,
            x: "0px",
            y: "4px",
            blur: "12px",
            spread: "0px",
            color: "rgba(0,0,0,0.15)",
            inset: false,
        };

        onChange(
            buildShadowValue([
                ...layers,
                nextLayer,
            ])
        );
    }

    function removeLayer(index: number) {
        onChange(
            buildShadowValue(
                layers.filter(
                    (_, layerIndex) =>
                        layerIndex !== index
                )
            )
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs font-semibold text-gray-600">
                        Shadow Layers
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">
                        Stack multiple shadows for more control.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={addLayer}
                    className="
                        rounded-md
                        border
                        border-blue-200
                        bg-blue-50
                        px-2.5
                        py-1.5
                        text-xs
                        font-medium
                        text-blue-600
                        transition
                        hover:bg-blue-100
                    "
                >
                    + Add Shadow
                </button>
            </div>

            {layers.length === 0 && (
                <div className="rounded-lg border border-dashed bg-gray-50 p-4 text-center">
                    <div className="text-xs font-medium text-gray-500">
                        No shadows
                    </div>
                    <div className="mt-1 text-[11px] text-gray-400">
                        Add a shadow layer to get started.
                    </div>
                </div>
            )}

            {layers.map((layer, index) => (
                <div
                    key={layer.id}
                    className="space-y-3 rounded-lg border bg-gray-50 p-3"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">
                            Shadow {index + 1}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                removeLayer(index)
                            }
                            className="
                                rounded-md
                                border
                                px-2
                                py-1
                                text-[11px]
                                font-medium
                                text-gray-500
                                transition
                                hover:bg-white
                                hover:text-red-500
                            "
                        >
                            Remove
                        </button>
                    </div>

                    <div className="space-y-3 rounded-md border bg-white p-3">
                        {[
                            {
                                key: "x" as const,
                                label: "X Offset",
                                min: -50,
                                max: 50,
                                fallback: 0,
                            },
                            {
                                key: "y" as const,
                                label: "Y Offset",
                                min: -50,
                                max: 50,
                                fallback: 4,
                            },
                            {
                                key: "blur" as const,
                                label: "Blur",
                                min: 0,
                                max: 100,
                                fallback: 12,
                            },
                            {
                                key: "spread" as const,
                                label: "Spread",
                                min: -50,
                                max: 50,
                                fallback: 0,
                            },
                        ].map((control) => {
                            const numericValue = Number.parseFloat(
                                layer[control.key]
                            );
                            const value = Number.isFinite(numericValue)
                                ? Math.min(
                                    control.max,
                                    Math.max(control.min, numericValue)
                                )
                                : control.fallback;

                            return (
                                <div key={control.key}>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label className="text-xs font-medium text-gray-500">
                                            {control.label}
                                        </label>
                                        <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                                            {value}px
                                        </span>
                                    </div>

                                    <input
                                        type="range"
                                        min={control.min}
                                        max={control.max}
                                        step="1"
                                        value={value}
                                        onChange={(event) =>
                                            updateLayer(index, {
                                                [control.key]: `${event.target.value}px`,
                                            })
                                        }
                                        className="w-full cursor-pointer"
                                        aria-label={control.label}
                                    />

                                    <div className="mt-0.5 flex justify-between text-[10px] text-gray-300">
                                        <span>{control.min}px</span>
                                        <span>{control.max}px</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <ColorInput
                        label="Color"
                        value={layer.color}
                        placeholder="rgba(0,0,0,0.15)"
                        onChange={(value) =>
                            updateLayer(index, {
                                color: value,
                            })
                        }
                    />

                    <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <input
                            type="checkbox"
                            checked={layer.inset}
                            onChange={(event) =>
                                updateLayer(index, {
                                    inset: event.target
                                        .checked,
                                })
                            }
                        />
                        Inset shadow
                    </label>

                    <div>
                        <div className="mb-1.5 text-[11px] font-medium text-gray-400">
                            Preview
                        </div>

                        <div
                            className="h-12 rounded-md border bg-white"
                            style={{
                                boxShadow:
                                    buildShadowLayer(
                                        layer
                                    ),
                            }}
                        />
                    </div>
                </div>
            ))}

            {layers.length > 0 && (
                <div>
                    <div className="mb-1.5 text-[11px] font-medium text-gray-400">
                        Generated CSS
                    </div>

                    <div className="break-all rounded-md border bg-white px-2.5 py-2 text-[11px] text-gray-500">
                        box-shadow:{" "}
                        {buildShadowValue(layers)}
                    </div>
                </div>
            )}

            {layers.length > 0 && (
                <button
                    type="button"
                    onClick={() => onChange("none")}
                    className="
                        w-full
                        rounded-md
                        border
                        px-3
                        py-2
                        text-sm
                        font-medium
                        text-gray-500
                        transition
                        hover:bg-gray-50
                    "
                >
                    Clear All Shadows
                </button>
            )}
        </div>
    );
}

/* =========================================================
   INSPECTOR SECTION
========================================================= */

interface InspectorSectionProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

function InspectorSection({
    title,
    children,
    defaultOpen = true,
}: InspectorSectionProps) {
    const [isOpen, setIsOpen] =
        useState(defaultOpen);

    return (
        <div className="border-b pb-4">

            <button
                type="button"
                onClick={() =>
                    setIsOpen(
                        (open) => !open
                    )
                }
                className="
                    flex
                    w-full
                    items-center
                    justify-between
                    py-1
                    text-left
                    transition
                    hover:text-gray-700
                "
                aria-expanded={isOpen}
            >
                <span className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-400
                ">
                    {title}
                </span>

                <span
                    className="
                        text-xs
                        text-gray-400
                        transition-transform
                    "
                    style={{
                        transform:
                            isOpen
                                ? "rotate(0deg)"
                                : "rotate(-90deg)",
                    }}
                >
                    ▼
                </span>
            </button>

            {isOpen && (
                <div className="
                    mt-3
                    space-y-3
                ">
                    {children}
                </div>
            )}

        </div>
    );
}

/* =========================================================
   TRANSITION EDITOR
========================================================= */

interface TransitionEditorProps {
    value?: string;
    onChange: (value: string) => void;
}

const TRANSITION_DEFAULTS = {
    property: "all",
    duration: "0.3",
    timing: "ease",
    delay: "0",
};

function parseTransition(value?: string) {
    if (!value || value === "none") {
        return TRANSITION_DEFAULTS;
    }

    const parts = value.trim().split(/\s+/);

    const property =
        parts[0] || TRANSITION_DEFAULTS.property;

    const durationPart =
        parts.find((part) =>
            /^\d*\.?\d+s$/.test(part)
        );

    const delayCandidates =
        parts.filter((part) =>
            /^\d*\.?\d+s$/.test(part)
        );

    const duration =
        durationPart
            ? durationPart.replace("s", "")
            : TRANSITION_DEFAULTS.duration;

    const delay =
        delayCandidates.length > 1
            ? delayCandidates[1].replace("s", "")
            : TRANSITION_DEFAULTS.delay;

    const timing =
        parts.find((part) =>
            [
                "ease",
                "ease-in",
                "ease-out",
                "ease-in-out",
                "linear",
            ].includes(part)
        ) || TRANSITION_DEFAULTS.timing;

    return {
        property,
        duration,
        timing,
        delay,
    };
}

function buildTransition(
    property: string,
    duration: string,
    timing: string,
    delay: string
) {
    const safeDuration =
        duration.trim() || "0.3";

    const safeDelay =
        delay.trim() || "0";

    return `${property} ${safeDuration}s ${timing} ${safeDelay}s`;
}

function TransitionEditor({
    value,
    onChange,
}: TransitionEditorProps) {
    const parsed = parseTransition(value);

    const enabled =
        Boolean(value && value !== "none");

    function updateTransition(
        changes: Partial<typeof parsed>
    ) {
        const next = {
            ...parsed,
            ...changes,
        };

        onChange(
            buildTransition(
                next.property,
                next.duration,
                next.timing,
                next.delay
            )
        );
    }

    return (
        <div className="space-y-4">
            {/* ENABLE */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">
                    Enable Transition
                </span>

                <button
                    type="button"
                    onClick={() => {
                        if (enabled) {
                            onChange("");
                        } else {
                            onChange(
                                buildTransition(
                                    TRANSITION_DEFAULTS.property,
                                    TRANSITION_DEFAULTS.duration,
                                    TRANSITION_DEFAULTS.timing,
                                    TRANSITION_DEFAULTS.delay
                                )
                            );
                        }
                    }}
                    className={`
                        relative
                        h-5
                        w-9
                        rounded-full
                        transition-colors
                        ${enabled
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        }
                    `}
                    aria-label="Toggle transition"
                >
                    <span
                        className={`
                            absolute
                            top-0.5
                            h-4
                            w-4
                            rounded-full
                            bg-white
                            shadow
                            transition-transform
                            ${enabled
                                ? "translate-x-4"
                                : "translate-x-0.5"
                            }
                        `}
                    />
                </button>
            </div>

            {enabled && (
                <>
                    {/* PROPERTY */}
                    <StyleSelect
                        label="Property"
                        value={parsed.property}
                        options={[
                            {
                                label: "All",
                                value: "all",
                            },
                            {
                                label: "Transform",
                                value: "transform",
                            },
                            {
                                label: "Opacity",
                                value: "opacity",
                            },
                            {
                                label: "Background Color",
                                value: "background-color",
                            },
                            {
                                label: "Text Color",
                                value: "color",
                            },
                            {
                                label: "Width",
                                value: "width",
                            },
                            {
                                label: "Height",
                                value: "height",
                            },
                        ]}
                        onChange={(property) =>
                            updateTransition({
                                property,
                            })
                        }
                    />

                    {/* DURATION */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Duration
                        </label>

                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.05"
                                value={parsed.duration}
                                onChange={(event) =>
                                    updateTransition({
                                        duration:
                                            event.target.value,
                                    })
                                }
                                className="
                                    w-full
                                    rounded
                                    border
                                    px-2
                                    py-1.5
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                "
                            />

                            <span className="text-xs text-gray-400">
                                sec
                            </span>
                        </div>
                    </div>

                    {/* TIMING */}
                    <StyleSelect
                        label="Timing"
                        value={parsed.timing}
                        options={[
                            {
                                label: "Ease",
                                value: "ease",
                            },
                            {
                                label: "Ease In",
                                value: "ease-in",
                            },
                            {
                                label: "Ease Out",
                                value: "ease-out",
                            },
                            {
                                label: "Ease In Out",
                                value: "ease-in-out",
                            },
                            {
                                label: "Linear",
                                value: "linear",
                            },
                        ]}
                        onChange={(timing) =>
                            updateTransition({
                                timing,
                            })
                        }
                    />

                    {/* DELAY */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Delay
                        </label>

                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.05"
                                value={parsed.delay}
                                onChange={(event) =>
                                    updateTransition({
                                        delay:
                                            event.target.value,
                                    })
                                }
                                className="
                                    w-full
                                    rounded
                                    border
                                    px-2
                                    py-1.5
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                "
                            />

                            <span className="text-xs text-gray-400">
                                sec
                            </span>
                        </div>
                    </div>

                    {/* PREVIEW */}
                    <div
                        className="
                            rounded
                            bg-gray-50
                            px-3
                            py-2
                            text-[11px]
                            text-gray-500
                        "
                    >
                        <div className="mb-1 font-medium text-gray-600">
                            CSS Preview
                        </div>

                        <code className="break-all">
                            transition:{" "}
                            {buildTransition(
                                parsed.property,
                                parsed.duration,
                                parsed.timing,
                                parsed.delay
                            )}
                        </code>
                    </div>
                </>
            )}
        </div>
    );
}

/* =========================================================
   ANIMATION EDITOR
========================================================= */


interface AnimationEditorProps {
    value?: string;
    trigger?: string;
    onChange: (value: string) => void;
    onTriggerChange: (value: string) => void;
}

const ANIMATION_DEFAULTS = {
    preset: "vwb-fade-in",
    duration: "1",
    timing: "ease",
    delay: "0",
    iteration: "1",
    direction: "normal",
    fill: "both",
};



const ANIMATION_PRESETS = [
    {
        label: "Fade In",
        value: "vwb-fade-in",
    },
    {
        label: "Fade Out",
        value: "vwb-fade-out",
    },
    {
        label: "Slide Up",
        value: "vwb-slide-up",
    },
    {
        label: "Slide Down",
        value: "vwb-slide-down",
    },
    {
        label: "Slide Left",
        value: "vwb-slide-left",
    },
    {
        label: "Slide Right",
        value: "vwb-slide-right",
    },
    {
        label: "Zoom In",
        value: "vwb-zoom-in",
    },
    {
        label: "Zoom Out",
        value: "vwb-zoom-out",
    },
    {
        label: "Bounce",
        value: "vwb-bounce",
    },
    {
        label: "Pulse",
        value: "vwb-pulse",
    },
    {
        label: "Shake",
        value: "vwb-shake",
    },
    {
        label: "Spin",
        value: "vwb-spin",
    },
];

function parseAnimation(value?: string) {
    if (!value || value === "none") {
        return ANIMATION_DEFAULTS;
    }

    const parts = value
        .trim()
        .split(/\s+/);

    const preset =
        parts[0] ||
        ANIMATION_DEFAULTS.preset;

    const timeParts = parts.filter(
        (part) =>
            /^\d*\.?\d+s$/.test(part)
    );

    const duration =
        timeParts[0]
            ? timeParts[0].replace("s", "")
            : ANIMATION_DEFAULTS.duration;

    const delay =
        timeParts[1]
            ? timeParts[1].replace("s", "")
            : ANIMATION_DEFAULTS.delay;

    const timing =
        parts.find((part) =>
            [
                "ease",
                "ease-in",
                "ease-out",
                "ease-in-out",
                "linear",
            ].includes(part)
        ) ||
        ANIMATION_DEFAULTS.timing;

    const iteration =
        parts.find(
            (part) =>
                part === "infinite" ||
                /^\d+$/.test(part)
        ) ||
        ANIMATION_DEFAULTS.iteration;

    const direction =
        parts.find((part) =>
            [
                "normal",
                "reverse",
                "alternate",
                "alternate-reverse",
            ].includes(part)
        ) ||
        ANIMATION_DEFAULTS.direction;

    const fill =
        parts.find((part) =>
            [
                "none",
                "forwards",
                "backwards",
                "both",
            ].includes(part)
        ) ||
        ANIMATION_DEFAULTS.fill;

    return {
        preset,
        duration,
        timing,
        delay,
        iteration,
        direction,
        fill,
    };
}

function buildAnimation(
    preset: string,
    duration: string,
    timing: string,
    delay: string,
    iteration: string,
    direction: string,
    fill: string
) {
    const safeDuration =
        duration.trim() || "1";

    const safeDelay =
        delay.trim() || "0";

    const safeIteration =
        iteration.trim() || "1";

    return `${preset} ${safeDuration}s ${timing} ${safeDelay}s ${safeIteration} ${direction} ${fill}`;
}

function AnimationEditor({
    value,
    trigger,
    onChange,
    onTriggerChange,
}: AnimationEditorProps) {
    const parsed = parseAnimation(value);

    const enabled =
        Boolean(value && value !== "none");

    function updateAnimation(
        changes: Partial<typeof parsed>
    ) {
        const next = {
            ...parsed,
            ...changes,
        };

        onChange(
            buildAnimation(
                next.preset,
                next.duration,
                next.timing,
                next.delay,
                next.iteration,
                next.direction,
                next.fill
            )
        );
    }

    return (
        <div className="space-y-4">
            {/* ENABLE */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">
                    Enable Animation
                </span>

                <button
                    type="button"
                    onClick={() => {
                        if (enabled) {
                            onChange("");
                        } else {
                            onChange(
                                buildAnimation(
                                    ANIMATION_DEFAULTS.preset,
                                    ANIMATION_DEFAULTS.duration,
                                    ANIMATION_DEFAULTS.timing,
                                    ANIMATION_DEFAULTS.delay,
                                    ANIMATION_DEFAULTS.iteration,
                                    ANIMATION_DEFAULTS.direction,
                                    ANIMATION_DEFAULTS.fill
                                )
                            );
                        }
                    }}
                    className={`
                        relative
                        h-5
                        w-9
                        rounded-full
                        transition-colors
                        ${enabled
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        }
                    `}
                    aria-label="Toggle animation"
                >
                    <span
                        className={`
                            absolute
                            top-0.5
                            h-4
                            w-4
                            rounded-full
                            bg-white
                            shadow
                            transition-transform
                            ${enabled
                                ? "translate-x-4"
                                : "translate-x-0.5"
                            }
                        `}
                    />
                </button>
            </div>

            {enabled && (
                <>
                    {/* TRIGGER */}
                    <StyleSelect
                        label="Trigger"
                        value={trigger || "load"}
                        options={[
                            {
                                label: "On Load",
                                value: "load",
                            },
                            {
                                label: "On Hover",
                                value: "hover",
                            },
                            {
                                label: "On Click",
                                value: "click",
                            },
                            {
                                label: "On Focus",
                                value: "focus",
                            },
                            {
                                label: "On Scroll Into View",
                                value: "scroll",
                            },
                        ]}
                        onChange={onTriggerChange}
                    />

                    {/* PRESET */}
                    <StyleSelect
                        label="Animation"
                        value={parsed.preset}
                        options={ANIMATION_PRESETS}
                        onChange={(preset) =>
                            updateAnimation({
                                preset,
                            })
                        }
                    />

                    {/* DURATION */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Duration
                        </label>

                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0.05"
                                max="20"
                                step="0.05"
                                value={
                                    parsed.duration
                                }
                                onChange={(event) =>
                                    updateAnimation({
                                        duration:
                                            event.target.value,
                                    })
                                }
                                className="
                                    w-full
                                    rounded
                                    border
                                    px-2
                                    py-1.5
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                "
                            />

                            <span className="text-xs text-gray-400">
                                sec
                            </span>
                        </div>
                    </div>

                    {/* TIMING */}
                    <StyleSelect
                        label="Timing"
                        value={parsed.timing}
                        options={[
                            {
                                label: "Ease",
                                value: "ease",
                            },
                            {
                                label: "Ease In",
                                value: "ease-in",
                            },
                            {
                                label: "Ease Out",
                                value: "ease-out",
                            },
                            {
                                label: "Ease In Out",
                                value: "ease-in-out",
                            },
                            {
                                label: "Linear",
                                value: "linear",
                            },
                        ]}
                        onChange={(timing) =>
                            updateAnimation({
                                timing,
                            })
                        }
                    />

                    {/* DELAY */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Delay
                        </label>

                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.05"
                                value={
                                    parsed.delay
                                }
                                onChange={(event) =>
                                    updateAnimation({
                                        delay:
                                            event.target.value,
                                    })
                                }
                                className="
                                    w-full
                                    rounded
                                    border
                                    px-2
                                    py-1.5
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                "
                            />

                            <span className="text-xs text-gray-400">
                                sec
                            </span>
                        </div>
                    </div>

                    {/* ITERATION */}
                    <StyleSelect
                        label="Repeat"
                        value={
                            parsed.iteration
                        }
                        options={[
                            {
                                label: "Once",
                                value: "1",
                            },
                            {
                                label: "2 Times",
                                value: "2",
                            },
                            {
                                label: "3 Times",
                                value: "3",
                            },
                            {
                                label: "5 Times",
                                value: "5",
                            },
                            {
                                label: "Infinite",
                                value: "infinite",
                            },
                        ]}
                        onChange={(iteration) =>
                            updateAnimation({
                                iteration,
                            })
                        }
                    />

                    {/* DIRECTION */}
                    <StyleSelect
                        label="Direction"
                        value={
                            parsed.direction
                        }
                        options={[
                            {
                                label: "Normal",
                                value: "normal",
                            },
                            {
                                label: "Reverse",
                                value: "reverse",
                            },
                            {
                                label: "Alternate",
                                value: "alternate",
                            },
                            {
                                label: "Alternate Reverse",
                                value: "alternate-reverse",
                            },
                        ]}
                        onChange={(direction) =>
                            updateAnimation({
                                direction,
                            })
                        }
                    />

                    {/* FILL */}
                    <StyleSelect
                        label="Fill Mode"
                        value={parsed.fill}
                        options={[
                            {
                                label: "None",
                                value: "none",
                            },
                            {
                                label: "Forwards",
                                value: "forwards",
                            },
                            {
                                label: "Backwards",
                                value: "backwards",
                            },
                            {
                                label: "Both",
                                value: "both",
                            },
                        ]}
                        onChange={(fill) =>
                            updateAnimation({
                                fill,
                            })
                        }
                    />

                    {/* PREVIEW */}
                    <div className="rounded bg-gray-50 px-3 py-2 text-[11px] text-gray-500">
                        <div className="mb-1 font-medium text-gray-600">
                            CSS Preview
                        </div>

                        <code className="break-all">
                            animation:{" "}
                            {buildAnimation(
                                parsed.preset,
                                parsed.duration,
                                parsed.timing,
                                parsed.delay,
                                parsed.iteration,
                                parsed.direction,
                                parsed.fill
                            )}
                        </code>
                    </div>
                </>
            )}
        </div>
    );
}

/* =========================================================
   RIGHT PANEL
========================================================= */

export default function RightPanel({
    viewport,
}: RightPanelProps) {
    const project =
        useEditorStore(
            (state) => state.project
        );

    const selectedNodeId =
        useEditorStore(
            (state) =>
                state.selectedNodeId
        );

    const selectedNodeIds =
        useEditorStore(
            (state) =>
                state.selectedNodeIds
        );

    const updateNode =
        useEditorStore(
            (state) =>
                state.updateNode
        );

    const setLayoutMode =
        useEditorStore(
            (state) =>
                state.setLayoutMode
        );

    const setImageAsset =
        useEditorStore(
            (state) =>
                state.setImageAsset
        );

    const addAsset =
        useEditorStore(
            (state) =>
                state.addAsset
        );

    const updateResponsiveNodeStyles =
        useEditorStore(
            (state) =>
                state.updateResponsiveNodeStyles
        );

    const bulkUpdateResponsiveNodeStyles =
        useEditorStore(
            (state) =>
                state.bulkUpdateResponsiveNodeStyles
        );

    const imageInputRef =
        useRef<HTMLInputElement>(null);

    const backgroundImageInputRef =
        useRef<HTMLInputElement>(null);

    const [showBackgroundAssetLibrary, setShowBackgroundAssetLibrary] =
        useState(false);

    const node =
        selectedNodeId
            ? project.nodes[
            selectedNodeId
            ]
            : null;

    const imageSource =
        node?.assetId
            ? project.assets[node.assetId]?.source
            : node?.content;

    /* =====================================================
       RESPONSIVE STYLE VALUE
    ===================================================== */

    function getStyleValue(
        property: string
    ): string | undefined {
        if (!node) {
            return undefined;
        }

        const styles =
            node.styles;

        if (!styles) {
            return undefined;
        }

        const stylesRecord =
            styles as unknown as Record<
                string,
                unknown
            >;

        const responsive =
            stylesRecord[
            "responsive"
            ] as
            | Record<
                string,
                Record<
                    string,
                    unknown
                >
            >
            | undefined;

        const responsiveStyles =
            responsive?.[
            viewport
            ];

        const responsiveValue =
            responsiveStyles?.[
            property
            ];

        if (
            typeof responsiveValue ===
            "string"
        ) {
            return responsiveValue;
        }

        const baseValue =
            stylesRecord[property];

        return typeof baseValue ===
            "string"
            ? baseValue
            : undefined;
    }

    /* =====================================================
       RESPONSIVE STYLE UPDATE
    ===================================================== */

    function updateStyle(
        property: string,
        value: string
    ) {
        if (!node) {
            return;
        }

        if (
            selectedNodeIds.length > 1
        ) {
            bulkUpdateResponsiveNodeStyles(
                selectedNodeIds,
                viewport,
                {
                    [property]: value,
                }
            );
            return;
        }

        updateResponsiveNodeStyles(
            node.id,
            viewport,
            {
                [property]: value,
            }
        );
    }

    /* =====================================================
       BASE STYLE UPDATE
    ===================================================== */

    function updateBaseStyle(
        property: string,
        value: string
    ) {
        if (!node) {
            return;
        }

        const currentStyles =
            node.styles ?? {};

        updateNode(
            node.id,
            {
                styles: {
                    ...currentStyles,
                    [property]: value,
                },
            }
        );
    }

    /* =====================================================
       CONTENT UPDATE
    ===================================================== */

    function updateContent(
        value: string
    ) {
        if (!node) {
            return;
        }

        updateNode(
            node.id,
            {
                content: value,
            }
        );
    }

    /* =====================================================
       IMAGE IMPORT
    ===================================================== */

    function handleImageImport(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file =
            event.target.files?.[0];

        if (!file || !node) {
            return;
        }

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {
            window.alert(
                "Please select a valid image file."
            );

            event.target.value = "";

            return;
        }

        const reader =
            new FileReader();

        reader.onload = () => {
            const result =
                reader.result;

            if (
                typeof result !==
                "string"
            ) {
                return;
            }

            const asset: ProjectAsset = {
                id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                name: file.name,
                type: file.type,
                size: file.size,
                source: result,
            };

            setImageAsset(node.id, asset);
        };

        reader.onerror = () => {
            window.alert(
                "Unable to read the selected image."
            );
        };

        reader.readAsDataURL(file);

        event.target.value = "";
    }

    /* =====================================================
       REMOVE IMAGE
    ===================================================== */

    function removeImage() {
        if (!node) {
            return;
        }

        updateNode(
            node.id,
            {
                content: "",
                assetId: undefined,
            }
        );
    }

    /* =====================================================
       CURRENT DISPLAY
    ===================================================== */

    const currentDisplay =
        getStyleValue(
            "display"
        );

    /* =====================================================
       PARENT NODE
    ===================================================== */

    const parentNode =
        node?.parentId
            ? project.nodes[
            node.parentId
            ]
            : null;

    const parentDisplay =
        parentNode
            ? (
                parentNode.styles
                    ?.responsive?.[
                    viewport
                ]?.display ??
                parentNode.styles
                    ?.display
            )
            : undefined;

    const parentLayoutMode =
        parentNode
            ? (
                parentNode.styles
                    ?.responsive?.[
                    viewport
                ]?.layoutMode ??
                parentNode.styles
                    ?.layoutMode
            )
            : undefined;

    const isGridItem =
        parentLayoutMode === "grid";

    const isFlexContainer =
        currentDisplay ===
        "flex";

    const isFlexItem =
        parentDisplay ===
        "flex";

    /* =====================================================
       BACKGROUND TYPE
    ===================================================== */

    const currentBackgroundImage =
        getStyleValue(
            "backgroundImage"
        );

    const hasGradient =
        !!currentBackgroundImage &&
        (
            currentBackgroundImage.includes(
                "gradient("
            )
        );

    const hasBackgroundImage =
        !!currentBackgroundImage &&
        !hasGradient;

    const backgroundImageUrl =
        currentBackgroundImage?.startsWith("url(")
            ? currentBackgroundImage
                .replace(/^url\(["']?/, "")
                .replace(/["']?\)$/, "")
            : "";

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <aside className="
            flex
            w-80
            shrink-0
            flex-col
            border-l
            bg-white
        ">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="
                shrink-0
                border-b
                px-4
                py-4
            ">
                <h2 className="
                    font-semibold
                ">
                    Properties
                </h2>

                <p className="
                    mt-1
                    text-xs
                    text-gray-500
                ">
                    Editing:{" "}
                    <span className="
                        font-medium
                        capitalize
                        text-gray-700
                    ">
                        {viewport}
                    </span>
                </p>
            </div>

            {/* ==================================================
                NO SELECTION
            ================================================== */}

            {!node && (
                <div className="
                    p-5
                    text-sm
                    text-gray-500
                ">
                    Select an element on the canvas.
                </div>
            )}

            {/* ==================================================
                INSPECTOR
            ================================================== */}

            {node && (
                <div className="
                    flex-1
                    overflow-auto
                ">
                    <div className="
                        space-y-5
                        p-4
                    ">

                        {/* ==================================================
                            ELEMENT
                        ================================================== */}

                        <InspectorSection
                            title="Element"
                        >
                            {selectedNodeIds.length > 1 && (
                                <div
                                    className="
                        shrink-0
                        border-b
                        border-blue-100
                        bg-blue-50
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-blue-700
                    "
                                >
                                    {selectedNodeIds.length} elements selected.
                                    Style changes apply to all selected elements.
                                </div>
                            )}


                            <div>
                                <label className="
                                    mb-1.5
                                    block
                                    text-xs
                                    font-medium
                                    text-gray-500
                                ">
                                    Type
                                </label>

                                <div className="
                                    rounded-md
                                    border
                                    bg-gray-50
                                    px-3
                                    py-2
                                    text-sm
                                    capitalize
                                ">
                                    {node.type}
                                </div>
                            </div>

                            <div>
                                <label className="
                                    mb-1.5
                                    block
                                    text-xs
                                    font-medium
                                    text-gray-500
                                ">
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
                                                name:
                                                    event
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

                        {(node.type === "text" ||
                            node.type === "button") && (
                                <InspectorSection
                                    title="Content"
                                >

                                    <div>
                                        <label className="
                                        mb-1.5
                                        block
                                        text-xs
                                        font-medium
                                        text-gray-500
                                    ">
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

                        {node.type === "image" && (
                            <InspectorSection
                                title="Image"
                            >

                                <div>
                                    <label className="
                                        mb-1.5
                                        block
                                        text-xs
                                        font-medium
                                        text-gray-500
                                    ">
                                        Image File
                                    </label>

                                    <input
                                        ref={
                                            imageInputRef
                                        }
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageImport
                                        }
                                        className="hidden"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            imageInputRef.current?.click()
                                        }
                                        className="
                                            w-full
                                            rounded-md
                                            border
                                            border-blue-500
                                            bg-blue-50
                                            px-3
                                            py-2.5
                                            text-sm
                                            font-medium
                                            text-blue-600
                                            transition
                                            hover:bg-blue-100
                                        "
                                    >
                                        Import Image from PC
                                    </button>
                                </div>

                                {imageSource && (
                                    <div className="
                                        overflow-hidden
                                        rounded-md
                                        border
                                        bg-gray-50
                                    ">
                                        <img
                                            src={
                                                imageSource
                                            }
                                            alt={
                                                node.styles
                                                    ?.alt ||
                                                "Image preview"
                                            }
                                            className="
                                                max-h-48
                                                w-full
                                                object-contain
                                            "
                                        />
                                    </div>
                                )}

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

                                {imageSource && (
                                    <button
                                        type="button"
                                        onClick={
                                            removeImage
                                        }
                                        className="
                                            w-full
                                            rounded-md
                                            border
                                            border-red-200
                                            px-3
                                            py-2
                                            text-sm
                                            font-medium
                                            text-red-500
                                            transition
                                            hover:bg-red-50
                                        "
                                    >
                                        Remove Image
                                    </button>
                                )}

                                <StyleInput
                                    label="Alt Text"
                                    value={
                                        node.styles?.alt
                                    }
                                    placeholder="Image description"
                                    onChange={(
                                        value
                                    ) =>
                                        updateBaseStyle(
                                            "alt",
                                            value
                                        )
                                    }
                                />

                                <StyleSelect
                                    label="Object Fit"
                                    value={
                                        getStyleValue(
                                            "objectFit"
                                        )
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
                                    onChange={(value) =>
                                        updateStyle(
                                            "objectFit",
                                            value
                                        )
                                    }
                                />

                                <StyleSelect
                                    label="Object Position"
                                    value={
                                        getStyleValue(
                                            "objectPosition"
                                        )
                                    }
                                    options={[
                                        {
                                            label: "Default",
                                            value: "",
                                        },
                                        {
                                            label: "Center",
                                            value: "center",
                                        },
                                        {
                                            label: "Top",
                                            value: "center top",
                                        },
                                        {
                                            label: "Bottom",
                                            value: "center bottom",
                                        },
                                        {
                                            label: "Left",
                                            value: "left center",
                                        },
                                        {
                                            label: "Right",
                                            value: "right center",
                                        },
                                        {
                                            label: "Top Left",
                                            value: "left top",
                                        },
                                        {
                                            label: "Top Right",
                                            value: "right top",
                                        },
                                        {
                                            label: "Bottom Left",
                                            value: "left bottom",
                                        },
                                        {
                                            label: "Bottom Right",
                                            value: "right bottom",
                                        },
                                    ]}
                                    onChange={(value) =>
                                        updateStyle(
                                            "objectPosition",
                                            value
                                        )
                                    }
                                />
                            </InspectorSection>
                        )}

                        {/* ==================================================
                            LAYOUT & PLACEMENT
                        ================================================== */}

                        {(node.type === "page" ||
                            node.type === "section" ||
                            node.type === "container" ||
                            node.type === "navbar") && (
                                <InspectorSection
                                    title="Layout & Placement"
                                >
                                    <div className="space-y-3">
                                        <p className="text-xs text-gray-500">
                                            How do you want to arrange this section?
                                        </p>

                                        {[
                                            {
                                                mode: "automatic" as LayoutMode,
                                                title: "Automatic",
                                                description:
                                                    "Let the builder arrange items naturally and responsively.",
                                            },
                                            {
                                                mode: "horizontal" as LayoutMode,
                                                title: "Horizontal",
                                                description:
                                                    "Place items side by side.",
                                            },
                                            {
                                                mode: "vertical" as LayoutMode,
                                                title: "Vertical",
                                                description:
                                                    "Stack items from top to bottom.",
                                            },
                                            {
                                                mode: "grid" as LayoutMode,
                                                title: "Grid",
                                                description:
                                                    "Arrange items in rows and columns.",
                                            },
                                            {
                                                mode: "free" as LayoutMode,
                                                title: "Free Position",
                                                description:
                                                    "Place and overlap items anywhere.",
                                            },
                                        ].map((option) => {
                                            const activeMode =
                                                getStyleValue("layoutMode") ||
                                                "automatic";

                                            const active =
                                                activeMode === option.mode;

                                            return (
                                                <button
                                                    key={option.mode}
                                                    type="button"
                                                    onClick={() =>
                                                        setLayoutMode(
                                                            node.id,
                                                            option.mode
                                                        )
                                                    }
                                                    className={`
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    p-3
                                                    text-left
                                                    transition
                                                    ${active
                                                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                                        }
                                                `}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-sm font-semibold text-gray-800">
                                                            {option.title}
                                                        </span>

                                                        {active && (
                                                            <span className="text-xs font-medium text-blue-600">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                                        {option.description}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </InspectorSection>
                            )}

                        {/* ==================================================
    GRID CONTROLS
================================================== */}

                        {(node.type === "page" ||
                            node.type === "section" ||
                            node.type === "container" ||
                            node.type === "navbar") &&
                            getStyleValue("layoutMode") === "grid" && (
                                <InspectorSection title="Grid">
                                    <GridControls
                                        columns={(() => {
                                            const value =
                                                getStyleValue("gridTemplateColumns");
                                            const match =
                                                value?.match(/repeat\(\s*(\d+)/);
                                            return match ? Number(match[1]) : 3;
                                        })()}
                                        rows={
                                            getStyleValue("gridTemplateRows") ||
                                            "repeat(2, minmax(0, auto))"
                                        }
                                        columnGap={
                                            parseInt(
                                                getStyleValue("columnGap") || "20",
                                                10
                                            ) || 0
                                        }
                                        rowGap={
                                            parseInt(
                                                getStyleValue("rowGap") || "20",
                                                10
                                            ) || 0
                                        }
                                        justifyItems={
                                            getStyleValue("justifyItems") || ""
                                        }
                                        justifyContent={
                                            getStyleValue("justifyContent") || ""
                                        }
                                        alignItems={
                                            getStyleValue("alignItems") || ""
                                        }
                                        alignContent={
                                            getStyleValue("alignContent") || ""
                                        }
                                        onColumnsChange={(value) =>
                                            updateStyle(
                                                "gridTemplateColumns",
                                                `repeat(${value}, minmax(0, 1fr))`
                                            )
                                        }
                                        onRowsChange={(value) =>
                                            updateStyle(
                                                "gridTemplateRows",
                                                value
                                            )
                                        }
                                        onColumnGapChange={(value) =>
                                            updateStyle(
                                                "columnGap",
                                                `${value}px`
                                            )
                                        }
                                        onRowGapChange={(value) =>
                                            updateStyle(
                                                "rowGap",
                                                `${value}px`
                                            )
                                        }
                                        onJustifyItemsChange={(value) =>
                                            updateStyle(
                                                "justifyItems",
                                                value
                                            )
                                        }
                                        onJustifyContentChange={(value) =>
                                            updateStyle(
                                                "justifyContent",
                                                value
                                            )
                                        }
                                        onAlignItemsChange={(value) =>
                                            updateStyle(
                                                "alignItems",
                                                value
                                            )
                                        }
                                        onAlignContentChange={(value) =>
                                            updateStyle(
                                                "alignContent",
                                                value
                                            )
                                        }
                                    />
                                </InspectorSection>
                            )}

                        {/* ==================================================
                            GRID ITEM PLACEMENT
                        ================================================== */}

                        {node && isGridItem && (
                            <InspectorSection title="Grid Item">
                                <div className="grid grid-cols-2 gap-3">
                                    <StyleInput
                                        label="Column Start"
                                        value={getStyleValue("gridColumnStart")}
                                        placeholder="auto"
                                        onChange={(value) =>
                                            updateStyle(
                                                "gridColumnStart",
                                                value
                                            )
                                        }
                                    />

                                    <StyleInput
                                        label="Column End"
                                        value={getStyleValue("gridColumnEnd")}
                                        placeholder="auto"
                                        onChange={(value) =>
                                            updateStyle(
                                                "gridColumnEnd",
                                                value
                                            )
                                        }
                                    />

                                    <StyleInput
                                        label="Row Start"
                                        value={getStyleValue("gridRowStart")}
                                        placeholder="auto"
                                        onChange={(value) =>
                                            updateStyle(
                                                "gridRowStart",
                                                value
                                            )
                                        }
                                    />

                                    <StyleInput
                                        label="Row End"
                                        value={getStyleValue("gridRowEnd")}
                                        placeholder="auto"
                                        onChange={(value) =>
                                            updateStyle(
                                                "gridRowEnd",
                                                value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-gray-500">
                                        Quick Span
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                updateStyle("gridColumnStart", "");
                                                updateStyle("gridColumnEnd", "");
                                            }}
                                            className="rounded-md border bg-white px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                        >
                                            Auto
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                updateStyle("gridColumnStart", "span 2");
                                                updateStyle("gridColumnEnd", "");
                                            }}
                                            className="rounded-md border bg-white px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                        >
                                            Span 2
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                updateStyle("gridColumnStart", "span 3");
                                                updateStyle("gridColumnEnd", "");
                                            }}
                                            className="rounded-md border bg-white px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                        >
                                            Span 3
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        updateStyle("gridColumnStart", "");
                                        updateStyle("gridColumnEnd", "");
                                        updateStyle("gridRowStart", "");
                                        updateStyle("gridRowEnd", "");
                                    }}
                                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    Reset Grid Placement
                                </button>
                            </InspectorSection>
                        )}


                        {/* ==================================================
                            LAYOUT
                        ================================================== */}

                        <InspectorSection
                            title="Layout"
                        >

                            <StyleSelect
                                label="Display"
                                value={
                                    getStyleValue(
                                        "display"
                                    )
                                }
                                options={[
                                    {
                                        label:
                                            "Default",
                                        value:
                                            "",
                                    },
                                    {
                                        label:
                                            "Block",
                                        value:
                                            "block",
                                    },
                                    {
                                        label:
                                            "Inline",
                                        value:
                                            "inline",
                                    },
                                    {
                                        label:
                                            "Inline Block",
                                        value:
                                            "inline-block",
                                    },
                                    {
                                        label:
                                            "Flex",
                                        value:
                                            "flex",
                                    },
                                    {
                                        label:
                                            "Grid",
                                        value:
                                            "grid",
                                    },
                                    {
                                        label:
                                            "None",
                                        value:
                                            "none",
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

                            <StyleSelect
                                label="Visibility"
                                value={
                                    getStyleValue(
                                        "visibility"
                                    ) || ""
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
                                ]}
                                onChange={(value) =>
                                    updateStyle(
                                        "visibility",
                                        value
                                    )
                                }
                            />

                            <DimensionInput
                                label="Width"
                                value={
                                    getStyleValue(
                                        "width"
                                    )
                                }
                                placeholder="auto, 100%, 300px"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "width",
                                        value
                                    )
                                }
                            />

                            <DimensionInput
                                label="Min Width"
                                value={
                                    getStyleValue(
                                        "minWidth"
                                    )
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

                            <DimensionInput
                                label="Max Width"
                                value={
                                    getStyleValue(
                                        "maxWidth"
                                    )
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

                            <DimensionInput
                                label="Height"
                                value={
                                    getStyleValue(
                                        "height"
                                    )
                                }
                                placeholder="auto, 100%, 300px"
                                onChange={(
                                    value
                                ) =>
                                    updateStyle(
                                        "height",
                                        value
                                    )
                                }
                            />

                            <DimensionInput
                                label="Min Height"
                                value={
                                    getStyleValue(
                                        "minHeight"
                                    )
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

                            <DimensionInput
                                label="Max Height"
                                value={
                                    getStyleValue(
                                        "maxHeight"
                                    )
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

                            {/* ==================================================
                                ASPECT RATIO
                            ================================================== */}

                            <StyleSelect
                                label="Aspect Ratio"
                                value={
                                    getStyleValue(
                                        "aspectRatio"
                                    ) || ""
                                }
                                options={[
                                    {
                                        label: "Auto",
                                        value: "",
                                    },
                                    {
                                        label: "1 : 1",
                                        value: "1 / 1",
                                    },
                                    {
                                        label: "4 : 3",
                                        value: "4 / 3",
                                    },
                                    {
                                        label: "3 : 2",
                                        value: "3 / 2",
                                    },
                                    {
                                        label: "16 : 9",
                                        value: "16 / 9",
                                    },
                                    {
                                        label: "21 : 9",
                                        value: "21 / 9",
                                    },
                                    {
                                        label: "Custom",
                                        value: "custom",
                                    },
                                ]}
                                onChange={(value) => {
                                    /*
                                     * Canvas resizing creates explicit width
                                     * and height values. If height remains a
                                     * fixed pixel value, CSS aspect-ratio cannot
                                     * change the element's proportions later.
                                     *
                                     * When an aspect ratio is selected, keep the
                                     * current width but release the explicit
                                     * height so CSS can calculate it from the
                                     * selected ratio.
                                     */
                                    const nextRatio =
                                        value === "custom"
                                            ? "1 / 1"
                                            : value;

                                    if (
                                        nextRatio
                                    ) {
                                        if (
                                            selectedNodeIds.length > 1
                                        ) {
                                            bulkUpdateResponsiveNodeStyles(
                                                selectedNodeIds,
                                                viewport,
                                                {
                                                    aspectRatio:
                                                        nextRatio,
                                                    height:
                                                        "auto",
                                                }
                                            );
                                        } else {
                                            updateResponsiveNodeStyles(
                                                node.id,
                                                viewport,
                                                {
                                                    aspectRatio:
                                                        nextRatio,
                                                    height:
                                                        "auto",
                                                }
                                            );
                                        }
                                        return;
                                    }

                                    /*
                                     * Returning to Auto should restore an
                                     * explicit height based on the element's
                                     * current rendered size, so switching back
                                     * does not unexpectedly collapse the node.
                                     */
                                    const element =
                                        document.querySelector(
                                            `[data-node-id="${node.id}"]`
                                        ) as HTMLElement | null;

                                    const viewportElement =
                                        document.querySelector(
                                            "[data-viewport]"
                                        ) as HTMLElement | null;

                                    const currentHeight =
                                        element?.getBoundingClientRect()
                                            .height;

                                    const viewportWidth =
                                        viewportElement?.getBoundingClientRect()
                                            .width;

                                    const logicalHeight =
                                        currentHeight &&
                                            viewportWidth
                                            ? currentHeight /
                                            (
                                                viewportWidth /
                                                (
                                                    parseFloat(
                                                        viewportElement
                                                            ?.style
                                                            .width || ""
                                                    ) || viewportWidth
                                                )
                                            )
                                            : currentHeight;

                                    const aspectRatioStyles = {
                                        aspectRatio:
                                            "",
                                        height:
                                            logicalHeight &&
                                                Number.isFinite(
                                                    logicalHeight
                                                )
                                                ? `${Math.round(
                                                    logicalHeight
                                                )}px`
                                                : "auto",
                                    };

                                    if (
                                        selectedNodeIds.length > 1
                                    ) {
                                        bulkUpdateResponsiveNodeStyles(
                                            selectedNodeIds,
                                            viewport,
                                            aspectRatioStyles
                                        );
                                    } else {
                                        updateResponsiveNodeStyles(
                                            node.id,
                                            viewport,
                                            aspectRatioStyles
                                        );
                                    }
                                }}
                            />

                            {(() => {
                                const aspectRatio =
                                    getStyleValue(
                                        "aspectRatio"
                                    );

                                const presetRatios = [
                                    "",
                                    "1 / 1",
                                    "4 / 3",
                                    "3 / 2",
                                    "16 / 9",
                                    "21 / 9",
                                ];

                                return (
                                    aspectRatio &&
                                    !presetRatios.includes(
                                        aspectRatio
                                    ) && (
                                        <StyleInput
                                            label="Custom Ratio"
                                            value={
                                                aspectRatio
                                            }
                                            placeholder="16 / 9"
                                            onChange={(value) =>
                                                updateStyle(
                                                    "aspectRatio",
                                                    value
                                                )
                                            }
                                        />
                                    )
                                );
                            })()}

                            <p className="text-[11px] leading-relaxed text-gray-400">
                                Controls the width-to-height proportion of the element.
                            </p>

                            <StyleSelect
                                label="Position"
                                value={
                                    getStyleValue(
                                        "position"
                                    )
                                }
                                options={[
                                    {
                                        label:
                                            "Default",
                                        value:
                                            "",
                                    },
                                    {
                                        label:
                                            "Static",
                                        value:
                                            "static",
                                    },
                                    {
                                        label:
                                            "Relative",
                                        value:
                                            "relative",
                                    },
                                    {
                                        label:
                                            "Absolute",
                                        value:
                                            "absolute",
                                    },
                                    {
                                        label:
                                            "Fixed",
                                        value:
                                            "fixed",
                                    },
                                    {
                                        label:
                                            "Sticky",
                                        value:
                                            "sticky",
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

                            {getStyleValue(
                                "position"
                            ) &&
                                getStyleValue(
                                    "position"
                                ) !==
                                "static" && (
                                    <div className="
                                        grid
                                        grid-cols-2
                                        gap-3
                                    ">

                                        <DimensionInput
                                            label="Top"
                                            value={
                                                getStyleValue(
                                                    "top"
                                                )
                                            }
                                            placeholder="auto, 10px"
                                            onChange={(
                                                value
                                            ) =>
                                                updateStyle(
                                                    "top",
                                                    value
                                                )
                                            }
                                        />

                                        <DimensionInput
                                            label="Left"
                                            value={
                                                getStyleValue(
                                                    "left"
                                                )
                                            }
                                            placeholder="auto, 10px"
                                            onChange={(
                                                value
                                            ) =>
                                                updateStyle(
                                                    "left",
                                                    value
                                                )
                                            }
                                        />

                                        <DimensionInput
                                            label="Right"
                                            value={
                                                getStyleValue(
                                                    "right"
                                                )
                                            }
                                            placeholder="auto, 10px"
                                            onChange={(
                                                value
                                            ) =>
                                                updateStyle(
                                                    "right",
                                                    value
                                                )
                                            }
                                        />

                                        <DimensionInput
                                            label="Bottom"
                                            value={
                                                getStyleValue(
                                                    "bottom"
                                                )
                                            }
                                            placeholder="auto, 10px"
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
                                )}

                        </InspectorSection>

                        {/* ==================================================
                            FLEX CONTAINER
                        ================================================== */}

                        {isFlexContainer && (
                            <InspectorSection
                                title="Flex Layout"
                            >

                                <StyleSelect
                                    label="Direction"
                                    value={
                                        getStyleValue(
                                            "flexDirection"
                                        )
                                    }
                                    options={[
                                        {
                                            label:
                                                "Row",
                                            value:
                                                "row",
                                        },
                                        {
                                            label:
                                                "Row Reverse",
                                            value:
                                                "row-reverse",
                                        },
                                        {
                                            label:
                                                "Column",
                                            value:
                                                "column",
                                        },
                                        {
                                            label:
                                                "Column Reverse",
                                            value:
                                                "column-reverse",
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
                                        getStyleValue(
                                            "justifyContent"
                                        )
                                    }
                                    options={[
                                        {
                                            label:
                                                "Start",
                                            value:
                                                "flex-start",
                                        },
                                        {
                                            label:
                                                "Center",
                                            value:
                                                "center",
                                        },
                                        {
                                            label:
                                                "End",
                                            value:
                                                "flex-end",
                                        },
                                        {
                                            label:
                                                "Space Between",
                                            value:
                                                "space-between",
                                        },
                                        {
                                            label:
                                                "Space Around",
                                            value:
                                                "space-around",
                                        },
                                        {
                                            label:
                                                "Space Evenly",
                                            value:
                                                "space-evenly",
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
                                        getStyleValue(
                                            "alignItems"
                                        )
                                    }
                                    options={[
                                        {
                                            label:
                                                "Stretch",
                                            value:
                                                "stretch",
                                        },
                                        {
                                            label:
                                                "Start",
                                            value:
                                                "flex-start",
                                        },
                                        {
                                            label:
                                                "Center",
                                            value:
                                                "center",
                                        },
                                        {
                                            label:
                                                "End",
                                            value:
                                                "flex-end",
                                        },
                                        {
                                            label:
                                                "Baseline",
                                            value:
                                                "baseline",
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

                                <DimensionInput
                                    label="Gap"
                                    value={
                                        getStyleValue(
                                            "gap"
                                        )
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
                                        getStyleValue(
                                            "flexWrap"
                                        )
                                    }
                                    options={[
                                        {
                                            label:
                                                "No Wrap",
                                            value:
                                                "nowrap",
                                        },
                                        {
                                            label:
                                                "Wrap",
                                            value:
                                                "wrap",
                                        },
                                        {
                                            label:
                                                "Wrap Reverse",
                                            value:
                                                "wrap-reverse",
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

                                <StyleSelect
                                    label="Align Content"
                                    value={
                                        getStyleValue(
                                            "alignContent"
                                        )
                                    }
                                    options={[
                                        {
                                            label:
                                                "Default",
                                            value:
                                                "",
                                        },
                                        {
                                            label:
                                                "Start",
                                            value:
                                                "flex-start",
                                        },
                                        {
                                            label:
                                                "Center",
                                            value:
                                                "center",
                                        },
                                        {
                                            label:
                                                "End",
                                            value:
                                                "flex-end",
                                        },
                                        {
                                            label:
                                                "Stretch",
                                            value:
                                                "stretch",
                                        },
                                        {
                                            label:
                                                "Space Between",
                                            value:
                                                "space-between",
                                        },
                                        {
                                            label:
                                                "Space Around",
                                            value:
                                                "space-around",
                                        },
                                        {
                                            label:
                                                "Space Evenly",
                                            value:
                                                "space-evenly",
                                        },
                                    ]}
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "alignContent",
                                            value
                                        )
                                    }
                                />

                            </InspectorSection>
                        )}

                        {/* ==================================================
                            FLEX ITEM
                        ================================================== */}

                        {isFlexItem && (
                            <InspectorSection
                                title="Flex Item"
                            >

                                <StyleInput
                                    label="Flex Grow"
                                    value={
                                        getStyleValue(
                                            "flexGrow"
                                        )
                                    }
                                    placeholder="0"
                                    type="number"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "flexGrow",
                                            value
                                        )
                                    }
                                />

                                <StyleInput
                                    label="Flex Shrink"
                                    value={
                                        getStyleValue(
                                            "flexShrink"
                                        )
                                    }
                                    placeholder="1"
                                    type="number"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "flexShrink",
                                            value
                                        )
                                    }
                                />

                                <DimensionInput
                                    label="Flex Basis"
                                    value={
                                        getStyleValue(
                                            "flexBasis"
                                        )
                                    }
                                    placeholder="auto, 0, 100px"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "flexBasis",
                                            value
                                        )
                                    }
                                />

                                <StyleSelect
                                    label="Align Self"
                                    value={
                                        getStyleValue(
                                            "alignSelf"
                                        )
                                    }
                                    options={[
                                        {
                                            label:
                                                "Auto",
                                            value:
                                                "auto",
                                        },
                                        {
                                            label:
                                                "Start",
                                            value:
                                                "flex-start",
                                        },
                                        {
                                            label:
                                                "Center",
                                            value:
                                                "center",
                                        },
                                        {
                                            label:
                                                "End",
                                            value:
                                                "flex-end",
                                        },
                                        {
                                            label:
                                                "Stretch",
                                            value:
                                                "stretch",
                                        },
                                        {
                                            label:
                                                "Baseline",
                                            value:
                                                "baseline",
                                        },
                                    ]}
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "alignSelf",
                                            value
                                        )
                                    }
                                />

                                <StyleInput
                                    label="Order"
                                    value={
                                        getStyleValue(
                                            "order"
                                        )
                                    }
                                    placeholder="0"
                                    type="number"
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "order",
                                            value
                                        )
                                    }
                                />

                            </InspectorSection>
                        )}

                        {/* ==================================================
                            MARGIN
                        ================================================== */}

                        <InspectorSection
                            title="Margin"
                        >

                            <BoxModelEditor
                                title="Margin"
                                values={{
                                    top:
                                        getStyleValue(
                                            "marginTop"
                                        ),
                                    right:
                                        getStyleValue(
                                            "marginRight"
                                        ),
                                    bottom:
                                        getStyleValue(
                                            "marginBottom"
                                        ),
                                    left:
                                        getStyleValue(
                                            "marginLeft"
                                        ),
                                }}
                                onChange={(
                                    side,
                                    value
                                ) => {
                                    const propertyMap =
                                        {
                                            top:
                                                "marginTop",
                                            right:
                                                "marginRight",
                                            bottom:
                                                "marginBottom",
                                            left:
                                                "marginLeft",
                                        } as const;

                                    updateStyle(
                                        propertyMap[
                                        side
                                        ],
                                        value
                                    );
                                }}
                            />

                        </InspectorSection>

                        {/* ==================================================
                            PADDING
                        ================================================== */}

                        <InspectorSection
                            title="Padding"
                        >

                            <BoxModelEditor
                                title="Padding"
                                values={{
                                    top:
                                        getStyleValue(
                                            "paddingTop"
                                        ),
                                    right:
                                        getStyleValue(
                                            "paddingRight"
                                        ),
                                    bottom:
                                        getStyleValue(
                                            "paddingBottom"
                                        ),
                                    left:
                                        getStyleValue(
                                            "paddingLeft"
                                        ),
                                }}
                                onChange={(
                                    side,
                                    value
                                ) => {
                                    const propertyMap =
                                        {
                                            top:
                                                "paddingTop",
                                            right:
                                                "paddingRight",
                                            bottom:
                                                "paddingBottom",
                                            left:
                                                "paddingLeft",
                                        } as const;

                                    updateStyle(
                                        propertyMap[
                                        side
                                        ],
                                        value
                                    );
                                }}
                            />

                        </InspectorSection>

                        {/* ==================================================
    TYPOGRAPHY
================================================== */}

                        <InspectorSection title="Typography">

                            {/* FONT FAMILY */}

                            <StyleSelect
                                label="Font Family"
                                value={
                                    getStyleValue("fontFamily")
                                }
                                options={[
                                    {
                                        label: "Default",
                                        value: "",
                                    },
                                    {
                                        label: "Arial",
                                        value: "Arial, sans-serif",
                                    },
                                    {
                                        label: "Inter",
                                        value: "Inter, sans-serif",
                                    },
                                    {
                                        label: "Roboto",
                                        value: "Roboto, sans-serif",
                                    },
                                    {
                                        label: "Poppins",
                                        value: "Poppins, sans-serif",
                                    },
                                    {
                                        label: "Georgia",
                                        value: "Georgia, serif",
                                    },
                                    {
                                        label: "Times New Roman",
                                        value: '"Times New Roman", serif',
                                    },
                                    {
                                        label: "Courier New",
                                        value: '"Courier New", monospace',
                                    },
                                ]}
                                onChange={(value) =>
                                    updateStyle(
                                        "fontFamily",
                                        value
                                    )
                                }
                            />

                            {/* FONT SIZE */}

                            <DimensionInput
                                label="Font Size"
                                value={
                                    getStyleValue("fontSize")
                                }
                                placeholder="16px"
                                onChange={(value) =>
                                    updateStyle(
                                        "fontSize",
                                        value
                                    )
                                }
                            />

                            {/* FONT WEIGHT */}

                            <StyleSelect
                                label="Font Weight"
                                value={
                                    getStyleValue("fontWeight")
                                }
                                options={[
                                    {
                                        label: "Default",
                                        value: "",
                                    },
                                    {
                                        label: "Thin (100)",
                                        value: "100",
                                    },
                                    {
                                        label: "Extra Light (200)",
                                        value: "200",
                                    },
                                    {
                                        label: "Light (300)",
                                        value: "300",
                                    },
                                    {
                                        label: "Normal (400)",
                                        value: "400",
                                    },
                                    {
                                        label: "Medium (500)",
                                        value: "500",
                                    },
                                    {
                                        label: "Semi Bold (600)",
                                        value: "600",
                                    },
                                    {
                                        label: "Bold (700)",
                                        value: "700",
                                    },
                                    {
                                        label: "Extra Bold (800)",
                                        value: "800",
                                    },
                                    {
                                        label: "Black (900)",
                                        value: "900",
                                    },
                                ]}
                                onChange={(value) =>
                                    updateStyle(
                                        "fontWeight",
                                        value
                                    )
                                }
                            />

                            {/* LINE HEIGHT */}

                            <StyleSelect
                                label="Line Height"
                                value={
                                    getStyleValue("lineHeight")
                                }
                                options={[
                                    {
                                        label: "Default",
                                        value: "",
                                    },
                                    {
                                        label: "Normal",
                                        value: "normal",
                                    },
                                    {
                                        label: "Tight (1.2)",
                                        value: "1.2",
                                    },
                                    {
                                        label: "Normal (1.5)",
                                        value: "1.5",
                                    },
                                    {
                                        label: "Relaxed (1.75)",
                                        value: "1.75",
                                    },
                                    {
                                        label: "Double (2)",
                                        value: "2",
                                    },
                                ]}
                                onChange={(value) =>
                                    updateStyle(
                                        "lineHeight",
                                        value
                                    )
                                }
                            />

                            {/* CUSTOM LINE HEIGHT */}

                            <DimensionInput
                                label="Custom Line Height"
                                value={
                                    getStyleValue("lineHeight")
                                }
                                placeholder="1.5, 24px"
                                onChange={(value) =>
                                    updateStyle(
                                        "lineHeight",
                                        value
                                    )
                                }
                            />

                            {/* LETTER SPACING */}

                            <StyleSelect
                                label="Letter Spacing"
                                value={
                                    getStyleValue("letterSpacing")
                                }
                                options={[
                                    {
                                        label: "Default",
                                        value: "",
                                    },
                                    {
                                        label: "Tight",
                                        value: "-0.05em",
                                    },
                                    {
                                        label: "Slightly Tight",
                                        value: "-0.025em",
                                    },
                                    {
                                        label: "Normal",
                                        value: "normal",
                                    },
                                    {
                                        label: "Slightly Wide",
                                        value: "0.025em",
                                    },
                                    {
                                        label: "Wide",
                                        value: "0.05em",
                                    },
                                    {
                                        label: "Very Wide",
                                        value: "0.1em",
                                    },
                                ]}
                                onChange={(value) =>
                                    updateStyle(
                                        "letterSpacing",
                                        value
                                    )
                                }
                            />

                            {/* CUSTOM LETTER SPACING */}

                            <DimensionInput
                                label="Custom Letter Spacing"
                                value={
                                    getStyleValue(
                                        "letterSpacing"
                                    )
                                }
                                placeholder="0px"
                                onChange={(value) =>
                                    updateStyle(
                                        "letterSpacing",
                                        value
                                    )
                                }
                            />

                            {/* TEXT ALIGN */}

                            <StyleSelect
                                label="Text Align"
                                value={
                                    getStyleValue("textAlign")
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
                                onChange={(value) =>
                                    updateStyle(
                                        "textAlign",
                                        value
                                    )
                                }
                            />

                            {/* TEXT TRANSFORM */}

                            <StyleSelect
                                label="Text Transform"
                                value={
                                    getStyleValue(
                                        "textTransform"
                                    )
                                }
                                options={[
                                    {
                                        label: "None",
                                        value: "",
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
                                onChange={(value) =>
                                    updateStyle(
                                        "textTransform",
                                        value
                                    )
                                }
                            />

                            {/* TEXT DECORATION */}

                            <StyleSelect
                                label="Text Decoration"
                                value={
                                    getStyleValue(
                                        "textDecoration"
                                    )
                                }
                                options={[
                                    {
                                        label: "None",
                                        value: "",
                                    },
                                    {
                                        label: "Underline",
                                        value: "underline",
                                    },
                                    {
                                        label: "Line Through",
                                        value: "line-through",
                                    },
                                    {
                                        label: "Overline",
                                        value: "overline",
                                    },
                                ]}
                                onChange={(value) =>
                                    updateStyle(
                                        "textDecoration",
                                        value
                                    )
                                }
                            />

                        </InspectorSection>

                        {/* ==================================================
                            COLORS & BACKGROUND
                        ================================================== */}

                        <InspectorSection
                            title="Colors & Background"
                        >

                            {/* TEXT COLOR */}

                            <ColorInput
                                label="Text Color"
                                value={
                                    getStyleValue(
                                        "color"
                                    )
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

                            <DesignTokenColorControl
                                value={getStyleValue("color")}
                                onChange={(value) =>
                                    updateStyle(
                                        "color",
                                        value
                                    )
                                }
                            />

                            {/* BACKGROUND TYPE */}

                            <StyleSelect
                                label="Background Type"
                                value={
                                    hasGradient
                                        ? "gradient"
                                        : hasBackgroundImage
                                            ? "image"
                                            : "solid"
                                }
                                options={[
                                    {
                                        label: "Solid Color",
                                        value: "solid",
                                    },
                                    {
                                        label: "Gradient",
                                        value: "gradient",
                                    },
                                    {
                                        label: "Image",
                                        value: "image",
                                    },
                                ]}
                                onChange={(value) => {
                                    if (value === "gradient") {
                                        updateStyle(
                                            "backgroundImage",
                                            "linear-gradient(90deg, #ff0000, #0000ff)"
                                        );
                                    } else if (value === "image") {
                                        updateStyle(
                                            "backgroundImage",
                                            "url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80)"
                                        );
                                        updateStyle("backgroundSize", "cover");
                                        updateStyle("backgroundPosition", "center");
                                        updateStyle("backgroundRepeat", "no-repeat");
                                        updateStyle("backgroundAttachment", "scroll");
                                    } else {
                                        updateStyle(
                                            "backgroundImage",
                                            ""
                                        );
                                    }
                                }}
                            />

                            {/* SOLID COLOR */}

                            {!hasGradient && (
                                <>
                                    <ColorInput
                                        label="Background Color"
                                        value={
                                            getStyleValue(
                                                "backgroundColor"
                                            )
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

                                    <DesignTokenColorControl
                                        value={getStyleValue("backgroundColor")}
                                        onChange={(value) =>
                                            updateStyle(
                                                "backgroundColor",
                                                value
                                            )
                                        }
                                    />
                                </>
                            )}

                            {/* GRADIENT */}

                            {hasGradient && (
                                <GradientBuilder
                                    value={
                                        currentBackgroundImage
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateStyle(
                                            "backgroundImage",
                                            value
                                        )
                                    }
                                />
                            )}

                            {hasBackgroundImage && (
                                <>
                                    <input
                                        ref={backgroundImageInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (!file) return;

                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                const result = reader.result;
                                                if (typeof result !== "string") return;

                                                const asset: ProjectAsset = {
                                                    id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                                                    name: file.name,
                                                    type: file.type,
                                                    size: file.size,
                                                    source: result,
                                                };

                                                addAsset(asset);
                                                updateStyle(
                                                    "backgroundImage",
                                                    `url(${result})`
                                                );
                                            };
                                            reader.readAsDataURL(file);
                                            event.target.value = "";
                                        }}
                                    />

                                    <BackgroundImageControls
                                        imageUrl={backgroundImageUrl}
                                        size={getStyleValue("backgroundSize")}
                                        position={getStyleValue("backgroundPosition")}
                                        repeat={getStyleValue("backgroundRepeat")}
                                        attachment={getStyleValue("backgroundAttachment")}
                                        assets={Object.values(project.assets)}
                                        onImageUrlChange={(value) =>
                                            updateStyle(
                                                "backgroundImage",
                                                value ? `url(${value})` : ""
                                            )
                                        }
                                        onImportFromPC={() =>
                                            backgroundImageInputRef.current?.click()
                                        }
                                        onOpenAssetLibrary={() =>
                                            setShowBackgroundAssetLibrary((current) => !current)
                                        }
                                        onSelectAsset={(asset) =>
                                            updateStyle(
                                                "backgroundImage",
                                                `url(${asset.source})`
                                            )
                                        }
                                        onSizeChange={(value) =>
                                            updateStyle("backgroundSize", value)
                                        }
                                        onPositionChange={(value) =>
                                            updateStyle("backgroundPosition", value)
                                        }
                                        onRepeatChange={(value) =>
                                            updateStyle("backgroundRepeat", value)
                                        }
                                        onAttachmentChange={(value) =>
                                            updateStyle("backgroundAttachment", value)
                                        }
                                    />

                                    {showBackgroundAssetLibrary && (
                                        <div className="mt-3 rounded-lg border bg-white p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-600">
                                                    Asset Library
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowBackgroundAssetLibrary(false)}
                                                    className="text-xs text-gray-400 hover:text-gray-600"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                            {Object.values(project.assets).filter((asset) => asset.type.startsWith("image/")).length === 0 ? (
                                                <p className="text-xs text-gray-400">
                                                    No images in your asset library yet.
                                                </p>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-2">
                                                    {Object.values(project.assets)
                                                        .filter((asset) => asset.type.startsWith("image/"))
                                                        .map((asset) => (
                                                            <button
                                                                key={asset.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    updateStyle(
                                                                        "backgroundImage",
                                                                        `url(${asset.source})`
                                                                    );
                                                                    setShowBackgroundAssetLibrary(false);
                                                                }}
                                                                title={asset.name}
                                                                className="overflow-hidden rounded-md border bg-gray-50 text-left transition hover:border-blue-400"
                                                            >
                                                                <img
                                                                    src={asset.source}
                                                                    alt={asset.name}
                                                                    className="h-16 w-full object-cover"
                                                                />
                                                                <span className="block truncate px-1.5 py-1 text-[10px] text-gray-500">
                                                                    {asset.name}
                                                                </span>
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* OPACITY */}

                            <StyleInput
                                label="Opacity"
                                value={
                                    getStyleValue(
                                        "opacity"
                                    )
                                }
                                placeholder="1"
                                type="number"
                                min="0"
                                max="1"
                                step="0.01"
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

                        <InspectorSection
                            title="Border"
                        >

                            <StyleSelect
                                label="Style"
                                value={
                                    getStyleValue(
                                        "borderStyle"
                                    )
                                }
                                options={[
                                    {
                                        label:
                                            "None",
                                        value:
                                            "none",
                                    },
                                    {
                                        label:
                                            "Solid",
                                        value:
                                            "solid",
                                    },
                                    {
                                        label:
                                            "Dashed",
                                        value:
                                            "dashed",
                                    },
                                    {
                                        label:
                                            "Dotted",
                                        value:
                                            "dotted",
                                    },
                                    {
                                        label:
                                            "Double",
                                        value:
                                            "double",
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

                            <DimensionInput
                                label="Width"
                                value={
                                    getStyleValue(
                                        "borderWidth"
                                    )
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
                                    getStyleValue(
                                        "borderColor"
                                    )
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

                            <DimensionInput
                                label="Radius"
                                value={
                                    getStyleValue(
                                        "borderRadius"
                                    )
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

                            <BorderSideEditor
                                getStyleValue={
                                    getStyleValue
                                }
                                updateStyle={
                                    updateStyle
                                }
                            />

                        </InspectorSection>

                        {/* ==================================================
    TRANSFORM
================================================== */}

                        <InspectorSection title="Transform">

                            {/* ROTATE */}

                            <TransformInput
                                label="Rotate"
                                value={
                                    (() => {
                                        const transform =
                                            getStyleValue(
                                                "transform"
                                            );

                                        const match =
                                            transform?.match(
                                                /rotate\((-?\d+(?:\.\d+)?)deg\)/
                                            );

                                        return match?.[1] || "0";
                                    })()
                                }
                                unit="deg"
                                min={-360}
                                max={360}
                                onChange={(value) => {
                                    const transform =
                                        getStyleValue(
                                            "transform"
                                        ) || "";

                                    const withoutRotate =
                                        transform
                                            .replace(
                                                /rotate\((-?\d+(?:\.\d+)?)deg\)/,
                                                ""
                                            )
                                            .trim();

                                    updateStyle(
                                        "transform",
                                        `${withoutRotate} rotate(${value || 0}deg)`.trim()
                                    );
                                }}
                            />

                            {/* SCALE */}

                            <TransformInput
                                label="Scale"
                                value={
                                    (() => {
                                        const transform =
                                            getStyleValue(
                                                "transform"
                                            );

                                        const match =
                                            transform?.match(
                                                /scale\((-?\d+(?:\.\d+)?)\)/
                                            );

                                        if (!match) {
                                            return "1";
                                        }

                                        return match[1];
                                    })()
                                }
                                unit="×"
                                min={0}
                                max={5}
                                step={0.1}
                                onChange={(value) => {
                                    const transform =
                                        getStyleValue(
                                            "transform"
                                        ) || "";

                                    const withoutScale =
                                        transform
                                            .replace(
                                                /scale\((-?\d+(?:\.\d+)?)\)/,
                                                ""
                                            )
                                            .trim();

                                    updateStyle(
                                        "transform",
                                        `${withoutScale} scale(${value || 1})`.trim()
                                    );
                                }}
                            />

                            {/* TRANSLATE X / Y */}

                            <div className="
        grid
        grid-cols-2
        gap-3
    ">

                                <TransformInput
                                    label="Move X"
                                    value={
                                        (() => {
                                            const transform =
                                                getStyleValue(
                                                    "transform"
                                                );

                                            const match =
                                                transform?.match(
                                                    /translateX\((-?\d+(?:\.\d+)?)px\)/
                                                );

                                            return match?.[1] || "0";
                                        })()
                                    }
                                    unit="px"
                                    onChange={(value) => {
                                        const transform =
                                            getStyleValue(
                                                "transform"
                                            ) || "";

                                        const withoutTranslateX =
                                            transform
                                                .replace(
                                                    /translateX\((-?\d+(?:\.\d+)?)px\)/,
                                                    ""
                                                )
                                                .trim();

                                        updateStyle(
                                            "transform",
                                            `${withoutTranslateX} translateX(${value || 0}px)`.trim()
                                        );
                                    }}
                                />

                                <TransformInput
                                    label="Move Y"
                                    value={
                                        (() => {
                                            const transform =
                                                getStyleValue(
                                                    "transform"
                                                );

                                            const match =
                                                transform?.match(
                                                    /translateY\((-?\d+(?:\.\d+)?)px\)/
                                                );

                                            return match?.[1] || "0";
                                        })()
                                    }
                                    unit="px"
                                    onChange={(value) => {
                                        const transform =
                                            getStyleValue(
                                                "transform"
                                            ) || "";

                                        const withoutTranslateY =
                                            transform
                                                .replace(
                                                    /translateY\((-?\d+(?:\.\d+)?)px\)/,
                                                    ""
                                                )
                                                .trim();

                                        updateStyle(
                                            "transform",
                                            `${withoutTranslateY} translateY(${value || 0}px)`.trim()
                                        );
                                    }}
                                />

                            </div>

                            {/* SKEW X / Y */}

                            <div className="
        grid
        grid-cols-2
        gap-3
    ">

                                <TransformInput
                                    label="Skew X"
                                    value={
                                        (() => {
                                            const transform =
                                                getStyleValue(
                                                    "transform"
                                                );

                                            const match =
                                                transform?.match(
                                                    /skewX\((-?\d+(?:\.\d+)?)deg\)/
                                                );

                                            return match?.[1] || "0";
                                        })()
                                    }
                                    unit="deg"
                                    min={-90}
                                    max={90}
                                    onChange={(value) => {
                                        const transform =
                                            getStyleValue(
                                                "transform"
                                            ) || "";

                                        const withoutSkewX =
                                            transform
                                                .replace(
                                                    /skewX\((-?\d+(?:\.\d+)?)deg\)/,
                                                    ""
                                                )
                                                .trim();

                                        updateStyle(
                                            "transform",
                                            `${withoutSkewX} skewX(${value || 0}deg)`.trim()
                                        );
                                    }}
                                />

                                <TransformInput
                                    label="Skew Y"
                                    value={
                                        (() => {
                                            const transform =
                                                getStyleValue(
                                                    "transform"
                                                ) || "";

                                            const match =
                                                transform.match(
                                                    /skewY\((-?\d+(?:\.\d+)?)deg\)/
                                                );

                                            return match?.[1] || "0";
                                        })()
                                    }
                                    unit="deg"
                                    min={-90}
                                    max={90}
                                    onChange={(value) => {
                                        const transform =
                                            getStyleValue(
                                                "transform"
                                            ) || "";

                                        const withoutSkewY =
                                            transform
                                                .replace(
                                                    /skewY\((-?\d+(?:\.\d+)?)deg\)/,
                                                    ""
                                                )
                                                .trim();

                                        updateStyle(
                                            "transform",
                                            `${withoutSkewY} skewY(${value || 0}deg)`.trim()
                                        );
                                    }}
                                />

                            </div>

                            {/* RESET */}

                            <button
                                type="button"
                                onClick={() =>
                                    updateStyle(
                                        "transform",
                                        ""
                                    )
                                }
                                className="
            w-full
            rounded-md
            border
            px-3
            py-2
            text-sm
            font-medium
            text-gray-500
            transition
            hover:bg-gray-50
        "
                            >
                                Reset Transform
                            </button>

                        </InspectorSection>


                        {/* ==================================================
    FILTERS
================================================== */}

                        <InspectorSection title="Filters">

                            <FilterEditor
                                value={
                                    getStyleValue(
                                        "filter"
                                    )
                                }
                                onChange={(value) =>
                                    updateStyle(
                                        "filter",
                                        value
                                    )
                                }
                            />

                        </InspectorSection>


                        {/* ==================================================
    BACKDROP FILTERS
================================================== */}

                        <InspectorSection title="Backdrop Filters">

                            <FilterEditor
                                value={
                                    getStyleValue(
                                        "backdropFilter"
                                    )
                                }
                                onChange={(value) =>
                                    updateStyle(
                                        "backdropFilter",
                                        value
                                    )
                                }
                                backdrop
                            />

                        </InspectorSection>


                        {/* ==================================================
    TRANSITION
================================================== */}

                        <InspectorSection title="Transition">
                            <TransitionEditor
                                value={getStyleValue("transition")}
                                onChange={(value) =>
                                    updateStyle(
                                        "transition",
                                        value
                                    )
                                }
                            />
                        </InspectorSection>


                        {/* ==================================================
    ANIMATION
================================================== */}

                        <InspectorSection title="Animation">
                            <AnimationEditor
                                value={getStyleValue("animation")}
                                trigger={getStyleValue("animationTrigger")}
                                onChange={(value) =>
                                    updateStyle(
                                        "animation",
                                        value
                                    )
                                }
                                onTriggerChange={(value) =>
                                    updateStyle(
                                        "animationTrigger",
                                        value
                                    )
                                }
                            />
                        </InspectorSection>




                        {/* ==================================================
                            SHADOW
                        ================================================== */}

                        <InspectorSection
                            title="Shadow"
                        >
                            <StyleSelect
                                label="Preset"
                                value={
                                    getStyleValue(
                                        "boxShadow"
                                    )
                                }
                                options={[
                                    {
                                        label:
                                            "None",
                                        value:
                                            "none",
                                    },
                                    {
                                        label:
                                            "Small",
                                        value:
                                            "0 1px 3px rgba(0,0,0,0.12)",
                                    },
                                    {
                                        label:
                                            "Medium",
                                        value:
                                            "0 4px 12px rgba(0,0,0,0.15)",
                                    },
                                    {
                                        label:
                                            "Large",
                                        value:
                                            "0 10px 30px rgba(0,0,0,0.18)",
                                    },
                                    {
                                        label:
                                            "Extra Large",
                                        value:
                                            "0 20px 50px rgba(0,0,0,0.2)",
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

                            <ShadowEditor
                                value={
                                    getStyleValue(
                                        "boxShadow"
                                    )
                                }
                                onChange={(value) =>
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

                        <InspectorSection
                            title="Overflow"
                        >

                            <StyleSelect
                                label="Overflow"
                                value={
                                    getStyleValue(
                                        "overflow"
                                    )
                                }
                                options={[
                                    {
                                        label:
                                            "Default",
                                        value:
                                            "",
                                    },
                                    {
                                        label:
                                            "Visible",
                                        value:
                                            "visible",
                                    },
                                    {
                                        label:
                                            "Hidden",
                                        value:
                                            "hidden",
                                    },
                                    {
                                        label:
                                            "Auto",
                                        value:
                                            "auto",
                                    },
                                    {
                                        label:
                                            "Scroll",
                                        value:
                                            "scroll",
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
                            ADVANCED
                        ================================================== */}

                        <InspectorSection
                            title="Advanced"
                        >

                            <StyleInput
                                label="Z Index"
                                value={
                                    getStyleValue(
                                        "zIndex"
                                    )
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
                                    getStyleValue(
                                        "cursor"
                                    )
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
