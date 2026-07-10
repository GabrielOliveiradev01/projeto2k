import React from 'react';
import {COLORS, DISPLAY_FONT} from '../theme';
import {AnimatedText, AnimatedWord, BODY_FONT_FAMILY} from './AnimatedText';

export const SceneHeadline: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  delay?: number;
  align?: 'center' | 'left';
  maxWidth?: number;
}> = ({eyebrow, title, subtitle, delay = 14, align = 'center', maxWidth = 1100}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        gap: 14,
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
            fontFamily: BODY_FONT_FAMILY,
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
          fontSize: 46,
          fontWeight: 400,
          textAlign: align,
          justifyContent: align === 'center' ? 'center' : 'flex-start',
          lineHeight: 1.12,
          letterSpacing: -0.5,
          fontFamily: `"${DISPLAY_FONT}", sans-serif`,
        }}
      />
      {subtitle ? (
        <AnimatedText
          delay={delay + (eyebrow ? 18 : 12)}
          rise={16}
          style={{
            color: COLORS.inkSoft,
            fontSize: 22,
            fontWeight: 500,
            textAlign: align,
            lineHeight: 1.5,
            fontFamily: BODY_FONT_FAMILY,
          }}
        >
          {subtitle}
        </AnimatedText>
      ) : null}
    </div>
  );
};
