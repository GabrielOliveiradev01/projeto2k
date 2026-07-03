import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg} from '../theme';
import {AnimatedWord} from '../components/AnimatedText';
import {LogoMark} from '../components/Logo';

const PANELS = [
  {w: 220, h: 140, x: -300, y: -110, delay: 20},
  {w: 180, h: 180, x: 260, y: -130, delay: 30},
  {w: 240, h: 120, x: -280, y: 130, delay: 40},
  {w: 190, h: 150, x: 280, y: 140, delay: 50},
  {w: 160, h: 100, x: 0, y: -200, delay: 60},
  {w: 160, h: 100, x: 0, y: 210, delay: 70},
];

export const Scene3Assembly: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const ringProgress = (offset: number) =>
    interpolate((frame + offset) % 70, [0, 70], [0, 1]);

  const hubScale = spring({frame, fps, config: {damping: 14, stiffness: 120}});

  return (
    <AbsoluteFill style={{background: gradientBg(135, COLORS.purpleDeep, COLORS.purpleDark)}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        {[0, 24, 48].map((offset) => {
          const p = ringProgress(offset);
          return (
            <div
              key={offset}
              style={{
                position: 'absolute',
                width: 120 + p * 420,
                height: 120 + p * 420,
                borderRadius: '50%',
                border: `2px solid ${COLORS.orange}`,
                opacity: 1 - p,
              }}
            />
          );
        })}

        {PANELS.map((p, i) => {
          const local = frame - p.delay;
          const s = spring({frame: local, fps, config: {damping: 14, stiffness: 140}});
          const scale = interpolate(s, [0, 1], [0.3, 1]);
          const opacity = interpolate(local, [0, 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: p.w,
                height: p.h,
                transform: `translate(${p.x}px, ${p.y}px) scale(${scale})`,
                opacity,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.94)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: 18,
                  background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.orange})`,
                }}
              />
              <div style={{padding: 12, display: 'flex', flexDirection: 'column', gap: 8}}>
                <div style={{height: 8, width: '70%', background: '#e3ddf5', borderRadius: 4}} />
                <div style={{height: 8, width: '50%', background: '#e3ddf5', borderRadius: 4}} />
                <div style={{height: 8, width: '85%', background: '#f0ddd0', borderRadius: 4}} />
              </div>
            </div>
          );
        })}

        <div style={{transform: `scale(${hubScale})`}}>
          <LogoMark size={96} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 100}}>
        <AnimatedWord
          text="Nossa equipe transforma cada detalhe em uma experiência digital."
          delay={12}
          style={{
            color: COLORS.white,
            fontSize: 42,
            fontWeight: 700,
            maxWidth: 1050,
            textAlign: 'center',
            textShadow: '0 6px 30px rgba(0,0,0,0.5)',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
