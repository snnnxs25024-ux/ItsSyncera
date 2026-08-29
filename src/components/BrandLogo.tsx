import React from 'react';

type BrandLogoProps = {
  className?: string;
  variant?: 'light' | 'dark';
  asset?: 'wordmark' | 'mark';
};

const logos = {
  wordmark: 'https://i.imgur.com/amfHJpU.png',
  mark: 'https://i.imgur.com/2SyGEWZ.png',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-10 w-auto', variant = 'light', asset = 'mark' }) => (
  <img
    src={logos[asset]}
    alt="It's Syncera"
    className={`${className} object-contain ${variant === 'dark' ? 'drop-shadow-[0_1px_8px_rgba(14,165,233,0.35)]' : ''}`}
    loading="eager"
  />
);
