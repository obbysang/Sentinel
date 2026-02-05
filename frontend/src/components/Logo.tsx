import React, { useState } from 'react';
import { Eye } from 'lucide-react';

interface LogoProps {
  className?: string;
  alt?: string;
  fallbackType?: 'circle' | 'eye'; // 'circle' for Landing, 'eye' for Dashboard if we want to mimic old style, or just 'default'
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", alt = "Sentinel Logo", fallbackType = 'circle' }) => {
  const [error, setError] = useState(false);

  if (error) {
    if (fallbackType === 'eye') {
        return <Eye className={`${className} text-slate-900`} strokeWidth={2.5} />;
    }
    // Default circle fallback (mimicking Landing Page original)
    // Note: The original had explicit border colors (white). 
    // We should try to inherit color or use a safe default.
    return (
      <div className={`${className} border-2 border-current rounded-full flex items-center justify-center`}>
         <div className="w-[30%] h-[30%] bg-current rounded-full"></div>
      </div>
    );
  }

  return (
    <img 
      src="/assets/logo.webp" 
      alt={alt} 
      className={`${className} object-contain`} 
      onError={() => setError(true)}
    />
  );
};

export default Logo;
