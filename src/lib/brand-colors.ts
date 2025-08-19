// Axonix Brand Colors - Thematic Dark Purple Theme
export const axonixColors = {
  // Primary Purple Shades - Strong Thematic Darks
  primary: {
    50: '#f8f6ff',   // Lightest pastel background
    100: '#f0ecff',  // Very light pastel
    200: '#e5ddff',  // Light pastel
    300: '#d1c4ff',  // Soft pastel
    400: '#b8a5ff',  // Medium pastel
    500: '#9d84ff',  // Main brand pastel purple
    600: '#6d56d4',  // Stronger medium-dark
    700: '#4c3bad',  // Strong dark professional
    800: '#3a2c8a',  // Very dark thematic
    900: '#2d1f6b',  // Deepest thematic purple
  },
  
  // Professional Accent Colors
  accent: {
    soft: '#b8a5ff',      // Soft pastel accent
    medium: '#6d56d4',    // Stronger medium-dark accent
    dark: '#3a2c8a',      // Very dark thematic accent
  },
  
  // Professional Status Colors
  status: {
    success: '#4ade80',    // Soft green
    warning: '#fbbf24',    // Soft amber
    error: '#f87171',      // Soft red
    info: '#60a5fa',       // Soft blue
  },
  
  // Professional Backgrounds
  background: {
    light: 'linear-gradient(135deg, #f8f6ff 0%, #f0ecff 100%)',
    medium: 'linear-gradient(135deg, #f0ecff 0%, #e5ddff 100%)',
    card: 'linear-gradient(135deg, #ffffff 0%, #f8f6ff 100%)',
    subtle: 'linear-gradient(135deg, #e5ddff 0%, #d1c4ff 100%)',
    professional: 'linear-gradient(135deg, #2d1f6b 0%, #3a2c8a 50%, #4c3bad 100%)',
    thematic: 'linear-gradient(135deg, #4c3bad 0%, #6d56d4 50%, #9d84ff 100%)',
  },
  
  // Professional borders and shadows
  border: {
    light: 'rgba(157, 132, 255, 0.15)',
    medium: 'rgba(109, 86, 212, 0.25)',
    dark: 'rgba(76, 59, 173, 0.35)',
    accent: 'rgba(58, 44, 138, 0.4)',
  },
  
  // Glass-morphism effects - more subtle
  glass: {
    light: 'rgba(255, 255, 255, 0.85)',
    medium: 'rgba(255, 255, 255, 0.92)',
    card: 'rgba(248, 246, 255, 0.88)',
    overlay: 'rgba(109, 86, 212, 0.08)',
  }
};

// CSS Custom Properties for easy theme switching
export const axonixCSSVariables = `
  :root {
    --axonix-primary: ${axonixColors.primary[500]};
    --axonix-primary-light: ${axonixColors.primary[300]};
    --axonix-primary-dark: ${axonixColors.primary[700]};
    --axonix-accent-soft: ${axonixColors.accent.soft};
    --axonix-accent-medium: ${axonixColors.accent.medium};
    --axonix-accent-dark: ${axonixColors.accent.dark};
    --axonix-bg-light: ${axonixColors.background.light};
    --axonix-bg-medium: ${axonixColors.background.medium};
    --axonix-bg-card: ${axonixColors.background.card};
    --axonix-border-light: ${axonixColors.border.light};
    --axonix-border-medium: ${axonixColors.border.medium};
    --axonix-glass-card: ${axonixColors.glass.card};
  }
`;

// Utility functions for theme generation
export const getAxonixGradient = (variant: 'light' | 'medium' | 'card' | 'subtle' | 'professional' = 'light') => {
  return axonixColors.background[variant];
};

export const getAxonixPrimary = (shade: keyof typeof axonixColors.primary = 500) => {
  return axonixColors.primary[shade];
};

export const getAxonixBorder = (variant: 'light' | 'medium' | 'dark' | 'accent' = 'light') => {
  return axonixColors.border[variant];
};

export default axonixColors;