
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "text-white", size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M25 35L50 75L75 35" 
        stroke="currentColor" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="50" cy="25" r="8" fill="currentColor">
        <animate 
          attributeName="opacity" 
          values="1;0.4;1" 
          dur="2s" 
          repeatCount="indefinite" 
        />
      </circle>
      <path 
        d="M40 55C43 52 47 52 50 55C53 58 57 58 60 55" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};

export default Logo;
