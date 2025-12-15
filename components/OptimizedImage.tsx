
import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  priority = false,
  width,
  height,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden w-full h-full bg-gray-100 dark:bg-gray-800 ${containerClassName}`}>
       {/* Placeholder (Skeleton Shimmer) */}
       <div 
         className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 transition-opacity duration-500 ease-out ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'} z-10 flex items-center justify-center`}
         aria-hidden="true"
       >
          {/* Simple lighter shimmer to reduce GPU load */}
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
       </div>
       
       {/* Actual Image - Reduced transitions for performance */}
       {/* Removing scale transition on load avoids layout repaint */}
       <img
         src={src}
         alt={alt}
         width={width}
         height={height}
         loading={priority ? "eager" : "lazy"}
         decoding="async" 
         onLoad={() => setIsLoaded(true)}
         className={`relative z-0 transition-all duration-500 ease-out will-change-[opacity,filter] ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'} ${className}`}
         {...props}
       />
       <style>{`
         @keyframes shimmer {
           0% { transform: translateX(-100%); }
           100% { transform: translateX(100%); }
         }
         .animate-shimmer {
           animation: shimmer 1.5s infinite linear;
         }
       `}</style>
    </div>
  );
};
