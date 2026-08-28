import React from 'react';

type BrandLogoProps = {
  className?: string;
  variant?: 'light' | 'dark';
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-10 w-auto', variant = 'light' }) => (
  <img
    src="/logo-syncera.svg"
    alt="It's Syncera"
    className={`${className} object-contain ${variant === 'dark' ? 'drop-shadow-[0_1px_8px_rgba(14,165,233,0.35)]' : ''}`}
    loading="eager"
  />
);
