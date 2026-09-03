import type { Project } from "./type";

export const PROJECT_STORAGE_KEY = "visual-web-builder.project.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isProject(value: unknown): value is Project {
    if (!isRecord(value)) return false;

    return (
        typeof value.id === "string" &&
        typeof value.name === "string" &&
        typeof value.activePageId === "string" &&
        isRecord(value.nodes) &&
        isRecord(value.pages) &&
        isRecord(value.assets)
    );
}

export function loadSavedProject(): Project | null {
    try {
        const raw = window.localStorage.getItem(PROJECT_STORAGE_KEY);
        if (!raw) return null;
        const project: unknown = JSON.parse(raw);
        return isProject(project) ? project : null;
    } catch {
        return null;
    }
}

export function saveProject(project: Project): boolean {
    try {
        window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project));
        return true;
    } catch {
        return false;
    }
}

export function downloadProject(project: Project): void {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.trim() || "visual-web-builder-project"}.json`;
    link.click();
    URL.revokeObjectURL(url);
}
