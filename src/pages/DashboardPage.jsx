import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileUp, 
  Target, 
  Layers, 
  CheckCircle2, 
  BarChart3, 
  Map, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { WorkflowProgress } from '../components/common/WorkflowProgress';
import { EmptyState } from '../components/common/EmptyState';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { 
    uploadedResume, 
    allUserSkills, 
    selectedRole, 
    gapAnalysis, 
    assessmentReport, 
    roadmap, 
    interviewResult 
  } = useApp();

  // Determine current active recommendation based strictly on actual progress
  const getNextRecommendedStep = () => {
    if (!uploadedResume && allUserSkills.length === 0) {
      return {
        stage: 'Stage 1',
        title: 'Upload your resume to begin',
        description: 'Submit your resume document to let the NLP parser identify your technical and domain skill profile.',
        action: () => navigate('/resume'),
        buttonLabel: 'Upload Resume',
      };
    }
    if (!selectedRole) {
      return {
        stage: 'Stage 2',
        title: 'Select a target role to start your analysis',
        description: 'Choose a benchmark role (Software Engineer, ML Engineer, DevOps, etc.) to evaluate competency requirements.',
        action: () => navigate('/roles'),
        buttonLabel: 'Choose Target Role',
      };
    }
    if (!gapAnalysis) {
      return {
        stage: 'Stage 3',
        title: 'Run skill gap analysis',
        description: 'Evaluate your verified skills against the benchmark to map matched competencies and missing prerequisites.',
        action: () => navigate('/gap-analysis'),
        buttonLabel: 'Analyze Skill Gaps',
      };
    }
    if (!assessmentReport) {
      return {
        stage: 'Stage 4',
        title: 'Complete your assessment to generate your performance report',
        description: `Undergo an adaptive evaluation tailored to ${selectedRole.title} competency standards.`,
        action: () => navigate('/assessment'),
        buttonLabel: 'Take Assessment',
      };
    }
    if (!roadmap) {
      return {
        stage: 'Stage 5',
        title: 'Generate your personalized learning roadmap',
        description: 'Create a tailored milestone trajectory to bridge your detected skill gaps systematically.',
        action: () => navigate('/roadmap'),
        buttonLabel: 'Generate Roadmap',
      };
    }
    if (!interviewResult) {
      return {
        stage: 'Stage 6',
        title: 'Participate in AI Mock Interview',
        description: 'Test your verbal and conceptual technical answers with role-specific interview simulation.',
        action: () => navigate('/interview'),
        buttonLabel: 'Start Mock Interview',
      };
    }
    return {
      stage: 'Complete',
      title: 'Full Evaluation Cycle Completed',
      description: 'You have completed all stages of the readiness verification workflow. Review your report or run a new evaluation.',
      action: () => navigate('/report'),
      buttonLabel: 'View Final Report',
    };
  };

  const nextStep = getNextRecommendedStep();

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Career Readiness Hub
            </h1>
            <StatusBadge variant="cyan" size="xs">Live State</StatusBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time tracking across resume extraction, benchmark matching, gap identification, and mock interviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={nextStep.action}
            icon={ArrowRight}
          >
            {nextStep.buttonLabel}
          </Button>
        </div>
      </div>

      {/* 8-Stage Workflow Tracker */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0c1220] p-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
            Workflow Progress
          </span>
          <span className="text-xs text-cyan-400 font-medium">
            Step: {nextStep.stage}
          </span>
        </div>
        <WorkflowProgress />
      </div>

      {/* Metrics Row - strictly real data, zero fake numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Extracted Skills"
          value={allUserSkills.length > 0 ? allUserSkills.length : null}
          emptyText="0 (Upload to Extract)"
          subtitle={uploadedResume ? `${uploadedResume.name}` : 'Upload resume to extract'}
          icon={FileUp}
          variant="cyan"
        />

        <MetricCard
          title="Target Role"
          value={selectedRole ? selectedRole.title : null}
          emptyText="None Selected"
          subtitle={selectedRole ? `${selectedRole.requiredSkills?.length || 0} benchmark skills` : 'Select a target role to start'}
          icon={Target}
          variant="default"
        />

        <MetricCard
          title="Skill Match Level"
          value={gapAnalysis ? `${gapAnalysis.matchPercentage}%` : null}
          emptyText="Pending Analysis"
          subtitle={gapAnalysis ? `${gapAnalysis.matched.length} of ${gapAnalysis.totalRequired} skills matched` : 'Requires role & skills'}
          icon={Layers}
          variant={gapAnalysis ? (gapAnalysis.matchPercentage >= 70 ? 'emerald' : 'amber') : 'default'}
        />

        <MetricCard
          title="Assessment Status"
          value={assessmentReport ? `${assessmentReport.overallScore}%` : null}
          emptyText="Not Completed"
          subtitle={assessmentReport ? 'Verified via Assessment' : 'Complete assessment to score'}
          icon={CheckCircle2}
          variant={assessmentReport ? 'emerald' : 'default'}
        />
      </div>

      {/* Primary Action Guidance Card */}
      <Card className="border-cyan-500/30 bg-gradient-to-r from-[#0d1627] to-[#0f1d35] p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Next Action • {nextStep.stage}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              {nextStep.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {nextStep.description}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={nextStep.action}
            icon={ArrowRight}
            className="shrink-0"
          >
            {nextStep.buttonLabel}
          </Button>
        </div>
      </Card>

      {/* Main Grid: Real Data vs Professional Empty States */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Target Role & Skill Matching Matrix Status */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-slate-100 text-sm">Target Role & Match Summary</h3>
              </div>
              {selectedRole && (
                <StatusBadge variant="cyan" size="xs">
                  {selectedRole.level}
                </StatusBadge>
              )}
            </div>

            {selectedRole && gapAnalysis ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Target Benchmark</div>
                  <div className="text-base font-bold text-slate-100">{selectedRole.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{selectedRole.description}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                    <div className="font-bold text-base">{gapAnalysis.matched.length}</div>
                    <div className="text-[10px] text-emerald-400/80">Matched Skills</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-300">
                    <div className="font-bold text-base">{gapAnalysis.moderateGaps.length}</div>
                    <div className="text-[10px] text-amber-400/80">Moderate Gaps</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300">
                    <div className="font-bold text-base">{gapAnalysis.criticalGaps.length}</div>
                    <div className="text-[10px] text-rose-400/80">Critical Gaps</div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                preset="role"
                title="Target Role Pending"
                message="Select a target role to start your analysis."
                description="Choose your desired career benchmark to trigger the skill gap identification engine."
                actionLabel="Select Role"
                onAction={() => navigate('/roles')}
              />
            )}
          </div>

          {selectedRole && (
            <div className="mt-4 pt-3 border-t border-slate-800 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/gap-analysis')}
                icon={ArrowRight}
              >
                Inspect Detailed Gap Matrix
              </Button>
            </div>
          )}
        </Card>

        {/* Right Card: Performance Report & Assessment Status */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-slate-100 text-sm">Assessment & Verified Analytics</h3>
              </div>
              <StatusBadge variant={assessmentReport ? 'success' : 'default'} size="xs">
                {assessmentReport ? 'Verified' : 'Pending'}
              </StatusBadge>
            </div>

            {assessmentReport ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-300 font-medium">Overall Score</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {assessmentReport.overallScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full transition-all"
                      style={{ width: `${assessmentReport.overallScore}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  <span className="text-slate-300 font-medium">Evaluation Summary: </span>
                  {assessmentReport.summary || 'Adaptive assessment completed successfully.'}
                </div>
              </div>
            ) : (
              <EmptyState
                preset="report"
                title="Performance Report Awaiting Assessment"
                message="Complete your assessment to generate your performance report."
                description="Zero fake analytics: Performance metrics will be plotted here only after taking a real assessment."
                actionLabel="Take Assessment"
                onAction={() => navigate('/assessment')}
              />
            )}
          </div>

          {assessmentReport && (
            <div className="mt-4 pt-3 border-t border-slate-800 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/report')}
                icon={ArrowRight}
              >
                View Full Scorecard
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Section: Personalized Roadmap Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Personalized Learning Roadmap</h3>
          </div>
          {roadmap && (
            <StatusBadge variant="cyan" size="xs">
              {roadmap.phases?.length || 0} Phases
            </StatusBadge>
          )}
        </div>

        {roadmap && roadmap.phases && roadmap.phases.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Personalized curriculum targeting identified gap competencies for{' '}
              <span className="text-cyan-300 font-medium">{roadmap.roleTitle}</span>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roadmap.phases.map((phase) => (
                <div key={phase.id} className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800">
                  <div className="text-[11px] font-mono text-cyan-400 font-semibold mb-1">{phase.title}</div>
                  <div className="text-xs text-slate-300 mb-2">{phase.description}</div>
                  <div className="text-[11px] text-slate-400">{phase.skills.length} target milestones</div>
                </div>
              ))}
            </div>
            <div className="pt-2 text-right">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/roadmap')}
                icon={ArrowRight}
              >
                Open Full Roadmap
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            preset="roadmap"
            title="Learning Roadmap Standby"
            message="Your personalized roadmap will appear here after skill analysis."
            description="Once you compare your extracted skills against a target role, a milestone curriculum will be synthesized here."
            actionLabel="Start Skill Analysis"
            onAction={() => navigate('/gap-analysis')}
          />
        )}
      </Card>
    </div>
  );
};
