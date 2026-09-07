"use client";

import { useEffect, useRef, useState } from "react";

import PageManager from "./PageManager";
import LeftPanel from "./LeftPanel";
import Canvas from "./Canvas";
import RightPanel from "./RightPanel";
import { DesignTokenManager } from "./design-tokens";
import { MultiSelectionBar } from "./multi-select";
import { ReusableStyleManager } from "./reusable-styles";
import { mergeReusableStyleClasses } from "./reusable-styles/styleClassUtils";
import { createTokenVariableMap } from "./design-tokens/tokenUtils";

import { useEditorStore } from "@/store/editorStore";
import {
    downloadProject,
    isProject,
    loadSavedProject,
    saveProject,
} from "@/model/projectPersistence";

import {
    BreakpointId,
    Project,
    ProjectNode,
} from "@/model/type";
import { defaultProject } from "@/model/defaultProject";

/* =========================================================
   DEVTOOLS STORE ACCESS
========================================================= */

if (typeof window !== "undefined") {
    (window as Window & { useEditorStore?: typeof useEditorStore }).useEditorStore =
        useEditorStore;
}

/* =========================================================
   VIEWPORT TYPES
========================================================= */

export type ViewportType =
    BreakpointId;

export interface ViewportConfig {
    label: string;
    width: number;
}

/* =========================================================
   VIEWPORT CONFIGURATION
========================================================= */

export const VIEWPORTS: Record<
    ViewportType,
    ViewportConfig
> = {
    desktop: {
        label: "Desktop",
        width: 1200,
    },

    tablet: {
        label: "Tablet",
        width: 768,
    },

    mobile: {
        label: "Mobile",
        width: 390,
    },
};

/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
    value: string
): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   CSS PROPERTY CONVERSION
========================================================= */

function cssPropertyName(
    property: string
): string {
    return property.replace(
        /[A-Z]/g,
        (letter) =>
            `-${letter.toLowerCase()}`
    );
}

/* =========================================================
   ANIMATION PROPERTIES
========================================================= */

/*
 * Preview must resolve styles exactly as Canvas does. The
 * inspector writes edits into the current breakpoint override,
 * including desktop, rather than directly to node.styles.
 */
function getPreviewResolvedStyles(
    project: Project,
    node: ProjectNode,
    viewport: ViewportType
) {
    /*
     * Preview must resolve the exact same style layers as Canvas:
     *
     * 1. reusable style classes
     * 2. node-local base styles
     * 3. reusable class responsive styles
     * 4. node-local responsive styles
     *
     * Node-local styles intentionally win over reusable classes.
     */
    const classStyles = mergeReusableStyleClasses(
        node,
        project.reusableStyles
    );

    const baseStyles = {
        ...(classStyles ?? {}),
        ...(node.styles ?? {}),
    };

    delete (
        baseStyles as typeof baseStyles & {
            responsive?: unknown;
        }
    ).responsive;

    const reusableResponsiveStyles =
        classStyles?.responsive?.[viewport] ?? {};

    const nodeResponsiveStyles =
        node.styles?.responsive?.[viewport] ?? {};

    return {
        ...baseStyles,
        ...reusableResponsiveStyles,
        ...nodeResponsiveStyles,
    };
}

/* =========================================================
   DESIGN TOKEN PREVIEW VARIABLES
========================================================= */

function createPreviewDesignTokenCss(
    project: Project
): string {
    const variables = createTokenVariableMap(
        project.designTokens ?? {}
    );

    return Object.entries(variables)
        .map(
            ([name, value]) =>
                `${name}:${String(value).replace(
                    /<\/style/gi,
                    "<\\/style"
                )};`
        )
        .join("\n");
}

function getAnimationValue(
    project: Project,
    node: ProjectNode,
    viewport: ViewportType
): string {
    const value =
        getPreviewResolvedStyles(
            project,
            node,
            viewport
        ).animation;

    if (
        typeof value !== "string" ||
        !value.trim()
    ) {
        return "none";
    }

    return value.trim();
}

/* =========================================================
   ANIMATION TRIGGER
========================================================= */

function getAnimationTrigger(
    project: Project,
    node: ProjectNode,
    viewport: ViewportType
): string {
    const trigger =
        getPreviewResolvedStyles(
            project,
            node,
            viewport
        ).animationTrigger;

    if (
        typeof trigger !== "string"
    ) {
        return "load";
    }

    if (
        trigger === "hover" ||
        trigger === "click" ||
        trigger === "focus"
    ) {
        return trigger;
    }

    return "load";
}

/* =========================================================
   PREVIEW ANIMATION CLASS
========================================================= */

function getPreviewAnimationClass(
    node: ProjectNode
): string {
    const safeNodeId =
        String(node.id)
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "-"
            );

    return `preview-animation-${safeNodeId}`;
}

/* =========================================================
   STYLE SERIALIZATION
========================================================= */

function serializeStyles(
    project: Project,
    node: ProjectNode,
    viewport: ViewportType
): string {
    const resolvedStyles =
        getPreviewResolvedStyles(
            project,
            node,
            viewport
        );

    /*
     * Canvas uses height:auto whenever an aspect ratio is active
     * so the browser derives height from width. Preview must do
     * the same instead of reusing a stale explicit pixel height.
     */
    const styles = {
        ...resolvedStyles,
        ...(resolvedStyles.aspectRatio
            ? {
                height: "auto",
            }
            : {}),
    } as Record<string, unknown>;

    /*
     * These are model metadata rather than CSS properties.
     * Canvas handles them separately, so Preview must not emit
     * invalid declarations such as "href:" or "target:".
     */
    const nonCssProperties = new Set([
        "responsive",
        "animation",
        "animationTrigger",
        "href",
        "target",
        "alt",
    ]);

    return Object.entries(styles)
        .filter(
            ([property]) =>
                !nonCssProperties.has(property)
        )
        .map(
            ([property, value]) => {
                if (
                    value === undefined ||
                    value === null ||
                    value === ""
                ) {
                    return "";
                }

                /*
                 * Canvas uses Tailwind's border baseline: borders are
                 * solid by default, but have zero width until the model
                 * explicitly supplies a width. Preview is a separate
                 * document, so make that same rule explicit instead of
                 * allowing the browser's native button border to leak in.
                 */
                if (
                    property === "borderStyle" &&
                    typeof value === "string" &&
                    value === "none"
                ) {
                    return "border-style:none";
                }

                return `${cssPropertyName(
                    property
                )}:${escapeHtml(
                    String(value)
                )}`;
            }
        )
        .filter(Boolean)
        .join(";");
}

/* =========================================================
   URL VALIDATION
========================================================= */

function getSafeUrl(
    value?: string
): string {
    if (!value) {
        return "";
    }

    const trimmed =
        value.trim();

    if (
        trimmed.startsWith("/") ||
        trimmed.startsWith("#") ||
        trimmed.startsWith("./") ||
        trimmed.startsWith("../") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("mailto:") ||
        trimmed.startsWith("tel:")
    ) {
        return trimmed;
    }

    return "";
}

