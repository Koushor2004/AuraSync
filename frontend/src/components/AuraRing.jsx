import React, { useId } from 'react';

export default function AuraRing({
  color = 'var(--brand)',
  size = 120,
  confidence = 100,
  spinning = false,
  children,
}) {
  const gradId = useId();
  const stroke = Math.max(3, size * 0.045);
  const radius = size / 2 - stroke * 1.6;
  const circumference = 2 * Math.PI * radius;
  const dash = (confidence / 100) * circumference;

  return (
    <div
      className="aura-ring"
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        '--aura-color': color,
      }}
    >
      <div
        className="aura-ring__glow"
        style={{
          position: 'absolute',
          inset: -size * 0.18,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}33 0%, transparent 68%)`,
          filter: 'blur(2px)',
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={spinning ? 'aura-ring__spin' : ''}
        style={{ position: 'relative', transform: 'rotate(-90deg)' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 600ms var(--ease)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: stroke * 2.2,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
