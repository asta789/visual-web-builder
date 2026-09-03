import type {
    BaseStyleProperties,
    Project,
    ProjectNode,
    ReusableStyleClass,
    StyleProperties,
} from "@/model/type";

const NON_REUSABLE_PROPERTIES = new Set([
    "href",
    "target",
    "alt",
]);

export function sanitizeReusableStyles(
    styles?: StyleProperties
): StyleProperties {
    if (!styles) {
        return {};
    }

    const base: Record<string, unknown> = {};

    Object.entries(styles).forEach(([property, value]) => {
        if (
            property === "responsive" ||
            NON_REUSABLE_PROPERTIES.has(property)
        ) {
            return;
        }

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            base[property] = value;
        }
    });

    const responsive = styles.responsive;

    const sanitizedResponsive = responsive
        ? Object.fromEntries(
              Object.entries(responsive).map(
                  ([breakpoint, breakpointStyles]) => [
                      breakpoint,
                      Object.fromEntries(
                          Object.entries(
                              breakpointStyles ?? {}
                          ).filter(
                              ([property, value]) =>
                                  !NON_REUSABLE_PROPERTIES.has(
                                      property
                                  ) &&
                                  value !== undefined &&
                                  value !== null &&
                                  value !== ""
                          )
                      ),
                  ]
              )
          )
        : undefined;

    return {
        ...(base as BaseStyleProperties),
        ...(sanitizedResponsive &&
        Object.keys(sanitizedResponsive).length
            ? { responsive: sanitizedResponsive }
            : {}),
    };
}

export function mergeReusableStyleClasses(
    node: ProjectNode,
    classes: Record<string, ReusableStyleClass> | undefined
): StyleProperties {
    const merged: StyleProperties = {};

    for (const classId of node.styleClassIds ?? []) {
        const reusableClass = classes?.[classId];
        if (!reusableClass) {
            continue;
        }

        Object.assign(merged, reusableClass.styles ?? {});

        const classResponsive =
            reusableClass.styles?.responsive;
        if (classResponsive) {
            merged.responsive = {
                ...(merged.responsive ?? {}),
                ...Object.fromEntries(
                    Object.entries(classResponsive).map(
                        ([breakpoint, styles]) => [
                            breakpoint,
                            {
                                ...(merged.responsive?.[
                                    breakpoint as keyof NonNullable<StyleProperties["responsive"]>
                                ] ?? {}),
                                ...(styles ?? {}),
                            },
                        ]
                    )
                ),
            };
        }
    }

    // Node-local styles intentionally win over reusable classes.
    Object.assign(merged, node.styles ?? {});

    if (node.styles?.responsive) {
        merged.responsive = {
            ...(merged.responsive ?? {}),
            ...Object.fromEntries(
                Object.entries(node.styles.responsive).map(
                    ([breakpoint, styles]) => [
                        breakpoint,
                        {
                            ...(merged.responsive?.[
                                breakpoint as keyof NonNullable<StyleProperties["responsive"]>
                            ] ?? {}),
                            ...(styles ?? {}),
                        },
                    ]
                )
            ),
        };
    }

    return merged;
}

export function getStyleClassUsage(
    project: Project,
    classId: string
): ProjectNode[] {
    return Object.values(project.nodes).filter((node) =>
        node.styleClassIds?.includes(classId)
    );
}

export function getStyleClassUsageCount(
    project: Project,
    classId: string
): number {
    return getStyleClassUsage(project, classId).length;
}

export function nodeUsesStyleClass(
    node: ProjectNode | null | undefined,
    classId: string
): boolean {
    return !!node?.styleClassIds?.includes(classId);
}

export function stripStylesCoveredByClass(
    styles: StyleProperties | undefined,
    classStyles: StyleProperties | undefined
): StyleProperties | undefined {
    if (!styles) {
        return styles;
    }

    const next: StyleProperties = { ...styles };
    const classStyleKeys = Object.keys(classStyles ?? {}).filter(
        (key) => key !== "responsive"
    );

    for (const key of classStyleKeys) {
        delete (next as Record<string, unknown>)[key];
    }

    if (styles.responsive) {
        next.responsive = Object.fromEntries(
            Object.entries(styles.responsive).map(
                ([breakpoint, breakpointStyles]) => {
                    const covered =
                        classStyles?.responsive?.[
                            breakpoint as keyof NonNullable<StyleProperties["responsive"]>
                        ];
                    const cleaned = { ...(breakpointStyles ?? {}) };

                    for (const key of Object.keys(covered ?? {})) {
                        delete (cleaned as Record<string, unknown>)[key];
                    }

                    return [breakpoint, cleaned];
                }
            )
        ) as StyleProperties["responsive"];
    }

    return next;
}
