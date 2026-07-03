import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg} from '../theme';
import {
  IconBlueprint,
  IconDoc,
  IconGear,
  IconImage,
  IconMap,
  IconMemo,
  IconStar,
  IconVideo,
} from '../components/Icons';

const FEATURES = [
  {Icon: IconBlueprint, label: 'Plantas Humanizadas'},
  {Icon: IconStar, label: 'Perspectivas 3D'},
  {Icon: IconImage, label: 'Galeria de Imagens'},
  {Icon: IconVideo, label: 'Vídeos'},
  {Icon: IconMap, label: 'Localização'},
  {Icon: IconGear, label: 'Diferenciais'},
  {Icon: IconMemo, label: 'Memorial Descritivo'},
  {Icon: IconDoc, label: 'Informações Técnicas'},
];

export const Scene5Features: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: gradientBg(135, COLORS.purpleDeep, COLORS.purpleDark)}}>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 90}}>
        <div
          style={{
            fontFamily: 'inherit',
            color: COLORS.white,
            fontSize: 38,
            fontWeight: 700,
            opacity: titleOpacity,
            marginBottom: 44,
          }}
        >
          Tudo em um só lugar
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 240px)',
            gridTemplateRows: 'repeat(2, 150px)',
            gap: 22,
          }}
        >
          {FEATURES.map((f, i) => {
            const delay = 10 + i * 16;
            const local = frame - delay;
            const s = spring({frame: local, fps, config: {damping: 13, stiffness: 160}});
            const scale = interpolate(s, [0, 1], [0.4, 1]);
            const opacity = interpolate(local, [0, 10], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const glow = interpolate(local, [0, 10, 26], [0, 1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={i}
                style={{
                  transform: `scale(${scale})`,
                  opacity,
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.07)',
                  border: `1.5px solid rgba(255,255,255,${0.12 + glow * 0.3})`,
                  boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 ${glow * 40}px rgba(240,97,28,${glow * 0.6})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.orange})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <f.Icon size={28} color={COLORS.white} />
                </div>
                <span
                  style={{
                    color: COLORS.white,
                    fontSize: 16,
                    fontWeight: 600,
                    textAlign: 'center',
                    maxWidth: 190,
                  }}
                >
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