/* =========================================================
   INPUT TYPE VALIDATION
========================================================= */

function getSafeInputType(
    value?: string
): string {
    const allowed = new Set([
        "text",
        "email",
        "password",
        "number",
        "tel",
        "url",
        "search",
        "date",
        "time",
    ]);

    return value && allowed.has(value)
        ? value
        : "text";
}

/* =========================================================
   IMAGE SOURCE
========================================================= */

function getImageSource(
    project: Project,
    node: ProjectNode
): string {
    const sourceValue = node.assetId
        ? project.assets[node.assetId]?.source
        : node.content;

    if (!sourceValue) {
        return "";
    }

    const source =
        sourceValue.trim();

    if (
        source.startsWith(
            "data:image/"
        )
    ) {
        return source;
    }

    if (
        source.startsWith(
            "https://"
        ) ||
        source.startsWith(
            "http://"
        ) ||
        source.startsWith("/")
    ) {
        return source;
    }

    return "";
}

/* =========================================================
   PREVIEW ANIMATION CSS
========================================================= */

function createPreviewAnimationCss(
    project: Project,
    viewport: ViewportType
): string {
    const animationRules: string[] =
        [];

    Object.values(
        project.nodes
    ).forEach(
        (node) => {
            const animation =
                getAnimationValue(
                    project,
                    node,
                    viewport
                );

            if (
                !animation ||
                animation === "none"
            ) {
                return;
            }

            const trigger =
                getAnimationTrigger(
                    project,
                    node,
                    viewport
                );

            const animationClass =
                getPreviewAnimationClass(
                    node
                );

            if (
                trigger === "hover"
            ) {
                animationRules.push(`
                    .${animationClass}:hover {
                        animation: ${animation};
                    }
                `);
            } else if (
                trigger === "focus"
            ) {
                animationRules.push(`
                    .${animationClass}:focus {
                        animation: ${animation};
                    }
                `);
            } else if (
                trigger === "load"
            ) {
                animationRules.push(`
                    .${animationClass} {
                        animation: ${animation};
                    }
                `);
            }
        }
    );

    return animationRules.join("\n");
}

/* =========================================================
   ANIMATION KEYFRAMES
========================================================= */

const ANIMATION_KEYFRAMES = `
/* =========================================================
   VISUAL WEB BUILDER ANIMATIONS
========================================================= */

@keyframes vwb-fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes vwb-fade-out {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

@keyframes vwb-slide-up {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes vwb-slide-down {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes vwb-slide-left {
    from {
        opacity: 0;
        transform: translateX(30px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes vwb-slide-right {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes vwb-zoom-in {
    from {
        opacity: 0;
        transform: scale(0.8);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes vwb-zoom-out {
    from {
        opacity: 0;
        transform: scale(1.2);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes vwb-bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-20px);
    }

    60% {
        transform: translateY(-10px);
    }
}

@keyframes vwb-pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

@keyframes vwb-shake {
    0%,
    100% {
        transform: translateX(0);
    }

    20% {
        transform: translateX(-8px);
    }

    40% {
        transform: translateX(8px);
    }

    60% {
        transform: translateX(-8px);
    }

    80% {
        transform: translateX(8px);
    }
}

@keyframes vwb-spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
`;

/* =========================================================
   PREVIEW NODE RENDERER
========================================================= */

