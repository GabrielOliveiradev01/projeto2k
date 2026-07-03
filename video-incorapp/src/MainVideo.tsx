import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {FadeWrapper} from './FadeWrapper';
import {Scene1Opportunity} from './scenes/Scene1Opportunity';
import {Scene2Files} from './scenes/Scene2Files';
import {Scene3Assembly} from './scenes/Scene3Assembly';
import {Scene4Build} from './scenes/Scene4Build';
import {Scene5Features} from './scenes/Scene5Features';
import {Scene6Presentation} from './scenes/Scene6Presentation';
import {Scene7Experience} from './scenes/Scene7Experience';
import {Scene8Result} from './scenes/Scene8Result';
import {Scene9Closing} from './scenes/Scene9Closing';
import {COLORS, FONT_FAMILY, gradientBrand} from './theme';
import {BrandWatermark} from './components/BrandWatermark';

export const SCENES = [
  {Component: Scene1Opportunity, duration: 120},
  {Component: Scene2Files, duration: 120},
  {Component: Scene3Assembly, duration: 150},
  {Component: Scene4Build, duration: 150},
  {Component: Scene5Features, duration: 210},
  {Component: Scene6Presentation, duration: 180},
  {Component: Scene7Experience, duration: 180},
  {Component: Scene8Result, duration: 210},
  {Component: Scene9Closing, duration: 180},
];

export const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0);

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const pct = Math.min(100, (frame / TOTAL_DURATION) * 100);
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 5,
        background: COLORS.border,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: gradientBrand(90),
        }}
      />
    </div>
  );
};

export const MainVideo: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{background: COLORS.white, fontFamily: FONT_FAMILY}}>
      {SCENES.map(({Component, duration}, i) => {
        const from = cursor;
        cursor += duration;
        return (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <FadeWrapper durationInFrames={duration}>
              <Component />
            </FadeWrapper>
          </Sequence>
        );
      })}
      <BrandWatermark />
      <ProgressBar />
    </AbsoluteFill>
  );
};
