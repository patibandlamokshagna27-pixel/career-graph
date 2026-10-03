import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { WifiOff, RefreshCw, X, ArrowRight } from 'lucide-react';
import { useApiStatus } from '../../context/ApiStatusContext';

export const ApiStatusBanner = () => {
  const { online, checked, isChecking, refreshStatus, apiBaseUrl } = useApiStatus();
  const [dismissed, setDismissed] = useState(false);

  // If online, or not checked yet, or user dismissed, don't show
  if (!checked || online || dismissed) return null;

  return (
    <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold text-amber-300">Backend API Offline:</strong> Target service at{' '}
            <code className="bg-amber-950/80 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-400 border border-amber-800/40">
              {apiBaseUrl}
            </code>{' '}
            is unreachable. Interactive client matching and manual skill evaluation are active.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <button
            onClick={refreshStatus}
            disabled={isChecking}
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-200 underline underline-offset-2"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Retry Connection</span>
          </button>

          <Link
            to="/settings"
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-white"
          >
            <span>API Settings</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400/70 hover:text-amber-200 p-0.5 rounded"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
