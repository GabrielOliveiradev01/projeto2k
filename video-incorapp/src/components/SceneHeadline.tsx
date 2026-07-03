import React from 'react';
import {COLORS, FONT_FAMILY} from '../theme';
import {AnimatedText, AnimatedWord} from './AnimatedText';

export const SceneHeadline: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  delay?: number;
  align?: 'center' | 'left';
  maxWidth?: number;
}> = ({eyebrow, title, subtitle, delay = 14, align = 'center', maxWidth = 1050}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        gap: 12,
        maxWidth,
      }}
    >
      {eyebrow ? (
        <AnimatedText
          delay={delay}
          rise={12}
          style={{
            color: COLORS.orange,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </AnimatedText>
      ) : null}
      <AnimatedWord
        text={title}
        delay={delay + (eyebrow ? 6 : 0)}
        style={{
          color: COLORS.ink,
          fontSize: 44,
          fontWeight: 800,
          textAlign: align,
          justifyContent: align === 'center' ? 'center' : 'flex-start',
          lineHeight: 1.15,
        }}
      />
      {subtitle ? (
        <AnimatedText
          delay={delay + (eyebrow ? 16 : 10)}
          rise={16}
          style={{
            color: COLORS.inkSoft,
            fontSize: 22,
            fontWeight: 500,
            textAlign: align,
            lineHeight: 1.5,
            fontFamily: FONT_FAMILY,
          }}
        >
          {subtitle}
        </AnimatedText>
      ) : null}
    </div>
  );
};
