# Onetime Survey Logo Components

This file contains reusable logo components for the Onetime Survey application. The logo has been implemented with proper sizing, accessibility, and performance optimizations.

## Components

### `Logo` (Main Component)
The primary logo component with text and image.

```tsx
import { Logo } from "@/components/ui/logo"

<Logo 
  size="md"           // "xs" | "sm" | "md" | "lg" | "xl"
  showText={true}     // Show/hide "Onetime Survey" text
  href="/"            // Link destination (set to null for no link)
  className=""        // Additional container classes
  textClassName=""    // Additional text classes
  imageClassName=""   // Additional image classes
  priority={false}    // Image loading priority for above-the-fold
/>
```

### `LogoCompact` (Sidebar/Compact Areas)
Optimized version for sidebars and compact spaces.

```tsx
import { LogoCompact } from "@/components/ui/logo"

<LogoCompact 
  size="sm"           // "xs" | "sm" | "md"
  href="/"            // Link destination (set to null for no link)
  className=""        // Additional classes
  priority={false}    // Image loading priority
/>
```

### `LogoIcon` (Icon Only)
Minimal icon-only version for very small spaces.

```tsx
import { LogoIcon } from "@/components/ui/logo"

<LogoIcon 
  size="sm"           // "xs" | "sm" | "md" | "lg"
  href="/"            // Link destination (set to null for no link)
  className=""        // Additional classes
/>
```

## Size Guide

| Size | Height | Best Used For |
|------|--------|---------------|
| xs   | 24px (h-6) | Mobile nav, badges |
| sm   | 32px (h-8) | Sidebar, compact areas |
| md   | 40px (h-10) | Headers, auth pages |
| lg   | 48px (h-12) | Landing page, hero sections |
| xl   | 64px (h-16) | Large displays, hero sections |

## Usage Examples

### Landing Page Header
```tsx
<Logo 
  size="lg" 
  showText={true} 
  href="/" 
  textClassName="text-white"
  priority={true}
/>
```

### Sidebar
```tsx
<LogoCompact 
  size="sm" 
  href="/dashboard" 
  priority={true}
/>
```

### Auth Pages
```tsx
<Logo 
  size="md" 
  showText={true} 
  href="/"
  textClassName="text-[#013F5C]"
  priority={true}
/>
```

### Mobile Navigation
```tsx
<LogoIcon 
  size="sm" 
  href="/"
/>
```

## Features

- **Responsive Design**: Automatic sizing adjustments
- **Performance Optimized**: Next.js Image optimization with priority loading
- **Accessibility**: Proper alt text and ARIA labels
- **Interactive**: Hover effects and smooth transitions
- **Flexible**: Multiple size options and text toggle
- **SEO Friendly**: Proper semantic markup

## File Locations

- Logo Image: `/public/images/onetime-logo.png`
- Component: `/components/ui/logo.tsx`
- Export: `/components/logo.tsx` (for easy imports)

## Brand Guidelines

- Use the full logo with text for main headers and landing pages
- Use compact version for sidebars and secondary navigation
- Use icon-only version for very small spaces or mobile
- Maintain proper contrast ratios
- Always use priority loading for above-the-fold logos
- Ensure logo is accessible and scalable across all devices
