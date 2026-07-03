import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg} from '../theme';
import {Skyline} from '../components/Skyline';
import {SceneHeadline} from '../components/SceneHeadline';
import {DotGrid} from '../components/BrandWatermark';

export const Scene1Opportunity: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.55], {
    extrapolateRight: 'clamp',
  });
  const translateX = interpolate(frame, [0, durationInFrames], [0, -140], {
    extrapolateRight: 'clamp',
  });
  const sunOpacity = interpolate(frame, [0, 25], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: gradientBg(160, COLORS.white, COLORS.offWhite)}}>
      <DotGrid opacity={0.35} />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 40,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.orangeSoft} 0%, rgba(255,228,211,0) 70%)`,
          transform: 'translateX(-50%)',
          opacity: sunOpacity,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          transform: `scale(${scale}) translateX(${translateX}px)`,
          transformOrigin: '58% 90%',
        }}
      >
        <Skyline highlightIndex={12} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(255,255,255,0) 55%, rgba(255,255,255,0.94) 88%)`,
        }}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 96}}>
        <SceneHeadline
          eyebrow="IncorApp apresenta"
          title="Todo empreendimento merece uma apresentação memorável."
          subtitle="Tecnologia e design a serviço do seu lançamento imobiliário."
          delay={34}
          maxWidth={1150}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
