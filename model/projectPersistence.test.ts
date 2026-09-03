import { describe, expect, it } from "vitest";

import { defaultProject } from "./defaultProject";
import { isProject } from "./projectPersistence";

describe("project-file validation", () => {
    it("accepts the canonical project shape", () => {
        expect(isProject(defaultProject)).toBe(true);
    });

    it("rejects incomplete or malformed imports", () => {
        expect(isProject(null)).toBe(false);
        expect(isProject({ id: "project" })).toBe(false);
        expect(isProject({
            ...defaultProject,
            pages: [],
        })).toBe(false);
    });
});
