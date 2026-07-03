export const COLORS = {
  orange: '#F0611C',
  orangeLight: '#FF8A4C',
  purple: '#674EA8',
  purpleDark: '#3E2E6B',
  purpleDeep: '#241A47',
  white: '#FFFFFF',
  offWhite: '#F6F3FF',
  ink: '#160F2E',
};

export const FPS = 30;

export const FONT_FAMILY =
  '"Liberation Sans", "Helvetica Neue", Arial, sans-serif';

export const gradientBg = (
  angle = 135,
  from = COLORS.purpleDeep,
  to = COLORS.purpleDark,
) => `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
