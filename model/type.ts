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
   STYLE PROPERTIES
========================================================= */

export interface StyleProperties {
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

   nodes: Record<string, ProjectNode>;

   pages: Record<string, ProjectPage>;

   activePageId: string;
}