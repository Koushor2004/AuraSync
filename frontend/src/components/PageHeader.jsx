import React from 'react';

export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 40,
      }}
    >
      <div style={{ maxWidth: 640 }}>
        {eyebrow && (
          <div
            className="eyebrow-label"
            style={{
              marginBottom: 8,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          style={{
            fontFamily: 'var(--font-framegothic)',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 400,
            lineHeight: 1.02,
            letterSpacing: '-1.92px',
            color: 'var(--color-carbon-vellum)',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-framegothic)',
              color: 'var(--color-smoke)',
              marginTop: 10,
              fontSize: 16,
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 12 }}>{actions}</div>}
    </div>
  );
}
