// Kutuku App Color Palette
// This file contains all colors used throughout the application
// Update these colors to change the entire app's theme

export const colors = {
    // Primary Brand Colors
    primary: {
        main: '#7B2FF2', // Main purple brand color
        light: '#F7F0FF', // Light purple background
        dark: '#5A1FD9', // Darker purple for hover states
        gradient: {
            start: '#7B2FF2',
            end: '#F357A8', // Pink gradient end
        },
    },

    // Secondary Colors
    secondary: {
        pink: '#F357A8', // Pink accent color
        lightPink: '#F7F0FF', // Very light pink background
    },

    // Neutral Colors
    neutral: {
        white: '#FFFFFF',
        black: '#000000',
        transparent: 'transparent',
    },

    // Gray Scale
    gray: {
        50: '#F7F7FB', // Very light gray background
        100: '#F5F5F5', // Light gray background
        200: '#E0E0E0', // Light gray borders
        300: '#E0D7F7', // Light purple-gray border
        400: '#CCCCCC', // Medium gray
        500: '#AAAAAA', // Medium gray for placeholders
        600: '#888888', // Medium gray for secondary text
        700: '#666666', // Darker gray for secondary text
        800: '#555555', // Dark gray
        900: '#333333', // Very dark gray for primary text
    },

    // Status Colors
    status: {
        success: '#00BCD4', // Success/Info color (cyan)
        error: '#FF0000', // Error/Red color
        warning: '#FFA500', // Warning/Orange color
        info: '#00BCD4', // Info color
    },

    // Background Colors
    background: {
        primary: '#F7F7FB', // Main app background
        secondary: '#FFFFFF', // Card/Component background
        tertiary: '#F5F0FF', // Light purple background
        overlay: 'rgba(0,0,0,0.3)', // Modal overlay
        overlayDark: 'rgba(0,0,0,0.4)', // Darker modal overlay
        overlayLight: 'rgba(0,0,0,0.18)', // Light overlay
        transparent: 'rgba(255,255,255,0.1)', // Transparent white
    },

    // Text Colors
    text: {
        primary: '#000000', // Primary text color
        secondary: '#333333', // Secondary text color
        tertiary: '#666666', // Tertiary text color
        placeholder: '#AAAAAA', // Placeholder text color
        disabled: '#CCCCCC', // Disabled text color
        white: '#FFFFFF', // White text
        purple: '#7B2FF2', // Purple text
        red: '#FF0000', // Red text for errors
        gray: '#888888', // Gray text
    },

    // Border Colors
    border: {
        light: '#EEEEEE', // Light border
        medium: '#E0D7F7', // Medium purple-gray border
        primary: '#7B2FF2', // Primary purple border
        gray: '#CCCCCC', // Gray border
    },

    // Shadow Colors
    shadow: {
        primary: '#7B2FF2', // Purple shadow
        black: '#000000', // Black shadow
    },

    // Tab Navigation Colors
    tab: {
        active: 'purple', // Active tab color
        inactive: '#999999', // Inactive tab color
        background: '#EEEEEE', // Tab bar background
    },

    // Button Colors
    button: {
        primary: {
            background: '#7B2FF2',
            text: '#FFFFFF',
            border: '#7B2FF2',
        },
        secondary: {
            background: '#E0E0E0',
            text: '#000000',
            border: '#E0E0E0',
        },
        tertiary: {
            background: 'transparent',
            text: '#7B2FF2',
            border: '#7B2FF2',
        },
        disabled: {
            background: '#E0E0E0',
            text: '#CCCCCC',
            border: '#CCCCCC',
        },
    },

    // Input Colors
    input: {
        background: '#F5F5F5',
        border: '#EEEEEE',
        text: '#333333',
        placeholder: '#AAAAAA',
        icon: '#888888',
    },

    // Card Colors
    card: {
        background: '#FFFFFF',
        border: '#EEEEEE',
        shadow: '#7B2FF2',
    },

    // Loading/Activity Indicator Colors
    loading: {
        primary: '#7B2FF2',
        secondary: '#000000',
        gray: '#CCCCCC',
    },

    // Badge Colors
    badge: {
        background: '#FF0000', // Red badge background
        text: '#FFFFFF', // Badge text color
    },

    // Rating Colors
    rating: {
        filled: '#FFD700', // Gold for filled stars
        empty: '#CCCCCC', // Gray for empty stars
    },

    // Currency Colors
    currency: {
        positive: '#00FF00', // Green for positive values
        negative: '#FF0000', // Red for negative values
    },
};

// Legacy color mappings for backward compatibility
export const legacyColors = {
    // Direct hex values that were used in the original code
    '#7B2FF2': colors.primary.main,
    '#F357A8': colors.secondary.pink,
    '#F7F0FF': colors.primary.light,
    '#E0D7F7': colors.gray[300],
    '#F7F7FB': colors.gray[50],
    '#F5F0FF': colors.background.tertiary,
    '#FFFFFF': colors.neutral.white,
    '#000000': colors.neutral.black,
    '#333333': colors.text.secondary,
    '#666666': colors.text.tertiary,
    '#888888': colors.text.gray,
    '#AAAAAA': colors.text.placeholder,
    '#CCCCCC': colors.gray[400],
    '#EEEEEE': colors.border.light,
    '#E0E0E0': colors.gray[200],
    '#FF0000': colors.status.error,
    '#00BCD4': colors.status.success,
    'purple': colors.primary.main,
    'white': colors.neutral.white,
    'black': colors.neutral.black,
    'gray': colors.gray[400],
    'red': colors.status.error,
    'green': colors.status.success,
    'transparent': colors.neutral.transparent,
};

// Helper function to get color with fallback
export const getColor = (colorKey: string, fallback: string = colors.neutral.black): string => {
    // Check if it's a direct hex value
    if (colorKey.startsWith('#')) {
        return legacyColors[colorKey as keyof typeof legacyColors] || colorKey;
    }

    // Check if it's a named color
    if (legacyColors[colorKey as keyof typeof legacyColors]) {
        return legacyColors[colorKey as keyof typeof legacyColors];
    }

    // Check if it's a nested color path (e.g., 'primary.main')
    const path = colorKey.split('.');
    let current: any = colors;

    for (const key of path) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return fallback;
        }
    }

    return typeof current === 'string' ? current : fallback;
};

// Export default colors object
export default colors; 