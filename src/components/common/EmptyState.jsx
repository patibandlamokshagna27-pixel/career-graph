import React from 'react';
import { 
  FileText, 
  Target, 
  BarChart3, 
  Map, 
  Cpu, 
  HelpCircle,
  ArrowRight,
  Layers
} from 'lucide-react';
import { Button } from './Button';

const PRESETS = {
  resume: {
    icon: FileText,
    title: 'No Resume Processed',
    message: 'Upload your resume to begin.',
    description: 'Our NLP parser will extract your technical competencies, frameworks, tools, and domain skills to evaluate your career profile.',
    actionLabel: 'Upload Resume',
    actionRoute: '/resume',
  },
  role: {
    icon: Target,
    title: 'No Target Role Selected',
    message: 'Select a target role to start your analysis.',
    description: 'Benchmark your verified competencies against industry-standard role skill requirements and identify missing competencies.',
    actionLabel: 'Browse Target Roles',
    actionRoute: '/roles',
  },
  gap: {
    icon: Layers,
    title: 'Skill Gap Analysis Pending',
    message: 'Upload your resume and select a target role to start your analysis.',
    description: 'The gap engine will calculate matched skills, moderate gaps, and critical high-priority requirements.',
    actionLabel: 'Go to Resume & Roles',
    actionRoute: '/resume',
  },
  report: {
    icon: BarChart3,
    title: 'No Assessment Report Available',
    message: 'Complete your assessment to generate your performance report.',
    description: 'Assessments evaluate your conceptual depth, problem solving, and architecture knowledge to generate verified competency analytics.',
    actionLabel: 'Start Assessment',
    actionRoute: '/assessment',
  },
  roadmap: {
    icon: Map,
    title: 'Roadmap Not Generated',
    message: 'Your personalized roadmap will appear here after skill analysis.',
    description: 'A phased learning trajectory with specific milestones will be constructed specifically targeting your critical skill gaps.',
    actionLabel: 'Run Skill Gap Analysis',
    actionRoute: '/gap-analysis',
  },
  interview: {
    icon: Cpu,
    title: 'No Active Mock Interview Session',
    message: 'Start a role-specific mock interview session to evaluate your verbal responses.',
    description: 'The AI interviewer will ask realistic technical and architectural questions matched to your target role benchmarks.',
    actionLabel: 'Start Mock Interview',
    actionRoute: '/interview',
  }
};

export const EmptyState = ({
  preset,
  icon: CustomIcon,
  title,
  message,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  const config = preset && PRESETS[preset] ? PRESETS[preset] : {};

  const IconComponent = CustomIcon || config.icon || HelpCircle;
  const displayTitle = title || config.title || 'No Data Available';
  const displayMessage = message || config.message || 'Complete the required workflow steps to populate this view.';
  const displayDesc = description || config.description;
  const displayAction = actionLabel || config.actionLabel;

  return (
    <div className={`rounded-xl border border-dashed border-slate-800 bg-[#0b101b]/80 p-8 text-center max-w-xl mx-auto my-6 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <IconComponent className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-semibold text-slate-100 mb-1">{displayTitle}</h3>
      <p className="text-cyan-400 font-medium text-sm mb-2">{displayMessage}</p>
      
      {displayDesc && (
        <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-md mx-auto">
          {displayDesc}
        </p>
      )}

      {displayAction && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          icon={actionIcon || ArrowRight}
          className="mx-auto"
        >
          {displayAction}
        </Button>
      )}
    </div>
  );
};
