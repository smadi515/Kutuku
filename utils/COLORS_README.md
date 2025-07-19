# Kutuku App Color System

This document explains how to use the centralized color system in the Kutuku React Native application.

## Overview

All colors used throughout the application are now centralized in `utils/colors.ts`. This makes it easy to:
- Change the entire app's theme by modifying one file
- Maintain consistency across all components
- Implement dark mode or different themes in the future

## Color Categories

### Primary Brand Colors
- `colors.primary.main` - Main purple brand color (#7B2FF2)
- `colors.primary.light` - Light purple background (#F7F0FF)
- `colors.primary.dark` - Darker purple for hover states (#5A1FD9)
- `colors.primary.gradient` - Gradient colors for backgrounds

### Secondary Colors
- `colors.secondary.pink` - Pink accent color (#F357A8)
- `colors.secondary.lightPink` - Very light pink background (#F7F0FF)

### Neutral Colors
- `colors.neutral.white` - Pure white (#FFFFFF)
- `colors.neutral.black` - Pure black (#000000)
- `colors.neutral.transparent` - Transparent

### Gray Scale
- `colors.gray[50]` to `colors.gray[900]` - Complete gray scale from light to dark

### Status Colors
- `colors.status.success` - Success/Info color (#00BCD4)
- `colors.status.error` - Error/Red color (#FF0000)
- `colors.status.warning` - Warning/Orange color (#FFA500)

### Background Colors
- `colors.background.primary` - Main app background (#F7F7FB)
- `colors.background.secondary` - Card/Component background (#FFFFFF)
- `colors.background.tertiary` - Light purple background (#F5F0FF)
- `colors.background.overlay` - Modal overlay (rgba(0,0,0,0.3))

### Text Colors
- `colors.text.primary` - Primary text color (#000000)
- `colors.text.secondary` - Secondary text color (#333333)
- `colors.text.tertiary` - Tertiary text color (#666666)
- `colors.text.placeholder` - Placeholder text color (#AAAAAA)

### Border Colors
- `colors.border.light` - Light border (#EEEEEE)
- `colors.border.medium` - Medium purple-gray border (#E0D7F7)
- `colors.border.primary` - Primary purple border (#7B2FF2)

### Component-Specific Colors
- `colors.button.*` - Button-specific colors
- `colors.input.*` - Input field colors
- `colors.card.*` - Card component colors
- `colors.tab.*` - Tab navigation colors
- `colors.loading.*` - Loading indicator colors

## How to Use

### 1. Import the colors
```typescript
import colors from '../utils/colors';
// or
import { colors, getColor } from '../utils/colors';
```

### 2. Use colors in your components
```typescript
// Direct usage
<View style={{ backgroundColor: colors.primary.main }}>
  <Text style={{ color: colors.text.primary }}>Hello World</Text>
</View>

// In StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderColor: colors.border.light,
  },
  text: {
    color: colors.text.secondary,
  },
});
```

### 3. Using the getColor helper function
```typescript
// For legacy color values or dynamic color selection
const color = getColor('primary.main'); // Returns '#7B2FF2'
const fallbackColor = getColor('nonexistent.color', '#000000'); // Returns fallback
```

## How to Change Colors

### To change the entire app theme:

1. **Edit `utils/colors.ts`**
   ```typescript
   export const colors = {
     primary: {
       main: '#YOUR_NEW_COLOR', // Change this to your new primary color
       light: '#YOUR_LIGHT_COLOR',
       dark: '#YOUR_DARK_COLOR',
     },
     // ... other colors
   };
   ```

2. **Common color changes:**
   - **Primary brand color**: Change `colors.primary.main`
   - **Background color**: Change `colors.background.primary`
   - **Text color**: Change `colors.text.primary`
   - **Button colors**: Change `colors.button.primary.*`

### Example: Change to a blue theme
```typescript
export const colors = {
  primary: {
    main: '#2196F3', // Blue instead of purple
    light: '#E3F2FD', // Light blue background
    dark: '#1976D2', // Darker blue
    gradient: {
      start: '#2196F3',
      end: '#03DAC6', // Teal gradient end
    },
  },
  // ... update other colors accordingly
};
```

## Migration Guide

### From hardcoded colors to centralized system:

**Before:**
```typescript
<View style={{ backgroundColor: '#7B2FF2' }}>
  <Text style={{ color: '#000' }}>Text</Text>
</View>
```

**After:**
```typescript
<View style={{ backgroundColor: colors.primary.main }}>
  <Text style={{ color: colors.text.primary }}>Text</Text>
</View>
```

### From named colors to centralized system:

**Before:**
```typescript
<View style={{ backgroundColor: 'purple' }}>
  <Text style={{ color: 'white' }}>Text</Text>
</View>
```

**After:**
```typescript
<View style={{ backgroundColor: colors.primary.main }}>
  <Text style={{ color: colors.text.white }}>Text</Text>
</View>
```

## Benefits

1. **Consistency**: All components use the same color palette
2. **Maintainability**: Change colors in one place
3. **Theming**: Easy to implement dark mode or different themes
4. **Type Safety**: TypeScript support for color names
5. **Documentation**: Clear naming conventions and organization

## Future Enhancements

- **Dark Mode**: Add dark theme colors alongside light theme
- **Theme Switching**: Implement runtime theme switching
- **Color Validation**: Add validation for color values
- **Accessibility**: Ensure proper contrast ratios
- **Brand Guidelines**: Align with official brand color guidelines

## Notes

- All existing hardcoded colors have been identified and mapped
- The `legacyColors` object provides backward compatibility
- The `getColor` helper function can handle both new and old color references
- Colors are organized by semantic meaning rather than just visual appearance 