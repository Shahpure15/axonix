// Socratic Wingman Brand Colors - Thematic Dark Purple Theme
export const socraticWingmanColors = {
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
export const socraticWingmanCSSVariables = `
  :root {
    --socratic-wingman-primary: ${socraticWingmanColors.primary[500]};
    --socratic-wingman-primary-light: ${socraticWingmanColors.primary[300]};
    --socratic-wingman-primary-dark: ${socraticWingmanColors.primary[700]};
    --socratic-wingman-accent-soft: ${socraticWingmanColors.accent.soft};
    --socratic-wingman-accent-medium: ${socraticWingmanColors.accent.medium};
    --socratic-wingman-accent-dark: ${socraticWingmanColors.accent.dark};
    --socratic-wingman-bg-light: ${socraticWingmanColors.background.light};
    --socratic-wingman-bg-medium: ${socraticWingmanColors.background.medium};
    --socratic-wingman-bg-card: ${socraticWingmanColors.background.card};
    --socratic-wingman-border-light: ${socraticWingmanColors.border.light};
    --socratic-wingman-border-medium: ${socraticWingmanColors.border.medium};
    --socratic-wingman-glass-card: ${socraticWingmanColors.glass.card};
  }
`;

// Utility functions for theme generation
export const getSocraticWingmanGradient = (variant: 'light' | 'medium' | 'card' | 'subtle' | 'professional' = 'light') => {
  return socraticWingmanColors.background[variant];
};

export const getSocraticWingmanPrimary = (shade: keyof typeof socraticWingmanColors.primary = 500) => {
  return socraticWingmanColors.primary[shade];
};

export const getSocraticWingmanBorder = (variant: 'light' | 'medium' | 'dark' | 'accent' = 'light') => {
  return socraticWingmanColors.border[variant];
};

export default socraticWingmanColors;