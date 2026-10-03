# Career Readiness & Skill Development System
### AI-Powered Career-Tech Platform for Hackathons & Students

A complete, production-grade web application architecture designed to answer:
> **“What skills do I have, what skills am I missing, how strong are my skills, what should I learn next, and am I ready for my target role?”**

---

## ⚡ Key Highlights & Architecture

- **Zero-Mock Data Rule**: Strictly zero fabricated users, zero fake analytics, zero fake scores, and zero invented interview transcripts. Modules display professional, contextual empty states until real backend services respond or candidate actions are verified.
- **Full 8-Stage Workflow**:
  1. `Resume Upload` (.pdf, .docx, .txt drag & drop + file validation)
  2. `Skill Extraction` (NLP Categorization: Languages, Frameworks, Tools, Soft Skills + Manual Entry support)
  3. `Role Selection` (Benchmark taxonomies for Software Engineering, ML, DevOps, Cloud, etc.)
  4. `Skill Gap Matrix` (Matched, Moderate Gaps, and Critical Prerequisites)
  5. `Adaptive Assessment` (Dynamic questions with countdown timer & question navigator)
  6. `Performance Report` (Empirical scoring, category radar breakdown, strengths/improvements)
  7. `Personalized Learning Roadmap` (Interactive milestone checklists across 3 progressive phases)
  8. `Role-Specific AI Mock Interview` (Interviewer persona, audio waveform indicator, response capture, scorecard)
- **Developer API Inspector**:
  - Live backend connection health probe
  - In-app runtime endpoint overrides
  - Configurable via `.env` without recompilation

---

## 🚀 Quick Start (Running in VS Code)

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
The app will start at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

---

## 🔌 Connecting Real Backend & AI Services

The frontend is fully decoupled and ready to consume your backend. All requests are managed through `src/services/api/client.js` and configured via `.env`.

### Environment Variables (`.env`)
```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_NLP_PARSER_ENDPOINT=http://localhost:8000/api/resume/parse
VITE_ASSESSMENT_ENDPOINT=http://localhost:8000/api/assessment
VITE_INTERVIEW_ENDPOINT=http://localhost:8000/api/interview
VITE_API_TIMEOUT_MS=15000
```

### Expected Backend API Contracts

#### 1. Health Probe
- `GET /api/health`
- **Response**: `{ "status": "healthy", "service": "CRSD-Backend" }`

#### 2. Resume NLP Parsing
- `POST /api/resume/parse` (multipart form `resume: File`)
- **Response**:
  ```json
  {
    "candidateName": "Alex Chen",
    "skills": {
      "technical": ["Python", "TypeScript", "PostgreSQL"],
      "frameworks": ["React", "FastAPI", "TailwindCSS"],
      "tools": ["Docker", "Git", "Kubernetes"],
      "soft": ["Problem Solving", "System Architecture"]
    }
  }
  ```

#### 3. Skill Gap Analysis
- `POST /api/skills/gap-analysis`
- **Body**: `{ "userSkills": string[], "roleId": string }`
- **Response**:
  ```json
  {
    "matchPercentage": 75,
    "matched": [...],
    "moderateGaps": [...],
    "criticalGaps": [...],
    "totalRequired": 10
  }
  ```

#### 4. Assessment Question Engine
- `POST /api/assessment/generate`
- **Body**: `{ "roleId": string, "focusSkills": string[], "difficulty": string }`
- **Response**:
  ```json
  {
    "assessmentId": "assess_123",
    "questions": [
      {
        "id": "q1",
        "skill": "Docker",
        "questionText": "What is the primary benefit of multi-stage Docker builds?",
        "options": ["Reduces final image size", "Speeds up CPU", "Encrypts volumes", "Disables networking"],
        "correctIndex": 0
      }
    ]
  }
  ```

#### 5. AI Mock Interview LLM
- `POST /api/interview/start`
- **Body**: `{ "roleId": string, "interviewType": string }`
- `POST /api/interview/turn`
- **Body**: `{ "sessionId": string, "question": string, "answer": string, "questionIndex": number }`

---

## 🎨 Theme & Styling

- **Background**: Deep charcoal / void black (`#080c14`)
- **Surfaces**: Dark navy/graphite (`#0f172a`, `#111c30`)
- **Accent**: Electric Cyan (`#00d2ff` / `#38bdf8`) & Tech Blue (`#2563eb`)
- **Icons**: Lucide React
- **CSS**: Tailwind CSS with custom responsive utilities
