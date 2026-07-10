import React from 'react';

type IconProps = {size?: number; color?: string};

export const IconBlueprint: React.FC<IconProps> = ({size = 40, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="2" stroke={color} strokeWidth="1.6" />
    <path d="M5 9h6v6H5z" stroke={color} strokeWidth="1.4" />
    <path d="M13 5v14M5 5v0M17 9h2M17 13h2" stroke={color} strokeWidth="1.2" />
  </svg>
);

export const IconImage: React.FC<IconProps> = ({size = 40, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.6" />
    <circle cx="8" cy="10" r="2" stroke={color} strokeWidth="1.4" />
    <path d="M2 17l6-5 4 3 4-4 6 6" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

export const IconVideo: React.FC<IconProps> = ({size = 40, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="14" height="14" rx="2" stroke={color} strokeWidth="1.6" />
    <path d="M16 10l5-3v10l-5-3z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

export const IconDoc: React.FC<IconProps> = ({size = 40, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 2h9l5 5v15H6z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M15 2v5h5" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 13h6M9 17h6" stroke={color} strokeWidth="1.3" />
  </svg>
);

export const IconMap: React.FC<IconProps> = ({size = 40, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.4" stroke={color} strokeWidth="1.4" />
  </svg>
);

export const IconStar: React.FC<IconProps> = ({size = 40, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.6 6.8L12 16.9 5.8 20.4l1.6-6.8L2.2 9l6.9-.7z"
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconMemo: React.FC<IconProps> = ({size = 40, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.6" />
    <path d="M7 8h10M7 12h10M7 16h6" stroke={color} strokeWidth="1.3" />
  </svg>
);

export const IconGear: React.FC<IconProps> = ({size = 40, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth="1.5" />
    <path
      d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

export const IconBuilding: React.FC<IconProps> = ({size = 40, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="3" width="10" height="18" stroke={color} strokeWidth="1.5" />
    <rect x="14" y="9" width="6" height="12" stroke={color} strokeWidth="1.5" />
    <path d="M7 7h1M10 7h1M7 11h1M10 11h1M7 15h1M10 15h1" stroke={color} strokeWidth="1.2" />
  </svg>
);
