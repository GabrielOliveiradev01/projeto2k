import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_FAMILY, gradientBg} from '../theme';
import {AnimatedText} from '../components/AnimatedText';
import {DotGrid} from '../components/BrandWatermark';
import {Logo} from '../components/Logo';
import {IconBuilding} from '../components/Icons';

const DeviceIcon: React.FC<{label: string}> = ({label}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: COLORS.orange,
      }}
    />
    <span style={{color: COLORS.ink, fontSize: 16, fontWeight: 700, fontFamily: FONT_FAMILY}}>
      {label}
    </span>
  </div>
);

export const Scene9Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const logoS = spring({frame, fps, config: {damping: 13, stiffness: 110}});
  const logoScale = interpolate(logoS, [0, 1], [0.6, 1]);
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
  const glow = interpolate(frame, [0, 40], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        background: gradientBg(135, COLORS.white, COLORS.offWhite),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <DotGrid opacity={0.35} />
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.orangeSoft} 0%, transparent 60%)`,
          opacity: glow,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.purpleSoft} 0%, transparent 65%)`,
          opacity: glow,
        }}
      />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
            color: COLORS.orange,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          <IconBuilding size={18} color={COLORS.orange} />
          Apresentações imobiliárias digitais
        </div>
        <div style={{transform: `scale(${logoScale})`, opacity: logoOpacity}}>
          <Logo />
        </div>
        <AnimatedText
          delay={48}
          style={{
            color: COLORS.inkSoft,
            fontSize: 28,
            fontWeight: 500,
            maxWidth: 720,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Apresentações imobiliárias que transformam a forma de vender
          empreendimentos.
        </AnimatedText>
        <div style={{display: 'flex', gap: 28, marginTop: 8, opacity: interpolate(frame, [70, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          <DeviceIcon label="Celular" />
          <DeviceIcon label="Tablet" />
          <DeviceIcon label="TV / Telão" />
        </div>
      </div>
    </AbsoluteFill>
  );
};
