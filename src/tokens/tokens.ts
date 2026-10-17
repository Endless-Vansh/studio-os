// STUDIO OS — Token Constants for JS/TS consumers

export const STUDIO_TOKENS = {
  colors: {
    studioInk: '#191A18',
    studioInkLight: '#252724',
    studioInkSubtle: '#333631',
    studioInkMuted: '#52554e',
    warmPaper: '#F1EEE6',
    warmPaperLight: '#F8F6F0',
    warmPaperElevated: '#FFFFFF',
    warmPaperDark: '#E8E4DA',
    warmPaperDeep: '#DFDAD0',
    studioVermilion: '#D65A36',
    studioVermilionHover: '#BF4D2C',
    studioVermilionSubtle: '#FAECE7',
    sage: '#D9DED3',
    sageLight: '#EDF1E9',
    sageDark: '#B8C1AE',
    sageText: '#3C4B37',
  },
  typography: {
    fontSerif: "'Newsreader', 'Playfair Display', Georgia, 'Times New Roman', serif",
    fontSans: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'JetBrains Mono', 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
  },
  borders: {
    radiusXs: '2px',
    radiusSm: '4px',
    radiusMd: '6px',
    hairline: '1px solid #E8E4DA',
    subtle: '1px solid #DFDAD0',
    ink: '1px solid #191A18',
  }
} as const;
