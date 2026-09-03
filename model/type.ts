/* =========================================================
   BREAKPOINTS
========================================================= */

export type BreakpointId =
   | "desktop"
   | "tablet"
   | "mobile";


/* =========================================================
   VISUAL BUILDER LAYOUT MODE
========================================================= */

/**
 * Controls how the user wants elements inside a container
 * to be arranged.
 *
 * These values are user-facing concepts. The renderer/layout
 * engine will translate them into the appropriate CSS behavior.
 */
export type LayoutMode =
   | "automatic"
   | "horizontal"
   | "vertical"
   | "grid"
   | "free";


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
   PROJECT ASSETS
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
   ANIMATION
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

   gridTemplateColumns?: string;
   gridTemplateRows?: string;

   justifyItems?: string;
   justifyContent?: string;
   alignItems?: string;
   alignContent?: string;

   gridColumnStart?: string;
   gridColumnEnd?: string;
   gridRowStart?: string;
   gridRowEnd?: string;

   columnGap?: string;
   rowGap?: string;
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
      Spacing
   --------------------------------------------------------- */

   marginTop?: string;
   marginRight?: string;
   marginBottom?: string;
   marginLeft?: string;

   paddingTop?: string;
   paddingRight?: string;
   paddingBottom?: string;
   paddingLeft?: string;


   /* ---------------------------------------------------------
      Display
   --------------------------------------------------------- */

   display?: string;


   /* ---------------------------------------------------------
      Visual Builder Layout
   --------------------------------------------------------- */

   /**
    * User-friendly layout mode.
    *
    * automatic   → builder decides the best responsive layout
    * horizontal  → children arranged left-to-right
    * vertical    → children arranged top-to-bottom
    * grid        → children arranged using rows/columns
    * free        → children can be positioned freely
    */
   layoutMode?: LayoutMode;


   /* ---------------------------------------------------------
      Flex Container
   --------------------------------------------------------- */

   flexDirection?: string;
   gap?: string;
   flexWrap?: string;



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


   /* ---------------------------------------------------------
      Animation
   --------------------------------------------------------- */

   animation?: string;
   animationTrigger?: AnimationTrigger;


   /* ---------------------------------------------------------
      Advanced
   --------------------------------------------------------- */

   overflow?: string;
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
   RESPONSIVE STYLES
========================================================= */

export type ResponsiveStyleOverrides =
   Partial<BaseStyleProperties>;


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
   PROJECT PAGE
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