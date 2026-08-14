/* =========================================================
   BREAKPOINT TYPES
========================================================= */

export type BreakpointId =
   | "desktop"
   | "tablet"
   | "mobile";

/* =========================================================
   NODE TYPES
========================================================= */

export type NodeType =
   | "page"
   | "section"
   | "container"
   | "text"
   | "button"
   | "image";

/* =========================================================
   BASE STYLE PROPERTIES
========================================================= */

/*
 * These are the existing style properties used by the
 * current editor.
 *
 * They remain the base/default styles for a node.
 */

export interface BaseStyleProperties {
   /* Size */
   width?: string;
   height?: string;
   minWidth?: string;
   maxWidth?: string;
   minHeight?: string;
   maxHeight?: string;

   /* Position */
   position?:
   | "static"
   | "relative"
   | "absolute"
   | "fixed"
   | "sticky";

   top?: string;
   right?: string;
   bottom?: string;
   left?: string;
   zIndex?: string;

   /* Margin */
   marginTop?: string;
   marginRight?: string;
   marginBottom?: string;
   marginLeft?: string;

   /* Padding */
   paddingTop?: string;
   paddingRight?: string;
   paddingBottom?: string;
   paddingLeft?: string;

   /* Display */
   display?: string;
   flexDirection?: string;
   justifyContent?: string;
   alignItems?: string;
   gap?: string;
   flexWrap?: string;

   /* Typography */
   fontFamily?: string;
   fontSize?: string;
   fontWeight?: string;
   lineHeight?: string;
   letterSpacing?: string;
   textAlign?: string;
   textTransform?: string;

   /* Colors */
   color?: string;
   backgroundColor?: string;

   /* Border */
   borderRadius?: string;
   borderStyle?: string;
   borderWidth?: string;
   borderColor?: string;

   /* Effects */
   opacity?: string;
   boxShadow?: string;

   /* Overflow */
   overflow?: string;

   /* Interaction */
   cursor?: string;

   /* Image */
   objectFit?: string;

   /* Link */
   href?: string;
   target?: string;

   /* Accessibility */
   alt?: string;
}

/* =========================================================
   RESPONSIVE STYLE OVERRIDES
========================================================= */

/*
 * A responsive override contains only the properties that
 * are explicitly changed at that breakpoint.
 *
 * Example:
 *
 * responsive: {
 *     mobile: {
 *         fontSize: "18px",
 *         paddingLeft: "16px"
 *     }
 * }
 *
 * Properties not present here are NOT duplicated.
 *
 * Inheritance / fallback resolution will be implemented
 * in the next responsive phase.
 */

export type ResponsiveStyleOverrides =
   Partial<BaseStyleProperties>;

/* =========================================================
   RESPONSIVE STYLES
========================================================= */

export interface ResponsiveStyles {
   desktop?: ResponsiveStyleOverrides;

   tablet?: ResponsiveStyleOverrides;

   mobile?: ResponsiveStyleOverrides;
}

/* =========================================================
   STYLE PROPERTIES
========================================================= */

/*
 * Existing styles remain directly available.
 *
 * This is important because the current Canvas,
 * RightPanel, EditorOverlay and other systems already
 * read properties such as:
 *
 * node.styles?.width
 * node.styles?.fontSize
 * node.styles?.color
 *
 * We are NOT breaking that structure.
 *
 * Responsive values are stored separately under
 * node.styles.responsive.
 */

export interface StyleProperties
   extends BaseStyleProperties {
   responsive?: ResponsiveStyles;
}

/* =========================================================
   PROJECT NODE
========================================================= */

export interface ProjectNode {
   id: string;

   type: NodeType;

   name: string;

   parentId?: string;

   children?: string[];

   content?: string;

   styles?: StyleProperties;
}

/* =========================================================
   PAGE
========================================================= */

export interface ProjectPage {
   id: string;

   name: string;

   rootNodeId: string;
}

/* =========================================================
   PROJECT
========================================================= */

export interface Project {
   id: string;

   name: string;

   nodes: Record<
      string,
      ProjectNode
   >;

   pages: Record<
      string,
      ProjectPage
   >;

   activePageId: string;
}