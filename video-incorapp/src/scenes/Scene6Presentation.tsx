import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg} from '../theme';
import {AnimatedWord} from '../components/AnimatedText';
import {AppTopBar, TabletFrame} from '../components/DeviceFrames';

export const Scene6Presentation: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = spring({frame, fps, config: {damping: 16, stiffness: 100}});
  const scale = interpolate(enter, [0, 1], [0.75, 1]);
  const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});

  const rotateY = interpolate(frame, [0, 90, 180], [-14, 14, -14]);
  const rotateX = 6;

  return (
    <AbsoluteFill style={{background: gradientBg(135, COLORS.purpleDark, COLORS.purpleDeep)}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 1400}}>
        <div
          style={{
            transform: `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            opacity,
          }}
        >
          <TabletFrame width={640} height={440}>
            <AppTopBar title="Residencial Aurora — IncorApp" />
            <div style={{display: 'flex', height: 'calc(100% - 64px)'}}>
              <div style={{flex: 1.3, padding: 18, display: 'flex', flexDirection: 'column', gap: 12}}>
                <div
                  style={{
                    height: '55%',
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.orange})`,
                  }}
                />
                <div style={{height: 12, width: '80%', background: '#e3ddf5', borderRadius: 6}} />
                <div style={{height: 12, width: '60%', background: '#e3ddf5', borderRadius: 6}} />
                <div style={{height: 12, width: '70%', background: '#f0ddd0', borderRadius: 6}} />
              </div>
              <div
                style={{
                  flex: 1,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  borderLeft: '1px solid #eee2f7',
                }}
              >
                {['Plantas', 'Galeria', 'Vídeos', 'Localização', 'Diferenciais'].map((t, i) => (
                  <div
                    key={t}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: i === 1 ? `${COLORS.orange}22` : '#f4f1fb',
                      border: i === 1 ? `1.5px solid ${COLORS.orange}` : '1px solid #e6e1f5',
                      color: COLORS.ink,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </TabletFrame>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 90}}>
        <AnimatedWord
          text="Tudo organizado para impressionar desde o primeiro contato."
          delay={20}
          style={{
            color: COLORS.white,
            fontSize: 42,
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
