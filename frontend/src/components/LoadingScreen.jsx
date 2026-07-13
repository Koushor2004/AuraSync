import React from 'react';
import AuraRing from './AuraRing.jsx';

export default function LoadingScreen({ label = 'Loading AuraSync…' }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: 'var(--bg)',
      }}
    >
      <AuraRing color="var(--brand)" size={72} confidence={70} spinning />
      <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-mono)' }}>{label}</p>
    </div>
  );
}
