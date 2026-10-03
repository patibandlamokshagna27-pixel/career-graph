import React from 'react';
import clsx from 'clsx';

export const MetricCard = ({
  title,
  value,
  emptyText = 'Pending',
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  className,
}) => {
  const hasValue = value !== null && value !== undefined && value !== '';

  const borderVariants = {
    default: 'hover:border-cyan-500/20',
    cyan: 'border-cyan-500/30 shadow-glow-cyan/10',
    emerald: 'border-emerald-500/30',
    amber: 'border-amber-500/30',
    rose: 'border-rose-500/30',
  };

  return (
    <div
      className={clsx(
        'rounded-xl border border-white/[0.08] bg-[#0f172a]/80 backdrop-blur-sm p-5 transition-all',
        borderVariants[variant],
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-cyan-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        {hasValue ? (
          <span className="text-2xl font-bold tracking-tight text-slate-100">{value}</span>
        ) : (
          <span className="text-sm font-medium text-slate-500 italic bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
            {emptyText}
          </span>
        )}
        {trend && <span className="text-xs font-medium text-emerald-400">{trend}</span>}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-2 truncate">{subtitle}</p>}
    </div>
  );
};
