
export interface CustomFont {
  id: string;
  name: string;
  type: 'google' | 'direct' | 'upload';
  value: string; // URL for google/direct, Base64 for upload
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  fontFamily: string;
  scale: number; // Percentage (e.g. 100 for 100%)
  customFonts: CustomFont[];
}

// Palette 895 defaults
export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#d1a845',
  secondaryColor: '#8A9E74', // Sage Green
  backgroundColor: '#fbf8eb', // Cream
  cardBackgroundColor: '#ffffff',
  fontFamily: 'Inter',
  scale: 100,
  customFonts: []
};

// Helper to adjust color brightness
const adjustBrightness = (col: string, amt: number) => {
  let usePound = false;
  if (col[0] === "#") {
    col = col.slice(1);
    usePound = true;
  }
  let num = parseInt(col, 16);
  let r = (num >> 16) + amt;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00FF) + amt;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  let g = (num & 0x0000FF) + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
};

const injectFontResource = (font: CustomFont) => {
  const head = document.head;
  const id = `font-style-${font.id}`;
  
  if (document.getElementById(id)) return; // Already injected

  if (font.type === 'google') {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = font.value;
    head.appendChild(link);
  } else {
    // Direct URL or Base64 Upload -> Use @font-face
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @font-face {
        font-family: '${font.name}';
        src: url('${font.value}') format('woff2'); /* Fallback attempt, browser auto-detects usually */
        font-weight: normal;
        font-style: normal;
      }
    `;
    head.appendChild(style);
  }
};

const loadStandardGoogleFont = (fontName: string) => {
  // Don't load if it's a known system/custom font
  const standardFonts = ['Inter', 'Roboto', 'Lato', 'Poppins', 'Montserrat', 'Open Sans'];
  if (!standardFonts.includes(fontName)) return;

  const linkId = 'aelgo-standard-font';
  let link = document.getElementById(linkId) as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  const formattedName = fontName.replace(/\s+/g, '+');
  link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;600;700&display=swap`;
};

export const applyTheme = (theme: ThemeConfig) => {
  const root = document.documentElement;

  // 1. Load Custom Fonts
  if (theme.customFonts) {
    theme.customFonts.forEach(injectFontResource);
  }

  // 2. Load Standard Font if needed
  loadStandardGoogleFont(theme.fontFamily);

  // 3. Set Font Family Variable
  // If it's a custom font, use its name. If standard, use it directly.
  root.style.setProperty('--font-primary', `'${theme.fontFamily}', sans-serif`);
  root.style.fontSize = `${theme.scale}%`;

  // 4. Card Background
  root.style.setProperty('--color-card-bg', theme.cardBackgroundColor);

  // 5. Background Scale
  root.style.setProperty('--color-gray-50', theme.backgroundColor);
  root.style.setProperty('--color-gray-100', adjustBrightness(theme.backgroundColor, -10)); 
  root.style.setProperty('--color-gray-200', adjustBrightness(theme.backgroundColor, -35));

  // 6. Primary Scale
  root.style.setProperty('--color-primary-500', theme.primaryColor);
  root.style.setProperty('--color-primary-50', adjustBrightness(theme.primaryColor, 150));
  root.style.setProperty('--color-primary-100', adjustBrightness(theme.primaryColor, 120));
  root.style.setProperty('--color-primary-200', adjustBrightness(theme.primaryColor, 90));
  root.style.setProperty('--color-primary-300', adjustBrightness(theme.primaryColor, 60));
  root.style.setProperty('--color-primary-400', adjustBrightness(theme.primaryColor, 30));
  root.style.setProperty('--color-primary-600', adjustBrightness(theme.primaryColor, -20));
  root.style.setProperty('--color-primary-700', adjustBrightness(theme.primaryColor, -40));
  root.style.setProperty('--color-primary-800', adjustBrightness(theme.primaryColor, -60));
  root.style.setProperty('--color-primary-900', adjustBrightness(theme.primaryColor, -80));

  // 7. Secondary Scale
  root.style.setProperty('--color-secondary-500', theme.secondaryColor);
  root.style.setProperty('--color-secondary-50', adjustBrightness(theme.secondaryColor, 150));
  root.style.setProperty('--color-secondary-100', adjustBrightness(theme.secondaryColor, 120));
  root.style.setProperty('--color-secondary-200', adjustBrightness(theme.secondaryColor, 90));
  root.style.setProperty('--color-secondary-300', adjustBrightness(theme.secondaryColor, 60));
  root.style.setProperty('--color-secondary-400', adjustBrightness(theme.secondaryColor, 30));
  root.style.setProperty('--color-secondary-600', adjustBrightness(theme.secondaryColor, -20));
  root.style.setProperty('--color-secondary-700', adjustBrightness(theme.secondaryColor, -40));
  root.style.setProperty('--color-secondary-800', adjustBrightness(theme.secondaryColor, -60));
  root.style.setProperty('--color-secondary-900', adjustBrightness(theme.secondaryColor, -80));

  // Save to storage
  localStorage.setItem('aelgo_theme', JSON.stringify(theme));
};

export const loadTheme = () => {
  const stored = localStorage.getItem('aelgo_theme');
  if (stored) {
    try {
      const theme = JSON.parse(stored);
      // Merge with default to handle new fields if missing
      const merged = { ...DEFAULT_THEME, ...theme };
      applyTheme(merged);
      return merged;
    } catch (e) {
      console.error("Failed to load theme", e);
    }
  }
  // Default is applied
  applyTheme(DEFAULT_THEME);
  return DEFAULT_THEME;
};

export const resetTheme = () => {
  applyTheme(DEFAULT_THEME);
  return DEFAULT_THEME;
};
