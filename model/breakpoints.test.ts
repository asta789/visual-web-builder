import { describe, expect, it } from "vitest";

import {
    DEFAULT_BREAKPOINTS,
    validateBreakpoints,
} from "./breakpoints";

describe("breakpoint registry", () => {
    it("accepts the default desktop, tablet, and mobile registry", () => {
        expect(validateBreakpoints(DEFAULT_BREAKPOINTS)).toEqual({
            valid: true,
            errors: [],
        });
    });

    it("rejects a breakpoint with an invalid range", () => {
        const invalid = DEFAULT_BREAKPOINTS.map((breakpoint) => ({ ...breakpoint }));
        invalid[1].minWidth = 1200;
        invalid[1].maxWidth = 700;

        expect(validateBreakpoints(invalid).valid).toBe(false);
    });
});
