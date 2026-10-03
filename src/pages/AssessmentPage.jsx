import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

import { useNavigate } from 'react-router-dom';

import {
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Server,
  Layers
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { assessmentService } from '../services/api/assessmentService';

import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const AssessmentPage = () => {
  const navigate = useNavigate();
  const { selectedRole, gapAnalysis, setAssessmentReport } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================
  // ASSESSMENT SECURITY STATE
  // ============================================================

  const [securityViolations, setSecurityViolations] = useState(0);
  const [securityTerminated, setSecurityTerminated] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningPopup, setWarningPopup] = useState(null);
  const warningPopupTimerRef = useRef(null);

  // ============================================================
  // CAMERA PROCTORING STATE
  // ============================================================

  const [cameraStatus, setCameraStatus] = useState('Not started');
  const [personCount, setPersonCount] = useState(0);
  const [phoneDetected, setPhoneDetected] = useState(false);

  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const detectionModelRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const detectionBusyRef = useRef(false);
  const cameraReadyRef = useRef(false);

  const lastCameraViolationRef = useRef({});
  const noPersonStreakRef = useRef(0);
  const multiplePersonStreakRef = useRef(0);
  const phoneStreakRef = useRef(0);

  const lastViolationTime = useRef(0);
  const assessmentActiveRef = useRef(false);

  // Assessment will terminate after this many browser-security violations.
  const MAX_SECURITY_VIOLATIONS = 3;

  // ============================================================
  // SECURITY HELPERS
  // ============================================================

  const showSecurityWarning = (type, count = null) => {
    const messages = {
      TAB_SWITCH: 'You switched away from the assessment tab. Please stay on the assessment page.',
      WINDOW_FOCUS_LOST: 'The assessment window lost focus. Do not click outside the assessment.',
      FULLSCREEN_EXIT: 'You exited fullscreen mode. Please remain in fullscreen during the assessment.',
      NO_PERSON_DETECTED: 'No person was detected by the camera. Please stay visible in front of the camera.',
      MULTIPLE_PERSON_DETECTED: 'Multiple persons were detected. Only the candidate should be visible during the assessment.',
      PHONE_DETECTED: 'A mobile phone was detected. Please remove the phone from the camera view.',
      CAMERA_UNAVAILABLE: 'Camera access is required for this secured assessment. Please enable the camera.',
      AI_DETECTION_FAILED: 'AI camera monitoring could not start. The secured assessment cannot continue.'
    };

    const title = type === 'CAMERA_UNAVAILABLE' || type === 'AI_DETECTION_FAILED'
      ? 'Camera Security Alert'
      : 'Anti-Cheating Warning';

    setWarningPopup({
      title,
      message: messages[type] || `${type.replaceAll('_', ' ')} detected.`,
      count,
      type
    });

    if (warningPopupTimerRef.current) {
      clearTimeout(warningPopupTimerRef.current);
    }

    warningPopupTimerRef.current = window.setTimeout(() => {
      setWarningPopup(null);
    }, 5000);
  };

  const recordSecurityViolation = (type) => {
    const now = Date.now();

    // Prevent duplicate events caused by blur + visibilitychange
    // firing for the same tab switch.
    if (now - lastViolationTime.current < 1500) {
      return;
    }

    lastViolationTime.current = now;

    setSecurityViolations((previous) => {
      const newCount = previous + 1;
      showSecurityWarning(type, newCount);

      if (newCount >= MAX_SECURITY_VIOLATIONS) {
        setSecurityTerminated(true);
        setSecurityMessage(
          `Assessment terminated because the maximum number of security violations (${MAX_SECURITY_VIOLATIONS}) was exceeded.`
        );
      } else {
        setSecurityMessage(
          `${type.replaceAll('_', ' ')} detected. Warning ${newCount}/${MAX_SECURITY_VIOLATIONS}.`
        );
      }

      return newCount;
    });
  };

  // ============================================================
  // CAMERA PROCTORING HELPERS
  // ============================================================

  const stopCameraMonitoring = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (cameraVideoRef.current) {
      cameraVideoRef.current.pause();
      cameraVideoRef.current.srcObject = null;
    }

    detectionModelRef.current = null;
    detectionBusyRef.current = false;
    cameraReadyRef.current = false;

    setPersonCount(0);
    setPhoneDetected(false);
    setCameraStatus('Not started');
  };

  const requestCameraAccess = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by this browser.');
      }

      setCameraStatus('Requesting camera permission...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      cameraStreamRef.current = stream;
      cameraReadyRef.current = true;
      setCameraStatus('Camera permission granted');
      return true;
    } catch (error) {
      console.error('Camera permission error:', error);
      cameraReadyRef.current = false;
      setCameraStatus('Camera unavailable');
      setSecurityMessage(
        'Camera access is required for the secured assessment. Please allow camera permission and try again.'
      );
      showSecurityWarning('CAMERA_UNAVAILABLE');
      return false;
    }
  };

  const recordCameraViolation = (type) => {
    const now = Date.now();
    const lastTime = lastCameraViolationRef.current[type] || 0;

    // Prevent the same camera event from being counted repeatedly.
    if (now - lastTime < 5000) {
      return;
    }

    lastCameraViolationRef.current[type] = now;
    recordSecurityViolation(type);
  };

  const runCameraDetection = async () => {
    const video = cameraVideoRef.current;
    const model = detectionModelRef.current;

    if (
      !video ||
      !model ||
      video.readyState < 2 ||
      securityTerminated ||
      !assessmentActiveRef.current ||
      detectionBusyRef.current
    ) {
      return;
    }

    detectionBusyRef.current = true;

    try {
      const predictions = await model.detect(video, 20, 0.30);

      // Keep phone detection sensitive enough for small/partially visible phones.
      const phonePredictions = predictions.filter(
        (prediction) => prediction.class === 'cell phone'
      );
      if (phonePredictions.length > 0) {
        console.log(
          'Phone detections:',
          phonePredictions.map((prediction) => ({
            score: Number(prediction.score.toFixed(3)),
            bbox: prediction.bbox
          }))
        );
      }

      const persons = predictions.filter(
        (prediction) =>
          prediction.class === 'person' && prediction.score >= 0.55
      ).length;

      const phones = predictions.filter(
        (prediction) =>
          prediction.class === 'cell phone' && prediction.score >= 0.35
      ).length;

      setPersonCount(persons);
      setPhoneDetected(phones > 0);

      // Require repeated detections to reduce false positives.
      if (persons === 0) {
        noPersonStreakRef.current += 1;
      } else {
        noPersonStreakRef.current = 0;
      }

      if (persons > 1) {
        multiplePersonStreakRef.current += 1;
      } else {
        multiplePersonStreakRef.current = 0;
      }

      if (phones > 0) {
        phoneStreakRef.current += 1;
      } else {
        phoneStreakRef.current = 0;
      }

      if (noPersonStreakRef.current >= 3) {
        recordCameraViolation('NO_PERSON_DETECTED');
        noPersonStreakRef.current = 0;
      }

      if (multiplePersonStreakRef.current >= 2) {
        recordCameraViolation('MULTIPLE_PERSON_DETECTED');
        multiplePersonStreakRef.current = 0;
      }

      if (phoneStreakRef.current >= 2) {
        recordCameraViolation('PHONE_DETECTED');
        phoneStreakRef.current = 0;
      }
    } catch (error) {
      console.warn('Camera detection error:', error);
    } finally {
      detectionBusyRef.current = false;
    }
  };

  // Start the ML camera monitor after the assessment UI has rendered.
  useEffect(() => {
    if (!activeQuiz || securityTerminated || !cameraReadyRef.current) {
      return undefined;
    }

    let cancelled = false;

    const startCameraMonitor = async () => {
      try {
        const video = cameraVideoRef.current;

        if (!video || !cameraStreamRef.current) {
          return;
        }

        video.srcObject = cameraStreamRef.current;
        await video.play();

        setCameraStatus('Initializing AI detection...');

        // Prefer GPU acceleration, but fall back to CPU if WebGL is unavailable.
        let activeBackend = tf.getBackend();

        try {
          await tf.setBackend('webgl');
          await tf.ready();
          activeBackend = tf.getBackend();
        } catch (webglError) {
          console.warn('WebGL backend unavailable. Falling back to CPU.', webglError);

          try {
            await tf.setBackend('cpu');
            await tf.ready();
            activeBackend = tf.getBackend();
          } catch (cpuError) {
            throw new Error('TensorFlow.js could not initialize WebGL or CPU backend.');
          }
        }

        if (cancelled) {
          return;
        }

        setCameraStatus(`Loading AI model (${activeBackend})...`);

        if (!detectionModelRef.current) {
          // Lightweight COCO-SSD model: suitable for browser-based detection.
          const modelLoadPromise = cocoSsd.load({
            base: 'lite_mobilenet_v2'
          });

          // Do not leave the UI stuck forever if the model host/network fails.
          const timeoutPromise = new Promise((_, reject) => {
            window.setTimeout(() => {
              reject(
                new Error(
                  'COCO-SSD model download timed out. Check your internet connection or firewall and try again.'
                )
              );
            }, 45000);
          });

          detectionModelRef.current = await Promise.race([
            modelLoadPromise,
            timeoutPromise
          ]);
        }

        if (cancelled) {
          return;
        }

        setCameraStatus(`AI detection active (${activeBackend})`);

        await runCameraDetection();

        detectionIntervalRef.current = window.setInterval(
          runCameraDetection,
          700
        );
      } catch (error) {
        console.error('Camera monitoring startup error:', error);

        setCameraStatus('AI detection failed');

        setSecurityMessage(
          error?.message ||
            'Camera monitoring could not start. The secured assessment cannot continue without active camera monitoring.'
        );
        showSecurityWarning('AI_DETECTION_FAILED');

        // Do not allow a secured assessment to continue without the detector.
        setSecurityTerminated(true);
      }
    };

    startCameraMonitor();

    return () => {
      cancelled = true;

      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [activeQuiz, securityTerminated]);

  // Stop camera immediately when security terminates the assessment.
  useEffect(() => {
    if (securityTerminated) {
      stopCameraMonitoring();
    }
  }, [securityTerminated]);

  // Stop camera when the page is unmounted.
  useEffect(() => {
    return () => {
      stopCameraMonitoring();
    };
  }, []);

  const enterAssessmentFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      setIsFullscreen(true);
    } catch (error) {
      console.warn('Fullscreen request was blocked:', error);
      setSecurityMessage(
        'Fullscreen permission was not granted. Please enable fullscreen to continue.'
      );
    }
  };

  const exitAssessmentFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen exit error:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (warningPopupTimerRef.current) {
        clearTimeout(warningPopupTimerRef.current);
      }
    };
  }, []);

  // ============================================================
  // BROWSER SECURITY MONITORING
  // ============================================================

  useEffect(() => {
    if (!activeQuiz || securityTerminated) {
      assessmentActiveRef.current = false;
      return;
    }

    assessmentActiveRef.current = true;

    const handleVisibilityChange = () => {
      if (
        assessmentActiveRef.current &&
        document.visibilityState === 'hidden'
      ) {
        recordSecurityViolation('TAB_SWITCH');
      }
    };

    const handleWindowBlur = () => {
      if (assessmentActiveRef.current) {
        recordSecurityViolation('WINDOW_FOCUS_LOST');
      }
    };

    const handleFullscreenChange = () => {
      const fullscreenActive = !!document.fullscreenElement;

      setIsFullscreen(fullscreenActive);

      if (
        assessmentActiveRef.current &&
        !fullscreenActive
      ) {
        recordSecurityViolation('FULLSCREEN_EXIT');
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    window.addEventListener(
      'blur',
      handleWindowBlur
    );

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange
    );

    return () => {
      assessmentActiveRef.current = false;

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      window.removeEventListener(
        'blur',
        handleWindowBlur
      );

      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange
      );
    };
  }, [activeQuiz, securityTerminated]);

  // If no role selected, show required empty state
  if (!selectedRole) {
    return (
      <div className="space-y-6">
        <div className="border-b border-white/[0.08] pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Stage 4: Adaptive Skill Assessment
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic technical assessment tailored to your target role benchmarks and detected skill gaps.
          </p>
        </div>

        <EmptyState
          preset="role"
          title="Target Role Required"
          message="Select a target role to start your analysis."
          description="Assessments are tailored to specific benchmark roles and skill gap topics."
          actionLabel="Select Target Role"
          onAction={() => navigate('/roles')}
        />
      </div>
    );
  }

  // ============================================================
  // START REAL BACKEND ASSESSMENT
  // ============================================================

  const handleStartRealAssessment = async () => {
    setIsLoading(true);
    setOfflineNotice(null);

    // Request camera + fullscreen immediately from the user click flow.
    const cameraPromise = requestCameraAccess();
    const fullscreenPromise = enterAssessmentFullscreen();

    const focusSkills = gapAnalysis
      ? [...gapAnalysis.criticalGaps, ...gapAnalysis.moderateGaps].map(
          (g) => g.name
        )
      : [];

    try {
      const [cameraGranted, res] = await Promise.all([
        cameraPromise,
        assessmentService.generateAssessment(
          selectedRole.id,
          focusSkills
        )
      ]);

      if (!cameraGranted) {
        await exitAssessmentFullscreen();
        setIsLoading(false);
        setOfflineNotice(
          'Camera permission is required for the secured assessment. Allow camera access and try again.'
        );
        stopCameraMonitoring();
        return;
      }

      if (res.success && res.questions && res.questions.length > 0) {
        setSecurityViolations(0);
        setSecurityTerminated(false);
        setSecurityMessage('');

        setActiveQuiz({
          id: res.assessmentId,
          questions: res.questions
        });

        setCurrentQuestionIdx(0);
        setUserAnswers({});
        setIsLoading(false);

        await fullscreenPromise;
      } else {
        await exitAssessmentFullscreen();
        stopCameraMonitoring();
        setIsLoading(false);
        setOfflineNotice(
          res.error ||
            'Assessment backend service is not reachable. You can connect your assessment microservice in VS Code or initialize a diagnostic verification quiz to test the evaluation engine.'
        );
      }
    } catch (error) {
      console.error('Assessment startup error:', error);
      await exitAssessmentFullscreen();
      stopCameraMonitoring();
      setIsLoading(false);
      setOfflineNotice(
        'Unable to start the secured assessment. Please check the backend and camera permissions, then try again.'
      );
    }
  };

  // ============================================================
  // DIAGNOSTIC MODE
  // ============================================================

  const handleLaunchDiagnostic = async () => {
    setIsLoading(true);
    setOfflineNotice(null);

    // Request both security permissions directly from the click flow.
    const cameraPromise = requestCameraAccess();
    const fullscreenPromise = enterAssessmentFullscreen();

    const cameraGranted = await cameraPromise;
    if (!cameraGranted) {
      await exitAssessmentFullscreen();
      setIsLoading(false);
      setOfflineNotice(
        'Camera permission is required for the secured diagnostic assessment. Allow camera access and try again.'
      );
      stopCameraMonitoring();
      return;
    }

    // Generate role-specific questions directly from benchmark skills
    const benchmarkQuestions = (selectedRole.requiredSkills || [])
      .slice(0, 5)
      .map((skill, index) => ({
        id: `q_${index + 1}`,
        skill: skill.name,
        category: skill.category,
        questionText: `Which architectural pattern or practice is most critical when designing for ${skill.name} in a production environment?`,
        options: [
          `Strict adherence to separation of concerns and automated unit/integration test coverage for ${skill.name}`,
          `Deploying all modules as monolithic in-memory state without horizontal redundancy`,
          `Ignoring error handling and relying on OS-level restarts`,
          `Hardcoding configuration tokens directly into source control repositories`
        ],
        correctIndex: 0,
        rationale: `Separation of concerns and test coverage ensure maintainability and production reliability for ${skill.name}.`
      }));

    setSecurityViolations(0);
    setSecurityTerminated(false);
    setSecurityMessage('');

    setActiveQuiz({
      id: `diagnostic_${Date.now()}`,
      questions: benchmarkQuestions
    });

    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setOfflineNotice('');
    setIsLoading(false);

    await fullscreenPromise;
  };

  // ============================================================
  // ANSWER SELECTION
  // ============================================================

  const handleSelectOption = (optIndex) => {
    if (securityTerminated) {
      return;
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optIndex
    }));
  };

  const handleTextAnswer = (value) => {
    if (securityTerminated) return;
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIdx]: value }));
  };

  // ============================================================
  // SUBMIT ASSESSMENT
  // ============================================================

  const handleSubmitQuiz = async () => {
    if (securityTerminated) return;
    setIsSubmitting(true);

    const questions = activeQuiz.questions;
    const answersByQuestionId = {};
    questions.forEach((q, idx) => {
      if (userAnswers[idx] !== undefined) answersByQuestionId[q.id] = userAnswers[idx];
    });

    try {
      const serverResult = await assessmentService.submitAssessment(
        activeQuiz.id, answersByQuestionId, selectedRole.id
      );
      const correctCount = Number(serverResult?.correct_answers ?? serverResult?.correctCount ?? 0);
      const totalQuestions = Number(serverResult?.total_questions ?? serverResult?.totalQuestions ?? questions.length);
      const scorePct = Number(serverResult?.score ?? 0);

      const reportData = {
        completedAt: new Date().toISOString(),
        roleTitle: selectedRole.title,
        overallScore: scorePct,
        correctCount,
        totalQuestions,
        categoryScores: [
          { category: 'Architecture & Fundamentals', score: scorePct },
          { category: 'Production Reliability', score: Math.min(100, scorePct + 5) },
          { category: 'Security & Quality', score: Math.max(0, scorePct - 5) }
        ],
        summary: scorePct >= 70
          ? `Strong verified competency in core ${selectedRole.title} benchmark areas. Candidate is ready for role-specific mock interview.`
          : `Foundational knowledge verified, but critical skill gaps persist. Consult your learning roadmap before mock interview.`
      };

      await exitAssessmentFullscreen();
      stopCameraMonitoring();
      setAssessmentReport(reportData);
      setIsSubmitting(false);
      navigate('/report');
    } catch (error) {
      console.error('Assessment submission error:', error);
      setIsSubmitting(false);
      setOfflineNotice('Unable to submit assessment. Please check the backend and try again.');
    }
  };

  // ============================================================
  // RESET ASSESSMENT
  // ============================================================

  const resetAssessment = async () => {
    stopCameraMonitoring();
    await exitAssessmentFullscreen();

    setActiveQuiz(null);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setSecurityViolations(0);
    setSecurityTerminated(false);
    setSecurityMessage('');
    setIsFullscreen(false);
    setOfflineNotice(null);
  };

  const isCurrentAnswered =
    userAnswers[currentQuestionIdx] !== undefined;

  const isAllAnswered =
    activeQuiz &&
    activeQuiz.questions.every(
      (_, idx) => userAnswers[idx] !== undefined
    );

  return (
    <div className="space-y-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Stage 4: Adaptive Skill Assessment
            </h1>

            <StatusBadge variant="cyan" size="xs">
              Stage 04 / 08
            </StatusBadge>
          </div>

          <p className="text-xs sm:text-sm text-slate-400">
            Evaluating competency against benchmark role:{' '}
            <strong className="text-cyan-400">
              {selectedRole.title}
            </strong>
          </p>
        </div>

        {activeQuiz && !securityTerminated && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Question {currentQuestionIdx + 1} of{' '}
              {activeQuiz.questions.length}
            </span>
          </div>
        )}
      </div>

      {/* ======================================================
          PRE-ASSESSMENT LAUNCHER
      ====================================================== */}

      {!activeQuiz && (
        <div className="max-w-2xl mx-auto space-y-6">

          <Card className="p-8 text-center space-y-6 border-cyan-500/20">

            <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-glow-cyan/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">
                Adaptive Assessment for {selectedRole.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                Evaluates theoretical foundations, system design trade-offs,
                and practical code execution across your identified skill gap
                areas.
              </p>
            </div>

            {/* Assessment Specs */}
            <div className="grid grid-cols-3 gap-3 text-xs text-left max-w-md mx-auto">

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Questions
                </span>
                <span className="text-slate-200 font-semibold">
                  5 Questions
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Format
                </span>
                <span className="text-slate-200 font-semibold">
                  Multiple Choice
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Target Role
                </span>
                <span className="text-slate-200 font-semibold truncate block">
                  {selectedRole.title}
                </span>
              </div>

            </div>

            {/* Security information */}
            <div className="text-left p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-semibold text-slate-200 mb-2">
                Assessment Security
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[11px] text-slate-400">
                <div>✓ Tab switching monitored</div>
                <div>✓ Window focus monitored</div>
                <div>✓ Fullscreen monitored</div>
                <div>✓ Multiple-person detection</div>
                <div>✓ Phone detection</div>
              </div>

              <p className="text-[10px] text-slate-500 mt-3">
                Camera monitoring is required. Person and phone detection runs
                locally in your browser using an object-detection model.
                Security events are counted as assessment violations.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleStartRealAssessment}
                isLoading={isLoading}
                icon={Sparkles}
              >
                Start assessment
              </Button>
            </div>

          </Card>

          {/* Backend Offline Guidance & Diagnostic Mode */}
          {offlineNotice && (
            <Card className="p-6 border-amber-500/30 bg-[#16131c] space-y-4">

              <div className="flex items-start gap-3">
                <Server className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-amber-300">
                    Backend Assessment Endpoint Notice
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {offlineNotice}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">

                <span className="text-[11px] text-slate-500">
                  Ready to test UI flow and score calculation?
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLaunchDiagnostic}
                  icon={ArrowRight}
                >
                  Start Diagnostic Evaluation Mode
                </Button>

              </div>

            </Card>
          )}

        </div>
      )}

      {/* ======================================================
          SECURITY TERMINATION SCREEN
      ====================================================== */}

      {securityTerminated && (
        <div className="max-w-2xl mx-auto">

          <Card className="p-8 text-center border-red-500/30 bg-red-950/10">

            <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-red-300 mt-5">
              Assessment Terminated
            </h2>

            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              {securityMessage}
            </p>

            <div className="mt-5 p-4 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-500">
                Security Violations
              </div>

              <div className="text-2xl font-bold text-red-400 mt-1">
                {securityViolations}
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="secondary"
                onClick={resetAssessment}
                icon={RotateCcw}
              >
                Return to Assessment Start
              </Button>
            </div>

          </Card>

        </div>
      )}

      {/* ======================================================
          ACTIVE ASSESSMENT
      ====================================================== */}

      {activeQuiz && !securityTerminated && (
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Security Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-500">
                Security Status
              </div>

              <div className="mt-1 text-sm font-semibold text-emerald-400">
                Monitoring Active
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-500">
                Violations
              </div>

              <div className="mt-1 text-sm font-semibold text-amber-400">
                {securityViolations} / {MAX_SECURITY_VIOLATIONS}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-500">
                Fullscreen
              </div>

              <div className="mt-1 text-sm font-semibold">
                {isFullscreen ? (
                  <span className="text-emerald-400">
                    Active
                  </span>
                ) : (
                  <span className="text-red-400">
                    Exited
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Camera Proctoring Monitor */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-black aspect-video">
              <video
                ref={cameraVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!cameraReadyRef.current && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500 bg-slate-950">
                  Camera not active
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-500">
                  Camera Proctoring
                </div>
                <div className="mt-1 text-sm font-semibold text-emerald-400">
                  {cameraStatus}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase font-mono text-slate-500">
                    Persons
                  </div>
                  <div
                    className={`mt-1 text-lg font-bold ${
                      personCount > 1
                        ? 'text-red-400'
                        : personCount === 1
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                    }`}
                  >
                    {personCount}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Expected: 1
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase font-mono text-slate-500">
                    Phone
                  </div>
                  <div
                    className={`mt-1 text-sm font-bold ${
                      phoneDetected
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {phoneDetected ? 'Detected' : 'Clear'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Object detection
                  </div>
                </div>
              </div>

              <p className="text-[10px] leading-relaxed text-slate-500">
                Detection is performed locally in the browser. A detection
                warning is not an identity check and may occasionally produce
                false positives.
              </p>
            </div>
          </div>

          {/* Anti-Cheating Popup Warning */}
          {warningPopup && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-amber-400/50 bg-slate-950 shadow-2xl shadow-black/50 overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-amber-300">
                      {warningPopup.title}
                    </div>
                    {warningPopup.count !== null && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        Violation {warningPopup.count}/{MAX_SECURITY_VIOLATIONS}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm leading-6 text-slate-200">
                    {warningPopup.message}
                  </p>

                  {warningPopup.count !== null && warningPopup.count < MAX_SECURITY_VIOLATIONS && (
                    <p className="mt-3 text-xs text-amber-400">
                      Further violations may terminate the assessment.
                    </p>
                  )}

                  {warningPopup.count !== null && warningPopup.count >= MAX_SECURITY_VIOLATIONS && (
                    <p className="mt-3 text-xs text-red-400 font-semibold">
                      Maximum violations reached. Assessment terminated.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setWarningPopup(null)}
                    className="mt-5 w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Warning */}
          {securityMessage && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />

              <div>
                <div className="text-sm font-semibold text-amber-300">
                  Security Warning
                </div>

                <div className="text-xs text-slate-400 mt-1">
                  {securityMessage}
                </div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-cyan-400 h-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestionIdx + 1) /
                    activeQuiz.questions.length) *
                  100
                }%`
              }}
            />
          </div>

          {/* Question Card */}
          <Card className="p-6 sm:p-8 space-y-6">

            <div className="flex items-center justify-between">

              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                Topic:{' '}
                {activeQuiz.questions[currentQuestionIdx].skill ||
                  selectedRole.title}
              </span>

              <span className="text-xs text-slate-500 font-mono">
                {Object.keys(userAnswers).length} of{' '}
                {activeQuiz.questions.length} answered
              </span>

            </div>

            <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
              {activeQuiz.questions[currentQuestionIdx].questionText}
            </h3>

            {/* Answer Area */}
            {activeQuiz.questions[currentQuestionIdx].type === 'mcq' ? (
              <div className="space-y-3">
                {(activeQuiz.questions[currentQuestionIdx].options || []).map((option, optIdx) => {
                  const isSelected = userAnswers[currentQuestionIdx] === optIdx;
                  return (
                    <button key={optIdx} onClick={() => handleSelectOption(optIdx)} className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 ${isSelected ? 'border-cyan-400 bg-cyan-950/30 text-cyan-100' : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'}`}>
                      <span className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs">{String.fromCharCode(65 + optIdx)}</span>
                      <span className="leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {activeQuiz.questions[currentQuestionIdx].code && (
                  <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto text-xs text-cyan-200 whitespace-pre-wrap">{activeQuiz.questions[currentQuestionIdx].code}</pre>
                )}
                <textarea
                  value={userAnswers[currentQuestionIdx] ?? ''}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                  placeholder={activeQuiz.questions[currentQuestionIdx].type === 'code_output' ? 'Enter the expected output...' : 'Enter your answer / code...'}
                  className="w-full min-h-32 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100 outline-none focus:border-cyan-400"
                />
                <p className="text-xs text-slate-500">Programming question — your answer is evaluated by the backend.</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">

              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setCurrentQuestionIdx((prev) =>
                    Math.max(0, prev - 1)
                  )
                }
                disabled={currentQuestionIdx === 0}
                icon={ArrowLeft}
              >
                Previous
              </Button>

              {currentQuestionIdx <
              activeQuiz.questions.length - 1 ? (

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setCurrentQuestionIdx((prev) =>
                      prev + 1
                    )
                  }
                  disabled={!isCurrentAnswered}
                  icon={ArrowRight}
                >
                  Next Question
                </Button>

              ) : (

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitQuiz}
                  disabled={!isAllAnswered}
                  isLoading={isSubmitting}
                  icon={CheckCircle2}
                >
                  Submit Assessment
                </Button>

              )}

            </div>

          </Card>

        </div>
      )}

    </div>
  );
};
