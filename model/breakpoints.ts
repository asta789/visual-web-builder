/* =========================================================
   RESPONSIVE BREAKPOINT DEFINITIONS
========================================================= */

import type { BreakpointId } from "@/model/type";

/* =========================================================
   BREAKPOINT
========================================================= */

export interface Breakpoint {
    id: BreakpointId;
    name: string;

    minWidth?: number;
    maxWidth?: number;

    icon?: string;

    isDefault?: boolean;

    /*
     * Parent breakpoint used by the
     * responsive inheritance graph.
     */
    parentId?: BreakpointId;

    /*
     * Deterministic display / resolution order.
     */
    order: number;
}

/* =========================================================
   DEFAULT BREAKPOINTS
========================================================= */

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
    {
        id: "desktop",
        name: "Desktop",
        minWidth: 1024,
        icon: "monitor",
        isDefault: true,
        order: 0,
    },

    {
        id: "tablet",
        name: "Tablet",
        minWidth: 768,
        maxWidth: 1023,
        parentId: "desktop",
        icon: "tablet",
        order: 1,
    },

    {
        id: "mobile",
        name: "Mobile",
        maxWidth: 767,
        parentId: "tablet",
        icon: "smartphone",
        order: 2,
    },
];

/* =========================================================
   BREAKPOINT VALIDATION
========================================================= */

export interface BreakpointValidationResult {
    valid: boolean;
    errors: string[];
}

/* =========================================================
   VALIDATE BREAKPOINT REGISTRY
========================================================= */

export function validateBreakpoints(
    breakpoints: Breakpoint[]
): BreakpointValidationResult {
    const errors: string[] = [];

    /* =====================================================
       EMPTY REGISTRY
    ===================================================== */

    if (breakpoints.length === 0) {
        errors.push(
            "Breakpoint registry cannot be empty."
        );

        return {
            valid: false,
            errors,
        };
    }

    /* =====================================================
       DUPLICATE IDS
    ===================================================== */

    const ids = new Set<BreakpointId>();

    for (const breakpoint of breakpoints) {
        if (ids.has(breakpoint.id)) {
            errors.push(
                `Duplicate breakpoint ID: "${breakpoint.id}".`
            );
        }

        ids.add(breakpoint.id);
    }

    /* =====================================================
       DEFAULT BREAKPOINT
    ===================================================== */

    const defaultBreakpoints =
        breakpoints.filter(
            (breakpoint) =>
                breakpoint.isDefault === true
        );

    if (defaultBreakpoints.length !== 1) {
        errors.push(
            `Exactly one default breakpoint is required; found ${defaultBreakpoints.length}.`
        );
    }

    /* =====================================================
       INDIVIDUAL BREAKPOINT VALIDATION
    ===================================================== */

    for (const breakpoint of breakpoints) {
        /* =================================================
           ORDER
        ================================================= */

        if (
            !Number.isInteger(
                breakpoint.order
            ) ||
            breakpoint.order < 0
        ) {
            errors.push(
                `Breakpoint "${breakpoint.id}" must have a non-negative integer order.`
            );
        }

        /* =================================================
           MIN WIDTH
        ================================================= */

        if (
            breakpoint.minWidth !==
            undefined
        ) {
            if (
                !Number.isFinite(
                    breakpoint.minWidth
                ) ||
                breakpoint.minWidth < 0
            ) {
                errors.push(
                    `Breakpoint "${breakpoint.id}" has an invalid minWidth.`
                );
            }
        }

        /* =================================================
           MAX WIDTH
        ================================================= */

        if (
            breakpoint.maxWidth !==
            undefined
        ) {
            if (
                !Number.isFinite(
                    breakpoint.maxWidth
                ) ||
                breakpoint.maxWidth < 0
            ) {
                errors.push(
                    `Breakpoint "${breakpoint.id}" has an invalid maxWidth.`
                );
            }
        }

        /* =================================================
           RANGE
        ================================================= */

        if (
            breakpoint.minWidth !==
            undefined &&
            breakpoint.maxWidth !==
            undefined &&
            breakpoint.minWidth >
            breakpoint.maxWidth
        ) {
            errors.push(
                `Breakpoint "${breakpoint.id}" has minWidth greater than maxWidth.`
            );
        }

        /* =================================================
           SELF PARENT
        ================================================= */

        if (
            breakpoint.parentId ===
            breakpoint.id
        ) {
            errors.push(
                `Breakpoint "${breakpoint.id}" cannot be its own parent.`
            );
        }

        /* =================================================
           PARENT EXISTS
        ================================================= */

        if (
            breakpoint.parentId !==
            undefined &&
            !ids.has(
                breakpoint.parentId
            )
        ) {
            errors.push(
                `Breakpoint "${breakpoint.id}" references missing parent "${breakpoint.parentId}".`
            );
        }
    }

    /* =====================================================
       CYCLE DETECTION
    ===================================================== */

    const breakpointMap =
        new Map<
            BreakpointId,
            Breakpoint
        >();

    for (const breakpoint of breakpoints) {
        breakpointMap.set(
            breakpoint.id,
            breakpoint
        );
    }

    for (const breakpoint of breakpoints) {
        const visited =
            new Set<BreakpointId>();

        let current:
            | Breakpoint
            | undefined =
            breakpoint;

        while (
            current?.parentId !==
            undefined
        ) {
            if (
                visited.has(
                    current.id
                )
            ) {
                errors.push(
                    `Breakpoint inheritance cycle detected involving "${current.id}".`
                );

                break;
            }

            visited.add(
                current.id
            );

            current =
                breakpointMap.get(
                    current.parentId
                );

            if (
                current ===
                undefined
            ) {
                break;
            }
        }
    }

    /* =====================================================
       OVERLAPPING RANGE VALIDATION
    ===================================================== */

    for (
        let i = 0;
        i < breakpoints.length;
        i++
    ) {
        for (
            let j = i + 1;
            j < breakpoints.length;
            j++
        ) {
            const first =
                breakpoints[i];

            const second =
                breakpoints[j];

            const firstMin =
                first.minWidth ??
                0;

            const firstMax =
                first.maxWidth ??
                Number.POSITIVE_INFINITY;

            const secondMin =
                second.minWidth ??
                0;

            const secondMax =
                second.maxWidth ??
                Number.POSITIVE_INFINITY;

            const overlaps =
                firstMin <=
                secondMax &&
                secondMin <=
                firstMax;

            if (overlaps) {
                errors.push(
                    `Breakpoint ranges overlap: "${first.id}" and "${second.id}".`
                );
            }
        }
    }

    return {
        valid:
            errors.length === 0,
        errors,
    };
}

/* =========================================================
   DEFAULT BREAKPOINT VALIDATION
========================================================= */

export const DEFAULT_BREAKPOINT_VALIDATION =
    validateBreakpoints(
        DEFAULT_BREAKPOINTS
    );