import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg} from '../theme';
import {AnimatedText} from '../components/AnimatedText';
import {Logo} from '../components/Logo';

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
        background: gradientBg(135, COLORS.purpleDeep, '#150c2c'),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.orange}33 0%, transparent 60%)`,
          opacity: glow,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.purple}33 0%, transparent 65%)`,
          opacity: glow,
        }}
      />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <div style={{transform: `scale(${logoScale})`, opacity: logoOpacity}}>
          <Logo />
        </div>
        <AnimatedText
          delay={48}
          style={{
            color: COLORS.offWhite,
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
      </div>
    </AbsoluteFill>
  );
};
