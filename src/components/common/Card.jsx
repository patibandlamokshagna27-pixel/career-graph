import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className, glow = false, interactive = false, ...props }) => {
  return (
    <div
      className={clsx(
        'rounded-xl border border-white/[0.08] bg-[#0f172a]/90 backdrop-blur-md p-6 transition-all duration-200',
        interactive && 'hover:border-cyan-500/30 hover:bg-[#131e33] hover:shadow-glow-cyan/20 cursor-pointer',
        glow && 'border-cyan-500/40 shadow-glow-cyan',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
