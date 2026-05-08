---
name: Obsidian Property Management
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c3c5d8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8d90a1'
  outline-variant: '#434655'
  surface-tint: '#b5c4ff'
  primary: '#b5c4ff'
  on-primary: '#00287c'
  primary-container: '#2d68ff'
  on-primary-container: '#fffcff'
  inverse-primary: '#0050e3'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#f9bd22'
  on-tertiary: '#402d00'
  tertiary-container: '#956f00'
  on-tertiary-container: '#fffdff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#003cae'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  numeric-data:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-page: 32px
---

## Brand & Style

This design system is built on a foundation of **Minimalism** and **High-Contrast** aesthetics. It is designed for professional property managers who require a high-focus environment that minimizes ocular strain during long management sessions.

The personality is authoritative, precise, and premium. By utilizing a "Void" black base with "Electric" accents, the UI recedes into the background, allowing critical data—such as booking dates, revenue, and guest status—to occupy the foreground. The emotional response is one of calm control and modern efficiency. 

Key visual principles include:
- **Absolute Clarity:** Information density is balanced with generous whitespace to ensure zero ambiguity.
- **Precision:** Mathematical alignments and consistent iconography.
- **Focus:** Use of "Electric Blue" only for high-priority interactive paths.

## Colors

The palette is strictly dark-mode first, utilizing a true black (`#000000`) background to create infinite depth and maximum contrast.

- **Primary (Electric Blue):** Reserved for primary actions (buttons), active navigation states, and current-day highlights in the calendar.
- **Secondary (Mint Green):** Used exclusively for "confirmed," "paid," or "active" statuses to provide a positive semantic signal.
- **Tertiary (Amber):** Used for alerts, pending actions, or help indicators.
- **Neutrals:** A range of deep grays is used to define hierarchy. Backgrounds are pure black, while cards and containers use a slightly elevated charcoal to distinguish layers. Text transitions from pure white for headers to a muted gray for secondary metadata.

## Typography

This design system utilizes **Inter** for its exceptional legibility in digital interfaces and its neutral, modern character.

- **Scale:** A tight typographic scale ensures that even with high data density, the interface remains readable.
- **Data Centricity:** For calendar dates and financial figures, use `tabular lining` figures to ensure columns of numbers align perfectly.
- **Hierarchy:** Contrast is achieved through weight (Bold vs Regular) and color (White vs Muted Gray) rather than excessive size changes.
- **Labels:** Small caps with slight letter spacing are used for non-interactive metadata and sidebar category headers.

## Layout & Spacing

The layout follows a **Fixed Sidebar / Fluid Content** model. 

- **Sidebar:** A narrow, high-contrast vertical navigation bar (240px width) stays fixed to the left.
- **Grid:** The main content area utilizes a 12-column grid for dashboard views. In the calendar view, a 7-column custom grid is used.
- **Rhythm:** An 8px linear scale (with a 4px half-step for tight components) governs all padding and margins. 
- **Density:** High-density spacing is used within cards to keep guest information compact, while generous margins (32px+) are used between major sections to prevent visual clutter.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** rather than traditional shadows. This maintains the "Obsidian" look without introducing "fuzzy" light artifacts that can soften the minimalist aesthetic.

- **Level 0 (Base):** `#000000` — Used for the main application background.
- **Level 1 (Surface):** `#121212` — Used for cards, the calendar grid, and the sidebar.
- **Level 2 (Hover/Overlay):** `#1A1A1A` — Used for hover states on list items and tooltips.
- **Outlines:** Instead of heavy shadows, use a `1px` solid border of `#262626` for all cards and interactive inputs to define their boundaries against the black background.
- **Interactive Depth:** Primary buttons use a subtle glow effect (box-shadow: 0 4px 20px rgba(45, 104, 255, 0.3)) to suggest they are "powered on."

## Shapes

The design system uses a **Large Rounded** shape language to soften the high-contrast color palette, making the software feel approachable despite its dark aesthetic.

- **Cards/Containers:** Use `1rem` (16px) for standard cards.
- **Primary Buttons:** Use `0.75rem` (12px) for a modern, chunky feel.
- **Interactive Controls:** Checkboxes and small status chips use `0.5rem` (8px).
- **Floating Action Buttons (FAB):** Fully circular (pill) for maximum distinction.

## Components

### Buttons & Inputs
- **Primary Action:** Large, Electric Blue background with white bold text. Minimum height 48px.
- **Secondary Action:** Ghost style with `#262626` border and white text.
- **Inputs:** Dark grey background (`#121212`) with a subtle border. On focus, the border transitions to Electric Blue.

### Cards & Calendar
- **Property Cards:** Feature high-quality imagery with a `15%` black overlay for text legibility. 
- **Booking Items:** Horizontal cards with a colored status indicator dot on the left.
- **Calendar Cells:** Minimalist grid. Active dates use a circular Electric Blue fill; secondary indicators (e.g., "dot" for bookings) appear below the date number.

### Social Proof & Feedback
- **Status Chips:** Small, pill-shaped indicators using low-opacity versions of the status color (e.g., 10% Green background with 100% Green text).
- **Review Sections:** Utilize the "Inter" italic variant for quotes with a "Verified" badge in Electric Blue.

### Navigation
- **Sidebar:** Icons are crisp, 24px stroke-based (2px weight). Active states include a vertical blue bar on the left and a subtle blue tint to the background.