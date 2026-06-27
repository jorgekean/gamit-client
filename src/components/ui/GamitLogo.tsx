import React from 'react';

export function GamitLogo({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* 
        The stylized 'G' forming the outer boundary.
        Starts at the top right, curves counter-clockwise around to the right middle,
        and cuts horizontally inward.
      */}
      <path 
        d="M19 6.5 A 9 9 0 1 0 21 12 H 13" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* The central 'tracker' dot */}
      <circle 
        cx="9" 
        cy="12" 
        r="2.5" 
        fill="currentColor" 
      />
    </svg>
  );
}