function renderPreviewNode(
    project: Project,
    nodeId: string,
    viewport: ViewportType
): string {
    const node =
        project.nodes[nodeId];

    if (!node) {
        return "";
    }

    /* =====================================================
       NORMAL STYLES
    ===================================================== */

    const styles =
        serializeStyles(
            project,
            node,
            viewport
        );

    const styleAttribute =
        styles
            ? ` style="${styles}"`
            : "";

    /* =====================================================
       ANIMATION
    ===================================================== */

    const animation =
        getAnimationValue(
            project,
            node,
            viewport
        );

    const animationTrigger =
        getAnimationTrigger(
            project,
            node,
            viewport
        );

    const hasAnimation =
        animation !== "none" &&
        animation.trim() !== "";

    const animationClass =
        hasAnimation
            ? getPreviewAnimationClass(
                node
            )
            : "";

    const classAttribute =
        animationClass
            ? ` class="${animationClass}"`
            : "";

    const accordionRoleAttribute = node.accordionRole
        ? ` data-accordion-role="${escapeHtml(node.accordionRole)}"`
        : "";

    const animationTriggerAttribute =
        hasAnimation &&
            (animationTrigger === "click" || animationTrigger === "scroll")
            ? ` data-animation-trigger="${animationTrigger}" data-animation-value="${escapeHtml(animation)}"`
            : "";

    const focusableAttribute =
        hasAnimation &&
            animationTrigger === "focus"
            ? ' tabindex="0"'
            : "";

    /*
     * IMPORTANT:
     *
     * Hover animations are controlled
     * by CSS :hover in Preview.
     *
     * Load animations are also controlled
     * by CSS on the generated element.
     *
     * The trigger itself is not written
     * into the normal inline style.
     */

    /* =====================================================
       TEXT
    ===================================================== */

    if (node.type === "text") {
        const allowedTextElements = new Set([
            "p",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "blockquote",
            "span",
        ]);
        const textElement =
            node.textElement &&
                allowedTextElements.has(node.textElement)
                ? node.textElement
                : "div";

        return `
            <${textElement}${classAttribute}${animationTriggerAttribute}${focusableAttribute}${styleAttribute}>
                ${escapeHtml(
            node.content ?? ""
        )}
            </${textElement}>
        `;
    }

    /* =====================================================
       ICON
    ===================================================== */

    if (node.type === "icon") {
        const iconName = escapeHtml(node.iconName || "star");
        const iconSize = Number(node.iconSize) || 32;
        const strokeWidth = Number(node.iconStrokeWidth) || 2;

        return `
            <div${classAttribute}${animationTriggerAttribute}${focusableAttribute}${styleAttribute}>
                <i
                    data-lucide="${iconName}"
                    data-icon-size="${iconSize}"
                    data-icon-stroke-width="${strokeWidth}"
                    aria-hidden="true"
                ></i>
            </div>
        `;
    }

    /* =====================================================
       TABLE
    ===================================================== */

    if (node.type === "table") {
        const rows = node.tableData?.length
            ? node.tableData
            : [["Header 1", "Header 2"], ["Cell 1", "Cell 2"]];
        const header = node.tableHeader ?? true;
        const striped = node.tableStriped ?? false;
        const borderWidth = Math.max(0, Number(node.tableBorderWidth ?? 1) || 0);
        const borderStyle = node.tableBorderStyle || "solid";
        const borderColor = node.tableBorderColor || "#d1d5db";
        const cellPadding = Math.max(0, Number(node.tableCellPadding ?? 10) || 0);
        const align = node.tableCellAlign || "left";
        const verticalAlign = node.tableCellVerticalAlign || "middle";
        const columnCount = Math.max(1, ...rows.map((row) => row.length));
        const columnWidths = node.tableColumnWidths ?? [];

        const tableStyle = [
            "width:100%",
            "border-collapse:collapse",
            "table-layout:fixed",
        ].join(";");

        const cellBaseStyle = [
            `padding:${cellPadding}px`,
            `text-align:${align}`,
            `vertical-align:${verticalAlign}`,
            `border:${borderWidth}px ${borderStyle} ${escapeHtml(borderColor)}`,
            "overflow-wrap:anywhere",
        ].join(";");

        const colgroup = columnWidths.length
            ? `<colgroup>${Array.from({ length: columnCount }).map((_, index) =>
                `<col style="width:${escapeHtml(columnWidths[index] || `${100 / columnCount}%`)}">`
            ).join("")}</colgroup>`
            : "";

        return `
            <div
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                ${styles
                ? ` style="${styles};overflow-x:auto"`
                : ` style="width:100%;overflow-x:auto"`}
            >
                <table style="${tableStyle}">
                    ${colgroup}
                    <tbody>
                        ${rows.map((row, rowIndex) => {
                    const isHeader = header && rowIndex === 0;
                    const tag = isHeader ? "th" : "td";
                    const cells = Array.from({ length: columnCount }).map((_, columnIndex) => {
                        const stripedStyle =
                            striped && !isHeader && rowIndex % 2 === 0
                                ? "background-color:#f9fafb;"
                                : "";
                        const weight = isHeader ? "font-weight:600;" : "";
                        return `<${tag} style="${cellBaseStyle};${stripedStyle}${weight}">${escapeHtml(row[columnIndex] ?? "")}</${tag}>`;
                    }).join("");
                    return `<tr>${cells}</tr>`;
                }).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    /* =====================================================
       INPUT
    ===================================================== */

    if (node.type === "input") {
        const inputType = getSafeInputType(node.inputType);
        const placeholder = escapeHtml(
            node.inputPlaceholder ?? ""
        );
        const value = escapeHtml(
            node.inputValue ?? ""
        );
        const name = node.inputName
            ? ` name="${escapeHtml(node.inputName)}"`
            : "";
        const required = node.inputRequired
            ? " required"
            : "";
        const disabled = node.inputDisabled
            ? " disabled"
            : "";
        const readOnly = node.inputReadOnly
            ? " readonly"
            : "";
        const min =
            inputType === "number" &&
                node.inputMin
                ? ` min="${escapeHtml(node.inputMin)}"`
                : "";
        const max =
            inputType === "number" &&
                node.inputMax
                ? ` max="${escapeHtml(node.inputMax)}"`
                : "";
        const step =
            inputType === "number" &&
                node.inputStep
                ? ` step="${escapeHtml(node.inputStep)}"`
                : "";

        return `
            <input
                type="${inputType}"
                placeholder="${placeholder}"
                value="${value}"
                ${name}
                ${required}
                ${disabled}
                ${readOnly}
                ${min}
                ${max}
                ${step}
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                ${styleAttribute}
            />
        `;
    }

    /* =====================================================
       TEXTAREA
    ===================================================== */

    if (node.type === "textarea") {
        const placeholder = escapeHtml(node.textareaPlaceholder ?? "");
        const value = escapeHtml(node.textareaValue ?? "");
        const name = node.textareaName
            ? ` name="${escapeHtml(node.textareaName)}"`
            : "";
        const required = node.textareaRequired ? " required" : "";
        const disabled = node.textareaDisabled ? " disabled" : "";
        const readOnly = node.textareaReadOnly ? " readonly" : "";
        const minLength = node.textareaMinLength && node.textareaMinLength > 0
            ? ` minlength="${node.textareaMinLength}"`
            : "";
        const maxLength = node.textareaMaxLength && node.textareaMaxLength > 0
            ? ` maxlength="${node.textareaMaxLength}"`
            : "";
        const rows = Math.max(1, Math.min(50, node.textareaRows ?? 5));
        const resize = node.textareaResize ?? "vertical";

        const textareaStyleAttribute = styles
            ? ` style="${styles};resize:${resize}"`
            : ` style="resize:${resize}"`;

        return `
            <textarea
                placeholder="${placeholder}"
                ${name}
                ${required}
                ${disabled}
                ${readOnly}
                ${minLength}
                ${maxLength}
                rows="${rows}"
                ${textareaStyleAttribute}
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
            >${value}</textarea>
        `;
    }

    /* =====================================================
       SELECT
    ===================================================== */

    if (node.type === "select") {
        const name = node.selectName
            ? ` name="${escapeHtml(node.selectName)}"`
            : "";
        const required = node.selectRequired
            ? " required"
            : "";
        const disabled = node.selectDisabled
            ? " disabled"
            : "";
        const multiple = node.selectMultiple
            ? " multiple"
            : "";

        const options = node.selectOptions ?? [];
        const value = node.selectValue ?? "";
        const placeholder = node.selectPlaceholder ?? "";

        const optionMarkup = [
            placeholder && !node.selectMultiple
                ? `<option value="" disabled>${escapeHtml(placeholder)}</option>`
                : "",
            ...options.map((option) => `
                <option
                    value="${escapeHtml(option.value)}"
                    ${option.value === value ? " selected" : ""}
                >
                    ${escapeHtml(option.label)}
                </option>
            `),
        ].join("");

        return `
            <select
                ${name}
                ${required}
                ${disabled}
                ${multiple}
                ${styleAttribute}
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
            >
                ${optionMarkup}
            </select>
        `;
    }

    /* =====================================================
   CHECKBOX
===================================================== */

    if (node.type === "checkbox") {
        const label = escapeHtml(
            node.checkboxLabel ?? "Checkbox"
        );

        const value = escapeHtml(
            node.checkboxValue ?? "on"
        );

        const name = node.checkboxName
            ? ` name="${escapeHtml(node.checkboxName)}"`
            : "";

        const required = node.checkboxRequired
            ? " required"
            : "";

        const disabled = node.checkboxDisabled
            ? " disabled"
            : "";

        const checked = node.checkboxChecked
            ? " checked"
            : "";

        const checkboxStyle = styles
            ? `${styles};display:flex;align-items:center;gap:8px;box-sizing:border-box;cursor:${node.checkboxDisabled ? "not-allowed" : "pointer"}`
            : `display:flex;align-items:center;gap:8px;box-sizing:border-box;cursor:${node.checkboxDisabled ? "not-allowed" : "pointer"}`;

        return `
        <label
            ${classAttribute}
            ${animationTriggerAttribute}
            ${focusableAttribute}
            style="${checkboxStyle}"
        >
            <input
                type="checkbox"
                value="${value}"
                ${name}
                ${required}
                ${disabled}
                ${checked}
                style="width:18px;height:18px;flex-shrink:0;margin:0;cursor:${node.checkboxDisabled ? "not-allowed" : "pointer"};accent-color:currentColor"
            />
            <span>${label}</span>
        </label>
    `;
    }

    /* =====================================================
       RADIO
    ===================================================== */

    if (node.type === "radio") {
        const options = node.radioOptions?.length
            ? node.radioOptions
            : [{ label: "Option 1", value: "option-1", checked: false }];

        const name = node.radioName
            ? ` name="${escapeHtml(node.radioName)}"`
            : "";

        const required = node.radioRequired
            ? " required"
            : "";

        const disabled = node.radioDisabled
            ? " disabled"
            : "";

        const radioStyle = styles
            ? `${styles};display:flex;flex-direction:column;gap:4px;box-sizing:border-box`
            : "display:flex;flex-direction:column;gap:4px;box-sizing:border-box";

        const optionMarkup = options.map((option, index) => `
            <label
                style="display:flex;align-items:center;gap:8px;width:100%;min-height:40px;box-sizing:border-box;cursor:${node.radioDisabled ? "not-allowed" : "pointer"}"
            >
                <input
                    type="radio"
                    value="${escapeHtml(option.value ?? "")}"
                    ${name}
                    ${required}
                    ${disabled}
                    ${option.checked ? " checked" : ""}
                    style="width:18px;height:18px;flex-shrink:0;margin:0;cursor:${node.radioDisabled ? "not-allowed" : "pointer"};accent-color:currentColor"
                />
                <span>${escapeHtml(option.label ?? `Option ${index + 1}`)}</span>
            </label>
        `).join("");

        return `
        <div
            ${classAttribute}
            ${animationTriggerAttribute}
            ${focusableAttribute}
            style="${radioStyle}"
        >
            ${optionMarkup}
        </div>
    `;
    }

    /* =====================================================
       SWITCH
    ===================================================== */

    if (node.type === "switch") {
        const label = escapeHtml(
            node.switchLabel ?? "Toggle"
        );
        const value = escapeHtml(
            node.switchValue ?? "on"
        );
        const name = node.switchName
            ? ` name="${escapeHtml(node.switchName)}"`
            : "";
        const required = node.switchRequired
            ? " required"
            : "";
        const disabled = node.switchDisabled
            ? " disabled"
            : "";
        const checked = node.switchChecked
            ? " checked"
            : "";

        const switchStyle = styles
            ? `${styles};display:flex;align-items:center;gap:10px;box-sizing:border-box;cursor:${node.switchDisabled ? "not-allowed" : "pointer"}`
            : `display:flex;align-items:center;gap:10px;box-sizing:border-box;cursor:${node.switchDisabled ? "not-allowed" : "pointer"}`;

        return `
            <label
                data-switch-wrapper="true"
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                style="${switchStyle}"
            >
                <span style="position:relative;display:inline-flex;width:42px;height:24px;flex:0 0 auto">
                    <input
                        type="checkbox"
                        role="switch"
                        value="${value}"
                        ${name}
                        ${required}
                        ${disabled}
                        ${checked}
                        style="position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:${node.switchDisabled ? "not-allowed" : "pointer"}"
                    />
                    <span
                        data-switch-track="true"
                        aria-hidden="true"
                        style="position:absolute;inset:0;border-radius:999px;background-color:${node.switchChecked ? "currentColor" : "#d1d5db"};pointer-events:none;transition:background-color 150ms ease"
                    >
                        <span
                            data-switch-thumb="true"
                            style="position:absolute;top:3px;left:${node.switchChecked ? "21px" : "3px"};width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:left 150ms ease"
                        ></span>
                    </span>
                </span>
                <span>${label}</span>
            </label>
        `;
    }

    /* =====================================================
       BUTTON
    ===================================================== */

    if (node.type === "button") {
        const href =
            getSafeUrl(
                node.styles?.href
            );

        const target =
            node.styles?.target ===
                "_blank"
                ? "_blank"
                : "_self";

        const buttonType =
            node.buttonType === "submit" ||
                node.buttonType === "reset"
                ? node.buttonType
                : "button";

        const disabled =
            node.buttonDisabled === true;

        if (href && !disabled) {
            return `
                <a
                    href="${escapeHtml(
                href
            )}"
                    target="${target}"
                    ${target === "_blank"
                    ? 'rel="noopener noreferrer"'
                    : ""
                }
                    ${classAttribute}
                    ${animationTriggerAttribute}
                    ${focusableAttribute}
                    ${styleAttribute}
                    aria-disabled="false"
                >
                    ${escapeHtml(
                    node.content ??
                    "Button"
                )}
                </a>
            `;
        }

        return `
            <button
                type="${buttonType}"
                ${disabled ? "disabled" : ""}
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                ${styleAttribute}
                ${href && disabled
                ? `data-disabled-href="${escapeHtml(href)}"`
                : ""
            }
            >
                ${escapeHtml(
                node.content ??
                "Button"
            )}
            </button>
        `;
    }

    /* =====================================================
       VIDEO
    ===================================================== */

    if (node.type === "video") {
        const source = node.videoSource || "";
        const poster = node.videoPoster || "";
        const controls = node.videoControls ?? true;
        const autoplay = node.videoAutoplay ?? false;
        const muted = node.videoMuted ?? true;
        const loop = node.videoLoop ?? false;
        const preload = node.videoPreload || "metadata";

        if (source) {
            return `
                <video
                    src="${escapeHtml(source)}"
                    ${poster ? `poster="${escapeHtml(poster)}"` : ""}
                    ${controls ? "controls" : ""}
                    ${autoplay ? "autoplay" : ""}
                    ${muted ? "muted" : ""}
                    ${loop ? "loop" : ""}
                    preload="${escapeHtml(preload)}"
                    playsinline
                    ${classAttribute}
                    ${animationTriggerAttribute}
                    ${focusableAttribute}
                    ${styleAttribute}
                ></video>
            `;
        }

        return `
            <div
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                style="${styles ? `${styles};` : ""}min-height:180px;display:flex;align-items:center;justify-content:center;background:#111;color:#aaa;font-size:14px"
            >
                Video
            </div>
        `;
    }

    /* =====================================================
       AUDIO
    ===================================================== */

    if (node.type === "audio") {
        const source = node.audioSource || "";
        const controls = node.audioControls ?? true;
        const autoplay = node.audioAutoplay ?? false;
        const muted = node.audioMuted ?? false;
        const loop = node.audioLoop ?? false;
        const preload = node.audioPreload || "metadata";
        const volume = Math.min(1, Math.max(0, node.audioVolume ?? 1));

        if (source) {
            return `
                <audio
                    src="${escapeHtml(source)}"
                    ${controls ? "controls" : ""}
                    ${autoplay ? "autoplay" : ""}
                    ${muted ? "muted" : ""}
                    ${loop ? "loop" : ""}
                    preload="${escapeHtml(preload)}"
                    data-audio-volume="${volume}"
                    ${classAttribute}
                    ${animationTriggerAttribute}
                    ${focusableAttribute}
                    ${styleAttribute}
                ></audio>
            `;
        }

        return `
            <div
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                style="${styles ? `${styles};` : ""}min-height:72px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#6b7280;font-size:14px"
            >
                Audio
            </div>
        `;
    }

    /* =====================================================
       DIVIDER
    ===================================================== */

    if (node.type === "divider") {
        const orientation =
            node.dividerOrientation === "vertical"
                ? "vertical"
                : "horizontal";
        const thickness = Math.max(
            1,
            Number(node.dividerThickness ?? 2) || 1,
        );
        const dividerStyle =
            node.dividerStyle === "dashed" ||
                node.dividerStyle === "dotted" ||
                node.dividerStyle === "double"
                ? node.dividerStyle
                : "solid";
        const dividerColor = node.dividerColor || "#d1d5db";
        const align = node.dividerAlign || "center";

        const wrapperStyles = [
            styles,
            "display:flex",
            orientation === "vertical"
                ? `justify-content:${align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"}`
                : `justify-content:${align === "top" ? "flex-start" : align === "bottom" ? "flex-end" : "center"}`,
        ]
            .filter(Boolean)
            .join(";");

        const lineStyles =
            orientation === "vertical"
                ? `width:${thickness}px;height:100%;border-left:${thickness}px ${dividerStyle} ${escapeHtml(dividerColor)};box-sizing:border-box;flex:0 0 auto`
                : `width:100%;height:${thickness}px;border-top:${thickness}px ${dividerStyle} ${escapeHtml(dividerColor)};box-sizing:border-box;flex:0 0 auto`;

        return `
            <div
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                style="${wrapperStyles}"
                aria-hidden="true"
            >
                <div style="${lineStyles}"></div>
            </div>
        `;
    }

    /* =====================================================
       LIST
    ===================================================== */

    if (node.type === "list") {
        const items =
            node.listItems?.length
                ? node.listItems
                : ["List item"];

        const ordered =
            node.listOrdered ?? false;

        const markerStyle =
            node.listMarkerStyle ||
            (ordered ? "decimal" : "disc");

        const safeMarkerStyles = new Set([
            "disc",
            "circle",
            "square",
            "decimal",
            "lower-alpha",
            "upper-alpha",
            "lower-roman",
            "upper-roman",
            "none",
        ]);

        const resolvedMarkerStyle =
            safeMarkerStyles.has(markerStyle)
                ? markerStyle
                : ordered
                    ? "decimal"
                    : "disc";

        const itemGap = Math.max(
            0,
            Number(node.listItemGap ?? 8) || 0,
        );

        const listTag = ordered ? "ol" : "ul";
        const startAttribute =
            ordered
                ? ` start="${Math.max(
                    1,
                    Number(node.listStart ?? 1) || 1,
                )}"`
                : "";

        const listStyle = [
            "width:100%",
            "box-sizing:border-box",
            "margin:0",
            `padding-left:${resolvedMarkerStyle === "none" ? "0" : "1.5em"}`,
            `list-style-type:${resolvedMarkerStyle}`,
            "list-style-position:outside",
        ].join(";");

        return `
            <div
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                ${styleAttribute}
            >
                <${listTag}${startAttribute} style="${listStyle}">
                    ${items
                .map(
                    (item, index) => `
                                <li style="margin-top:${index === 0 ? "0" : `${itemGap}px`}">
                                    ${escapeHtml(item || "List item")}
                                </li>
                            `,
                )
                .join("")}
                </${listTag}>
            </div>
        `;
    }

    /* =====================================================
       IMAGE
    ===================================================== */

    if (node.type === "image") {
        const source =
            getImageSource(project, node);

        if (source) {
            const alt =
                getPreviewResolvedStyles(
                    project,
                    node,
                    viewport
                ).alt ??
                "";

            return `
                <img
                    src="${escapeHtml(
                source
            )}"
                    alt="${escapeHtml(
                alt
            )}"
                    ${classAttribute}
                    ${animationTriggerAttribute}
                    ${focusableAttribute}
                    ${styleAttribute}
                />
            `;
        }

        return `
            <div
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                ${styleAttribute}
                style="${styles
                ? `${styles};`
                : ""
            }min-height:120px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#9ca3af;font-size:14px"
            >
                Image
            </div>
        `;
    }

    /* =====================================================
       ACCORDION
    ===================================================== */

    if (node.type === "accordion") {
        const children =
            (node.children ?? [])
                .map((childId) =>
                    renderPreviewNode(
                        project,
                        childId,
                        viewport,
                    )
                )
                .join("");

        return `
            <div
                ${classAttribute}
                ${animationTriggerAttribute}
                ${focusableAttribute}
                ${styleAttribute}
                data-accordion-root="true"
                data-accordion-multiple="${node.accordionAllowMultiple ? "true" : "false"}"
                data-accordion-default-open="${Math.max(0, Number(node.accordionDefaultOpen ?? 0) || 0)}"
            >
                ${children}
            </div>
        `;
    }

    /* =====================================================
       STRUCTURAL NODES
    ===================================================== */

    if (
        node.type === "page" ||
        node.type === "section" ||
        node.type === "container" ||
        node.type === "navbar" ||
        node.type === "card"
    ) {
        const children =
            (node.children ?? [])
                .map(
                    (childId) =>
                        renderPreviewNode(
                            project,
                            childId,
                            viewport
                        )
                )
                .join("");

        return `
            <div${classAttribute}${animationTriggerAttribute}${focusableAttribute}${styleAttribute}${accordionRoleAttribute}>
                ${children}
            </div>
        `;
    }

    return "";
}

