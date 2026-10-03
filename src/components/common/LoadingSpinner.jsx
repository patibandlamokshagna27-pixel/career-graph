import React from 'react';
import clsx from 'clsx';

export const LoadingSpinner = ({ size = 'md', text, className }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={clsx(
          'rounded-full animate-spin border-slate-700 border-t-cyan-400 border-r-cyan-400/50',
          sizes[size]
        )}
      />
      {text && <span className="text-xs font-mono text-cyan-400/90 tracking-wide">{text}</span>}
    </div>
  );
};

export const Skeleton = ({ className }) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-slate-800/60 rounded-md border border-slate-700/30',
        className
      )}
    />
  );
};
