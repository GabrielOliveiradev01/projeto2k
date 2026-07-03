import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg} from '../theme';
import {Skyline} from '../components/Skyline';
import {AnimatedWord} from '../components/AnimatedText';

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
  const vignette = interpolate(frame, [durationInFrames - 20, durationInFrames], [0, 0.55], {
    extrapolateLeft: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: gradientBg(160, '#2A1F55', COLORS.purpleDeep)}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 90,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.orange} 0%, rgba(240,97,28,0) 70%)`,
          transform: 'translateX(-50%)',
          opacity: sunOpacity,
          filter: 'blur(2px)',
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
        style={{background: `radial-gradient(circle at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,${vignette}) 100%)`}}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 110}}>
        <AnimatedWord
          text="Todo empreendimento merece uma apresentação memorável."
          delay={38}
          style={{
            color: COLORS.white,
            fontSize: 46,
            fontWeight: 700,
            maxWidth: 1100,
            textAlign: 'center',
            textShadow: '0 6px 30px rgba(0,0,0,0.5)',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
