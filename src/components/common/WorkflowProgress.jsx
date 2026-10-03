import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileUp, 
  Cpu, 
  Target, 
  Layers, 
  CheckCircle2, 
  BarChart3, 
  Map, 
  MessageSquare
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../context/AppContext';

export const STAGES = [
  { id: 'resume', label: '1. Resume Upload', path: '/resume', icon: FileUp },
  { id: 'skills', label: '2. Skill Extraction', path: '/resume', icon: Cpu },
  { id: 'roles', label: '3. Role Selection', path: '/roles', icon: Target },
  { id: 'gaps', label: '4. Gap Analysis', path: '/gap-analysis', icon: Layers },
  { id: 'assessment', label: '5. Assessment', path: '/assessment', icon: CheckCircle2 },
  { id: 'report', label: '6. Performance Report', path: '/report', icon: BarChart3 },
  { id: 'roadmap', label: '7. Learning Roadmap', path: '/roadmap', icon: Map },
  { id: 'interview', label: '8. Mock Interview', path: '/interview', icon: MessageSquare },
];

export const WorkflowProgress = ({ currentStageId, className = '' }) => {
  const navigate = useNavigate();
  const { uploadedResume, allUserSkills, selectedRole, gapAnalysis, assessmentReport, roadmap, interviewResult } = useApp();

  // Determine completion of each stage dynamically based on real data
  const isCompleted = (stageId) => {
    switch (stageId) {
      case 'resume':
        return Boolean(uploadedResume);
      case 'skills':
        return allUserSkills.length > 0;
      case 'roles':
        return Boolean(selectedRole);
      case 'gaps':
        return Boolean(gapAnalysis);
      case 'assessment':
        return Boolean(assessmentReport);
      case 'report':
        return Boolean(assessmentReport);
      case 'roadmap':
        return Boolean(roadmap);
      case 'interview':
        return Boolean(interviewResult);
      default:
        return false;
    }
  };

  return (
    <div className={clsx('w-full overflow-x-auto py-3 px-1 scrollbar-none', className)}>
      <div className="flex items-center min-w-[760px] justify-between relative">
        {/* Connecting background line */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 bg-slate-800 -z-0" />

        {STAGES.map((stage, idx) => {
          const completed = isCompleted(stage.id);
          const isCurrent = stage.id === currentStageId;
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              onClick={() => navigate(stage.path)}
              className="relative z-10 flex flex-col items-center group focus:outline-none"
              title={`Stage ${idx + 1}: ${stage.label}`}
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all duration-200 border',
                  isCurrent && 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 ring-4 ring-cyan-500/20 shadow-glow-cyan scale-110',
                  completed && !isCurrent && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 group-hover:bg-emerald-500/20',
                  !completed && !isCurrent && 'bg-[#0b101b] text-slate-500 border-slate-800 group-hover:border-slate-700 group-hover:text-slate-300'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={clsx(
                  'text-[11px] mt-1.5 whitespace-nowrap font-medium transition-colors',
                  isCurrent ? 'text-cyan-300 font-semibold' : completed ? 'text-emerald-400/90' : 'text-slate-500 group-hover:text-slate-400'
                )}
              >
                {stage.label.split('. ')[1]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
