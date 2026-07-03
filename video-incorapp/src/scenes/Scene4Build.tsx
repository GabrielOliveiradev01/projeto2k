import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, gradientBg} from '../theme';
import {AnimatedWord} from '../components/AnimatedText';
import {AppTopBar, PhoneFrame} from '../components/DeviceFrames';

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
        background: gradient
          ? `linear-gradient(120deg, ${COLORS.purple}, ${COLORS.orange})`
          : '#E4DEF7',
        transform: `scaleY(${scaleY})`,
        transformOrigin: 'top',
        opacity,
      }}
    />
  );
};

export const Scene4Build: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const phoneS = spring({frame, fps, config: {damping: 16, stiffness: 110}});
  const phoneScale = interpolate(phoneS, [0, 1], [0.6, 1]);
  const phoneOpacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: gradientBg(135, COLORS.purpleDark, COLORS.purpleDeep)}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 10}}>
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
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 90}}>
        <AnimatedWord
          text="Criamos um aplicativo exclusivo para o seu empreendimento."
          delay={16}
          style={{
            color: COLORS.white,
            fontSize: 40,
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
