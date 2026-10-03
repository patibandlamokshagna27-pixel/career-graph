import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Terminal, 
  Layers, 
  Settings, 
  RotateCcw, 
  ExternalLink,
  Menu,
  X,
  Server
} from 'lucide-react';
import { useApiStatus } from '../../context/ApiStatusContext';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { online, isChecking, latency, refreshStatus } = useApiStatus();
  const { resetWorkflow, selectedRole } = useApp();

  const handleReset = () => {
    if (window.confirm('Reset all session data, uploaded resume, and progress?')) {
      resetWorkflow();
      navigate('/resume');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080c14]/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-glow-cyan/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                CRSD System
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  AI-Engine
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                Career Readiness & Skill Development
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Active Role Indicator if set */}
        {selectedRole && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Target Role:</span>
            <span className="text-cyan-400 font-medium">{selectedRole.title}</span>
          </div>
        )}

        {/* Right: API Status, Developer Settings, Session Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Connection Badge */}
          <Link
            to="/settings"
            className="flex items-center gap-1.5"
            title="Inspect API & Backend Service Connectivity"
          >
            <StatusBadge
              variant={online ? 'success' : 'warning'}
              size="xs"
              pulse={isChecking}
              className="cursor-pointer hover:opacity-90"
            >
              <span className="font-mono text-[11px]">
                {isChecking
                  ? 'Checking API...'
                  : online
                  ? `Backend: Ready (${latency}ms)`
                  : 'Backend: Disconnected'}
              </span>
            </StatusBadge>
          </Link>

          {/* Settings Link */}
          <Link
            to="/settings"
            className={`p-2 rounded-lg border transition-colors ${
              location.pathname === '/settings'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
            title="API & Service Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Reset session button */}
          <button
            onClick={handleReset}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
            title="Clear state and start fresh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
