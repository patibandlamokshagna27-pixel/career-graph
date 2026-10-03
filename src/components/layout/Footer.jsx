import React from 'react';
import { Terminal, Shield, Cpu } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#070a10] py-6 px-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-300">
            Career Readiness & Skill Development System
          </span>
          <span className="text-slate-600">|</span>
          <span>Zero-Mock Architecture</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>NLP & AI Ready</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Honest Evaluation Engine</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
