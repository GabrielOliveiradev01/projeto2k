import React from 'react';
import {COLORS, DISPLAY_FONT} from '../theme';

export const Logo: React.FC<{scale?: number; style?: React.CSSProperties}> = ({
  scale = 1,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        fontFamily: `"${DISPLAY_FONT}", sans-serif`,
        fontWeight: 400,
        fontSize: 92 * scale,
        letterSpacing: -1,
        ...style,
      }}
    >
      <span style={{color: COLORS.ink}}>Incor</span>
      <span style={{color: COLORS.orange}}>App</span>
    </div>
  );
};

export const LogoMark: React.FC<{size?: number}> = ({size = 64}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.orange})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 12px 30px rgba(240,97,28,0.35)',
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 11.5L12 4l9 7.5"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 10v9a1 1 0 001 1H10v-6h4v6h3.5a1 1 0 001-1v-9"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);
