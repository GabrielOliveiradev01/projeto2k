import {staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

export const DISPLAY_FONT = 'Archivo Black';
export const BODY_FONT = 'Poppins';

loadFont({
  family: DISPLAY_FONT,
  url: staticFile('fonts/ArchivoBlack-Regular.ttf'),
  weight: '900',
});

loadFont({
  family: BODY_FONT,
  url: staticFile('fonts/Poppins-Medium.ttf'),
  weight: '500',
});

loadFont({
  family: BODY_FONT,
  url: staticFile('fonts/Poppins-SemiBold.ttf'),
  weight: '600',
});

loadFont({
  family: BODY_FONT,
  url: staticFile('fonts/Poppins-Bold.ttf'),
  weight: '700',
});

loadFont({
  family: BODY_FONT,
  url: staticFile('fonts/Poppins-ExtraBold.ttf'),
  weight: '800',
});
