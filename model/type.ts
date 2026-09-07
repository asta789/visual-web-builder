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
   | "image"
   | "icon"
   | "video"
   | "audio"
   | "divider"
   | "list"
   | "table"
   | "input"
   | "textarea"
   | "select"
   | "checkbox"
   | "radio"
   | "switch"
   | "card"
   | "accordion";

export type TextElementType =
   | "p"
   | "h1"
   | "h2"
   | "h3"
   | "h4"
   | "h5"
   | "h6"
   | "blockquote"
   | "span";

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
   DESIGN TOKENS
========================================================= */

export type DesignTokenType =
   | "color"
   | "spacing"
   | "fontSize"
   | "fontWeight"
   | "borderRadius"
   | "shadow"
   | "custom";


export interface DesignToken {
   id: string;
   name: string;
   type: DesignTokenType;
   value: string;
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

   /* --------------------------------------------------------- 
      Grid Container 
   --------------------------------------------------------- */

   gridTemplateColumns?: string;
   gridTemplateRows?: string;

   columnGap?: string;
   rowGap?: string;

   justifyItems?: string;
   alignItems?: string;
   justifyContent?: string;
   alignContent?: string;


   /* --------------------------------------------------------- 
      Grid Item Placement 
   --------------------------------------------------------- */

   gridColumnStart?: string;
   gridColumnEnd?: string;
   gridRowStart?: string;
   gridRowEnd?: string;


   /* --------------------------------------------------------- 
      Size 
   --------------------------------------------------------- */

   width?: string;
   height?: string;

   minWidth?: string;
   maxWidth?: string;

   minHeight?: string;
   maxHeight?: string;

   aspectRatio?: string;


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
   visibility?: string;


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
   backgroundSize?: string;
   backgroundPosition?: string;
   backgroundRepeat?: string;
   backgroundAttachment?: string;


   /* --------------------------------------------------------- 
      Border 
   --------------------------------------------------------- */

   borderRadius?: string;
   borderStyle?: string;
   borderWidth?: string;
   borderColor?: string;

   borderTopStyle?: string;
   borderRightStyle?: string;
   borderBottomStyle?: string;
   borderLeftStyle?: string;

   borderTopWidth?: string;
   borderRightWidth?: string;
   borderBottomWidth?: string;
   borderLeftWidth?: string;

   borderTopColor?: string;
   borderRightColor?: string;
   borderBottomColor?: string;
   borderLeftColor?: string;


   /* --------------------------------------------------------- 
      Effects 
   --------------------------------------------------------- */

   opacity?: string;
   boxShadow?: string;
   transform?: string;
   transition?: string;
   filter?: string;
   backdropFilter?: string;


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
   objectPosition?: string;


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

export interface ReusableStyleClass {
   id: string;
   name: string;
   description?: string;
   styles: StyleProperties;
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

   accordionRole?: "root" | "item" | "header" | "content";
   accordionAllowMultiple?: boolean;
   accordionDefaultOpen?: number;
   /** Editor-only mode: false = edit composite root, true = edit its inner nodes. */
   compositeEditingLocked?: boolean;

   content?: string;



   textareaPlaceholder?: string;
   textareaValue?: string;
   textareaName?: string;
   textareaRequired?: boolean;
   textareaDisabled?: boolean;
   textareaReadOnly?: boolean;
   textareaMinLength?: number;
   textareaMaxLength?: number;
   textareaRows?: number;
   textareaResize?: "none" | "horizontal" | "vertical" | "both";

   selectOptions?: {
      label: string;
      value: string;
   }[];
   selectValue?: string;
   selectName?: string;
   selectPlaceholder?: string;
   selectRequired?: boolean;
   selectDisabled?: boolean;
   selectMultiple?: boolean;



   inputType?:
   | "text"
   | "email"
   | "password"
   | "number"
   | "tel"
   | "url"
   | "search"
   | "date"
   | "time";
   inputPlaceholder?: string;
   inputValue?: string;
   inputName?: string;
   inputRequired?: boolean;
   inputDisabled?: boolean;
   inputReadOnly?: boolean;
   inputMin?: string;
   inputMax?: string;
   inputStep?: string;

   checkboxLabel?: string;
   checkboxValue?: string;
   checkboxName?: string;
   checkboxChecked?: boolean;
   checkboxRequired?: boolean;
   checkboxDisabled?: boolean;

   radioOptions?: {
      label: string;
      value: string;
      checked?: boolean;
   }[];
   radioName?: string;
   radioRequired?: boolean;
   radioDisabled?: boolean;

   buttonType?: "button" | "submit" | "reset";
   buttonDisabled?: boolean;

   switchLabel?: string;
   switchValue?: string;
   switchName?: string;
   switchChecked?: boolean;
   switchRequired?: boolean;
   switchDisabled?: boolean;

   videoSource?: string;
   videoPoster?: string;
   videoControls?: boolean;
   videoAutoplay?: boolean;
   videoMuted?: boolean;
   videoLoop?: boolean;
   videoPreload?: "auto" | "metadata" | "none";

   audioSource?: string;
   audioControls?: boolean;
   audioAutoplay?: boolean;
   audioMuted?: boolean;
   audioLoop?: boolean;
   audioPreload?: "auto" | "metadata" | "none";
   audioVolume?: number;

   dividerOrientation?: "horizontal" | "vertical";
   dividerThickness?: number;
   dividerStyle?: "solid" | "dashed" | "dotted" | "double";
   dividerColor?: string;
   dividerAlign?: "left" | "center" | "right" | "top" | "bottom";

   listItems?: string[];
   listOrdered?: boolean;
   listMarkerStyle?:
   | "disc"
   | "circle"
   | "square"
   | "decimal"
   | "lower-alpha"
   | "upper-alpha"
   | "lower-roman"
   | "upper-roman"
   | "none";
   listStart?: number;
   listItemGap?: number;

   tableData?: string[][];
   tableHeader?: boolean;
   tableStriped?: boolean;
   tableBorderWidth?: number;
   tableBorderStyle?: "solid" | "dashed" | "dotted" | "double" | "none";
   tableBorderColor?: string;
   tableCellPadding?: number;
   tableCellAlign?: "left" | "center" | "right";
   tableCellVerticalAlign?: "top" | "middle" | "bottom";
   tableColumnWidths?: string[];
   tableRowHeight?: number;

   iconName?: string;
   iconSize?: number;
   iconStrokeWidth?: number;

   textElement?: TextElementType;

   assetId?: string;

   styles?: StyleProperties;

   styleClassIds?: string[];
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

   reusableStyles: Record<string, ReusableStyleClass>;

   pages: Record<string, ProjectPage>;

   activePageId: string;

   designTokens: Record<string, DesignToken>;
}
