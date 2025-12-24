
import React from 'react';

export type BadgeProps = {
  color: 'green' | 'yellow' | 'blue';
  text: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  emailVerification?: boolean;
  verified?: boolean;
};

const COLORS = {
  green: {
    bg: '#d1fae5',
    text: '#166534',
  },
  yellow: {
    bg: '#fef9c3',
    text: '#b45309',
  },
  blue: {
    bg: '#e0e7ff',
    text: '#3730a3',
  },
};
export function Badge({ color, text, icon, style, emailVerification = false, verified = false }: BadgeProps) {
  const palette = COLORS[color];
  const badgeIcon = icon;

  // Icon logic should be handled outside the Badge component

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: palette.bg,
        color: palette.text,
        borderRadius: 8,
        padding: '2px 10px',
        fontWeight: 600,
        fontSize: '0.8rem',
        ...style,
      }}
    >
      {badgeIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{badgeIcon}</span>}
      {text}
    </span>
  );
}
