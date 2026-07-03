import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg} from '../theme';
import {AnimatedWord} from '../components/AnimatedText';
import {IconBlueprint, IconDoc, IconImage, IconVideo} from '../components/Icons';

const FILES = [
  {Icon: IconBlueprint, label: 'Plantas', fromX: -560, fromY: -220, rot: -18},
  {Icon: IconImage, label: 'Fotos', fromX: 540, fromY: -260, rot: 14},
  {Icon: IconVideo, label: 'Vídeos', fromX: -580, fromY: 240, rot: 12},
  {Icon: IconDoc, label: 'Documentos', fromX: 560, fromY: 260, rot: -16},
  {Icon: IconBlueprint, label: 'Renders', fromX: 0, fromY: -340, rot: 6},
  {Icon: IconDoc, label: 'Memorial', fromX: 0, fromY: 340, rot: -6},
];

export const Scene2Files: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const hubScale = spring({frame: frame - 70, fps, config: {damping: 12}});

  return (
    <AbsoluteFill style={{background: gradientBg(135, COLORS.purpleDeep, COLORS.purpleDark)}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            position: 'absolute',
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${COLORS.orange}, transparent 70%)`,
            opacity: 0.9,
            transform: `scale(${1 + hubScale * 1.4})`,
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
                width: 120,
                height: 90,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.08)',
                border: `1px solid ${COLORS.orangeLight}55`,
                backdropFilter: 'blur(4px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
              }}
            >
              <f.Icon size={32} color={COLORS.white} />
              <span style={{color: COLORS.white, fontSize: 13, fontWeight: 600, fontFamily: 'inherit'}}>
                {f.label}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 110}}>
        <AnimatedWord
          text="Você envia todo o material do empreendimento."
          delay={14}
          style={{
            color: COLORS.white,
            fontSize: 46,
            fontWeight: 700,
            maxWidth: 1000,
            textAlign: 'center',
            textShadow: '0 6px 30px rgba(0,0,0,0.5)',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
