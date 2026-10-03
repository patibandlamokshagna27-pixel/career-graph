import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileUp, 
  Target, 
  Layers, 
  CheckCircle2, 
  BarChart3, 
  Map, 
  ShieldCheck, 
  MessageSquare,
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../context/AppContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { uploadedResume, selectedRole, gapAnalysis, assessmentReport, roadmap, interviewResult } = useApp();

  const navigation = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard Hub', to: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Readiness Workflow',
      items: [
        { 
          name: '1. Resume Processing', 
          to: '/resume', 
          icon: FileUp, 
          done: Boolean(uploadedResume),
          tag: uploadedResume ? 'Uploaded' : null 
        },
        { 
          name: '2. Target Role Benchmark', 
          to: '/roles', 
          icon: Target, 
          done: Boolean(selectedRole),
          tag: selectedRole ? 'Selected' : null 
        },
        { 
          name: '3. Skill Gap Analysis', 
          to: '/gap-analysis', 
          icon: Layers, 
          done: Boolean(gapAnalysis),
          tag: gapAnalysis ? 'Mapped' : null 
        },
        { 
          name: '4. Skill Assessment', 
          to: '/assessment', 
          icon: CheckCircle2, 
          done: Boolean(assessmentReport),
          tag: assessmentReport ? 'Evaluated' : null 
        },
        { 
          name: '5. Performance Report', 
          to: '/report', 
          icon: BarChart3, 
          done: Boolean(assessmentReport),
          tag: null 
        },
        { 
          name: '6. Learning Roadmap', 
          to: '/roadmap', 
          icon: Map, 
          done: Boolean(roadmap),
          tag: roadmap ? 'Active' : null 
        },
        { 
          name: '7. Readiness Check', 
          to: '/readiness', 
          icon: ShieldCheck, 
          done: false,
          tag: null 
        },
        { 
          name: '8. AI Mock Interview', 
          to: '/interview', 
          icon: MessageSquare, 
          done: Boolean(interviewResult),
          tag: interviewResult ? 'Done' : null 
        },
      ],
    },
    {
      group: 'Developer & System',
      items: [
        { name: 'API & Service Settings', to: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed md:sticky top-16 z-30 h-[calc(100vh-4rem)] w-72 shrink-0 border-r border-white/[0.08] bg-[#090d16] p-4 transition-transform duration-200 ease-in-out overflow-y-auto flex flex-col justify-between',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="space-y-6">
          {navigation.map((section) => (
            <div key={section.group}>
              <h4 className="px-3 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
                {section.group}
              </h4>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          clsx(
                            'group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                            isActive
                              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                          )
                        }
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className="w-4 h-4 shrink-0 transition-colors text-slate-500 group-hover:text-cyan-400" />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.tag ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                            {item.tag}
                          </span>
                        ) : item.done ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        ) : null}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Hackathon Project Tag Footer */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Career-Tech</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Ready for real backend integration via VS Code.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