/* =========================================================
   PREVIEW HTML
========================================================= */

function createPreviewDocument(
    project: Project,
    viewport: ViewportType
): string {
    const page =
        project.pages[
        project.activePageId
        ];

    if (!page) {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Preview</title>

                    <style>
                        ${ANIMATION_KEYFRAMES}
                    </style>
                </head>

                <body>
                    <h1>No active page</h1>
                </body>
            </html>
        `;
    }

    /* =====================================================
       RENDER PAGE
    ===================================================== */

    const content =
        renderPreviewNode(
            project,
            page.rootNodeId,
            viewport
        );

    /* =====================================================
       CREATE ANIMATION CSS
    ===================================================== */

    const animationCss =
        createPreviewAnimationCss(
            project,
            viewport
        );

    /* =====================================================
       PAGE TITLE
    ===================================================== */

    const pageTitle =
        page.name ||
        "Website Preview";

    /* =====================================================
       COMPLETE PREVIEW DOCUMENT
    ===================================================== */

    return `
        <!DOCTYPE html>

        <html lang="en">

        <head>

            <meta
                charset="UTF-8"
            />

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />

            <title>
                ${escapeHtml(
        pageTitle
    )}
            </title>

            <style>

                /* =========================================
                   GLOBAL RESET
                ========================================= */

                *,
                *::before,
                *::after {
                    box-sizing: border-box;
                    border-width: 0;
                    border-style: solid;
                    border-color: #e5e7eb;
                }

                html,
                body {
                    margin: 0;
                    padding: 0;
                    min-height: 100%;
                }

                body {
                    background: #ffffff;
                    color: #111111;
                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;
                }

                .vwb-accordion-content-hidden {
                    display: none !important;
                }

                img {
                    display: block;
                    max-width: 100%;
                }

                button,
                a {
                    font: inherit;
                }

                button {
                    margin: 0;
                    padding: 0;
                    background: transparent;
                    border: 0 solid transparent;
                }

                a {
                    text-decoration: none;
                }

                button:disabled {
                    cursor: not-allowed;
                }

                /* =========================================
                   DESIGN TOKEN VARIABLES
                ========================================= */

                :root {
                    ${createPreviewDesignTokenCss(project)}
                }

                /* =========================================
                   ANIMATION KEYFRAMES
                ========================================= */

                ${ANIMATION_KEYFRAMES}

                /* =========================================
                   NODE ANIMATIONS
                ========================================= */

                ${animationCss}

            </style>

            <script src="https://unpkg.com/lucide@1.40.0/dist/umd/lucide.min.js"></script>

            <script>
                document.addEventListener("DOMContentLoaded", function () {
                    if (!window.lucide) return;

                    document.querySelectorAll("[data-lucide]").forEach(function (element) {
                        var size = Number(element.getAttribute("data-icon-size")) || 32;
                        var strokeWidth = Number(element.getAttribute("data-icon-stroke-width")) || 2;
                        element.setAttribute("width", String(size));
                        element.setAttribute("height", String(size));
                        element.setAttribute("stroke-width", String(strokeWidth));
                    });

                    window.lucide.createIcons({
                        attrs: {
                            "stroke-width": 2,
                        },
                    });

                    document.querySelectorAll("audio[data-audio-volume]").forEach(function (element) {
                        var volume = Number(element.getAttribute("data-audio-volume"));
                        if (!Number.isFinite(volume)) volume = 1;
                        element.volume = Math.min(1, Math.max(0, volume));
                    });

                    document.querySelectorAll('[data-accordion-root="true"]').forEach(function (root) {
                        var items = Array.from(root.querySelectorAll('[data-accordion-role="item"]'));
                        var allowMultiple = root.getAttribute("data-accordion-multiple") === "true";
                        var defaultOpen = Number(root.getAttribute("data-accordion-default-open"));
                        if (!Number.isFinite(defaultOpen)) defaultOpen = 0;

                        function setOpen(item, open) {
                            var content = item.querySelector('[data-accordion-role="content"]');
                            if (!content) return;
                            content.classList.toggle("vwb-accordion-content-hidden", !open);
                            item.setAttribute("data-accordion-open", open ? "true" : "false");
                        }

                        items.forEach(function (item, index) {
                            setOpen(item, index === defaultOpen);

                            var header = item.querySelector('[data-accordion-role="header"]');
                            if (!header) return;

                            header.addEventListener("click", function () {
                                var isOpen = item.getAttribute("data-accordion-open") === "true";

                                if (allowMultiple) {
                                    setOpen(item, !isOpen);
                                    return;
                                }

                                items.forEach(function (otherItem) {
                                    setOpen(otherItem, otherItem === item ? !isOpen : false);
                                });
                            });
                        });
                    });

                    document.querySelectorAll("svg[data-icon-size]").forEach(function (element) {
                        var size = Number(element.getAttribute("data-icon-size")) || 32;
                        var strokeWidth = Number(element.getAttribute("data-icon-stroke-width")) || 2;
                        element.setAttribute("width", String(size));
                        element.setAttribute("height", String(size));
                        element.setAttribute("stroke-width", String(strokeWidth));
                    });

                    document.querySelectorAll('[data-switch-wrapper="true"]').forEach(function (wrapper) {
                        var input = wrapper.querySelector('input[role="switch"]');
                        var track = wrapper.querySelector('[data-switch-track="true"]');
                        var thumb = wrapper.querySelector('[data-switch-thumb="true"]');

                        if (!(input instanceof HTMLInputElement)) return;
                        if (!(track instanceof HTMLElement)) return;
                        if (!(thumb instanceof HTMLElement)) return;

                        function syncSwitch() {
                            var enabled = input.checked;
                            track.style.backgroundColor = enabled ? "currentColor" : "#d1d5db";
                            thumb.style.left = enabled ? "21px" : "3px";
                        }

                        input.addEventListener("change", syncSwitch);
                        syncSwitch();
                    });
                });

                document.addEventListener("click", function (event) {
                    var target = event.target;

                    if (!(target instanceof Element)) {
                        return;
                    }

                    var element = target.closest(
                        '[data-animation-trigger="click"]'
                    );

                    if (!element) {
                        return;
                    }

                    var animation = element.getAttribute(
                        "data-animation-value"
                    );

                    if (!animation) {
                        return;
                    }

                    element.style.animation = "none";
                    void element.offsetWidth;
                    element.style.animation = animation;
                });

                window.addEventListener("DOMContentLoaded", function () {
                    var targets = document.querySelectorAll(
                        '[data-animation-trigger="scroll"]'
                    );

                    if (!("IntersectionObserver" in window)) {
                        targets.forEach(function (element) {
                            element.style.animation = element.getAttribute(
                                "data-animation-value"
                            ) || "none";
                        });
                        return;
                    }

                    var observer = new IntersectionObserver(function (entries) {
                        entries.forEach(function (entry) {
                            if (!entry.isIntersecting) return;
                            var animation = entry.target.getAttribute(
                                "data-animation-value"
                            );
                            if (animation) entry.target.style.animation = animation;
                            observer.unobserve(entry.target);
                        });
                    }, { threshold: 0.2 });

                    targets.forEach(function (element) { observer.observe(element); });
                });
            </script>

        </head>

        <body>

            ${content}

        </body>

        </html>
    `;
}

/* =========================================================
   OPEN PREVIEW
========================================================= */

function openPreview(
    project: Project,
    viewport: ViewportType
): void {
    const previewWindow =
        window.open(
            "",
            "_blank"
        );

    if (!previewWindow) {
        window.alert(
            "Preview could not be opened. Please allow pop-ups for this site."
        );

        return;
    }

    const previewHtml =
        createPreviewDocument(
            project,
            viewport
        );

    previewWindow.document.open();

    previewWindow.document.write(
        previewHtml
    );

    previewWindow.document.close();

    try {
        previewWindow.opener =
            null;
    } catch {
        // Some browsers prevent modifying window.opener.
    }

    previewWindow.focus();
}

/* =========================================================
   EDITOR
========================================================= */

export default function Editor() {
    const [showDesignTokens, setShowDesignTokens] =
        useState(false);
    const [showReusableStyles, setShowReusableStyles] =
        useState(false);

    /* =====================================================
       PROJECT
    ===================================================== */

    const project =
        useEditorStore(
            (state) =>
                state.project
        );

    const replaceProject = useEditorStore((state) => state.replaceProject);
    const importInputRef = useRef<HTMLInputElement>(null);
    const shouldSkipInitialSave = useRef(true);

    useEffect(() => {
        const savedProject = loadSavedProject();
        if (savedProject) replaceProject(savedProject);
    }, [replaceProject]);

    useEffect(() => {
        /*
         * The first render contains the built-in default project.
         * Skip writing it so a restored project cannot be overwritten
         * before Zustand has delivered the replacement state.
         */
        if (shouldSkipInitialSave.current) {
            shouldSkipInitialSave.current = false;
            return;
        }

        saveProject(project);
    }, [project]);

    function importProject(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const imported: unknown = JSON.parse(String(reader.result));
                if (!isProject(imported)) throw new Error("Invalid project");
                replaceProject(imported);
            } catch {
                window.alert("That file is not a valid Visual Web Builder project.");
            }
        };
        reader.readAsText(file);
    }

    /* =====================================================
       RESET CANVAS
    ===================================================== */

    function resetCanvas() {
        const confirmed = window.confirm(
            "Reset Canvas? This will remove your current canvas changes and restore the default canvas. This cannot be undone with the current Undo history."
        );

        if (!confirmed) {
            return;
        }

        replaceProject(
            structuredClone(defaultProject)
        );
    }

    /* =====================================================
       SELECTION
    ===================================================== */

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

    /* =====================================================
       NODE OPERATIONS
    ===================================================== */

    const deleteNode =
        useEditorStore(
            (state) =>
                state.deleteNode
        );

    const deleteSelectedNodes =
        useEditorStore(
            (state) =>
                state.deleteSelectedNodes
        );

    const duplicateNode =
        useEditorStore(
            (state) =>
                state.duplicateNode
        );

    const selectAllNodes =
        useEditorStore(
            (state) =>
                state.selectAllNodes
        );

    const clearSelection =
        useEditorStore(
            (state) =>
                state.clearSelection
        );

    /* =====================================================
       HISTORY
    ===================================================== */

    const undo =
        useEditorStore(
            (state) =>
                state.undo
        );

    const redo =
        useEditorStore(
            (state) =>
                state.redo
        );

    const canUndo =
        useEditorStore(
            (state) =>
                state.past.length > 0
        );

    const canRedo =
        useEditorStore(
            (state) =>
                state.future.length > 0
        );

    /* =====================================================
       ACTIVE VIEWPORT
    ===================================================== */

    const viewport =
        useEditorStore(
            (state) =>
                state.activeBreakpointId
        );

    const setActiveBreakpoint =
        useEditorStore(
            (state) =>
                state.setActiveBreakpoint
        );

    /* =====================================================
       KEYBOARD SHORTCUTS
    ===================================================== */

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent
        ) {
            const target =
                event.target as HTMLElement;

            const isTyping =
                target.tagName ===
                "INPUT" ||
                target.tagName ===
                "TEXTAREA" ||
                target.isContentEditable;

            /* ---------------------------------------------
               UNDO
            --------------------------------------------- */

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                !event.shiftKey &&
                event.key.toLowerCase() ===
                "z"
            ) {
                event.preventDefault();

                undo();

                return;
            }

            /* ---------------------------------------------
               REDO
            --------------------------------------------- */

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.shiftKey &&
                event.key.toLowerCase() ===
                "z"
            ) {
                event.preventDefault();

                redo();

                return;
            }

            /* ---------------------------------------------
               REDO - CTRL + Y
            --------------------------------------------- */

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                "y"
            ) {
                event.preventDefault();

                redo();

                return;
            }

            /* ---------------------------------------------
               STOP WHILE TYPING
            --------------------------------------------- */

            if (isTyping) {
                return;
            }

            /* ---------------------------------------------
               SELECTION REQUIRED
            --------------------------------------------- */

            /* ---------------------------------------------
               SELECT ALL
            --------------------------------------------- */

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                "a"
            ) {
                event.preventDefault();
                selectAllNodes();
                return;
            }

            /* ---------------------------------------------
               CLEAR SELECTION
            --------------------------------------------- */

            if (
                event.key ===
                "Escape"
            ) {
                clearSelection();
                return;
            }

            if (!selectedNodeId) {
                return;
            }

            /* ---------------------------------------------
               DELETE
            --------------------------------------------- */

            if (
                event.key ===
                "Delete" ||
                event.key ===
                "Backspace"
            ) {
                event.preventDefault();

                if (
                    selectedNodeIds.length >
                    1
                ) {
                    deleteSelectedNodes();
                } else {
                    deleteNode(
                        selectedNodeId
                    );
                }

                return;
            }

            /* ---------------------------------------------
               DUPLICATE
            --------------------------------------------- */

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                "d"
            ) {
                event.preventDefault();

                duplicateNode(
                    selectedNodeId
                );

                return;
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        selectedNodeId,
        deleteNode,
        duplicateNode,
        undo,
        redo,
    ]);

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div
            className="
                flex
                h-screen
                w-screen
                min-w-0
                overflow-hidden
                bg-gray-100
            "
        >
            {/* =================================================
                LEFT PANEL
            ================================================= */}

            <LeftPanel />

            {/* =================================================
                MAIN EDITOR
            ================================================= */}

            <main
                className="
                    flex
                    min-w-0
                    flex-1
                    flex-col
                    overflow-hidden
                "
            >
                {/* =================================================
                    TOP TOOLBAR
                ================================================= */}

                <header
                    className="
                        flex
                        h-14
                        min-w-0
                        shrink-0
                        items-center
                        gap-3
                        border-b
                        bg-white
                        px-2
                        sm:px-3
                        lg:px-5
                    "
                >
                    {/* =============================================
                        PROJECT NAME
                    ============================================= */}

                    <div
                        className="
                            hidden
                            min-w-0
                            shrink
                            truncate
                            font-semibold
                            sm:block
                        "
                    >
                        Visual Web Builder
                    </div>

                    {/* =============================================
                        PAGE MANAGER
                    ============================================= */}

                    <div
                        className="
                            min-w-0
                            shrink-0
                        "
                    >
                        <PageManager />
                    </div>

                    {/* =============================================
                        TOOLBAR SCROLL AREA
                    ============================================= */}

                    <div
                        className="
                            min-w-0
                            flex-1
                            overflow-x-auto
                            overflow-y-hidden
                            scrollbar-thin
                        "
                    >
                        <div
                            className="
                                flex
                                min-w-max
                                items-center
                                justify-end
                                gap-2
                                px-1
                            "
                        >
                            {/* =================================
                                UNDO
                            ================================= */}

                            <button
                                type="button"
                                onClick={
                                    undo
                                }
                                disabled={
                                    !canUndo
                                }
                                title="Undo (Ctrl+Z)"
                                className={`
                                    shrink-0
                                    rounded-md
                                    border
                                    px-3
                                    py-1.5
                                    text-sm
                                    transition
                                    ${canUndo
                                        ? "cursor-pointer hover:bg-gray-50"
                                        : "cursor-not-allowed opacity-40"
                                    }
                                `}
                            >
                                Undo
                            </button>

                            {/* =================================
                                REDO
                            ================================= */}

                            <button
                                type="button"
                                onClick={
                                    redo
                                }
                                disabled={
                                    !canRedo
                                }
                                title="Redo (Ctrl+Shift+Z)"
                                className={`
                                    shrink-0
                                    rounded-md
                                    border
                                    px-3
                                    py-1.5
                                    text-sm
                                    transition
                                    ${canRedo
                                        ? "cursor-pointer hover:bg-gray-50"
                                        : "cursor-not-allowed opacity-40"
                                    }
                                `}
                            >
                                Redo
                            </button>

                            {/* =================================
                                SEPARATOR
                            ================================= */}

                            <div className="mx-1 h-6 w-px shrink-0 bg-gray-200" />

                            <input ref={importInputRef} type="file" accept="application/json,.json" onChange={importProject} className="hidden" />
                            <button type="button" onClick={() => downloadProject(project)} title="Download project JSON" className="shrink-0 rounded-md border px-3 py-1.5 text-sm transition hover:bg-gray-50">
                                Export
                            </button>
                            <button type="button" onClick={() => importInputRef.current?.click()} title="Open a saved project" className="shrink-0 rounded-md border px-3 py-1.5 text-sm transition hover:bg-gray-50">
                                Import
                            </button>

                            <button
                                type="button"
                                onClick={resetCanvas}
                                title="Reset the canvas to the default project"
                                className="
                                    shrink-0
                                    rounded-md
                                    border
                                    border-red-200
                                    px-3
                                    py-1.5
                                    text-sm
                                    text-red-600
                                    transition
                                    hover:bg-red-50
                                "
                            >
                                Reset Canvas
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowDesignTokens((current) => !current);
                                    setShowReusableStyles(false);
                                }}
                                title="Open Design Tokens"
                                className={`
                                    shrink-0
                                    rounded-md
                                    border
                                    px-3
                                    py-1.5
                                    text-sm
                                    transition
                                    ${showDesignTokens
                                        ? "border-blue-200 bg-blue-50 text-blue-700"
                                        : "hover:bg-gray-50"
                                    }
                                `}
                            >
                                Design Tokens
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowReusableStyles((current) => !current);
                                    setShowDesignTokens(false);
                                }}
                                title="Open Reusable Styles"
                                className={`
                                    shrink-0
                                    rounded-md
                                    border
                                    px-3
                                    py-1.5
                                    text-sm
                                    transition
                                    ${showReusableStyles
                                        ? "border-blue-200 bg-blue-50 text-blue-700"
                                        : "hover:bg-gray-50"
                                    }
                                `}
                            >
                                Styles
                            </button>

                            <div className="mx-1 h-6 w-px shrink-0 bg-gray-200" />

                            {/* =================================
                                VIEWPORT SWITCHER
                            ================================= */}

                            <div
                                className="
                                    flex
                                    shrink-0
                                    items-center
                                    rounded-md
                                    border
                                    bg-gray-50
                                    p-0.5
                                "
                            >
                                {(
                                    Object.keys(
                                        VIEWPORTS
                                    ) as ViewportType[]
                                ).map(
                                    (
                                        viewportType
                                    ) => {
                                        const config =
                                            VIEWPORTS[
                                            viewportType
                                            ];

                                        const isActive =
                                            viewport ===
                                            viewportType;

                                        return (
                                            <button
                                                key={
                                                    viewportType
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setActiveBreakpoint(
                                                        viewportType
                                                    )
                                                }
                                                title={`${config.label} (${config.width}px)`}
                                                className={`
                                                    shrink-0
                                                    rounded
                                                    px-3
                                                    py-1.5
                                                    text-xs
                                                    font-medium
                                                    transition
                                                    ${isActive
                                                        ? "bg-white text-gray-900 shadow-sm"
                                                        : "text-gray-500 hover:text-gray-900"
                                                    }
                                                `}
                                            >
                                                {
                                                    config.label
                                                }
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            {/* =================================
                                VIEWPORT WIDTH
                            ================================= */}

                            <div
                                className="
                                    shrink-0
                                    text-xs
                                    text-gray-400
                                "
                            >
                                {
                                    VIEWPORTS[
                                        viewport
                                    ].width
                                }
                                px
                            </div>

                            {/* =================================
                                SEPARATOR
                            ================================= */}

                            <div className="mx-1 h-6 w-px shrink-0 bg-gray-200" />

                            {/* =================================
                                PREVIEW
                            ================================= */}

                            <button
                                type="button"
                                onClick={() =>
                                    openPreview(
                                        project,
                                        viewport
                                    )
                                }
                                title="Open website preview"
                                className="
                                    shrink-0
                                    rounded-md
                                    border
                                    px-3
                                    py-1.5
                                    text-sm
                                    transition
                                    hover:bg-gray-50
                                "
                            >
                                Preview
                            </button>

                            {/* =================================
                                PUBLISH
                            ================================= */}

                            <button
                                type="button"
                                className="
                                    shrink-0
                                    rounded-md
                                    bg-black
                                    px-3
                                    py-1.5
                                    text-sm
                                    text-white
                                    hover:bg-gray-800
                                "
                            >
                                Publish
                            </button>
                        </div>
                    </div>
                </header>

                <MultiSelectionBar />

                {/* =================================================
                    CANVAS
                ================================================= */}

                <Canvas
                    viewport={
                        viewport
                    }
                    viewportWidth={
                        VIEWPORTS[
                            viewport
                        ].width
                    }
                />
            </main>

            {/* =================================================
                RIGHT PANEL
            ================================================= */}

            {showDesignTokens ? (
                <aside
                    className="
                        w-80
                        shrink-0
                        overflow-hidden
                        border-l
                        bg-white
                    "
                >
                    <DesignTokenManager />
                </aside>
            ) : showReusableStyles ? (
                <aside
                    className="
                        w-80
                        shrink-0
                        overflow-hidden
                        border-l
                        bg-white
                    "
                >
                    <ReusableStyleManager
                        onClose={() => setShowReusableStyles(false)}
                    />
                </aside>
            ) : (
                <RightPanel
                    viewport={
                        viewport
                    }
                />
            )}
        </div>
    );
}
