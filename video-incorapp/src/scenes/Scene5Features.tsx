import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_FAMILY, gradientBg, gradientBrand, SHADOW_MD} from '../theme';
import {DotGrid} from '../components/BrandWatermark';
import {AnimatedText} from '../components/AnimatedText';
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
  {Icon: IconBlueprint, label: 'Plantas Humanizadas', desc: 'Visualização realista dos ambientes'},
  {Icon: IconStar, label: 'Perspectivas 3D', desc: 'Renderizações que encantam'},
  {Icon: IconImage, label: 'Galeria de Imagens', desc: 'Fotos em alta qualidade'},
  {Icon: IconVideo, label: 'Vídeos', desc: 'Tour completo do empreendimento'},
  {Icon: IconMap, label: 'Localização', desc: 'Mapa interativo da região'},
  {Icon: IconGear, label: 'Diferenciais', desc: 'O que torna o projeto único'},
  {Icon: IconMemo, label: 'Memorial Descritivo', desc: 'Especificações técnicas completas'},
  {Icon: IconDoc, label: 'Informações Técnicas', desc: 'Dados essenciais em um clique'},
];

export const Scene5Features: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{background: gradientBg(135, COLORS.white, COLORS.offWhite)}}>
      <DotGrid opacity={0.3} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 80}}>
        <AnimatedText
          delay={0}
          rise={14}
          style={{
            color: COLORS.orange,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Tudo em um só lugar
        </AnimatedText>
        <AnimatedText
          delay={4}
          rise={18}
          style={{
            color: COLORS.ink,
            fontSize: 38,
            fontWeight: 800,
            marginBottom: 40,
          }}
        >
          Recursos completos para o seu lançamento
        </AnimatedText>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 250px)',
            gridTemplateRows: 'repeat(2, 176px)',
            gap: 22,
          }}
        >
          {FEATURES.map((f, i) => {
            const delay = 10 + i * 16;
            const local = frame - delay;
            const s = spring({frame: local, fps: 30, config: {damping: 13, stiffness: 160}});
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
                  background: COLORS.white,
                  border: `1.5px solid ${COLORS.border}`,
                  boxShadow: `${SHADOW_MD}, 0 0 ${glow * 36}px rgba(240,97,28,${glow * 0.35})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '0 16px',
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: gradientBrand(135),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <f.Icon size={27} color={COLORS.white} />
                </div>
                <span
                  style={{
                    color: COLORS.ink,
                    fontSize: 16,
                    fontWeight: 700,
                    textAlign: 'center',
                    maxWidth: 200,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {f.label}
                </span>
                <span
                  style={{
                    color: COLORS.inkSoft,
                    fontSize: 12.5,
                    fontWeight: 500,
                    textAlign: 'center',
                    maxWidth: 195,
                    lineHeight: 1.35,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {f.desc}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
