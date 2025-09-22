# VAI Tourist App - Theme System Documentation

## Overview

The VAI Tourist App now features a comprehensive, modular theme system that enables easy switching between light and dark modes, and provides a foundation for creating custom themes. This system replaces all hardcoded color values with semantic naming conventions.

## 🎨 Theme Structure

### Color Architecture

The theme system is built on three layers:

1. **CSS Custom Properties** - Foundation layer with actual color values
2. **Tailwind Config** - Maps CSS variables to Tailwind classes
3. **Component Classes** - Reusable semantic components

### Color Categories

#### UI Surface Colors
```css
--color-surface-primary    /* Main card/form backgrounds */
--color-surface-secondary  /* Modal/container backgrounds */
--color-surface-tertiary   /* Disabled/inactive backgrounds */
--color-surface-elevated   /* Floating card backgrounds */
--color-surface-overlay    /* Page/backdrop backgrounds */
```

#### UI Border Colors
```css
--color-border-primary    /* Main borders */
--color-border-secondary  /* Secondary borders */
--color-border-muted      /* Light borders */
--color-border-focus      /* Focus ring colors */
```

#### UI Text Colors
```css
--color-text-primary     /* Main text */
--color-text-secondary   /* Secondary text */
--color-text-muted       /* Muted text */
--color-text-disabled    /* Disabled text */
--color-text-inverse     /* Inverse text for light backgrounds */
```

#### Interactive Colors
```css
--color-interactive-primary        /* Primary buttons */
--color-interactive-primary-hover  /* Primary button hover */
--color-interactive-primary-light  /* Light interactive elements */
--color-interactive-secondary      /* Secondary buttons */
--color-interactive-focus          /* Focus states */
```

#### Status Colors
```css
--color-status-success       /* Success states */
--color-status-success-light /* Success text */
--color-status-success-bg    /* Success backgrounds */
--color-status-error         /* Error states */
--color-status-warning       /* Warning states */
--color-status-caution       /* Caution states */
--color-status-info          /* Info states */
```

#### Mood Colors (Tourism-specific)
```css
--color-mood-adventure  /* Adventure tours (Orange) */
--color-mood-relax      /* Relaxation tours (Blue) */
--color-mood-culture    /* Cultural tours (Purple) */
--color-mood-ocean      /* Ocean tours (Cyan) */
--color-mood-luxury     /* Luxury tours (Pink) */
```

## 🚀 Usage

### Tailwind Classes

Use semantic Tailwind classes instead of hardcoded colors:

```jsx
// ❌ Before (hardcoded)
<div className="bg-slate-800 text-slate-400 border-slate-700">

// ✅ After (semantic)
<div className="bg-ui-surface-secondary text-ui-text-secondary border-ui-border-primary">
```

### Component Classes

Use pre-built component classes for common patterns:

```jsx
// Surfaces
<div className="vai-surface">          {/* Primary surface */}
<div className="vai-surface-elevated"> {/* Elevated card */}

// Buttons
<button className="vai-button-primary">   {/* Primary button */}
<button className="vai-button-secondary"> {/* Secondary button */}
<button className="vai-button-success">   {/* Success button */}

// Forms
<input className="vai-input">          {/* Standard input */}
<input className="vai-input-error">    {/* Error state input */}

// Text
<p className="vai-text-secondary">     {/* Secondary text */}
<p className="vai-text-success">       {/* Success text */}

// Badges
<span className="vai-badge-success">   {/* Success badge */}
<span className="vai-badge-warning">   {/* Warning badge */}
```

### Theme Switching

#### Using the ThemeToggle Component

```jsx
import ThemeToggle from './components/shared/ThemeToggle'

function Header() {
  return (
    <div>
      <ThemeToggle size="small" variant="ghost" />
    </div>
  )
}
```

#### Using the Theme Hook

