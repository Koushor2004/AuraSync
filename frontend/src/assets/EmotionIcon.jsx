import React from 'react';
import happySvg from './happy.svg';
import sadSvg from './sad.svg';
import angrySvg from './angry.svg';
import fearfulSvg from './fearful.svg';
import neutralSvg from './neutral.svg';
import surprisedSvg from './surprised.svg';
import disgustedSvg from './disgusted.svg';
import excitedSvg from './excited.svg';
import relaxedSvg from './relaxed.svg';

export const SVG_MAP = {
  happy: happySvg,
  sad: sadSvg,
  angry: angrySvg,
  fearful: fearfulSvg,
  neutral: neutralSvg,
  surprised: surprisedSvg,
  disgusted: disgustedSvg,
  excited: excitedSvg,
  relaxed: relaxedSvg,
};

export default function EmotionIcon({ emotion = 'neutral', size = 24, style = {}, className = '' }) {
  const src = SVG_MAP[emotion] || SVG_MAP.neutral;
  return (
    <img
      src={src}
      alt={emotion}
      width={size}
      height={size}
      className={`emotion-icon ${className}`.trim()}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        verticalAlign: 'middle',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}
