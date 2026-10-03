import React, { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {

  MessageSquare,

  Mic,

  MicOff,

  Send,

  Volume2,

  Sparkles,

  AlertCircle,

  RotateCcw,

  CheckCircle2,

  Server,

  ArrowRight,


} from 'lucide-react';

import { useApp } from '../context/AppContext';

import { Card } from '../components/common/Card';

import { Button } from '../components/common/Button';

import { StatusBadge } from '../components/common/StatusBadge';

import { EmptyState } from '../components/common/EmptyState';

export const MockInterviewPage = () => {

  const API_BASE_URL = 'http://127.0.0.1:8000';

  const checkInterviewBackend = async () => {

    const healthResponse = await fetch(

      `${API_BASE_URL}/api/interview/health`

    );

    let healthData = null;

    try {

      healthData = await healthResponse.json();

    } catch {

      // Keep the original HTTP error if the response is not JSON.

    }

    if (!healthResponse.ok || !healthData?.success) {

      throw new Error(

        `AI Interview backend is not available at ${API_BASE_URL}. Start FastAPI with: uvicorn main:app --reload --host 127.0.0.1 --port 8000`

      );

    }

    return healthData;

  };

  const navigate = useNavigate();

  const { selectedRole, interviewResult, setInterviewResult } = useApp();

  const [sessionMode, setSessionMode] = useState('Technical Architecture');

  const [sessionState, setSessionState] = useState('idle'); // 'idle' | 'active' | 'feedback'

  const [currentTurn, setCurrentTurn] = useState(0);

  const [candidateResponse, setCandidateResponse] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const [isEvaluating, setIsEvaluating] = useState(false);

  const [offlineNotice, setOfflineNotice] = useState(null);

  // Active question state

  const [currentQuestion, setCurrentQuestion] = useState('');

  const [conversationLog, setConversationLog] = useState([]);

  const [interviewSessionId, setInterviewSessionId] = useState(null);

  if (!selectedRole) {

    return (

      <div className="space-y-6">

        <div className="border-b border-white/[0.08] pb-6">

          <h1 className="text-2xl font-bold tracking-tight text-slate-100">

            Stage 8: Role-Specific AI Mock Interview

          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-1">

            Simulate realistic technical and architectural interview rounds tailored to your role.

          </p>

        </div>

        <EmptyState

          preset="role"

          title="Target Role Required"

          message="Select a target role to start your analysis."

          description="Mock interview questions are strictly aligned to the competencies of your chosen role."

          actionLabel="Select Target Role"

          onAction={() => navigate('/roles')}

        />

      </div>

    );

  }

  // Real browser microphone -> speech-to-text.
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        'Voice input is not supported by this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceError('');
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += `${transcript} `;
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript;
      setCandidateResponse(`${finalTranscript}${interimTranscript}`.trim());
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceError(
          'Microphone permission was blocked. Allow microphone access for this site and try again.'
        );
      } else if (event.error === 'no-speech') {
        setVoiceError('No speech was detected. Speak clearly and try again.');
      } else if (event.error === 'audio-capture') {
        setVoiceError(
          'No microphone was detected. Check your microphone and try again.'
        );
      } else {
        setVoiceError(`Voice input error: ${event.error}`);
      }

      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }
      recognitionRef.current = null;
    };
  }, []);

  const toggleVoiceInput = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setVoiceError(
        'Voice input is not available in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    if (isRecording) {
      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }
      setIsRecording(false);
      return;
    }

    setVoiceError('');
    finalTranscriptRef.current = candidateResponse
      ? `${candidateResponse.trim()} `
      : '';

    try {
      recognition.start();
    } catch (error) {
      console.error('Unable to start speech recognition:', error);
      setVoiceError(
        'Unable to start voice input. Check microphone permission and try again.'
      );
      setIsRecording(false);
    }
  };

  const handleStartSession = async () => {

    setOfflineNotice(null);

    setIsEvaluating(true);

    try {

      // The backend question banks use these two categories.

      const category =

        sessionMode === 'Behavioral & Leadership'

          ? 'Behavioral & Leadership'

          : 'Problem Solving';

      const response = await fetch(`${API_BASE_URL}/api/interview/start`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          role: selectedRole.title || selectedRole.id || 'Software Developer',

          roleId: selectedRole.id,

          category,

          interviewType: category,

          questionCount: 6,

        }),

      });

      const data = await response.json();

      if (!response.ok || !data.success) {

        throw new Error(

          data.detail ||

            data.error ||

            'Unable to start the AI interview session.'

        );

      }

      const firstQuestion = data.question || data.questionText;

      if (!data.sessionId || !firstQuestion) {

        throw new Error('Interview backend returned an incomplete session.');

      }

      setInterviewSessionId(data.sessionId);

      setCurrentQuestion(firstQuestion);

      setSessionState('active');

      setCurrentTurn(1);

      setConversationLog([

        {

          role: 'interviewer',

          text: firstQuestion,

          timestamp: new Date().toLocaleTimeString(),

        },

      ]);

    } catch (error) {

      console.error('AI Interview start error:', error);

      setOfflineNotice(

        error?.message ||

          'Unable to connect to the AI Interview backend. Make sure FastAPI is running on http://127.0.0.1:8000.'

      );

    } finally {

      setIsEvaluating(false);

    }

  };

  const handleStartDiagnosticSession = async () => {

    // Diagnostic mode now uses the same working backend session,

    // so answers can also be submitted and evaluated.

    setOfflineNotice(null);

    setIsEvaluating(true);

    try {

      const response = await fetch(`${API_BASE_URL}/api/interview/start`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          role: selectedRole.title || selectedRole.id || 'Software Developer',

          roleId: selectedRole.id,

          category: 'Problem Solving',

          interviewType: 'Problem Solving',

          questionCount: 3,

        }),

      });

      const data = await response.json();

      if (!response.ok || !data.success) {

        throw new Error(

          data.detail ||

            data.error ||

            'Unable to start the diagnostic interview session.'

        );

      }

      const firstQuestion = data.question || data.questionText;

      if (!data.sessionId || !firstQuestion) {

        throw new Error('Interview backend returned an incomplete session.');

      }

      setInterviewSessionId(data.sessionId);

      setCurrentQuestion(firstQuestion);

      setSessionState('active');

      setCurrentTurn(1);

      setConversationLog([

        {

          role: 'interviewer',

          text: firstQuestion,

          timestamp: new Date().toLocaleTimeString(),

        },

      ]);

    } catch (error) {

      console.error('Diagnostic interview start error:', error);

      setOfflineNotice(

        error?.message ||

          'Unable to connect to the AI Interview backend.'

      );

    } finally {

      setIsEvaluating(false);

    }

  };

  const handleSubmitAnswer = async () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped.
      }
      setIsRecording(false);
    }

    if (!candidateResponse.trim() || !interviewSessionId) return;

    setIsEvaluating(true);

    const answerText = candidateResponse.trim();

    const userTurn = {

      role: 'candidate',

      text: answerText,

      timestamp: new Date().toLocaleTimeString(),

    };

    const updatedLog = [...conversationLog, userTurn];

    setConversationLog(updatedLog);

    setCandidateResponse('');

    try {

      const response = await fetch(`${API_BASE_URL}/api/interview/answer`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          sessionId: interviewSessionId,

          answer: answerText,

          response: answerText,

          question: currentQuestion,

          questionIndex: currentTurn - 1,

        }),

      });

      const data = await response.json();

      if (!response.ok || !data.success) {

        throw new Error(

          data.detail ||

            data.error ||

            'The interview answer could not be evaluated.'

        );

      }

      if (!data.completed) {

        const nextQuestion = data.question || data.questionText;

        if (!nextQuestion) {

          throw new Error('Interview backend did not return the next question.');

        }

        setCurrentQuestion(nextQuestion);

        setCurrentTurn((prev) => prev + 1);

        setConversationLog([

          ...updatedLog,

          {

            role: 'interviewer',

            text: nextQuestion,

            timestamp: new Date().toLocaleTimeString(),

          },

        ]);

        return;

      }

      // All questions are answered. Get the actual backend report.

      const reportResponse = await fetch(

        `${API_BASE_URL}/api/interview/submit`,

        {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

          },

          body: JSON.stringify({

            sessionId: interviewSessionId,

          }),

        }

      );

      const reportData = await reportResponse.json();

      if (!reportResponse.ok || !reportData.success) {

        throw new Error(

          reportData.detail ||

            reportData.error ||

            'Interview completed, but the final report could not be generated.'

        );

      }

      const report = reportData.report || {};

      const averageScore = Number(report.average_score ?? 0);

      const scorecard = {

        roleTitle: selectedRole.title,

        completedAt: new Date().toISOString(),

        turnsCompleted: Number(

          report.questions_answered ?? currentTurn

        ),

        scores: {

          technicalDepth: averageScore,

          communication: averageScore,

          systemThinking: averageScore,

          relevance: averageScore,

        },

        overallScore: averageScore,

        strengths: report.strengths || [],

        improvements: report.improvements || [],

        verdict: report.readiness || 'Interview Report Generated',

      };

      setInterviewResult(scorecard);

      setSessionState('feedback');

    } catch (error) {

      console.error('AI Interview answer error:', error);

      setOfflineNotice(

        error?.message ||

          'Unable to communicate with the AI Interview backend.'

      );

    } finally {

      setIsEvaluating(false);

    }

  };

  return (

    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">

        <div>

          <div className="flex items-center gap-2 mb-1">

            <h1 className="text-2xl font-bold tracking-tight text-slate-100">

              Stage 8: Role-Specific AI Mock Interview

            </h1>

            <StatusBadge variant="cyan" size="xs">Stage 08 / 08</StatusBadge>

          </div>

          <p className="text-xs sm:text-sm text-slate-400">

            Interactive simulated interview for{' '}

            <strong className="text-cyan-400">{selectedRole.title}</strong>.

          </p>

        </div>

        <div className="flex items-center gap-3">

          {sessionState === 'active' && (

            <Button

              variant="secondary"

              size="sm"

              onClick={() => {

                if (window.confirm('End current interview session?')) {

                  setSessionState('idle');

                }

              }}

            >

              End Session

            </Button>

          )}

        </div>

      </div>

      {/* State 1: Pre-Session Config */}

      {sessionState === 'idle' && (

        <div className="max-w-2xl mx-auto space-y-6">

          <Card className="p-8 text-center space-y-6 border-cyan-500/20">

            <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-glow-cyan/20">

              <MessageSquare className="w-8 h-8" />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-100 mb-2">

                Launch AI Mock Interview for {selectedRole.title}

              </h2>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">

                Practice answering complex architectural questions, explaining your system decisions, and receiving empirical feedback.

              </p>

            </div>

            {/* Mode Selector */}

            <div className="text-left space-y-2 max-w-md mx-auto">

              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">

                Interview Domain Round

              </label>

              <div className="grid grid-cols-2 gap-2">

                {['Technical Architecture', 'Systems Design', 'Problem Solving', 'Behavioral & Leadership'].map((mode) => (

                  <button

                    key={mode}

                    onClick={() => setSessionMode(mode)}

                    className={`p-3 rounded-lg border text-xs text-left font-medium transition-colors ${

                      sessionMode === mode

                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'

                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'

                    }`}

                  >

                    {mode}

                  </button>

                ))}

              </div>

            </div>

            <div className="pt-2">

              <Button

                variant="primary"

                size="lg"

                onClick={handleStartSession}

                isLoading={isEvaluating}

                icon={Sparkles}

              >

                Connect to AI Interview Agent

              </Button>

            </div>

          </Card>

          {/* Backend Notice & Diagnostic Mode Option */}

          {offlineNotice && (

            <Card className="p-6 border-amber-500/30 bg-[#16131c] space-y-4">

              <div className="flex items-start gap-3">

                <Server className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />

                <div className="space-y-1">

                  <h4 className="text-sm font-semibold text-amber-300">

                    Backend AI Interview Service Notice

                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">

                    {offlineNotice}

                  </p>

                </div>

              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">

                <span className="text-[11px] text-slate-500">

                  Ready to test speech/audio controls and response flow?

                </span>

                <Button

                  variant="outline"

                  size="sm"

                  onClick={handleStartDiagnosticSession}

                  icon={ArrowRight}

                >

                  Start Diagnostic Interview Session

                </Button>

              </div>

            </Card>

          )}

        </div>

      )}

      {/* State 2: Active Interview Console */}

      {sessionState === 'active' && (

        <div className="max-w-4xl mx-auto space-y-6">

          {/* Interviewer Persona Card */}

          <Card className="p-6 border-cyan-500/30 bg-gradient-to-r from-[#0d1628] to-[#12203b]">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">

                <Volume2 className="w-6 h-6 animate-pulse" />

              </div>

              <div className="space-y-2 flex-1">

                <div className="flex items-center justify-between">

                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">

                    AI Lead Technical Interviewer • Turn {currentTurn}

                  </span>

                  <StatusBadge variant="cyan" size="xs">Listening</StatusBadge>

                </div>

                <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">

                  “{currentQuestion}”

                </p>

              </div>

            </div>

          </Card>

          {/* Candidate Response Workspace */}

          <Card className="p-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">

                Your Spoken or Written Response

              </span>

              <div className="flex items-center gap-2">

                <button

                  type="button"

                  onClick={toggleVoiceInput}

                  className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${

                    isRecording

                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'

                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'

                  }`}

                  title="Toggle Microphone Speech Input"

                >

                  {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}

                  <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>

                </button>

              </div>

            </div>

            <textarea

              rows={5}

              placeholder="Type your structured technical response here, or click Voice Input to dictate..."

              value={candidateResponse}

              onChange={(e) => setCandidateResponse(e.target.value)}

              className="w-full rounded-xl bg-slate-900/90 border border-slate-700 p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"

            />

            {voiceError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 mb-2">
                {voiceError}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">

              <span className="text-xs text-slate-500">

                Tip: Structure answers using STAR framework or Architecture Problem-Solution patterns.

              </span>

              <Button

                variant="primary"

                size="md"

                onClick={handleSubmitAnswer}

                disabled={!candidateResponse.trim()}

                isLoading={isEvaluating}

                icon={Send}

              >

                Submit Answer

              </Button>

            </div>

          </Card>

          {/* Conversation Log */}

          {conversationLog.length > 1 && (

            <Card className="p-6 space-y-4">

              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">

                Session Transcript

              </h4>

              <div className="space-y-3">

                {conversationLog.map((entry, idx) => (

                  <div

                    key={idx}

                    className={`p-3 rounded-lg text-xs leading-relaxed ${

                      entry.role === 'candidate'

                        ? 'bg-cyan-950/20 border border-cyan-500/20 text-slate-200 ml-6'

                        : 'bg-slate-900 border border-slate-800 text-slate-300 mr-6'

                    }`}

                  >

                    <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">

                      <span className="uppercase">{entry.role}</span>

                      <span>{entry.timestamp}</span>

                    </div>

                    {entry.text}

                  </div>

                ))}

              </div>

            </Card>

          )}

        </div>

      )}

      {/* State 3: Feedback Scorecard */}

      {sessionState === 'feedback' && interviewResult && (

        <div className="max-w-3xl mx-auto space-y-6">

          <Card className="p-8 border-emerald-500/30 bg-gradient-to-r from-[#0c1825] to-[#10233d] space-y-6">

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

              <div>

                <StatusBadge variant="success" size="sm">Session Completed</StatusBadge>

                <h2 className="text-2xl font-bold text-slate-100 mt-2">

                  AI Interview Evaluation Scorecard

                </h2>

                <p className="text-xs text-slate-300 mt-1">

                  Target Role: <strong className="text-cyan-400">{interviewResult.roleTitle}</strong>

                </p>

              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[140px]">

                <span className="text-[10px] font-mono text-slate-400 uppercase">Overall Score</span>

                <div className="text-3xl font-extrabold text-emerald-400">{interviewResult.overallScore}%</div>

                <div className="text-[10px] text-slate-400 mt-1">{interviewResult.verdict}</div>

              </div>

            </div>

            {/* Score Grid */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">

                <span className="text-[10px] text-slate-400 uppercase font-mono block">Technical Depth</span>

                <span className="text-lg font-bold text-slate-100">{interviewResult.scores.technicalDepth}%</span>

              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">

                <span className="text-[10px] text-slate-400 uppercase font-mono block">Communication</span>

                <span className="text-lg font-bold text-slate-100">{interviewResult.scores.communication}%</span>

              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">

                <span className="text-[10px] text-slate-400 uppercase font-mono block">System Thinking</span>

                <span className="text-lg font-bold text-slate-100">{interviewResult.scores.systemThinking}%</span>

              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">

                <span className="text-[10px] text-slate-400 uppercase font-mono block">Relevance</span>

                <span className="text-lg font-bold text-slate-100">{interviewResult.scores.relevance}%</span>

              </div>

            </div>

            {/* Strengths & Improvements */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">

                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">

                  <CheckCircle2 className="w-4 h-4" />

                  <span>Key Strengths</span>

                </div>

                <ul className="space-y-1 text-slate-300 list-disc list-inside">

                  {interviewResult.strengths.map((str, idx) => (

                    <li key={idx}>{str}</li>

                  ))}

                </ul>

              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">

                <div className="font-semibold text-amber-400 flex items-center gap-1.5">

                  <AlertCircle className="w-4 h-4" />

                  <span>Recommendations</span>

                </div>

                <ul className="space-y-1 text-slate-300 list-disc list-inside">

                  {interviewResult.improvements.map((imp, idx) => (

                    <li key={idx}>{imp}</li>

                  ))}

                </ul>

              </div>

            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between">

              <Button

                variant="secondary"

                size="sm"

                onClick={() => {

                  setSessionState('idle');

                  setInterviewSessionId(null);

                  setInterviewResult(null);

                }}

                icon={RotateCcw}

              >

                Conduct Another Round

              </Button>

              <Button

                variant="primary"

                size="sm"

                onClick={() => navigate('/dashboard')}

                icon={ArrowRight}

              >

                Back to Dashboard

              </Button>

            </div>

          </Card>

        </div>

      )}

    </div>

  );

};
