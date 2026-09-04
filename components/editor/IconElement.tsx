"use client";

import { lazy, Suspense, type CSSProperties, type HTMLAttributes } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

export type BuilderIconName = keyof typeof dynamicIconImports;

const lazyIconCache = new Map<
    BuilderIconName,
    ReturnType<typeof lazy>
>();

function getLazyIcon(name: BuilderIconName) {
    const cached = lazyIconCache.get(name);
    if (cached) return cached;

    const loader = dynamicIconImports[name];
    const component = lazy(loader);
    lazyIconCache.set(name, component);
    return component;
}

interface IconElementProps extends HTMLAttributes<HTMLDivElement> {
    name: BuilderIconName;
    size?: number;
    strokeWidth?: number;
    className?: string;
    style?: CSSProperties;
}

function IconFallback({ size = 32 }: { size?: number }) {
    return (
        <span
            aria-hidden="true"
            style={{
                display: "inline-block",
                width: size,
                height: size,
            }}
        />
    );
}

export default function IconElement({
    name,
    size = 32,
    strokeWidth = 2,
    className,
    style,
    ...props
}: IconElementProps) {
    const loader = dynamicIconImports[name];

    if (!loader) {
        return (
            <div className={className} style={style} {...props}>
                <IconFallback size={size} />
            </div>
        );
    }

    const LucideIcon = getLazyIcon(name);

    return (
        <div className={className} style={style} {...props}>
            <Suspense fallback={<IconFallback size={size} />}>
                <LucideIcon
                    size={size}
                    strokeWidth={strokeWidth}
                    aria-hidden="true"
                    focusable="false"
                    style={{ display: "block" }}
                />
            </Suspense>
        </div>
    );
}
