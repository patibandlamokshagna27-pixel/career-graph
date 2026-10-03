import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Target, 
  FileUp, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const GapAnalysisPage = () => {
  const navigate = useNavigate();
  const { selectedRole, gapAnalysis, triggerGapAnalysis, allUserSkills, generateRoadmapFromGaps } = useApp();

  useEffect(() => {
    if (selectedRole && !gapAnalysis) {
      triggerGapAnalysis(selectedRole);
    }
  }, [selectedRole, gapAnalysis, triggerGapAnalysis]);

  if (!selectedRole) {
    return (
      <div className="space-y-6">
        <div className="border-b border-white/[0.08] pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Stage 3: Skill Gap Analysis & Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compare verified skills against target role benchmarks to classify deficiencies.
          </p>
        </div>

        <EmptyState
          preset="role"
          title="Target Role Required"
          message="Select a target role to start your analysis."
          description="A target role benchmark must be selected before skill gaps can be calculated."
          actionLabel="Select Target Role"
          onAction={() => navigate('/roles')}
        />
      </div>
    );
  }

  const { matched = [], criticalGaps = [], moderateGaps = [], matchPercentage = 0, totalRequired = 0 } =
    gapAnalysis || {};

  const handleStartRoadmap = () => {
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
              Stage 3: Skill Gap Analysis & Matrix
            </h1>
            <StatusBadge variant="cyan" size="xs">Stage 03 / 08</StatusBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Evaluating candidate profile against{' '}
            <strong className="text-cyan-400">{selectedRole.title}</strong> benchmark.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/roles')}
          >
            Change Role
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/assessment')}
            icon={ArrowRight}
          >
            Start Skill Assessment
          </Button>
        </div>
      </div>

      {/* Match Overview Bar */}
      <Card className="p-6 bg-gradient-to-r from-[#0d1628] to-[#111e38] border-cyan-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1">
              Benchmark Role Compatibility
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              {matchPercentage}% Alignment with {selectedRole.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {matched.length} verified competencies of {totalRequired} total benchmark requirements.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartRoadmap}
              icon={BookOpen}
            >
              Generate Learning Roadmap
            </Button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
            <div
              className="bg-emerald-400 h-full transition-all duration-500"
              style={{ width: `${(matched.length / Math.max(totalRequired, 1)) * 100}%` }}
              title={`Matched: ${matched.length}`}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: `${(moderateGaps.length / Math.max(totalRequired, 1)) * 100}%` }}
              title={`Moderate Gaps: ${moderateGaps.length}`}
            />
            <div
              className="bg-rose-400 h-full transition-all duration-500"
              style={{ width: `${(criticalGaps.length / Math.max(totalRequired, 1)) * 100}%` }}
              title={`Critical Gaps: ${criticalGaps.length}`}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              <span>Matched ({matched.length})</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span>Moderate Gaps ({moderateGaps.length})</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
              <span>Critical Gaps ({criticalGaps.length})</span>
            </span>
          </div>
        </div>
      </Card>

      {/* 3-Column Categorized Gap Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Matched Skills */}
        <Card className="p-5 border-emerald-500/20 bg-[#0c1524]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-semibold text-slate-100 text-sm">
                Matched Competencies
              </h3>
            </div>
            <StatusBadge variant="success" size="xs">
              {matched.length}
            </StatusBadge>
          </div>

          {matched.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 italic">
              No direct matches found yet. Upload your resume or add your skills to match against this role.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {matched.map((item) => (
                <li
                  key={item.name}
                  className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-200">{item.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                      {item.minProficiency}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Category: {item.category}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Column 2: Moderate Gaps */}
        <Card className="p-5 border-amber-500/20 bg-[#16151f]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold text-slate-100 text-sm">
                Moderate Gaps
              </h3>
            </div>
            <StatusBadge variant="warning" size="xs">
              {moderateGaps.length}
            </StatusBadge>
          </div>

          {moderateGaps.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 italic">
              No moderate gaps detected.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {moderateGaps.map((item) => (
                <li
                  key={item.name}
                  className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-200">{item.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/40">
                      Req: {item.minProficiency}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Category: {item.category}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Column 3: Critical Gaps */}
        <Card className="p-5 border-rose-500/20 bg-[#1a121d]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-500/20">
            <div className="flex items-center gap-2 text-rose-400">
              <XCircle className="w-5 h-5" />
              <h3 className="font-semibold text-slate-100 text-sm">
                Critical Missing Gaps
              </h3>
            </div>
            <StatusBadge variant="danger" size="xs">
              {criticalGaps.length}
            </StatusBadge>
          </div>

          {criticalGaps.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 italic">
              No critical gaps detected! You satisfy all high-priority requirements.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {criticalGaps.map((item) => (
                <li
                  key={item.name}
                  className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-rose-200">{item.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/40">
                      High Priority
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Prerequisite for: {selectedRole.title}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">
            Next Action: Take Adaptive Skill Assessment
          </h4>
          <p className="text-xs text-slate-400">
            Validate your mastery on detected gaps to update your readiness score before mock interviewing.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/assessment')}
          icon={ArrowRight}
        >
          Proceed to Assessment
        </Button>
      </div>
    </div>
  );
};
