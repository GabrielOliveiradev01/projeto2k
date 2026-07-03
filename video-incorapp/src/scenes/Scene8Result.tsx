import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg, gradientBrand, SHADOW_MD} from '../theme';
import {SceneHeadline} from '../components/SceneHeadline';
import {DotGrid} from '../components/BrandWatermark';
import {AppTopBar, PhoneFrame, TVFrame} from '../components/DeviceFrames';
import {Skyline} from '../components/Skyline';

const StatBadge: React.FC<{delay: number; x: number; y: number; value: string; label: string}> = ({
  delay,
  x,
  y,
  value,
  label,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - delay;
  const s = spring({frame: local, fps, config: {damping: 15, stiffness: 150}});
  const scale = interpolate(s, [0, 1], [0.5, 1]);
  const opacity = interpolate(local, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${scale})`,
        opacity,
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: '14px 20px',
        boxShadow: SHADOW_MD,
        textAlign: 'center',
      }}
    >
      <div style={{fontSize: 26, fontWeight: 800, color: COLORS.orange}}>{value}</div>
      <div style={{fontSize: 12.5, fontWeight: 600, color: COLORS.inkSoft}}>{label}</div>
    </div>
  );
};

export const Scene8Result: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = spring({frame, fps, config: {damping: 16, stiffness: 100}});
  const tvScale = interpolate(enter, [0, 1], [0.7, 1]);
  const tvOpacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});

  const phoneS = spring({frame: frame - 24, fps, config: {damping: 16, stiffness: 110}});
  const phoneScale = interpolate(phoneS, [0, 1], [0.5, 1]);
  const phoneOpacity = interpolate(frame, [24, 40], [0, 1], {extrapolateRight: 'clamp'});
  const bob = Math.sin(frame / 18) * 10;

  return (
    <AbsoluteFill style={{background: gradientBg(160, COLORS.white, COLORS.offWhite)}}>
      <DotGrid opacity={0.3} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', opacity: 0.5}}>
        <Skyline highlightIndex={7} />
      </AbsoluteFill>

      <StatBadge delay={46} x={210} y={190} value="+38%" label="taxa de conversão" />
      <StatBadge delay={60} x={1560} y={640} value="5x" label="mais engajamento" />

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 170}}>
        <div style={{transform: `scale(${tvScale * 0.62}) translateX(-60px)`, opacity: tvOpacity}}>
          <TVFrame width={820} height={470}>
            <AppTopBar title="Residencial Aurora" />
            <div style={{padding: 22, display: 'flex', flexDirection: 'column', gap: 14, height: 'calc(100% - 76px)'}}>
              <div style={{flex: 1, borderRadius: 16, background: gradientBrand(135)}} />
              <div style={{display: 'flex', gap: 14}}>
                <div style={{flex: 1, height: 16, background: COLORS.purpleSoft, borderRadius: 8}} />
                <div style={{flex: 1, height: 16, background: COLORS.orangeSoft, borderRadius: 8}} />
              </div>
            </div>
          </TVFrame>
        </div>

        <div
          style={{
            position: 'absolute',
            transform: `translate(360px, ${100 + bob}px) scale(${phoneScale * 0.62})`,
            opacity: phoneOpacity,
          }}
        >
          <PhoneFrame width={280} height={560}>
            <AppTopBar title="Residencial Aurora" />
            <div style={{padding: 14, display: 'flex', flexDirection: 'column', gap: 10}}>
              <div style={{height: 120, borderRadius: 12, background: gradientBrand(135)}} />
              <div style={{height: 10, width: '75%', background: COLORS.purpleSoft, borderRadius: 5}} />
              <div style={{height: 10, width: '55%', background: COLORS.purpleSoft, borderRadius: 5}} />
              <div style={{height: 38, borderRadius: 19, background: COLORS.orange}} />
            </div>
          </PhoneFrame>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 96}}>
        <SceneHeadline
          eyebrow="O resultado"
          title="Uma experiência que valoriza o seu lançamento e fortalece sua marca."
          subtitle="Presença profissional em qualquer tela — do estande ao bolso do cliente."
          delay={18}
          maxWidth={1080}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
