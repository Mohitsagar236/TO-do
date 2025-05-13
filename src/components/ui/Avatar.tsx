import React from 'react';

interface AvatarProps {
  src?: string;
  fallback: string;
  className?: string;
}

export function Avatar({ src, fallback, className = '' }: AvatarProps) {
  return (
    <div 
      className={`relative inline-block rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium">
          {fallback.toUpperCase()}
        </div>
      )}
    </div>
  );
}