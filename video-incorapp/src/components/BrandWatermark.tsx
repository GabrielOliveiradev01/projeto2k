import React from 'react';
import {COLORS, FONT_FAMILY} from '../theme';
import {LogoMark} from './Logo';

export const BrandWatermark: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 44,
      bottom: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      opacity: 0.85,
    }}
  >
    <LogoMark size={30} />
    <span
      style={{
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: 16,
        color: COLORS.inkSoft,
        letterSpacing: 0.2,
      }}
    >
      Incor<span style={{color: COLORS.orange}}>App</span>
    </span>
  </div>
);

export const DotGrid: React.FC<{opacity?: number}> = ({opacity = 0.5}) => (
  <svg
    width="100%"
    height="100%"
    style={{position: 'absolute', inset: 0}}
  >
    <defs>
      <pattern id="dotgrid" width="34" height="34" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.6" fill={COLORS.purple} opacity={opacity} />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dotgrid)" />
  </svg>
);
