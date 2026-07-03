import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, gradientBg, gradientBrand} from '../theme';
import {SceneHeadline} from '../components/SceneHeadline';
import {DotGrid} from '../components/BrandWatermark';
import {PhoneFrame} from '../components/DeviceFrames';

const SCREENS: {title: string; accent: string}[] = [
  {title: 'Perspectivas 3D', accent: COLORS.orange},
  {title: 'Galeria de Imagens', accent: COLORS.purple},
  {title: 'Localização', accent: COLORS.orange},
];

const ScreenContent: React.FC<{title: string; accent: string}> = ({title, accent}) => (
  <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
    <div
      style={{
        height: 60,
        background: `linear-gradient(90deg, ${COLORS.purple}, ${accent})`,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 20,
        color: 'white',
        fontWeight: 700,
        fontSize: 17,
      }}
    >
      {title}
    </div>
    <div style={{flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
      <div style={{flex: 1, borderRadius: 16, background: `linear-gradient(160deg, ${accent}33, ${COLORS.purple}33)`}} />
      <div style={{height: 12, width: '70%', background: COLORS.purpleSoft, borderRadius: 6}} />
      <div style={{height: 12, width: '50%', background: COLORS.purpleSoft, borderRadius: 6}} />
      <div style={{height: 44, borderRadius: 22, background: accent}} />
    </div>
  </div>
);

export const Scene7Experience: React.FC = () => {
  const frame = useCurrentFrame();
  const segment = 60;
  const rawIndex = frame / segment;
  const clampedIndex = interpolate(rawIndex, [0, SCREENS.length - 1], [0, SCREENS.length - 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const trackWidth = 300;

  return (
    <AbsoluteFill style={{background: gradientBg(135, COLORS.white, COLORS.offWhite)}}>
      <DotGrid opacity={0.3} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 170}}>
        <div style={{transform: 'scale(1.02)'}}>
          <PhoneFrame width={340} height={640}>
            <div
              style={{
                display: 'flex',
                width: trackWidth * SCREENS.length,
                height: '100%',
                transform: `translateX(${-clampedIndex * trackWidth}px)`,
              }}
            >
              {SCREENS.map((s, i) => (
                <div key={i} style={{width: trackWidth, height: '100%'}}>
                  <ScreenContent title={s.title} accent={s.accent} />
                </div>
              ))}
            </div>
          </PhoneFrame>
        </div>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            display: 'flex',
            gap: 8,
            transform: 'translate(-50%, 250px)',
          }}
        >
          {SCREENS.map((_, i) => {
            const active = Math.round(clampedIndex) === i;
            return (
              <div
                key={i}
                style={{
                  width: active ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: active ? COLORS.orange : COLORS.border,
                  transition: 'width 0.2s',
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 96}}>
        <SceneHeadline
          eyebrow="Experiência do usuário"
          title="Mais tecnologia. Mais organização. Mais credibilidade."
          subtitle="Navegação fluida em todas as telas, do começo ao fim da jornada."
          delay={16}
          maxWidth={1050}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
