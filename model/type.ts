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
   | "navbar"
   | "text"
   | "button"
   | "image";

/* =========================================================
   ASSET TYPES
========================================================= */

export interface ProjectAsset {
   id: string;

   name: string;

   type: string;

   size: number;

   source: string;

   width?: number;

   height?: number;
}

/* =========================================================
   ANIMATION TRIGGER
========================================================= */

export type AnimationTrigger =
   | "load"
   | "hover"
   | "click"
   | "focus"
   | "scroll";

/* =========================================================
   BASE STYLE PROPERTIES
========================================================= */

export interface BaseStyleProperties {
   /* ---------------------------------------------------------
      Size
   --------------------------------------------------------- */

   width?: string;
   height?: string;
   minWidth?: string;
   maxWidth?: string;
   minHeight?: string;
   maxHeight?: string;

   /* ---------------------------------------------------------
      Position
   --------------------------------------------------------- */

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

   /* ---------------------------------------------------------
      Margin
   --------------------------------------------------------- */

   marginTop?: string;
   marginRight?: string;
   marginBottom?: string;
   marginLeft?: string;

   /* ---------------------------------------------------------
      Padding
   --------------------------------------------------------- */

   paddingTop?: string;
   paddingRight?: string;
   paddingBottom?: string;
   paddingLeft?: string;

   /* ---------------------------------------------------------
      Display
   --------------------------------------------------------- */

   display?: string;

   /* ---------------------------------------------------------
      Flex Container
   --------------------------------------------------------- */

   flexDirection?: string;
   justifyContent?: string;
   alignItems?: string;
   gap?: string;
   flexWrap?: string;
   alignContent?: string;

   /* ---------------------------------------------------------
      Flex Item
   --------------------------------------------------------- */

   flexGrow?: string;
   flexShrink?: string;
   flexBasis?: string;
   alignSelf?: string;
   order?: string;

   /* ---------------------------------------------------------
      Typography
   --------------------------------------------------------- */

   /* Typography */
   fontFamily?: string;
   fontSize?: string;
   fontWeight?: string;
   lineHeight?: string;
   letterSpacing?: string;
   textAlign?: string;
   textTransform?: string;
   textDecoration?: string;

   /* ---------------------------------------------------------
      Colors
   --------------------------------------------------------- */

   color?: string;

   backgroundColor?: string;

   /*
    * CSS gradients are represented using background-image.
    *
    * Example:
    *
    * linear-gradient(90deg, #ff0000, #0000ff)
    *
    * or:
    *
    * radial-gradient(circle, #ffffff, #000000)
    */

   backgroundImage?: string;

   /* ---------------------------------------------------------
      Border
   --------------------------------------------------------- */

   borderRadius?: string;
   borderStyle?: string;
   borderWidth?: string;
   borderColor?: string;

   /* ---------------------------------------------------------
      Effects
   --------------------------------------------------------- */

   opacity?: string;
   boxShadow?: string;
   transform?: string;
   transition?: string;
   animation?: string;
   animationTrigger?: AnimationTrigger;


   /* ---------------------------------------------------------
      Overflow
   --------------------------------------------------------- */

   overflow?: string;

   /* ---------------------------------------------------------
      Interaction
   --------------------------------------------------------- */

   cursor?: string;

   /* ---------------------------------------------------------
      Image
   --------------------------------------------------------- */

   objectFit?: string;

   /* ---------------------------------------------------------
      Link
   --------------------------------------------------------- */

   href?: string;
   target?: string;

   /* ---------------------------------------------------------
      Accessibility
   --------------------------------------------------------- */

   alt?: string;
}

/* =========================================================
   RESPONSIVE STYLE OVERRIDES
========================================================= */

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

   assetId?: string;

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

   assets: Record<string, ProjectAsset>;

   pages: Record<string, ProjectPage>;

   activePageId: string;
}