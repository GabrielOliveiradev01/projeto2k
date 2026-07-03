export const COLORS = {
  orange: '#F0611C',
  orangeLight: '#FF8A4C',
  orangeSoft: '#FFE4D3',
  purple: '#674EA8',
  purpleDark: '#3E2E6B',
  purpleDeep: '#241A47',
  purpleSoft: '#EAE5F7',
  white: '#FFFFFF',
  offWhite: '#F7F6FB',
  panel: '#FBFAFD',
  border: '#E7E3F3',
  ink: '#1B1330',
  inkSoft: '#5B5470',
  muted: '#8B84A0',
};

export const FPS = 30;

export const FONT_FAMILY =
  '"Liberation Sans", "Helvetica Neue", Arial, sans-serif';

export const gradientBg = (
  angle = 135,
  from = COLORS.white,
  to = COLORS.offWhite,
) => `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;

export const gradientBrand = (angle = 135) =>
  `linear-gradient(${angle}deg, ${COLORS.purple} 0%, ${COLORS.orange} 100%)`;

export const SHADOW_SM = '0 8px 24px rgba(27,19,48,0.08)';
export const SHADOW_MD = '0 20px 48px rgba(27,19,48,0.12)';
export const SHADOW_LG = '0 34px 80px rgba(27,19,48,0.16)';
