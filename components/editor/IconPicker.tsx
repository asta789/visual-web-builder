"use client";

import { lazy, Suspense, useMemo, useState } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import type { BuilderIconName } from "./IconElement";

const FEATURED_ICONS: { name: BuilderIconName; label: string; keywords: string }[] = [
    { name: "house", label: "Home", keywords: "home house start" },
    { name: "user", label: "User", keywords: "user person account profile" },
    { name: "users", label: "Users", keywords: "users people team" },
    { name: "heart", label: "Heart", keywords: "heart like favorite love" },
    { name: "star", label: "Star", keywords: "star favorite rating" },
    { name: "search", label: "Search", keywords: "search find magnify" },
    { name: "menu", label: "Menu", keywords: "menu navigation hamburger" },
    { name: "x", label: "Close", keywords: "close x cancel" },
    { name: "check", label: "Check", keywords: "check done success" },
    { name: "plus", label: "Plus", keywords: "plus add create" },
    { name: "minus", label: "Minus", keywords: "minus remove" },
    { name: "arrow-right", label: "Arrow Right", keywords: "arrow right next" },
    { name: "arrow-left", label: "Arrow Left", keywords: "arrow left back" },
    { name: "arrow-up", label: "Arrow Up", keywords: "arrow up" },
    { name: "arrow-down", label: "Arrow Down", keywords: "arrow down" },
    { name: "chevron-right", label: "Chevron Right", keywords: "chevron right next" },
    { name: "chevron-down", label: "Chevron Down", keywords: "chevron down dropdown" },
    { name: "mail", label: "Mail", keywords: "mail email message" },
    { name: "phone", label: "Phone", keywords: "phone call contact" },
    { name: "map-pin", label: "Location", keywords: "location map pin address" },
    { name: "calendar", label: "Calendar", keywords: "calendar date schedule" },
    { name: "clock", label: "Clock", keywords: "clock time" },
    { name: "camera", label: "Camera", keywords: "camera photo" },
    { name: "image", label: "Image", keywords: "image photo picture" },
    { name: "video", label: "Video", keywords: "video movie media" },
    { name: "play", label: "Play", keywords: "play start video" },
    { name: "download", label: "Download", keywords: "download save" },
    { name: "upload", label: "Upload", keywords: "upload send" },
    { name: "share-2", label: "Share", keywords: "share social send" },
    { name: "link", label: "Link", keywords: "link url hyperlink" },
    { name: "external-link", label: "External Link", keywords: "external link url" },
    { name: "settings", label: "Settings", keywords: "settings gear configuration" },
    { name: "bell", label: "Bell", keywords: "bell notification alert" },
    { name: "shopping-cart", label: "Cart", keywords: "shopping cart ecommerce" },
    { name: "credit-card", label: "Credit Card", keywords: "credit card payment" },
    { name: "lock", label: "Lock", keywords: "lock security private" },
    { name: "globe", label: "Globe", keywords: "globe world website" },
    { name: "sun", label: "Sun", keywords: "sun light theme" },
    { name: "moon", label: "Moon", keywords: "moon dark theme" },
    { name: "sparkles", label: "Sparkles", keywords: "sparkles magic featured" },
    { name: "zap", label: "Zap", keywords: "zap lightning energy" },
    { name: "check-circle", label: "Success", keywords: "success check circle" },
    { name: "info", label: "Info", keywords: "info information" },
    { name: "circle-help", label: "Help", keywords: "help question" },
    { name: "triangle-alert", label: "Warning", keywords: "warning alert danger" },
    { name: "trash-2", label: "Delete", keywords: "delete trash remove" },
    { name: "pencil", label: "Edit", keywords: "edit pencil write" },
    { name: "eye", label: "View", keywords: "eye view show" },
];

const pickerIconCache = new Map<BuilderIconName, ReturnType<typeof lazy>>();

const ALL_ICON_NAMES = Object.keys(dynamicIconImports) as BuilderIconName[];

function PickerIcon({ name }: { name: BuilderIconName }) {
    let LucideIcon = pickerIconCache.get(name);
    if (!LucideIcon) {
        LucideIcon = lazy(dynamicIconImports[name]);
        pickerIconCache.set(name, LucideIcon);
    }

    return (
        <Suspense fallback={<span className="h-5 w-5" />}>
            <LucideIcon size={20} strokeWidth={2} aria-hidden="true" />
        </Suspense>
    );
}

interface IconPickerProps {
    value: BuilderIconName;
    onChange: (value: BuilderIconName) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
    const [query, setQuery] = useState("");

    const filteredIcons = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return FEATURED_ICONS;

        const featuredMatches = FEATURED_ICONS.filter((icon) =>
            `${icon.name} ${icon.label} ${icon.keywords}`.includes(normalized)
        );

        const allMatches = ALL_ICON_NAMES
            .filter((name) => name.includes(normalized))
            .map((name) => ({
                name,
                label: name
                    .split("-")
                    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                    .join(" "),
                keywords: name,
            }));

        const seen = new Set<string>();
        return [...featuredMatches, ...allMatches]
            .filter((icon) => {
                if (seen.has(icon.name)) return false;
                seen.add(icon.name);
                return true;
            })
            .slice(0, 100);
    }, [query]);

    return (
        <div className="space-y-3">
            <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search icons…"
                className="w-full rounded-md border px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            <div className="max-h-64 overflow-y-auto rounded-md border bg-white p-2">
                {filteredIcons.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400">
                        No matching icons found.
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-1.5">
                        {filteredIcons.map((icon) => (
                            <button
                                key={icon.name}
                                type="button"
                                title={icon.label}
                                aria-label={icon.label}
                                onClick={() => onChange(icon.name)}
                                className={`flex h-12 flex-col items-center justify-center gap-1 rounded-md border text-gray-600 transition hover:bg-gray-50 ${
                                    value === icon.name
                                        ? "border-blue-500 bg-blue-50 text-blue-600"
                                        : "border-transparent"
                                }`}
                            >
                                <PickerIcon name={icon.name} />
                                <span className="max-w-full truncate px-1 text-[9px]">
                                    {icon.label}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
