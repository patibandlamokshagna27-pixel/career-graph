import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const LearningRoadmapPage = () => {
  const navigate = useNavigate();
  const { roadmap, toggleRoadmapSkill, selectedRole, gapAnalysis, generateRoadmapFromGaps } = useApp();

  if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) {
    return (
      <div className="space-y-6">
        <div className="border-b border-white/[0.08] pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Stage 6: Personalized Learning Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Milestone trajectory structured to close high-priority skill gaps.
          </p>
        </div>

        <EmptyState
          preset="roadmap"
          title="Roadmap Awaiting Skill Gap Analysis"
          message="Your personalized roadmap will appear here after skill analysis."
          description="Identify your missing competencies against a target benchmark role to synthesize a targeted curriculum."
          actionLabel="Run Skill Gap Analysis"
          onAction={() => navigate('/gap-analysis')}
        />
      </div>
    );
  }

  // Count completion progress
  const allSkills = roadmap.phases.flatMap((p) => p.skills);
  const completedCount = allSkills.filter((s) => s.completed).length;
  const progressPct = allSkills.length > 0 ? Math.round((completedCount / allSkills.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Stage 6: Personalized Learning Roadmap
            </h1>
            <StatusBadge variant="cyan" size="xs">Stage 06 / 08</StatusBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Tailored learning path for{' '}
            <strong className="text-cyan-400">{roadmap.roleTitle}</strong> based on identified skill gaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => generateRoadmapFromGaps(gapAnalysis)}
            icon={RotateCcw}
          >
            Regenerate
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/readiness')}
            icon={ArrowRight}
          >
            Career Readiness Check
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="p-6 bg-gradient-to-r from-[#0d1628] to-[#12223f] border-cyan-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1">
              Curriculum Milestone Completion
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              {progressPct}% Milestones Mastered ({completedCount} of {allSkills.length})
            </h2>
          </div>
          <StatusBadge variant={progressPct === 100 ? 'success' : 'cyan'} size="sm">
            {progressPct === 100 ? 'Roadmap Completed' : 'In Progress'}
          </StatusBadge>
        </div>

        <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-cyan-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </Card>

      {/* Phased Roadmap Timeline */}
      <div className="space-y-6">
        {roadmap.phases.map((phase, pIdx) => (
          <Card key={phase.id} className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                  Phase {pIdx + 1}
                </span>
                <h3 className="text-base font-bold text-slate-100">{phase.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{phase.description}</p>
              </div>
              <span className="text-xs text-slate-400 font-mono shrink-0">
                {phase.skills.filter((s) => s.completed).length} / {phase.skills.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {phase.skills.map((skill) => (
                <div
                  key={skill.name}
                  onClick={() => toggleRoadmapSkill(phase.id, skill.name)}
                  className={`p-4 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${
                    skill.completed
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-slate-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        skill.completed
                          ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                          : 'border-slate-700 bg-slate-900 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    </button>
                    <div>
                      <span className={`font-semibold ${skill.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {skill.name}
                      </span>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Category: {skill.category}</span>
                        <span>•</span>
                        <span className="text-cyan-400">{skill.recommendedWeeks}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      skill.priority === 'Critical'
                        ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {skill.priority}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">
            Next Action: Career Readiness Gatekeeper
          </h4>
          <p className="text-xs text-slate-400">
            Verify milestone progress, skill threshold, and proceed to the AI mock interview.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/readiness')}
          icon={ArrowRight}
        >
          Check Readiness Status
        </Button>
      </div>
    </div>
  );
};
