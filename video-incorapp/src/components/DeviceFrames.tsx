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
          '0 40px 90px rgba(27,19,48,0.28), 0 6px 18px rgba(27,19,48,0.14), 0 0 0 2px rgba(255,255,255,0.06) inset',
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
          '0 50px 110px rgba(27,19,48,0.26), 0 6px 20px rgba(27,19,48,0.12), 0 0 0 2px rgba(255,255,255,0.06) inset',
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

export const TVFrame: React.FC<{
  width?: number;
  height?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({width = 760, height = 440, children, style}) => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', ...style}}>
      <div
        style={{
          width,
          height,
          borderRadius: 14,
          background: 'linear-gradient(160deg,#232030,#0e0c16)',
          padding: 12,
          boxShadow:
            '0 40px 90px rgba(27,19,48,0.28), 0 6px 18px rgba(27,19,48,0.14), 0 0 0 2px rgba(255,255,255,0.05) inset',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 4,
            overflow: 'hidden',
            background: COLORS.offWhite,
          }}
        >
          {children}
        </div>
      </div>
      <div
        style={{
          width: 10,
          height: 34,
          background: 'linear-gradient(180deg,#2c2838,#0e0c16)',
        }}
      />
      <div
        style={{
          width: width * 0.36,
          height: 10,
          borderRadius: 6,
          background: 'linear-gradient(180deg,#2c2838,#0e0c16)',
          boxShadow: '0 14px 24px rgba(27,19,48,0.22)',
        }}
      />
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
