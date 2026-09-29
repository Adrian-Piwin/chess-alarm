export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  light: string;
  dark: string;
  /** Last-move highlight, drawn over the square colour. */
  lastMove: string;
  selected: string;
  wrong: string;
  hintArrow: string;
  check: string;
}

export type BoardThemeId = 'meadow' | 'walnut' | 'glacier' | 'slate';

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  meadow: {
    id: 'meadow',
    name: 'Meadow',
    light: '#EDEBD3',
    dark: '#6E9A6A',
    lastMove: 'rgba(240, 214, 84, 0.55)',
    selected: 'rgba(240, 214, 84, 0.7)',
    wrong: 'rgba(229, 83, 75, 0.75)',
    hintArrow: 'rgba(255, 160, 40, 0.85)',
    check: 'rgba(229, 60, 50, 0.85)',
  },
  walnut: {
    id: 'walnut',
    name: 'Walnut',
    light: '#F0DCB8',
    dark: '#B3835C',
    lastMove: 'rgba(205, 210, 106, 0.6)',
    selected: 'rgba(205, 210, 106, 0.8)',
    wrong: 'rgba(229, 83, 75, 0.75)',
    hintArrow: 'rgba(40, 150, 90, 0.85)',
    check: 'rgba(229, 60, 50, 0.85)',
  },
  glacier: {
    id: 'glacier',
    name: 'Glacier',
    light: '#E4ECF2',
    dark: '#7B9CB4',
    lastMove: 'rgba(120, 200, 230, 0.55)',
    selected: 'rgba(120, 200, 230, 0.75)',
    wrong: 'rgba(229, 83, 75, 0.75)',
    hintArrow: 'rgba(255, 150, 40, 0.85)',
    check: 'rgba(229, 60, 50, 0.85)',
  },
  slate: {
    id: 'slate',
    name: 'Slate',
    light: '#D9DCE1',
    dark: '#6C7482',
    lastMove: 'rgba(150, 190, 110, 0.6)',
    selected: 'rgba(150, 190, 110, 0.8)',
    wrong: 'rgba(229, 83, 75, 0.75)',
    hintArrow: 'rgba(255, 170, 50, 0.9)',
    check: 'rgba(229, 60, 50, 0.85)',
  },
};

export const DEFAULT_BOARD_THEME: BoardThemeId = 'meadow';
