import React from 'react';
import {
  ArchivoBlack_Regular_ttf,
  Poppins_Bold_ttf,
  Poppins_ExtraBold_ttf,
  Poppins_Medium_ttf,
  Poppins_SemiBold_ttf,
} from './fontData';

export const DISPLAY_FONT = 'Archivo Black';
export const BODY_FONT = 'Poppins';

const css = `
@font-face {
  font-family: '${DISPLAY_FONT}';
  src: url('${ArchivoBlack_Regular_ttf}') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: '${BODY_FONT}';
  src: url('${Poppins_Medium_ttf}') format('truetype');
  font-weight: 500;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: '${BODY_FONT}';
  src: url('${Poppins_SemiBold_ttf}') format('truetype');
  font-weight: 600;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: '${BODY_FONT}';
  src: url('${Poppins_Bold_ttf}') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: '${BODY_FONT}';
  src: url('${Poppins_ExtraBold_ttf}') format('truetype');
  font-weight: 800;
  font-style: normal;
  font-display: block;
}
`;

export const FontStyles: React.FC = () => React.createElement('style', {dangerouslySetInnerHTML: {__html: css}});
