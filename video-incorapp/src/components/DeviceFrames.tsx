import React from 'react';
import {COLORS} from '../theme';

export const PhoneFrame: React.FC<{
  width?: number;
  height?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({width = 360, height = 740, children, style}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 54,
        background: 'linear-gradient(160deg,#2a2140,#120c24)',
        padding: 14,
        boxShadow:
          '0 40px 90px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.06) inset',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 40,
          overflow: 'hidden',
          position: 'relative',
          background: COLORS.offWhite,
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 120,
          height: 24,
          background: '#120c24',
          borderRadius: 14,
        }}
      />
    </div>
  );
};

export const TabletFrame: React.FC<{
  width?: number;
  height?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({width = 620, height = 460, children, style}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 28,
        background: 'linear-gradient(160deg,#2a2140,#120c24)',
        padding: 16,
        boxShadow:
          '0 50px 110px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.06) inset',
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 16,
          overflow: 'hidden',
          background: COLORS.offWhite,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const AppTopBar: React.FC<{title?: string}> = ({title = 'IncorApp'}) => (
  <div
    style={{
      height: 64,
      background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.orange})`,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 24,
      color: 'white',
      fontWeight: 700,
      fontSize: 20,
      letterSpacing: 0.3,
    }}
  >
    {title}
  </div>
);
