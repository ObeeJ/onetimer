# OneTimer Button Style Guide

## Overview
This document outlines the consistent button styling system implemented across the OneTimer survey platform. All buttons use rounded corners (rounded-xl), consistent brand colors, and proper hover states.

## Button Variants

### Brand-Specific Variants

#### Filler Buttons (Blue Theme)
- **`filler`**: Primary blue button for filler users
  - Background: `#013F5C`
  - Hover: `#012d42`
  - Text: White
  - Usage: Primary CTAs for filler users

- **`filler-outline`**: Outlined blue button for filler users
  - Border: `#013F5C`
  - Background: White → `#013F5C` on hover
  - Text: `#013F5C` → White on hover
  - Usage: Secondary actions for filler users

#### Creator Buttons (Orange Theme)
- **`creator`**: Primary orange button for creator users
  - Background: `#C1654B`
  - Hover: `#a55440`
  - Text: White
  - Usage: Primary CTAs for creator users

- **`creator-outline`**: Outlined orange button for creator users
  - Border: `#C1654B`
  - Background: White → `#C1654B` on hover
  - Text: `#C1654B` → White on hover
  - Usage: Secondary actions for creator users

### General Variants

#### Primary Variants
- **`default`**: Default orange button (same as creator)
- **`accent`**: Blue accent button (same as filler)

#### Secondary Variants
- **`secondary`**: Light gray button
- **`outline`**: Generic outlined button
- **`ghost`**: Transparent button with hover state
- **`link`**: Text-only button with underline
- **`destructive`**: Red button for dangerous actions

## Button Sizes

- **`sm`**: Small button (h-8, rounded-lg, px-4, text-xs)
- **`default`**: Standard button (h-10, px-6, py-2)
- **`lg`**: Large button (h-12, rounded-xl, px-8, text-base)
- **`icon`**: Square icon button (h-10, w-10)

## Design Principles

### Corner Radius
- All buttons use `rounded-xl` (12px border radius) by default
- Small buttons use `rounded-lg` (8px border radius)
- Large buttons maintain `rounded-xl`

### Brand Colors
- **Filler Blue**: `#013F5C` (primary), `#012d42` (hover)
- **Creator Orange**: `#C1654B` (primary), `#a55440` (hover)

### Hover Effects
- Smooth transitions with `transition-all duration-300`
- Subtle scale effect with `active:scale-[0.98]`
- Shadow enhancements on hover
- Focus rings for accessibility

### Consistency Rules
1. Always use the appropriate brand variant for user roles
2. Maintain consistent spacing and sizing
3. Use semantic color coding (blue for fillers, orange for creators)
4. Ensure proper contrast ratios for accessibility

## Usage Examples

### Filler Interface
```tsx
// Primary action
<Button variant="filler">Start Taking Surveys</Button>

// Secondary action
<Button variant="filler-outline">Complete Profile</Button>
```

### Creator Interface
```tsx
// Primary action
<Button variant="creator">Create Survey</Button>

// Secondary action
<Button variant="creator-outline">Import Survey</Button>
```

### Role Selection
```tsx
// Filler path
<Button variant="filler" size="lg">Start earning now</Button>

// Creator path
<Button variant="creator" size="lg">Start creating surveys</Button>
```

## Implementation Notes

### Component Location
- Main button component: `components/ui/button.tsx`
- Uses `class-variance-authority` for variant management
- Built on top of Radix UI primitives

### Custom Classes Override
- Avoid using custom background colors directly
- Use the provided variants instead of `className` overrides
- If custom styling is needed, extend the variants in the button component

### Accessibility
- All buttons include proper focus states
- Keyboard navigation support
- Screen reader friendly
- Proper contrast ratios maintained

## Migration Notes

### Before (Custom Classes)
```tsx
<button className="bg-[#013F5C] hover:bg-[#012d42] text-white rounded-xl px-6 py-2">
  Button Text
</button>
```

### After (Consistent Variants)
```tsx
<Button variant="filler">
  Button Text
</Button>
```

## Quality Assurance

### Checklist
- [ ] All buttons use proper variants
- [ ] No custom background color classes
- [ ] Consistent corner radius (rounded-xl)
- [ ] Proper brand color usage
- [ ] Hover states working correctly
- [ ] Focus states accessible
- [ ] Mobile responsiveness maintained

### Testing
- Test all button states (default, hover, focus, active, disabled)
- Verify color consistency across different pages
- Check mobile responsiveness
- Validate accessibility with screen readers
- Ensure proper contrast ratios

## Future Enhancements

### Planned Features
- Dark mode support
- Animation variants
- Loading states
- Icon positioning options
- Size variants for mobile optimization

### Maintenance
- Regular audit of button usage across the platform
- Update brand colors if design system changes
- Monitor accessibility compliance
- Performance optimization for animations