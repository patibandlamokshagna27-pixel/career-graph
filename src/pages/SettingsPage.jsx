import React, { useState } from 'react';
import { 
  Settings, 
  Server, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Save, 
  RotateCcw, 
  Code2, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { config } from '../config/env';
import { useApiStatus } from '../context/ApiStatusContext';
import { healthService } from '../services/api/healthService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';

export const SettingsPage = () => {
  const { online, latency, isChecking, refreshStatus, lastChecked } = useApiStatus();

  const [baseUrlInput, setBaseUrlInput] = useState(config.apiBaseUrl);
  const [nlpEndpointInput, setNlpEndpointInput] = useState(config.nlpParserEndpoint);
  const [assessmentEndpointInput, setAssessmentEndpointInput] = useState(config.assessmentEndpoint);
  const [interviewEndpointInput, setInterviewEndpointInput] = useState(config.interviewEndpoint);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customPingUrl, setCustomPingUrl] = useState('http://localhost:8000/api/health');
  const [pingResult, setPingResult] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  const handleSaveOverrides = (e) => {
    e.preventDefault();
    config.setOverride('VITE_API_BASE_URL', baseUrlInput.trim());
    config.setOverride('VITE_NLP_PARSER_ENDPOINT', nlpEndpointInput.trim());
    config.setOverride('VITE_ASSESSMENT_ENDPOINT', assessmentEndpointInput.trim());
    config.setOverride('VITE_INTERVIEW_ENDPOINT', interviewEndpointInput.trim());
    setSavedSuccess(true);
    refreshStatus();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    config.resetOverrides();
    setBaseUrlInput('http://localhost:8000/api');
    setNlpEndpointInput('http://localhost:8000/api/resume/parse');
    setAssessmentEndpointInput('http://localhost:8000/api/assessment');
    setInterviewEndpointInput('http://localhost:8000/api/interview');
    setSavedSuccess(true);
    refreshStatus();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRunPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    const res = await healthService.pingUrl(customPingUrl);
    setPingResult(res);
    setIsPinging(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Developer Settings & API Inspector
            </h1>
            <StatusBadge variant="cyan" size="xs">System Architecture</StatusBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Configure backend endpoints, inspect network connectivity, and test API services.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshStatus}
          isLoading={isChecking}
          icon={RefreshCw}
        >
          Ping Backend Now
        </Button>
      </div>

      {/* Backend Status Live Inspector */}
      <Card className="p-6 bg-gradient-to-r from-[#0d1628] to-[#12223f] border-cyan-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge
                variant={online ? 'success' : 'warning'}
                size="sm"
              >
                {online ? 'Backend Online & Ready' : 'Backend Disconnected (Port 8000)'}
              </StatusBadge>
              {lastChecked && (
                <span className="text-[11px] font-mono text-slate-400">
                  Last checked: {new Date(lastChecked).toLocaleTimeString()}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-100">
              API Base URL: <code className="text-cyan-400 font-mono text-base">{config.apiBaseUrl}</code>
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              {online
                ? `Connection established with average latency of ${latency}ms. All NLP and Assessment calls will route to this server.`
                : 'The application is running in zero-mock client evaluation mode. Connect your Python FastAPI, Node, or Spring Boot backend to enable live AI/NLP processing.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono shrink-0 min-w-[200px]">
            <div className="text-slate-500 text-[10px] uppercase mb-1">Service Status</div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">HTTP Gateway:</span>
              <span className={online ? 'text-emerald-400' : 'text-rose-400'}>
                {online ? '200 OK' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Response Latency:</span>
              <span className="text-cyan-400">{latency ? `${latency} ms` : 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Local Cache:</span>
              <span className="text-emerald-400">Active</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoint Overrides Form */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Runtime API Endpoint Overrides</span>
            </h3>
            <button
              onClick={handleResetDefaults}
              className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <form onSubmit={handleSaveOverrides} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono text-slate-400 mb-1">
                API Base URL (VITE_API_BASE_URL)
              </label>
              <input
                type="text"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-mono text-slate-400 mb-1">
                NLP Resume Parser Endpoint (VITE_NLP_PARSER_ENDPOINT)
              </label>
              <input
                type="text"
                value={nlpEndpointInput}
                onChange={(e) => setNlpEndpointInput(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-mono text-slate-400 mb-1">
                Assessment Engine Endpoint (VITE_ASSESSMENT_ENDPOINT)
              </label>
              <input
                type="text"
                value={assessmentEndpointInput}
                onChange={(e) => setAssessmentEndpointInput(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-mono text-slate-400 mb-1">
                AI Mock Interview Endpoint (VITE_INTERVIEW_ENDPOINT)
              </label>
              <input
                type="text"
                value={interviewEndpointInput}
                onChange={(e) => setInterviewEndpointInput(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Overrides saved to localStorage!</span>
                </span>
              ) : (
                <span className="text-slate-500">
                  Overrides take effect immediately in the frontend.
                </span>
              )}

              <Button type="submit" variant="primary" size="sm" icon={Save}>
                Save Configuration
              </Button>
            </div>
          </form>
        </Card>

        {/* Live Endpoint Connectivity Tester */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Live Endpoint Connectivity Ping</span>
            </h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Test any local or staging URL to verify that CORS headers and HTTP responses are properly configured before running full assessments.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={customPingUrl}
              onChange={(e) => setCustomPingUrl(e.target.value)}
              className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              placeholder="http://localhost:8000/api/health"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunPing}
              isLoading={isPinging}
            >
              Ping
            </Button>
          </div>

          {pingResult && (
            <div
              className={`p-4 rounded-xl border text-xs font-mono space-y-1.5 ${
                pingResult.ok
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{pingResult.ok ? 'Connection Succeeded' : 'Connection Failed'}</span>
                <span>Status: {pingResult.status || 'Offline'}</span>
              </div>
              {pingResult.latency && (
                <div>Latency: {pingResult.latency} ms</div>
              )}
              {pingResult.error && (
                <div className="text-[11px] text-rose-400 break-all">{pingResult.error}</div>
              )}
            </div>
          )}

          {/* Quick Backend Startup Guide */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>FastAPI Backend Quick-Start (VS Code)</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              To connect your real Python AI/NLP backend, create a FastAPI server listening on port 8000:
            </p>
            <pre className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-cyan-300 overflow-x-auto border border-slate-800">
{`from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/api/health")
def health(): return {"status": "healthy", "service": "CRSD-Backend"}`}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
};
