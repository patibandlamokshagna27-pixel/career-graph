import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variants = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-sm hover:shadow-glow-cyan active:scale-[0.99]',
    secondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-700/70 hover:border-slate-600',
    outline: 'border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400',
    ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20',
  };

  return (
    <button
      className={clsx(baseStyles, sizeStyles[size], variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className={clsx(size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4')} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
