import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg, gradientBrand} from '../theme';
import {SceneHeadline} from '../components/SceneHeadline';
import {DotGrid} from '../components/BrandWatermark';
import {LogoMark} from '../components/Logo';
import {AppTopBar, TVFrame} from '../components/DeviceFrames';

const PANELS = [
  {w: 200, h: 130, x: -380, y: -100, delay: 20},
  {w: 170, h: 170, x: 370, y: -110, delay: 30},
  {w: 210, h: 110, x: -400, y: 40, delay: 40},
  {w: 180, h: 140, x: 400, y: 50, delay: 50},
  {w: 150, h: 95, x: 0, y: -230, delay: 60},
];

export const Scene3Assembly: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const ringProgress = (offset: number) =>
    interpolate((frame + offset) % 70, [0, 70], [0, 1]);

  const hubScale = spring({frame, fps, config: {damping: 14, stiffness: 120}});

  const tvLocal = frame - 66;
  const tvS = spring({frame: tvLocal, fps, config: {damping: 14, stiffness: 130}});
  const tvScale = interpolate(tvS, [0, 1], [0.32, 0.34]);
  const tvOpacity = interpolate(tvLocal, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: gradientBg(135, COLORS.white, COLORS.offWhite)}}>
      <DotGrid opacity={0.35} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 90}}>
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
                opacity: (1 - p) * 0.55,
              }}
            />
          );
        })}

        <div
          style={{
            position: 'absolute',
            transform: `translate(0px, 175px) scale(${tvScale})`,
            opacity: tvOpacity,
          }}
        >
          <TVFrame width={760} height={440}>
            <AppTopBar />
            <div style={{padding: 20, display: 'flex', gap: 16}}>
              <div
                style={{
                  flex: 1,
                  height: 260,
                  borderRadius: 14,
                  background: gradientBrand(135),
                }}
              />
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 10}}>
                <div style={{height: 14, width: '80%', background: COLORS.border, borderRadius: 6}} />
                <div style={{height: 14, width: '55%', background: COLORS.border, borderRadius: 6}} />
                <div style={{height: 14, width: '65%', background: COLORS.orangeSoft, borderRadius: 6}} />
                <div style={{height: 60}} />
                <div style={{height: 42, width: '60%', background: COLORS.purple, borderRadius: 10}} />
              </div>
            </div>
          </TVFrame>
        </div>

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
                background: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 25px 50px rgba(27,19,48,0.14)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: 18,
                  background: gradientBrand(90),
                }}
              />
              <div style={{padding: 12, display: 'flex', flexDirection: 'column', gap: 8}}>
                <div style={{height: 8, width: '70%', background: COLORS.purpleSoft, borderRadius: 4}} />
                <div style={{height: 8, width: '50%', background: COLORS.purpleSoft, borderRadius: 4}} />
                <div style={{height: 8, width: '85%', background: COLORS.orangeSoft, borderRadius: 4}} />
              </div>
            </div>
          );
        })}

        <div style={{transform: `scale(${hubScale})`, zIndex: 2}}>
          <LogoMark size={96} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 96}}>
        <SceneHeadline
          eyebrow="Passo 02"
          title="Nossa equipe transforma cada detalhe em uma experiência digital."
          subtitle="Curadoria, design e desenvolvimento feitos sob medida para o seu projeto."
          delay={12}
          maxWidth={1080}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
