import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Target, 
  Layers, 
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';

export const ReadinessCheckPage = () => {
  const navigate = useNavigate();
  const { 
    uploadedResume, 
    allUserSkills, 
    selectedRole, 
    gapAnalysis, 
    assessmentReport, 
    roadmap 
  } = useApp();

  const criteria = [
    {
      id: 'profile',
      name: 'Resume & Skill Profile Verified',
      description: 'Candidate skill taxonomy extracted from resume or manually confirmed.',
      status: allUserSkills.length > 0,
      link: '/resume',
      linkText: 'Upload Resume',
      icon: FileText,
      value: allUserSkills.length > 0 ? `${allUserSkills.length} Verified Skills` : 'No Skills Entered',
    },
    {
      id: 'role',
      name: 'Target Benchmark Role Configured',
      description: 'Role benchmark selected for alignment calculation.',
      status: Boolean(selectedRole),
      link: '/roles',
      linkText: 'Select Role',
      icon: Target,
      value: selectedRole ? selectedRole.title : 'None Selected',
    },
    {
      id: 'gap',
      name: 'Skill Gap Matrix Computed',
      description: 'Deficiencies classified into critical and moderate priority bands.',
      status: Boolean(gapAnalysis),
      link: '/gap-analysis',
      linkText: 'Analyze Gaps',
      icon: Layers,
      value: gapAnalysis ? `${gapAnalysis.matchPercentage}% Alignment` : 'Pending Analysis',
    },
    {
      id: 'assessment',
      name: 'Conceptual Assessment Completed',
      description: 'Empirical assessment score recorded for benchmark competencies.',
      status: Boolean(assessmentReport),
      link: '/assessment',
      linkText: 'Take Assessment',
      icon: BarChart3,
      value: assessmentReport ? `${assessmentReport.overallScore}% Verified Score` : 'Pending Assessment',
    },
  ];

  const passedCount = criteria.filter((c) => c.status).length;
  const isFullyReady = passedCount === criteria.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Stage 7: Career Readiness Verification Gate
            </h1>
            <StatusBadge variant="cyan" size="xs">Stage 07 / 08</StatusBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            System gatekeeper verifying prerequisites before admitting candidate to mock interview simulation.
          </p>
        </div>

        <Button
          variant={isFullyReady ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => navigate('/interview')}
          icon={ArrowRight}
        >
          {isFullyReady ? 'Proceed to Mock Interview' : 'Skip Directly to Interview'}
        </Button>
      </div>

      {/* Primary Verification Status Card */}
      <Card className="p-6 bg-gradient-to-r from-[#0d1628] to-[#12223f] border-cyan-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge
                variant={isFullyReady ? 'success' : 'warning'}
                size="sm"
              >
                {isFullyReady ? 'Readiness Gate Passed' : 'Prerequisites Incomplete'}
              </StatusBadge>
              <span className="text-xs font-mono text-slate-400">
                {passedCount} / {criteria.length} Verification Gates Satisfied
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              {isFullyReady
                ? 'Candidate is Fully Prepared for Mock Interview'
                : 'Complete Pending Verification Gates'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {isFullyReady
                ? `All benchmark requirements, gap assessments, and evaluations for ${selectedRole.title} have been verified.`
                : 'The system requires completing resume extraction, benchmark matching, and skill assessments to generate accurate interview prompts.'}
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(isFullyReady ? '/interview' : criteria.find((c) => !c.status)?.link || '/resume')}
              icon={ArrowRight}
            >
              {isFullyReady ? 'Launch Mock Interview' : 'Complete Next Step'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Verification Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteria.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              className={`p-5 flex flex-col justify-between ${
                item.status ? 'border-emerald-500/20 bg-[#0d1727]' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.status
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100">{item.name}</h3>
                  </div>
                  {item.status ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">{item.value}</span>
                {!item.status && (
                  <button
                    onClick={() => navigate(item.link)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                  >
                    <span>{item.linkText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
