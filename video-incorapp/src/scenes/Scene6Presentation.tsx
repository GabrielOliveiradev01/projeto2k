import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg, gradientBrand} from '../theme';
import {SceneHeadline} from '../components/SceneHeadline';
import {DotGrid} from '../components/BrandWatermark';
import {AppTopBar, TabletFrame, TVFrame} from '../components/DeviceFrames';

export const Scene6Presentation: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const tvS = spring({frame, fps, config: {damping: 16, stiffness: 95}});
  const tvOpacity = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  const tvScale = interpolate(tvS, [0, 1], [0.85, 1]);

  const tabS = spring({frame: frame - 18, fps, config: {damping: 16, stiffness: 100}});
  const tabScale = interpolate(tabS, [0, 1], [0.7, 1]);
  const tabOpacity = interpolate(frame, [18, 34], [0, 1], {extrapolateRight: 'clamp'});

  const rotateY = interpolate(frame, [0, 90, 180], [-8, 8, -8]);

  return (
    <AbsoluteFill style={{background: gradientBg(135, COLORS.white, COLORS.offWhite)}}>
      <DotGrid opacity={0.3} />

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 170}}>
        <div style={{transform: `scale(${tvScale * 0.72}) translateX(-40px)`, opacity: tvOpacity}}>
          <TVFrame width={820} height={470}>
            <AppTopBar title="Residencial Aurora — IncorApp" />
            <div style={{padding: 22, display: 'flex', gap: 18, height: 'calc(100% - 76px)'}}>
              <div
                style={{
                  flex: 1.3,
                  borderRadius: 16,
                  background: gradientBrand(135),
                }}
              />
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center'}}>
                {['Plantas', 'Galeria', 'Vídeos', 'Localização', 'Diferenciais'].map((t, i) => (
                  <div
                    key={t}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 12,
                      background: i === 1 ? COLORS.orangeSoft : COLORS.panel,
                      border: i === 1 ? `1.5px solid ${COLORS.orange}` : `1px solid ${COLORS.border}`,
                      color: COLORS.ink,
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </TVFrame>
        </div>

        <div
          style={{
            position: 'absolute',
            transform: `translate(300px, 130px) scale(${tabScale * 0.62}) rotateY(${rotateY}deg)`,
            opacity: tabOpacity,
            perspective: 1200,
          }}
        >
          <TabletFrame width={640} height={440}>
            <AppTopBar title="Residencial Aurora" />
            <div style={{display: 'flex', height: 'calc(100% - 64px)'}}>
              <div style={{flex: 1.3, padding: 18, display: 'flex', flexDirection: 'column', gap: 12}}>
                <div
                  style={{
                    height: '55%',
                    borderRadius: 14,
                    background: gradientBrand(135),
                  }}
                />
                <div style={{height: 12, width: '80%', background: COLORS.purpleSoft, borderRadius: 6}} />
                <div style={{height: 12, width: '60%', background: COLORS.purpleSoft, borderRadius: 6}} />
                <div style={{height: 12, width: '70%', background: COLORS.orangeSoft, borderRadius: 6}} />
              </div>
              <div
                style={{
                  flex: 1,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  borderLeft: `1px solid ${COLORS.border}`,
                }}
              >
                {['Plantas', 'Galeria', 'Vídeos'].map((t, i) => (
                  <div
                    key={t}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: i === 1 ? COLORS.orangeSoft : COLORS.panel,
                      border: i === 1 ? `1.5px solid ${COLORS.orange}` : `1px solid ${COLORS.border}`,
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

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 96}}>
        <SceneHeadline
          eyebrow="No estande ou no atendimento"
          title="Tudo organizado para impressionar desde o primeiro contato."
          subtitle="Do telão da sala de vendas ao tablet do corretor — a mesma experiência premium."
          delay={20}
          maxWidth={1080}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
