import React from 'react';
import clsx from 'clsx';

export const StatusBadge = ({ variant = 'default', children, size = 'sm', pulse = false, className }) => {
  const base = 'inline-flex items-center font-medium rounded-full border';

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
  };

  const variants = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    purple: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  };

  const dotColors = {
    default: 'bg-slate-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    cyan: 'bg-cyan-400',
    blue: 'bg-blue-400',
    purple: 'bg-indigo-400',
  };

  return (
    <span className={clsx(base, sizes[size], variants[variant], className)}>
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full shrink-0',
          dotColors[variant] || 'bg-slate-400',
          pulse && 'animate-ping opacity-75'
        )}
      />
      <span>{children}</span>
    </span>
  );
};
