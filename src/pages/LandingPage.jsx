import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  FileText, 
  Target, 
  Layers, 
  CheckCircle, 
  Map, 
  MessageSquare, 
  Cpu, 
  Terminal, 
  Database, 
  Network,
  Code2,
  Sparkles,
  Server,
  Workflow,
  HelpCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { useApiStatus } from '../context/ApiStatusContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { online, latency } = useApiStatus();

  const workflowSteps = [
    {
      num: '01',
      title: 'Upload Resume',
      desc: 'Submit PDF, DOCX, or TXT documents to initiate structured NLP extraction.',
      icon: FileText,
      path: '/resume',
    },
    {
      num: '02',
      title: 'Extract Skills',
      desc: 'Extract technical stack, frameworks, developer tools, and domain abilities.',
      icon: Cpu,
      path: '/resume',
    },
    {
      num: '03',
      title: 'Select Target Role',
      desc: 'Benchmark your profile against industry standards (Software Engineer, ML, DevOps, etc.).',
      icon: Target,
      path: '/roles',
    },
    {
      num: '04',
      title: 'Identify Skill Gaps',
      desc: 'Map verified skills against prerequisites to detect critical and moderate gaps.',
      icon: Layers,
      path: '/gap-analysis',
    },
    {
      num: '05',
      title: 'Take Assessment',
      desc: 'Undergo targeted adaptive evaluations on detected gap competencies.',
      icon: CheckCircle,
      path: '/assessment',
    },
    {
      num: '06',
      title: 'Personalized Roadmap',
      desc: 'Receive a phased, milestone-driven curriculum directly addressing your gaps.',
      icon: Map,
      path: '/roadmap',
    },
    {
      num: '07',
      title: 'Reassess Readiness',
      desc: 'Verify milestone completion and review overall role readiness score.',
      icon: ShieldCheck,
      path: '/readiness',
    },
    {
      num: '08',
      title: 'Mock Interview',
      desc: 'Practice with an AI interviewer on role-specific technical & behavioral prompts.',
      icon: MessageSquare,
      path: '/interview',
    },
  ];

  const features = [
    {
      title: 'Resume Skill Extraction',
      description: 'Parses unstructured resume documents into standardized taxonomy categories: Core Languages, Frameworks, Cloud/DevOps, and Tools.',
      icon: FileText,
      tag: 'NLP Pipeline',
    },
    {
      title: 'Target Role Matching',
      description: 'Compares your actual profile against production role benchmarks with categorized proficiency thresholds.',
      icon: Target,
      tag: 'Vector Benchmarks',
    },
    {
      title: 'Skill Gap Matrix Engine',
      description: 'Calculates exact deficiency severity: Matched, Moderate Gap, and Critical Missing Prerequisite.',
      icon: Layers,
      tag: 'Deterministic Logic',
    },
    {
      title: 'Adaptive Skill Assessment',
      description: 'Evaluates theoretical knowledge, code reading, and systems thinking tailored to detected gap areas.',
      icon: CheckCircle2,
      tag: 'Assessment Engine',
    },
    {
      title: 'Personalized Learning Roadmap',
      description: 'Organizes actionable study phases with estimated time commitments and verifiable milestones.',
      icon: Map,
      tag: 'Curriculum Builder',
    },
    {
      title: 'Role-Specific Mock Interview',
      description: 'Interactive conversational simulation evaluating communication depth, technical accuracy, and domain reasoning.',
      icon: MessageSquare,
      tag: 'LLM Evaluator',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Bar on Landing Page */}
      <header className="border-b border-white/[0.08] bg-[#080c14]/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-slate-100">
              CRSD System
            </span>
          </div>

          <div className="flex items-center gap-4">
            <StatusBadge variant={online ? 'success' : 'warning'} size="xs">
              {online ? `Backend Connected (${latency}ms)` : 'Backend Offline (Local Mode)'}
            </StatusBadge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Open Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 border-b border-white/[0.06] tech-grid">
        {/* Abstract Tech Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-0" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-0" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs text-cyan-300 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">AI-Powered Career-Tech Platform</span>
          </div>

          <div className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-4">
            Career Readiness & Skill Development System
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.15] mb-6">
            Know Your Skills. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Discover Your Gaps.
            </span> <br />
            Become Job-Ready.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            An AI-powered career readiness platform that analyzes your resume, identifies skill gaps, assesses your knowledge, and builds a personalized path toward your target role.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/resume')}
              icon={ArrowRight}
              className="w-full sm:w-auto"
            >
              Get Started →
            </Button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center font-medium rounded-lg text-sm px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Core System Question Prompt Box */}
          <div className="mt-14 max-w-2xl mx-auto p-4 rounded-xl bg-[#0f172a]/70 border border-slate-800 text-left">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>CORE SYSTEM QUERY</span>
            </div>
            <p className="text-sm font-medium text-slate-200 italic leading-relaxed">
              &ldquo;What skills do I have, what skills am I missing, how strong are my skills, what should I learn next, and am I ready for my target role?&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 border-b border-white/[0.06] bg-[#090d17]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">
              <Workflow className="w-3.5 h-3.5" />
              <span>Full-Lifecycle Pipeline</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 tracking-tight">
              The 8-Stage Career Readiness Workflow
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              A continuous, structured evaluation cycle that transforms raw student resumes into verified job-readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  onClick={() => navigate(step.path)}
                  className="rounded-xl border border-white/[0.08] bg-[#0e1628] p-5 hover:border-cyan-500/30 hover:bg-[#131f38] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/40 px-2 py-0.5 rounded">
                        {step.num}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-300 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {step.desc}
                    </p>
                  </div>

                  <div className="flex items-center text-xs font-medium text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>Enter Stage</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-24 px-6 border-b border-white/[0.06] bg-[#080c14]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">
              Modular Capabilities
            </div>
            <h2 className="text-3xl font-bold text-slate-100 tracking-tight">
              Key System Features
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Engineered with clean separation between UI components and backend AI/NLP endpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {feat.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mb-2">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {feat.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* System Architecture Blueprint (For Evaluators & Hackathon Judges) */}
      <section className="py-24 px-6 bg-[#090e18] border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">
              <Network className="w-3.5 h-3.5" />
              <span>Engineering Specification</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 tracking-tight">
              System Architecture & Data Flow
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Ready for VS Code extension. Frontend components connect to decoupled microservices via standard HTTP/JSON.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0d1424] p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {/* Node 1: Client */}
              <div className="p-4 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-center">
                <Code2 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-200">React Frontend</h4>
                <p className="text-[11px] text-slate-400 mt-1">Vite + Tailwind UI</p>
                <div className="mt-2 text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded">
                  Port 3000
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center text-slate-600 font-mono text-xs">
                ──► REST ──►
              </div>

              {/* Node 2: Gateway */}
              <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-700 text-center">
                <Server className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-200">API Gateway</h4>
                <p className="text-[11px] text-slate-400 mt-1">FastAPI / Express</p>
                <div className="mt-2 text-[10px] font-mono text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded">
                  Port 8000
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center text-slate-600 font-mono text-xs">
                ──► Async ──►
              </div>

              {/* Node 3: AI Engine */}
              <div className="p-4 rounded-lg bg-slate-900/90 border border-indigo-500/30 text-center">
                <Cpu className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-200">AI & NLP Services</h4>
                <p className="text-[11px] text-slate-400 mt-1">spaCy + LLM Agent</p>
                <div className="mt-2 text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded">
                  Embeddings & Models
                </div>
              </div>
            </div>

            {/* Integration Note */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Mock Rule: Empty states active until real endpoints respond.</span>
              </span>
              <Link to="/settings" className="text-cyan-400 hover:underline font-mono">
                Inspect API Endpoints →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">
            Begin Your Career Readiness Verification
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            Upload your resume or configure your target role to evaluate competencies with precision.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/resume')}
            icon={ArrowRight}
          >
            Launch System Workflow
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#070a10] py-6 px-6 text-xs text-slate-500 text-center">
        <p>Career Readiness & Skill Development System • AI Career-Tech Project • Zero-Mock Architecture</p>
      </footer>
    </div>
  );
};
