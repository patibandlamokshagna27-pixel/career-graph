import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ApiStatusProvider } from './context/ApiStatusContext';
import { AppLayout } from './components/layout/AppLayout';

// Feature Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { GapAnalysisPage } from './pages/GapAnalysisPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { PerformanceReportPage } from './pages/PerformanceReportPage';
import { LearningRoadmapPage } from './pages/LearningRoadmapPage';
import { ReadinessCheckPage } from './pages/ReadinessCheckPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <ApiStatusProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Workflow Application Shell */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/resume" element={<ResumeUploadPage />} />
              <Route path="/roles" element={<RoleSelectionPage />} />
              <Route path="/gap-analysis" element={<GapAnalysisPage />} />
              <Route path="/assessment" element={<AssessmentPage />} />
              <Route path="/report" element={<PerformanceReportPage />} />
              <Route path="/roadmap" element={<LearningRoadmapPage />} />
              <Route path="/readiness" element={<ReadinessCheckPage />} />
              <Route path="/interview" element={<MockInterviewPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all redirect to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ApiStatusProvider>
  );
}

export default App;
