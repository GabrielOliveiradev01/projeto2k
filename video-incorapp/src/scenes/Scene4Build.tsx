import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_FAMILY, gradientBg, gradientBrand, SHADOW_MD} from '../theme';
import {SceneHeadline} from '../components/SceneHeadline';
import {DotGrid} from '../components/BrandWatermark';
import {AppTopBar, PhoneFrame} from '../components/DeviceFrames';
import {IconGear, IconStar} from '../components/Icons';

const Block: React.FC<{
  delay: number;
  height: number;
  width?: string;
  radius?: number;
  gradient?: boolean;
}> = ({delay, height, width = '100%', radius = 10, gradient}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - delay;
  const s = spring({frame: local, fps, config: {damping: 16, stiffness: 160}});
  const scaleY = interpolate(s, [0, 1], [0, 1]);
  const opacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: gradient ? gradientBrand(120) : COLORS.purpleSoft,
        transform: `scaleY(${scaleY})`,
        transformOrigin: 'top',
        opacity,
      }}
    />
  );
};

const Chip: React.FC<{delay: number; x: number; y: number; icon: React.ReactNode; label: string}> = ({
  delay,
  x,
  y,
  icon,
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
  const bob = Math.sin((frame - delay) / 16) * 6;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + bob,
        transform: `scale(${scale})`,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 30,
        padding: '10px 18px 10px 12px',
        boxShadow: SHADOW_MD,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: gradientBrand(135),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <span style={{color: COLORS.ink, fontSize: 15, fontWeight: 700, fontFamily: FONT_FAMILY}}>
        {label}
      </span>
    </div>
  );
};

export const Scene4Build: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const phoneS = spring({frame, fps, config: {damping: 16, stiffness: 110}});
  const phoneScale = interpolate(phoneS, [0, 1], [0.6, 1]);
  const phoneOpacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: gradientBg(135, COLORS.white, COLORS.offWhite)}}>
      <DotGrid opacity={0.35} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 190}}>
        <Chip
          delay={95}
          x={330}
          y={190}
          icon={<IconStar size={14} color={COLORS.white} />}
          label="100% personalizado"
        />
        <Chip
          delay={110}
          x={1230}
          y={260}
          icon={<IconGear size={14} color={COLORS.white} />}
          label="Pronto em poucos dias"
        />
        <div style={{transform: `scale(${phoneScale})`, opacity: phoneOpacity}}>
          <PhoneFrame width={320} height={640}>
            <AppTopBar />
            <div style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
              <Block delay={20} height={140} gradient radius={14} />
              <Block delay={35} height={18} width="70%" />
              <Block delay={45} height={14} width="45%" />
              <div style={{display: 'flex', gap: 10}}>
                <Block delay={55} height={70} width="48%" radius={12} />
                <Block delay={62} height={70} width="48%" radius={12} />
              </div>
              <Block delay={72} height={14} width="90%" />
              <Block delay={78} height={14} width="80%" />
              <Block delay={88} height={46} width="100%" radius={23} gradient />
            </div>
          </PhoneFrame>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 96}}>
        <SceneHeadline
          eyebrow="Passo 03"
          title="Criamos um aplicativo exclusivo para o seu empreendimento."
          subtitle="Identidade visual, conteúdo e navegação pensados só para o seu projeto."
          delay={16}
          maxWidth={1050}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
