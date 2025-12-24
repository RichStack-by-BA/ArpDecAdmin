import React from 'react';

export type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export function SectionCard({ title, children, style }: SectionCardProps) {
  return (
    <div
      style={{
        background: '#f8fafc',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        ...style,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12, color: '#334155' }}>{title}</div>
      {children}
    </div>
  );
}
