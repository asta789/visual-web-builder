"use client";

import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type HTMLAttributes,
} from "react";

/* =========================================================
   BOX SHORTHAND HELPERS
========================================================= */

type BoxSide = "Top" | "Right" | "Bottom" | "Left";

function splitBoxShorthand(
    value: unknown,
): [string, string, string, string] {
    const parts = String(value)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 1) {
        return [parts[0], parts[0], parts[0], parts[0]];
    }

    if (parts.length === 2) {
        return [parts[0], parts[1], parts[0], parts[1]];
    }

    if (parts.length === 3) {
        return [parts[0], parts[1], parts[2], parts[1]];
    }

    return [
        parts[0],
        parts[1],
        parts[2],
        parts[3],
    ];
}

function normalizeBoxShorthand(
    style: Record<string, unknown>,
    shorthand: "padding" | "margin",
) {
    const shorthandValue = style[shorthand];

    if (shorthandValue != null) {
        const [
            top,
            right,
            bottom,
            left,
        ] = splitBoxShorthand(shorthandValue);

        const sides: BoxSide[] = [
            "Top",
            "Right",
            "Bottom",
            "Left",
        ];

        const values = [
            top,
            right,
            bottom,
            left,
        ];

        sides.forEach((side, index) => {
            const key = `${shorthand}${side}`;

            if (style[key] == null) {
                style[key] = values[index];
            }
        });
    }

    /*
     * Never pass the shorthand property to React.
     * This prevents:
     *
     * padding + paddingBottom
     * margin + marginBottom
     *
     * conflicts.
     */
    delete style[shorthand];
}

/* =========================================================
   BORDER HELPERS
========================================================= */

const BORDER_STYLES = new Set([
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
]);

const BORDER_WIDTHS = new Set([
    "thin",
    "medium",
    "thick",
]);

function parseBorderShorthand(
    value: unknown,
): {
    width?: string;
    style?: string;
    color?: string;
} {
    const tokens = String(value)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    let width: string | undefined;
    let style: string | undefined;
    let color: string | undefined;

    for (const token of tokens) {
        if (
            !width &&
            (
                BORDER_WIDTHS.has(token) ||
                /^(?:0|[0-9.]+(?:px|em|rem|%|vh|vw|vmin|vmax|pt|pc|cm|mm|in))$/.test(
                    token,
                )
            )
        ) {
            width = token;
            continue;
        }

        if (
            !style &&
            BORDER_STYLES.has(token)
        ) {
            style = token;
            continue;
        }

        if (!color) {
            color = token;
        }
    }

    return {
        width,
        style,
        color,
    };
}

