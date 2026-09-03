import type {
    DesignToken,
    DesignTokenType,
    Project,
    ProjectNode,
    BaseStyleProperties,
} from "@/model/type";

export const DESIGN_TOKEN_TYPES: {
    value: DesignTokenType;
    label: string;
    description: string;
}[] = [
    {
        value: "color",
        label: "Color",
        description: "Brand colors, text colors, backgrounds, borders",
    },
    {
        value: "spacing",
        label: "Spacing",
        description: "Reusable gaps, margins, padding and sizes",
    },
    {
        value: "fontSize",
        label: "Font Size",
        description: "Reusable typography sizes",
    },
    {
        value: "fontWeight",
        label: "Font Weight",
        description: "Reusable text weights",
    },
    {
        value: "borderRadius",
        label: "Border Radius",
        description: "Reusable corner radius values",
    },
    {
        value: "shadow",
        label: "Shadow",
        description: "Reusable multi-layer box shadows",
    },
    {
        value: "custom",
        label: "Custom",
        description: "Any valid CSS value",
    },
];

/**
 * Token CSS variables intentionally use the stable token id.
 * This means changing the display name never breaks existing references.
 *
 * Example:
 *   token id -> token-123
 *   CSS var  -> --token-token-123
 */
export function getTokenCssVariableName(token: Pick<DesignToken, "id">): string {
    return `--token-${token.id}`;
}

export function getTokenCssValue(
    token: Pick<DesignToken, "id">
): string {
    return `var(${getTokenCssVariableName(token)})`;
}

export function isTokenCssValue(value?: string): boolean {
    return Boolean(value?.trim().startsWith("var(--token-"));
}

export function getTokenIdFromCssValue(
    value?: string
): string | null {
    if (!value) {
        return null;
    }

    const match = value.match(
        /^var\(\s*(--token-[A-Za-z0-9_-]+)\s*\)$/
    );

    if (!match) {
        return null;
    }

    return match[1].replace(/^--token-/, "");
}

export function normalizeTokenName(name: string): string {
    return name.trim().replace(/\s+/g, " ");
}

export function normalizeTokenValue(value: string): string {
    return value.trim();
}

export function tokenTypeLabel(type: DesignTokenType): string {
    return (
        DESIGN_TOKEN_TYPES.find(
            (item) => item.value === type
        )?.label || "Custom"
    );
}

function styleValueContainsToken(
    value: unknown,
    tokenId: string
): boolean {
    return (
        typeof value === "string" &&
        value.includes(`var(--token-${tokenId})`)
    );
}

function nodeUsesToken(
    node: ProjectNode,
    tokenId: string
): boolean {
    const styleSets: BaseStyleProperties[] = [
        node.styles?.desktop || {},
        node.styles?.tablet || {},
        node.styles?.mobile || {},
    ];

    return styleSets.some((styles) =>
        Object.values(styles).some((value) =>
            styleValueContainsToken(value, tokenId)
        )
    );
}

export function findTokenUsage(
    project: Project,
    tokenId: string
): string[] {
    return Object.values(project.nodes)
        .filter((node) => nodeUsesToken(node, tokenId))
        .map((node) => node.name || node.id);
}

export function isTokenInUse(
    project: Project,
    tokenId: string
): boolean {
    return findTokenUsage(project, tokenId).length > 0;
}

export function createTokenVariableMap(
    tokens: Record<string, DesignToken>
): Record<string, string> {
    return Object.fromEntries(
        Object.values(tokens).map((token) => [
            getTokenCssVariableName(token),
            token.value,
        ])
    );
}
