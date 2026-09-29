/**
 * Design tokens. The app is dark-first (like most chess apps) so the board is
 * the brightest thing on screen.
 */
import { Platform } from 'react-native';

export const colors = {
  background: '#16181D',
  surface: '#20232A',
  surfaceRaised: '#2A2E37',
  border: '#343944',
  text: '#F1F2F4',
  textMuted: '#A3A9B4',
  textFaint: '#6F7684',
  primary: '#56B870',
  primaryPressed: '#469C5D',
  primaryText: '#0E1A12',
  accent: '#F4BF4F',
  danger: '#E5534B',
  info: '#5AA6E8',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(8, 9, 12, 0.72)',
} as const;

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 6, md: 10, lg: 16, pill: 999 } as const;

const fontFamily = Platform.select({
  web: 'Inter, "Segoe UI", system-ui, -apple-system, Roboto, sans-serif',
  default: undefined,
});

export const typography = {
  display: { fontFamily, fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontFamily, fontSize: 22, fontWeight: '700' as const },
  heading: { fontFamily, fontSize: 17, fontWeight: '700' as const },
  body: { fontFamily, fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontFamily, fontSize: 15, fontWeight: '600' as const },
  caption: { fontFamily, fontSize: 13, fontWeight: '500' as const },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 14 },
};

/** Maximum width of content on large (web/tablet) screens. */
export const CONTENT_MAX_WIDTH = 1100;
export const BOARD_MAX_WIDTH = 560;
