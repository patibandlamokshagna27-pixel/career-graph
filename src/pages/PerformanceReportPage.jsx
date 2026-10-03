import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Map, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const PerformanceReportPage = () => {
  const navigate = useNavigate();
  const { assessmentReport, selectedRole, generateRoadmapFromGaps, gapAnalysis } = useApp();

  if (!assessmentReport) {
    return (
      <div className="space-y-6">
        <div className="border-b border-white/[0.08] pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Stage 5: Performance Report & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Empirical evaluation results and verified domain depth analysis.
          </p>
        </div>

        <EmptyState
          preset="report"
          title="Performance Report Awaiting Assessment"
          message="Complete your assessment to generate your performance report."
          description="Analytics are generated exclusively from completed evaluations. No fake statistics are shown."
          actionLabel="Take Assessment Now"
          onAction={() => navigate('/assessment')}
        />
      </div>
    );
  }

  const { overallScore, correctCount, totalQuestions, categoryScores, summary, completedAt } = assessmentReport;

  const handleActivateRoadmap = () => {
    generateRoadmapFromGaps(gapAnalysis);
    navigate('/roadmap');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Stage 5: Performance Report & Analytics
            </h1>
            <StatusBadge variant="cyan" size="xs">Stage 05 / 08</StatusBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Assessment completed for{' '}
            <strong className="text-cyan-400">{selectedRole?.title || 'Target Role'}</strong>. Verified at{' '}
            {new Date(completedAt).toLocaleTimeString()}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/assessment')}
            icon={RotateCcw}
          >
            Retake Assessment
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleActivateRoadmap}
            icon={ArrowRight}
          >
            Open Learning Roadmap
          </Button>
        </div>
      </div>

      {/* Primary Score Hero Card */}
      <Card className="p-6 bg-gradient-to-r from-[#0d1628] to-[#12203b] border-cyan-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge
                variant={overallScore >= 70 ? 'success' : 'warning'}
                size="sm"
              >
                {overallScore >= 70 ? 'Benchmark Passed' : 'Needs Development'}
              </StatusBadge>
              <span className="text-xs font-mono text-slate-400">
                {correctCount} / {totalQuestions} Verified Answers Correct
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Overall Score: {overallScore}%
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {summary}
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[160px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Readiness Status
            </span>
            <span
              className={`text-xl font-bold ${
                overallScore >= 70 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {overallScore >= 70 ? 'Interview Ready' : 'Roadmap Phase'}
            </span>
            <div className="mt-2 text-[10px] text-slate-500">
              Role: {selectedRole?.title}
            </div>
          </div>
        </div>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Competency Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Verified Score</span>
          </div>

          <div className="space-y-4">
            {categoryScores.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{cat.category}</span>
                  <span className="font-mono font-bold text-cyan-400">{cat.score}%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Strengths & Weaknesses Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Diagnostic Insights</span>
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Strengths</span>
              </div>
              <p className="text-slate-400">
                Demonstrated understanding of core software engineering fundamentals, API concepts, and separation of concerns.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Key Areas for Improvement</span>
              </div>
              <p className="text-slate-400">
                Production-grade reliability, containerization, and advanced distributed patterns require consolidation in Phase 2 of your roadmap.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">
            Next Action: Personalized Learning Roadmap
          </h4>
          <p className="text-xs text-slate-400">
            Track weekly milestones tailored to close your verified gaps before attempting the mock interview.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleActivateRoadmap}
          icon={ArrowRight}
        >
          View Roadmap
        </Button>
      </div>
    </div>
  );
};
