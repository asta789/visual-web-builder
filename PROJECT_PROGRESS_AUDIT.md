# Visual Web Builder — audited progress

**Audit date:** 3 September 2026  
**Scope:** every project source file (`app`, `components`, `model`, and `store`), excluding generated dependencies.  
**Status key:** ✅ implemented and wired into the application · ⚠️ partial/foundation only · ⬜ not implemented.

## Important audit note

The repository has uncommitted changes in `Canvas.tsx`, `RightPanel.tsx`, `model/type.ts`, and `store/editorStore.ts`. The Grid, background-image, transition, image-import, and click-animation work found there is treated as **implemented in the current working tree**, but should be committed and manually tested before it is considered a stable milestone.

## Implemented now

### Core visual builder

- ✅ Canonical in-memory project model: project, pages, node map, parent/child references, styles, responsive overrides, and asset records.
- ✅ Zustand editor store with node selection.
- ✅ Add Section, Container, Text, Image, and Button from the component panel.
- ✅ Canvas rendering for page, section, container, text, button, and image nodes.
- ✅ Layer tree with expand/collapse, selection, drag-to-reparent, and sibling reordering.
- ✅ Delete and duplicate nodes.
- ✅ Canvas drag behavior for flow, free-position, and grid layouts.
- ✅ Resize selection overlay with four corner handles.
- ✅ Undo/redo history, including transaction handling for drag/resize edits.

### Pages and preview

- ✅ Create, select, rename, duplicate, and delete pages through Page Manager.
- ✅ Active-page canvas rendering.
- ✅ Browser preview generated from the active page, including responsive styles and supported animations.
- ✅ Button URL and target (`_self` / `_blank`) configuration.

### Responsive editing

- ✅ Three breakpoint definitions: desktop (1024px+), tablet (768–1023px), and mobile (up to 767px).
- ✅ Breakpoint validation and inheritance-aware style resolution.
- ✅ Active desktop/tablet/mobile viewport selection.
- ✅ Per-breakpoint style overrides in the inspector and canvas/preview resolution.

### Layout and visual styling

- ✅ Visual layout modes: automatic, horizontal, vertical, grid, and free position.
- ✅ Display; width/height/min/max dimensions; position; offsets; z-index; overflow; cursor.
- ✅ Flex direction, justify/align controls, wrap, content alignment, gap, grow/shrink/basis, self alignment, and order.
- ✅ CSS Grid mode with configurable columns plus row/column gaps and a canvas guide.
- ✅ Margin and padding on all four sides.
- ✅ Typography: family, size, weight, line height, letter spacing, alignment, transform, decoration, and color.
- ✅ Background color and gradient editor; direct background-image styling is also supported in the current working tree.
- ✅ Border style, width, color, and uniform radius.
- ✅ Opacity, transform controls (rotate, scale, translate, skew), shadow presets, and transition editor.
- ✅ Image import from PC, image URL, remove image, alt text, and object-fit.

### Animation

- ✅ Preset keyframes: fade, slide, zoom, bounce, pulse, shake, and spin.
- ✅ Animation duration, timing, delay, repeat, direction, and fill-mode controls.
- ✅ On-load, hover, focus, and click animation triggers in the canvas and preview.
- ⚠️ `scroll` exists in the model type but has no implemented scroll-trigger runtime behavior.

## Completed after the follow-up milestone

- ✅ Scroll-triggered animations now use `IntersectionObserver` in the canvas and preview, with a safe preview fallback for browsers without it.
- ✅ Navbar is available in the component panel, has sensible Flex defaults, can contain children, supports Layers drag/drop, and renders in preview.
- ✅ Asset library: import images, inspect name/type/size metadata, reuse an asset on any selected image, and remove unused assets. Imported image data is stored with the project.
- ✅ Local-first persistence: the active project automatically saves to browser storage. JSON export and validated JSON import are available from the toolbar.
- ✅ Preview now executes all supported animation triggers (load, hover, focus, click, scroll) and button navigation. It is the interactive runtime for features currently in the builder.
- ✅ Automated tests now cover breakpoint validation and project-file validation. `npm run test` runs them.
- ✅ The stock README and metadata were replaced with Visual Web Builder documentation/metadata; the build no longer relies on downloading Google Fonts.

## Still intentionally outside this frontend milestone

- ⬜ Real-time collaboration requires a shared backend, identity, permissions, and conflict resolution; it is not safe to present a local browser project as collaborative editing.
- ⬜ Asset optimization (resizing/compression pipeline) and folders/tags remain future asset-system work. The library now provides the foundation and metadata.
- ⬜ A general event-to-action runtime is part of the later Interactions phase; the preview fully simulates the interactions that the current model supports.

## Remaining frontend roadmap

### A. Finish advanced CSS and layout

- ⬜ Grid rows, grid alignment, and explicit grid-item placement.
- ⬜ Background-image size, position, repeat, and attachment controls.
- ⬜ Aspect ratio, visibility controls beyond `display: none`, CSS filters/backdrop filters, and object-position.
- ⬜ Per-side borders and a custom multi-layer shadow editor.
- ⬜ CSS variables/design tokens, global styles, and reusable style presets.

### B. Add website elements

- ⬜ Heading and rich text; icon, video, audio, divider, list, and table.
- ⬜ Form, label, input, textarea, select, checkbox, radio, and switch.
- ⬜ Card, Navbar (complete it), Footer, Sidebar, Tabs, Accordion, Modal, Dropdown, Tooltip, Toast, Breadcrumb, Pagination, loading/skeleton.
- ⬜ Gallery, carousel, and slider.

### C. Frontend interactions

- ⬜ Event-to-action system.
- ⬜ Show/hide, toggle, modal open/close, dropdown, tabs, and accordion behavior.
- ⬜ Scroll and keyboard interactions, active/pressed states, interaction chains, custom animations, and scroll-trigger animations.

### D. Forms and UI states

- ⬜ Required fields and validation UI.
- ⬜ Error, success, disabled, focus, loading, and empty states; error pages and feedback.

### E. Reusable components

- ⬜ Component definitions and instances, properties, variants, states, and shared styling.

### F. Asset system

- ⬜ Asset library, folders/organization, reusable media selection, metadata, and optimization pipeline.

### G. Pages and routing

- ⬜ Route definitions, navigation actions, dynamic routes/parameters, 404 page, and page metadata.

### H. Runtime and code generation

- ⬜ Runtime state, full interaction simulation, diagnostics, and preview parity.
- ⬜ Export/generation for React + TypeScript + Tailwind, HTML/CSS/JavaScript, and Next.js; responsive, routing, animation, interaction, and asset generation.

## Recommended next milestone

Complete **Advanced CSS/Layout** first: finish the Grid controls (rows, alignment, and item placement), then background-image controls, filters, per-side borders, and design tokens. Afterwards, build the missing elements and their behavior before starting the backend builder.

## Not started: backend/full-stack builder

- ⬜ Database and visual data models
- ⬜ API builder and server functions
- ⬜ Authentication and authorization
- ⬜ File storage
- ⬜ Payments, email/notifications, webhooks, and real-time features
- ⬜ Backend deployment