function normalizeBorderShorthand(
    style: Record<string, unknown>,
) {
    const sides: BoxSide[] = [
        "Top",
        "Right",
        "Bottom",
        "Left",
    ];

    /*
     * First convert:
     *
     * border: "1px solid black"
     *
     * into generic border values.
     */
    const parsedBorder =
        style.border != null
            ? parseBorderShorthand(style.border)
            : {};

    const genericWidth =
        style.borderWidth ??
        parsedBorder.width;

    const genericStyle =
        style.borderStyle ??
        parsedBorder.style;

    const genericColor =
        style.borderColor ??
        parsedBorder.color;

    /*
     * Convert generic border values into
     * individual side properties.
     *
     * We deliberately DO NOT leave:
     *
     * borderWidth
     * borderStyle
     * borderColor
     *
     * on the final React style object.
     */
    for (const side of sides) {
        const widthKey = `border${side}Width`;
        const styleKey = `border${side}Style`;
        const colorKey = `border${side}Color`;

        if (
            style[widthKey] == null &&
            genericWidth != null
        ) {
            style[widthKey] = genericWidth;
        }

        if (
            style[styleKey] == null &&
            genericStyle != null
        ) {
            style[styleKey] = genericStyle;
        }

        if (
            style[colorKey] == null &&
            genericColor != null
        ) {
            style[colorKey] = genericColor;
        }
    }

    /*
     * Also normalize:
     *
     * borderTop
     * borderRight
     * borderBottom
     * borderLeft
     *
     * because those are shorthands too.
     */
    for (const side of sides) {
        const shorthandKey = `border${side}`;
        const value = style[shorthandKey];

        if (value == null) {
            continue;
        }

        const parsed = parseBorderShorthand(value);

        const widthKey = `border${side}Width`;
        const styleKey = `border${side}Style`;
        const colorKey = `border${side}Color`;

        if (
            style[widthKey] == null &&
            parsed.width != null
        ) {
            style[widthKey] = parsed.width;
        }

        if (
            style[styleKey] == null &&
            parsed.style != null
        ) {
            style[styleKey] = parsed.style;
        }

        if (
            style[colorKey] == null &&
            parsed.color != null
        ) {
            style[colorKey] = parsed.color;
        }

        delete style[shorthandKey];
    }

    /*
     * Remove ALL border shorthands.
     */
    delete style.border;
    delete style.borderWidth;
    delete style.borderStyle;
    delete style.borderColor;

    /*
     * Remove logical border shorthands as well.
     */
    delete style.borderBlock;
    delete style.borderBlockWidth;
    delete style.borderBlockStyle;
    delete style.borderBlockColor;

    delete style.borderInline;
    delete style.borderInlineWidth;
    delete style.borderInlineStyle;
    delete style.borderInlineColor;
}

/* =========================================================
   BUILDER STYLE NORMALIZATION
========================================================= */

function normalizeBuilderStyle(
    style?: CSSProperties,
): CSSProperties {
    if (!style) {
        return {};
    }

    const normalized = {
        ...style,
    } as Record<string, unknown>;

    /*
     * Box model.
     */
    normalizeBoxShorthand(
        normalized,
        "padding",
    );

    normalizeBoxShorthand(
        normalized,
        "margin",
    );

    /*
     * Borders.
     */
    normalizeBorderShorthand(normalized);

    return normalized as CSSProperties;
}

/* =========================================================
   COMPONENT
========================================================= */

interface AudioElementProps
    extends HTMLAttributes<HTMLDivElement> {
    source?: string;
    controls?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    preload?: "auto" | "metadata" | "none";
    volume?: number;
    className?: string;
    style?: CSSProperties;
}

