import React, { createContext, useContext, useState, useEffect } from 'react';
import { gapService } from '../services/api/gapService';

const AppContext = createContext(null);

const STORAGE_KEY = 'CRSD_SYSTEM_STATE_V1';

export const AppProvider = ({ children }) => {
  // Candidate / User state (Strictly null initially - No fake user)
  const [candidate, setCandidate] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_CANDIDATE`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Resume Document State
  const [uploadedResume, setUploadedResume] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_RESUME`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Extracted Skills (Categorized - starts strictly empty)
  const [skills, setSkills] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_SKILLS`);
      return saved
        ? JSON.parse(saved)
        : { technical: [], frameworks: [], tools: [], soft: [] };
    } catch {
      return { technical: [], frameworks: [], tools: [], soft: [] };
    }
  });

  // Selected Target Role Benchmark (null until chosen)
  const [selectedRole, setSelectedRole] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ROLE`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Skill Gap Analysis Results (null until calculated)
  const [gapAnalysis, setGapAnalysis] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_GAP`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Assessment Report & Scorecard (null until assessment is completed)
  const [assessmentReport, setAssessmentReport] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_REPORT`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Personalized Roadmap (null until generated)
  const [roadmap, setRoadmap] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ROADMAP`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Mock Interview Results (null until session completed)
  const [interviewResult, setInterviewResult] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_INTERVIEW`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Synchronize state changes to localStorage
  useEffect(() => {
    try {
      if (candidate) localStorage.setItem(`${STORAGE_KEY}_CANDIDATE`, JSON.stringify(candidate));
      else localStorage.removeItem(`${STORAGE_KEY}_CANDIDATE`);

      if (uploadedResume) localStorage.setItem(`${STORAGE_KEY}_RESUME`, JSON.stringify(uploadedResume));
      else localStorage.removeItem(`${STORAGE_KEY}_RESUME`);

      localStorage.setItem(`${STORAGE_KEY}_SKILLS`, JSON.stringify(skills));

      if (selectedRole) localStorage.setItem(`${STORAGE_KEY}_ROLE`, JSON.stringify(selectedRole));
      else localStorage.removeItem(`${STORAGE_KEY}_ROLE`);

      if (gapAnalysis) localStorage.setItem(`${STORAGE_KEY}_GAP`, JSON.stringify(gapAnalysis));
      else localStorage.removeItem(`${STORAGE_KEY}_GAP`);

      if (assessmentReport) localStorage.setItem(`${STORAGE_KEY}_REPORT`, JSON.stringify(assessmentReport));
      else localStorage.removeItem(`${STORAGE_KEY}_REPORT`);

      if (roadmap) localStorage.setItem(`${STORAGE_KEY}_ROADMAP`, JSON.stringify(roadmap));
      else localStorage.removeItem(`${STORAGE_KEY}_ROADMAP`);

      if (interviewResult) localStorage.setItem(`${STORAGE_KEY}_INTERVIEW`, JSON.stringify(interviewResult));
      else localStorage.removeItem(`${STORAGE_KEY}_INTERVIEW`);
    } catch (e) {
      console.warn('Could not persist app state', e);
    }
  }, [candidate, uploadedResume, skills, selectedRole, gapAnalysis, assessmentReport, roadmap, interviewResult]);

  // Flattened all skills array
  const allUserSkills = [
    ...(skills.technical || []),
    ...(skills.frameworks || []),
    ...(skills.tools || []),
    ...(skills.soft || [])
  ];

  // Helper to add manual skill (enables user/evaluator to test workflow immediately without fake data)
  const addSkill = (category, skillName) => {
    if (!skillName || !skillName.trim()) return;
    const trimmed = skillName.trim();
    setSkills((prev) => {
      const catList = prev[category] || [];
      if (catList.includes(trimmed)) return prev;
      return {
        ...prev,
        [category]: [...catList, trimmed]
      };
    });
  };

  // Helper to remove skill
  const removeSkill = (category, skillName) => {
    setSkills((prev) => ({
      ...prev,
      [category]: (prev[category] || []).filter((s) => s !== skillName)
    }));
  };

  // Set batch skills (e.g. from backend NLP parser)
  const setExtractedSkills = (newSkills) => {
    setSkills({
      technical: Array.isArray(newSkills.technical) ? newSkills.technical : [],
      frameworks: Array.isArray(newSkills.frameworks) ? newSkills.frameworks : [],
      tools: Array.isArray(newSkills.tools) ? newSkills.tools : [],
      soft: Array.isArray(newSkills.soft) ? newSkills.soft : [],
    });
  };

  // Compute skill gap analysis against active role and user skills
  const triggerGapAnalysis = async (targetRole = selectedRole) => {
    if (!targetRole) return null;
    const result = await gapService.calculateGaps(allUserSkills, targetRole);
    setGapAnalysis(result);
    return result;
  };

  // Generate milestone roadmap based on actual gap analysis
  const generateRoadmapFromGaps = (gapsData = gapAnalysis) => {
    if (!gapsData || (gapsData.criticalGaps.length === 0 && gapsData.moderateGaps.length === 0)) {
      setRoadmap(null);
      return null;
    }

    const phases = [
      {
        id: 'phase-1',
        title: 'Phase 1: Critical High-Priority Competencies',
        description: 'Close high-impact skill gaps required for role baseline proficiency.',
        skills: gapsData.criticalGaps.map((g) => ({
          name: g.name,
          category: g.category,
          priority: 'Critical',
          completed: false,
          recommendedWeeks: '2 - 3 Weeks'
        }))
      },
      {
        id: 'phase-2',
        title: 'Phase 2: Core Engineering & Framework Deepening',
        description: 'Strengthen secondary and tool-chain requirements.',
        skills: gapsData.moderateGaps.map((g) => ({
          name: g.name,
          category: g.category,
          priority: 'Moderate',
          completed: false,
          recommendedWeeks: '1 - 2 Weeks'
        }))
      },
      {
        id: 'phase-3',
        title: 'Phase 3: System Capstone & Role Readiness Verification',
        description: 'Synthesize skills in realistic domain scenarios before interview.',
        skills: [
          {
            name: `${selectedRole?.title || 'Target Role'} End-to-End Capstone Project`,
            category: 'Project Synthesis',
            priority: 'Recommended',
            completed: false,
            recommendedWeeks: '2 Weeks'
          }
        ]
      }
    ];

    const generated = {
      generatedAt: new Date().toISOString(),
      roleTitle: selectedRole?.title || 'Target Role',
      phases: phases.filter((p) => p.skills.length > 0)
    };

    setRoadmap(generated);
    return generated;
  };

  // Toggle milestone completion
  const toggleRoadmapSkill = (phaseId, skillName) => {
    if (!roadmap) return;
    setRoadmap((prev) => ({
      ...prev,
      phases: prev.phases.map((phase) => {
        if (phase.id !== phaseId) return phase;
        return {
          ...phase,
          skills: phase.skills.map((s) => (s.name === skillName ? { ...s, completed: !s.completed } : s))
        };
      })
    }));
  };

  // Reset all session data
  const resetWorkflow = () => {
    setCandidate(null);
    setUploadedResume(null);
    setSkills({ technical: [], frameworks: [], tools: [], soft: [] });
    setSelectedRole(null);
    setGapAnalysis(null);
    setAssessmentReport(null);
    setRoadmap(null);
    setInterviewResult(null);
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_KEY))
      .forEach((k) => localStorage.removeItem(k));
  };

  return (
    <AppContext.Provider
      value={{
        candidate,
        setCandidate,
        uploadedResume,
        setUploadedResume,
        skills,
        allUserSkills,
        addSkill,
        removeSkill,
        setExtractedSkills,
        selectedRole,
        setSelectedRole,
        gapAnalysis,
        triggerGapAnalysis,
        assessmentReport,
        setAssessmentReport,
        roadmap,
        generateRoadmapFromGaps,
        toggleRoadmapSkill,
        interviewResult,
        setInterviewResult,
        resetWorkflow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
