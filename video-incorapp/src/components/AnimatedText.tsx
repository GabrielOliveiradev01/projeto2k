import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_FAMILY} from '../theme';

export const AnimatedText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  rise?: number;
}> = ({children, delay = 0, style, rise = 28}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - delay;

  const progress = spring({
    frame: local,
    fps,
    config: {damping: 200, stiffness: 120, mass: 0.9},
  });

  const opacity = interpolate(local, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(progress, [0, 1], [rise, 0]);

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const AnimatedWord: React.FC<{
  text: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({text, delay = 0, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');

  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', ...style}}>
      {words.map((w, i) => {
        const local = frame - delay - i * 2;
        const progress = spring({
          frame: local,
          fps,
          config: {damping: 200, stiffness: 140, mass: 0.7},
        });
        const opacity = interpolate(local, [0, fps * 0.35], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const translateY = interpolate(progress, [0, 1], [18, 0]);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity,
              transform: `translateY(${translateY}px)`,
              marginRight: '0.28em',
              whiteSpace: 'nowrap',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
