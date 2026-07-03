import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, gradientBg} from '../theme';
import {AnimatedWord} from '../components/AnimatedText';
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
      <div style={{flex: 1, borderRadius: 16, background: `linear-gradient(160deg, ${accent}55, ${COLORS.purple}55)`}} />
      <div style={{height: 12, width: '70%', background: '#e3ddf5', borderRadius: 6}} />
      <div style={{height: 12, width: '50%', background: '#e3ddf5', borderRadius: 6}} />
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
    <AbsoluteFill style={{background: gradientBg(135, COLORS.purpleDeep, COLORS.purpleDark)}}>
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
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 90}}>
        <AnimatedWord
          text="Mais tecnologia. Mais organização. Mais credibilidade."
          delay={16}
          style={{
            color: COLORS.white,
            fontSize: 44,
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
