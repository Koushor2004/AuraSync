import React from 'react';

export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
      }}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--brand-light)',
              marginBottom: 6,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>{title}</h1>
        {subtitle && (
          <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14.5 }}>{subtitle}</p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
    </div>
  );
}
