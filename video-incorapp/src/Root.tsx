import React from 'react';
import {Composition} from 'remotion';
import {MainVideo, TOTAL_DURATION} from './MainVideo';
import {FPS} from './theme';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="IncorAppVideo"
        component={MainVideo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
