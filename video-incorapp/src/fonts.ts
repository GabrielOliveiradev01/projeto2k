import {loadFont} from '@remotion/fonts';
import {
  ArchivoBlack_Regular_ttf,
  Poppins_Bold_ttf,
  Poppins_ExtraBold_ttf,
  Poppins_Medium_ttf,
  Poppins_SemiBold_ttf,
} from './fontData';

export const DISPLAY_FONT = 'Archivo Black';
export const BODY_FONT = 'Poppins';

loadFont({
  family: DISPLAY_FONT,
  url: ArchivoBlack_Regular_ttf,
  weight: '900',
  format: 'truetype',
});

loadFont({
  family: BODY_FONT,
  url: Poppins_Medium_ttf,
  weight: '500',
  format: 'truetype',
});

loadFont({
  family: BODY_FONT,
  url: Poppins_SemiBold_ttf,
  weight: '600',
  format: 'truetype',
});

loadFont({
  family: BODY_FONT,
  url: Poppins_Bold_ttf,
  weight: '700',
  format: 'truetype',
});

loadFont({
  family: BODY_FONT,
  url: Poppins_ExtraBold_ttf,
  weight: '800',
  format: 'truetype',
});
