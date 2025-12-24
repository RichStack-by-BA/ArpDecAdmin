import React from 'react';

export type BaseBadgeProps = {
  color: 'green' | 'yellow';
  text: string;
  fontSize?: string | number;
};

const COLORS = {
  green: {
    bg: '#d1fae5',
    text: '#166534',
    iconBg: '#A7F3D0',
    icon: '#166534',
  },
  yellow: {
    bg: '#fef9c3',
    text: '#b45309',
    iconBg: '#fde68a',
    icon: '#b45309',
  },
};

export function BaseBadge({ color, text, fontSize }: BaseBadgeProps) {
  const palette = COLORS[color];
  return (
    <span
      style={{
        marginLeft: 8,
        background: palette.bg,
        color: palette.text,
        borderRadius: 8,
        padding: '2px 10px 2px 6px',
        fontWeight: 600,
        fontSize: fontSize || '0.6rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 4 }}>
        <circle cx="12" cy="12" r="12" fill={palette.iconBg} />
        {color === 'green' ? (
          <path d="M8 12.5L11 15.5L16 10.5" stroke={palette.icon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M12 8v4m0 4h.01M12 16a4 4 0 100-8 4 4 0 000 8z" stroke={palette.icon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {text}
    </span>
  );
}