```jsx
import { useTheme } from './contexts/ThemeContext'

function CustomComponent() {
  const { theme, isDark, isLight, toggleTheme } = useTheme()

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'} mode
      </button>
    </div>
  )
}
```

## 🎯 Migration Guide

### Converting Existing Components

1. **Background Colors**
   ```jsx
   // Replace these patterns:
   bg-slate-700 → bg-ui-surface-primary
   bg-slate-800 → bg-ui-surface-secondary
   bg-slate-600 → bg-ui-surface-tertiary
   ```

2. **Text Colors**
   ```jsx
   // Replace these patterns:
   text-slate-400 → text-ui-text-secondary
   text-slate-300 → text-ui-text-muted
   text-slate-500 → text-ui-text-disabled
   ```

3. **Interactive Colors**
   ```jsx
   // Replace these patterns:
   bg-blue-600 → bg-interactive-primary
   hover:bg-blue-700 → hover:bg-interactive-primary-hover
   focus:ring-blue-500 → focus:ring-interactive-focus
   ```

4. **Status Colors**
   ```jsx
   // Replace these patterns:
   bg-green-500 → bg-status-success
   text-red-400 → text-status-error-light
   border-orange-500 → border-status-warning
   ```

## 🔧 Customization

### Creating Custom Themes

Add new themes by extending the CSS custom properties:

```css
/* Custom "Ocean" theme */
[data-theme="ocean"] {
  --color-surface-primary: #0d4f5c;
  --color-surface-secondary: #0a3d47;
  --color-text-primary: #e0f2f1;
  --color-interactive-primary: #26c6da;
  /* ... other colors */
}
```

### Adding New Color Categories

1. **Add to CSS custom properties** (src/styles/index.css)
2. **Add to Tailwind config** (tailwind.config.js)
3. **Create component classes** (src/styles/index.css)

Example:
```css
/* 1. CSS Variables */
:root {
  --color-accent-primary: #ff6b6b;
}

/* 2. Component class */
.vai-accent {
  @apply bg-accent-primary text-white;
}
```

```js
// 3. Tailwind config
colors: {
  'accent': {
    'primary': 'var(--color-accent-primary, #ff6b6b)',
  }
}
```

## 📱 Testing

### Manual Testing Checklist

- [ ] Theme toggle button works in header
- [ ] Theme preference persists on page reload
- [ ] All components render correctly in both themes
- [ ] Form inputs maintain proper contrast
- [ ] Status indicators are clearly visible
- [ ] Modal overlays have proper backdrop colors
- [ ] Navigation elements respond to theme changes

### Automated Testing

```bash
# Build test
npm run build

# Development server
npm run dev
```

## 🎨 Design Tokens

### Light Theme Values
```css
--color-surface-primary: #f1f5f9    /* Light gray */
--color-surface-secondary: #ffffff  /* Pure white */
--color-text-primary: #0f172a       /* Dark gray */
--color-text-secondary: #475569     /* Medium gray */
```

### Dark Theme Values
```css
--color-surface-primary: #334155    /* Dark gray */
--color-surface-secondary: #1e293b  /* Darker gray */
--color-text-primary: #f8fafc       /* Off-white */
--color-text-secondary: #94a3b8     /* Light gray */
```

## 🔮 Future Enhancements

### Planned Features
- [ ] System-based automatic theme switching
- [ ] Multiple theme variants (Ocean, Sunset, etc.)
- [ ] High contrast accessibility mode
- [ ] Theme-based animation speeds
- [ ] Color-blind friendly palettes

### Theme Ideas
- **Ocean Theme**: Blues and teals for water-focused tours
- **Sunset Theme**: Warm oranges and pinks for romantic tours
- **Culture Theme**: Earth tones for cultural experiences
- **Adventure Theme**: Bold greens and oranges for active tours

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Web Accessibility Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Last Updated**: September 2025
**Version**: 1.0.0
**Author**: VAI Studio Development Team