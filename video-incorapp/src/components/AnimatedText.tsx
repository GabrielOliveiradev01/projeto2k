import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BODY_FONT, FONT_FAMILY} from '../theme';

export const AnimatedText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  rise?: number;
}> = ({children, delay = 0, style, rise = 22}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - delay;

  const progress = spring({
    frame: local,
    fps,
    config: {damping: 15, stiffness: 170, mass: 0.7},
  });

  const opacity = interpolate(local, [0, fps * 0.35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(progress, [0, 1], [rise, 0]);
  const blur = interpolate(local, [0, 8], [6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        opacity,
        transform: `translateY(${translateY}px)`,
        filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const seededRot = (i: number) => {
  const seq = [-7, 5, -4, 6, -3, 4, -6, 3, -5, 7, -2, 5];
  return seq[i % seq.length];
};

export const AnimatedWord: React.FC<{
  text: string;
  delay?: number;
  style?: React.CSSProperties;
  stagger?: number;
}> = ({text, delay = 0, style, stagger = 3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');

  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', ...style}}>
      {words.map((w, i) => {
        const local = frame - delay - i * stagger;
        const progress = spring({
          frame: local,
          fps,
          config: {damping: 11, stiffness: 220, mass: 0.75},
        });
        const opacity = interpolate(local, [0, fps * 0.22], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const scale = interpolate(progress, [0, 0.6, 1], [0.3, 1.12, 1]);
        const rot = interpolate(progress, [0, 1], [seededRot(i), 0]);
        const translateY = interpolate(progress, [0, 1], [34, 0]);
        const blur = interpolate(local, [0, 6], [10, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity,
              transform: `translateY(${translateY}px) scale(${scale}) rotate(${rot}deg)`,
              filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
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

export const GhostWordBackdrop: React.FC<{
  word: string;
  color?: string;
  opacity?: number;
}> = ({word, color = '#000', opacity = 0.05}) => {
  const rows = 4;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {Array.from({length: rows}).map((_, i) => (
        <div
          key={i}
          style={{
            fontFamily: 'inherit',
            fontWeight: 900,
            fontSize: 118,
            color,
            opacity,
            whiteSpace: 'nowrap',
            letterSpacing: 2,
            transform: i % 2 === 0 ? 'translateX(-40px)' : 'translateX(40px)',
          }}
        >
          {`${word}  ${word}  ${word}`}
        </div>
      ))}
    </div>
  );
};

export const HighlightWord: React.FC<{
  children: React.ReactNode;
  bg?: string;
  fg?: string;
  delay?: number;
}> = ({children, bg = '#F0611C', fg = '#fff', delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - delay;
  const s = spring({frame: local, fps, config: {damping: 12, stiffness: 200}});
  const scaleX = interpolate(s, [0, 1], [0, 1]);

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        padding: '2px 14px',
        marginRight: '0.28em',
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: bg,
          borderRadius: 10,
          transform: `scaleX(${scaleX})`,
          transformOrigin: 'left center',
          zIndex: 0,
        }}
      />
      <span style={{position: 'relative', zIndex: 1, color: fg, fontFamily: 'inherit', fontWeight: 'inherit'}}>
        {children}
      </span>
    </span>
  );
};

export const BODY_FONT_FAMILY = `"${BODY_FONT}", "Liberation Sans", sans-serif`;
