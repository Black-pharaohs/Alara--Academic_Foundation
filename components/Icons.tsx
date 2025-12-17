import React from 'react';

interface IconProps {
  className?: string;
}

export const AnkhIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2ZM12 10C10.34 10 9 8.66 9 7C9 5.34 10.34 4 12 4C13.66 4 15 5.34 15 7C15 8.66 13.66 10 12 10ZM11 13V15H8V17H11V22H13V17H16V15H13V13H11Z" />
  </svg>
);

export const EyeOfHorusIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 19C12 19 15 21 17 21" />
    <path d="M12 19V22" />
    <path d="M22 12C22 12 20 16 17 18" />
  </svg>
);

export const PyramidIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L2 22H22L12 2Z" />
    <path d="M12 2L15.5 13.5L22 22" />
    <path d="M12 22V15" />
  </svg>
);