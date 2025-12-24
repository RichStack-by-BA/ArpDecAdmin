import React from 'react';

export type InfoRowProps = {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
};

export function InfoRow({ label, value, icon, style }: InfoRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, ...style }}>
      <span style={{ display: 'flex', alignItems: 'center', minWidth: 90, fontWeight: 500, color: '#64748b' }}>
        {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
        {label}:
      </span>
      <span style={{ marginLeft: 8, color: '#334155', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
