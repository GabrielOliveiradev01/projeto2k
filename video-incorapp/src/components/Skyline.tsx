import React from 'react';
import {COLORS} from '../theme';

type Building = {x: number; w: number; h: number};

const BUILDINGS: Building[] = [
  {x: 0, w: 60, h: 220},
  {x: 65, w: 90, h: 340},
  {x: 160, w: 70, h: 260},
  {x: 235, w: 110, h: 430},
  {x: 350, w: 80, h: 300},
  {x: 435, w: 60, h: 200},
  {x: 500, w: 95, h: 380},
  {x: 600, w: 75, h: 250},
  {x: 680, w: 100, h: 400},
  {x: 785, w: 65, h: 230},
  {x: 855, w: 90, h: 320},
  {x: 950, w: 70, h: 270},
  {x: 1025, w: 110, h: 440},
  {x: 1140, w: 80, h: 300},
  {x: 1225, w: 95, h: 360},
  {x: 1325, w: 75, h: 240},
];

export const Skyline: React.FC<{
  highlightIndex?: number;
  width?: number;
  height?: number;
  groundY?: number;
}> = ({highlightIndex = 3, width = 1400, height = 500, groundY = 470}) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {BUILDINGS.map((b, i) => {
        const isHighlight = i === highlightIndex;
        const y = groundY - b.h;
        const windowRows = Math.floor(b.h / 26);
        const windowCols = Math.max(2, Math.floor(b.w / 22));
        const windows = [];
        for (let r = 0; r < windowRows; r++) {
          for (let c = 0; c < windowCols; c++) {
            const lit = (r * windowCols + c + i * 7) % 5 === 0;
            windows.push(
              <rect
                key={`${r}-${c}`}
                x={b.x + 8 + c * (b.w - 16) / windowCols}
                y={y + 14 + r * 24}
                width={(b.w - 16) / windowCols - 6}
                height={12}
                fill={
                  lit
                    ? isHighlight
                      ? 'rgba(255,255,255,0.9)'
                      : COLORS.orangeLight
                    : 'rgba(255,255,255,0.08)'
                }
              />,
            );
          }
        }
        return (
          <g key={i}>
            <rect
              x={b.x}
              y={y}
              width={b.w}
              height={b.h}
              fill={isHighlight ? COLORS.orange : '#2A2050'}
              stroke={isHighlight ? COLORS.orangeLight : 'rgba(255,255,255,0.05)'}
              strokeWidth={isHighlight ? 2 : 1}
            />
            {windows}
          </g>
        );
      })}
    </svg>
  );
};