export default function AudioElement({
    source,
    controls = true,
    autoPlay = false,
    muted = false,
    loop = false,
    preload = "metadata",
    volume = 1,
    className,
    style,
    ...interactionProps
}: AudioElementProps) {
    const audioRef =
        useRef<HTMLAudioElement | null>(null);

    const [isPlaying, setIsPlaying] =
        useState(false);

    const [progress, setProgress] =
        useState(0);

    /* =====================================================
       AUDIO EVENT SYNC
    ===================================================== */

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        const syncState = () => {
            setIsPlaying(
                !audio.paused &&
                !audio.ended,
            );

            setProgress(
                audio.duration
                    ? audio.currentTime /
                    audio.duration
                    : 0,
            );
        };

        audio.addEventListener(
            "play",
            syncState,
        );

        audio.addEventListener(
            "pause",
            syncState,
        );

        audio.addEventListener(
            "ended",
            syncState,
        );

        audio.addEventListener(
            "timeupdate",
            syncState,
        );

        audio.addEventListener(
            "loadedmetadata",
            syncState,
        );

        return () => {
            audio.removeEventListener(
                "play",
                syncState,
            );

            audio.removeEventListener(
                "pause",
                syncState,
            );

            audio.removeEventListener(
                "ended",
                syncState,
            );

            audio.removeEventListener(
                "timeupdate",
                syncState,
            );

            audio.removeEventListener(
                "loadedmetadata",
                syncState,
            );
        };
    }, [source]);

    /* =====================================================
       VOLUME + MUTED
    ===================================================== */

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        audio.volume = Math.min(
            1,
            Math.max(0, volume),
        );

        audio.muted = muted;
    }, [volume, muted]);

    /* =====================================================
       PLAY / PAUSE
    ===================================================== */

    async function togglePlayback() {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        try {
            if (
                audio.paused ||
                audio.ended
            ) {
                await audio.play();
            } else {
                audio.pause();
            }
        } catch {
            /*
             * Browser autoplay/media policy
             * can reject play().
             */
        }
    }

    /* =====================================================
       NORMALIZED BUILDER STYLE
    ===================================================== */

    const normalizedStyle =
        normalizeBuilderStyle(style);

    /* =====================================================
       NO AUDIO SOURCE
    ===================================================== */

    if (!source) {
        return (
            <div
                {...interactionProps}
                className={className}
                style={{
                    position: "relative",
                    minHeight: 72,
                    width: "100%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: "#f3f4f6",
                    color: "#6b7280",

                    /*
                     * IMPORTANT:
                     * Do not add padding, margin,
                     * border, borderStyle, etc.
                     * here.
                     *
                     * They come exclusively from
                     * normalizedStyle.
                     */
                    ...normalizedStyle,
                }}
                aria-label="Audio placeholder"
            >
                <span
                    aria-hidden="true"
                    style={{
                        fontSize: 22,
                        lineHeight: 1,
                    }}
                >
                    ♪
                </span>

                <span
                    style={{
                        fontSize: 14,
                    }}
                >
                    Audio
                </span>
            </div>
        );
    }

    /* =====================================================
       AUDIO WITH SOURCE
    ===================================================== */

    return (
        <div
            {...interactionProps}
            className={className}
            style={{
                position: "relative",
                overflow: "hidden",
                width: "100%",
                minHeight: 72,
                display: "flex",
                alignItems: "center",

                /*
                 * All builder styles are already
                 * normalized above.
                 */
                ...normalizedStyle,
            }}
        >
            {/* =================================================
                REAL AUDIO ELEMENT

                Hidden in Canvas so the builder can control
                selection, dragging and resizing.
            ================================================= */}

            <audio
                ref={audioRef}
                src={source}
                controls={false}
                autoPlay={autoPlay}
                muted={muted}
                loop={loop}
                preload={preload}
                style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: "none",
                }}
                aria-hidden="true"
            />

            {/* =================================================
                CANVAS PLAY / PAUSE
            ================================================= */}

            {controls && (
                <button
                    type="button"
                    aria-label={
                        isPlaying
                            ? "Pause audio"
                            : "Play audio"
                    }
                    title={
                        isPlaying
                            ? "Pause audio"
                            : "Play audio"
                    }
                    onPointerDown={(event) => {
                        event.stopPropagation();
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                        void togglePlayback();
                    }}
                    style={{
                        width: 44,
                        height: 44,
                        flex: "0 0 auto",

                        /*
                         * This button's own border is
                         * intentionally independent from
                         * the builder's Audio border.
                         */
                        border:
                            "1px solid #d1d5db",

                        borderRadius: "999px",
                        backgroundColor: "#ffffff",
                        color: "#111827",

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        cursor: "pointer",
                        padding: 0,

                        zIndex: 2,
                        lineHeight: 1,
                        fontSize: 17,
                    }}
                >
                    {isPlaying
                        ? "❚❚"
                        : "▶"}
                </button>
            )}

            {/* =================================================
                PROGRESS BAR
            ================================================= */}

            <div
                aria-hidden="true"
                style={{
                    position: "relative",
                    flex: 1,
                    height: 8,
                    marginLeft: 12,
                    marginRight: 4,
                    borderRadius: 999,
                    backgroundColor: "#e5e7eb",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${Math.round(
                            progress * 100,
                        )}%`,
                        height: "100%",
                        backgroundColor:
                            "#111827",
                        borderRadius: 999,
                        transition:
                            "width 120ms linear",
                    }}
                />
            </div>
        </div>
    );
}