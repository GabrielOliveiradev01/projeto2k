import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg, gradientBrand, SHADOW_MD} from '../theme';
import {SceneHeadline} from '../components/SceneHeadline';
import {DotGrid} from '../components/BrandWatermark';
import {IconBlueprint, IconDoc, IconImage, IconVideo} from '../components/Icons';

const FILES = [
  {Icon: IconBlueprint, label: 'Plantas', fromX: -560, fromY: -200, rot: -18},
  {Icon: IconImage, label: 'Fotos', fromX: 540, fromY: -240, rot: 14},
  {Icon: IconVideo, label: 'Vídeos', fromX: -580, fromY: 220, rot: 12},
  {Icon: IconDoc, label: 'Documentos', fromX: 560, fromY: 240, rot: -16},
  {Icon: IconBlueprint, label: 'Renders', fromX: 0, fromY: -320, rot: 6},
  {Icon: IconDoc, label: 'Memorial', fromX: 0, fromY: 320, rot: -6},
];

export const Scene2Files: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const hubScale = spring({frame: frame - 70, fps, config: {damping: 12}});

  return (
    <AbsoluteFill style={{background: gradientBg(135, COLORS.white, COLORS.offWhite)}}>
      <DotGrid opacity={0.35} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 90}}>
        <div
          style={{
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: `2px dashed ${COLORS.purple}55`,
            transform: `scale(${1 + hubScale * 1.6})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 74,
            height: 74,
            borderRadius: '50%',
            background: gradientBrand(135),
            boxShadow: SHADOW_MD,
            opacity: 0.95,
            transform: `scale(${1 + hubScale * 0.5})`,
          }}
        />
        {FILES.map((f, i) => {
          const delay = i * 6;
          const local = frame - delay;
          const progress = spring({
            frame: local,
            fps,
            config: {damping: 18, stiffness: 90, mass: 0.8},
          });
          const x = interpolate(progress, [0, 1], [f.fromX, 0]);
          const y = interpolate(progress, [0, 1], [f.fromY, 0]);
          const rotate = interpolate(progress, [0, 1], [f.rot, 0]);
          const opacity = interpolate(local, [0, 10, 55, 70], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const scale = interpolate(progress, [0, 1], [0.7, 1]);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
                opacity,
                width: 128,
                height: 96,
                borderRadius: 16,
                background: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: SHADOW_MD,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: gradientBrand(135),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <f.Icon size={20} color={COLORS.white} />
              </div>
              <span style={{color: COLORS.ink, fontSize: 13, fontWeight: 700, fontFamily: 'inherit'}}>
                {f.label}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 96}}>
        <SceneHeadline
          eyebrow="Passo 01"
          title="Você envia todo o material do empreendimento."
          subtitle="Plantas, renders, fotos, vídeos e documentos — tudo em um só envio."
          delay={14}
          maxWidth={1050}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
