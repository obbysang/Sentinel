import React from 'react';

interface IsometricCubeProps {
  type: number;
}

const IsometricCube: React.FC<IsometricCubeProps> = ({ type }) => {
  return (
    <div className="w-48 h-48 relative opacity-80 hover:opacity-100 transition-opacity duration-500">
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        <path d="M100 20 L180 60 L180 140 L100 180 L20 140 L20 60 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-600" />
        <path d="M20 60 L100 100 L180 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-600" />
        <path d="M100 100 L100 180" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-600" />
        
        {type === 1 && (
           <g transform="translate(100, 100)" className="animate-pulse">
             <circle cx="0" cy="0" r="15" fill="#f9f9f9" stroke="#333" strokeWidth="1.5" className="dark:fill-slate-800 dark:stroke-slate-200" />
             <circle cx="0" cy="0" r="5" fill="#333" className="dark:fill-slate-200" />
             <path d="M-25 0 Q0 -25 25 0 Q0 25 -25 0" fill="none" stroke="#333" strokeWidth="1" className="dark:stroke-slate-200" />
           </g>
        )}
        {type === 2 && (
           <g transform="translate(100, 100)">
              <circle cx="-10" cy="-10" r="4" fill="#333" className="dark:fill-slate-200" />
              <circle cx="10" cy="-10" r="4" fill="#333" className="dark:fill-slate-200" />
              <circle cx="0" cy="10" r="4" fill="#333" className="dark:fill-slate-200" />
              <line x1="-10" y1="-10" x2="10" y2="-10" stroke="#333" strokeWidth="1" className="dark:stroke-slate-200" />
              <line x1="-10" y1="-10" x2="0" y2="10" stroke="#333" strokeWidth="1" className="dark:stroke-slate-200" />
              <line x1="10" y1="-10" x2="0" y2="10" stroke="#333" strokeWidth="1" className="dark:stroke-slate-200" />
           </g>
        )}
        {type === 3 && (
            <g transform="translate(100, 100)">
              <path d="M-15 0 L-5 10 L15 -10" fill="none" stroke="#333" strokeWidth="3" className="dark:stroke-slate-200" />
              <rect x="-20" y="-20" width="40" height="40" rx="5" fill="none" stroke="#333" strokeWidth="1" className="dark:stroke-slate-200" />
            </g>
        )}
      </svg>
    </div>
  )
}

export default IsometricCube;
