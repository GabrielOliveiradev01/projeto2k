import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg} from '../theme';
import {AnimatedWord} from '../components/AnimatedText';
import {AppTopBar, PhoneFrame} from '../components/DeviceFrames';
import {Skyline} from '../components/Skyline';

export const Scene8Result: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = spring({frame, fps, config: {damping: 16, stiffness: 100}});
  const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
  const bob = Math.sin(frame / 18) * 12;
  const scale = interpolate(enter, [0, 1], [0.7, 1]);

  return (
    <AbsoluteFill style={{background: gradientBg(160, '#2A1F55', COLORS.purpleDeep)}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', opacity: 0.55}}>
        <Skyline highlightIndex={7} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 30% 55%, ${COLORS.orange}33, transparent 55%)`,
        }}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingRight: 60}}>
        <div
          style={{
            transform: `translate(160px, ${bob}px) scale(${scale})`,
            opacity,
          }}
        >
          <PhoneFrame width={280} height={560}>
            <AppTopBar title="Residencial Aurora" />
            <div style={{padding: 14, display: 'flex', flexDirection: 'column', gap: 10}}>
              <div
                style={{
                  height: 120,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.orange})`,
                }}
              />
              <div style={{height: 10, width: '75%', background: '#e3ddf5', borderRadius: 5}} />
              <div style={{height: 10, width: '55%', background: '#e3ddf5', borderRadius: 5}} />
              <div style={{height: 38, borderRadius: 19, background: COLORS.orange}} />
            </div>
          </PhoneFrame>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 90}}>
        <AnimatedWord
          text="Uma experiência que valoriza o seu lançamento e fortalece sua marca."
          delay={18}
          style={{
            color: COLORS.white,
            fontSize: 42,
            fontWeight: 700,
            maxWidth: 560,
            textAlign: 'left',
            justifyContent: 'flex-start',
            textShadow: '0 6px 30px rgba(0,0,0,0.5)',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
