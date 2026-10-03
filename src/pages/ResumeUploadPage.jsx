import React, { useState, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { 

  FileUp, 

  FileText, 

  CheckCircle2, 

  AlertCircle, 

  Cpu, 

  Plus, 

  X, 

  ArrowRight, 

  Sparkles,

  Info,

  Server

} from 'lucide-react';

import { useApp } from '../context/AppContext';

import { resumeService } from '../services/api/resumeService';

import { Card } from '../components/common/Card';

import { Button } from '../components/common/Button';

import { StatusBadge } from '../components/common/StatusBadge';

import { LoadingSpinner } from '../components/common/LoadingSpinner';

import { Modal } from '../components/common/Modal';



export const ResumeUploadPage = () => {

  const navigate = useNavigate();

  const fileInputRef = useRef(null);



  const {

    uploadedResume,

    setUploadedResume,

    skills,

    extractedSkills,

    allUserSkills,

    addSkill,

    removeSkill,

    setExtractedSkills,

  } = useApp();



  const [isDragging, setIsDragging] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const [errorMessage, setErrorMessage] = useState(null);

  const [offlineNotice, setOfflineNotice] = useState(null);



  // Manual skill add modal state

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [skillCategory, setSkillCategory] = useState('technical');

  const [newSkillName, setNewSkillName] = useState('');



  const allowedTypes = [

    'application/pdf',

    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    'text/plain',

  ];



  // Categorize skills returned by the backend so they enter the same
  // state used by Candidate Skill Profile and allUserSkills.
  const getSkillCategory = (skill) => {
    const name = String(skill || '').trim().toLowerCase();

    const frameworks = [
      'react', 'fastapi', 'tailwindcss', 'tailwind css',
      'pandas', 'numpy', 'scikit-learn', 'tensorflow',
      'pytorch', 'node.js', 'nodejs'
    ];

    const tools = [
      'git', 'docker', 'kubernetes', 'github', 'gitlab',
      'aws', 'azure', 'gcp'
    ];

    const soft = [
      'problem solving', 'communication', 'leadership',
      'teamwork', 'system architecture', 'time management'
    ];

    if (frameworks.some((item) => name === item || name.includes(item))) {
      return 'frameworks';
    }

    if (tools.some((item) => name === item || name.includes(item))) {
      return 'tools';
    }

    if (soft.some((item) => name === item || name.includes(item))) {
      return 'soft';
    }

    return 'technical';
  };

  const handleFileProcess = async (file) => {

    if (!file) return;



    // Validate size (max 10MB)

    if (file.size > 10 * 1024 * 1024) {

      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller resume document.');

      return;

    }



    setErrorMessage(null);

    setOfflineNotice(null);

    setIsProcessing(true);



    // Save basic document metadata

    const docMeta = {

      name: file.name,

      size: (file.size / 1024).toFixed(1) + ' KB',

      type: file.type || 'text/plain',

      uploadedAt: new Date().toLocaleDateString(),

    };



    try {
      // Send the real resume file to the FastAPI backend.
      const result = await resumeService.uploadAndParseResume(file);
      console.log("RESUME RESULT:", result);

      if (result?.success && Array.isArray(result?.data?.skills)) {
        const extracted = [...new Set(
          result.data.skills
            .map((skill) => String(skill || '').trim())
            .filter(Boolean)
        )];

        setUploadedResume(docMeta);
        setExtractedSkills(extracted);

        // The backend returns a flat skills array.
        // Add each skill to the same categorized state used by the UI.
        extracted.forEach((skill) => {
          addSkill(getSkillCategory(skill), skill);
        });

        setOfflineNotice(
          extracted.length > 0
            ? null
            : 'Resume text was extracted, but no known skills were found in the current skill dictionary.'
        );
      } else {
        setUploadedResume(docMeta);
        setOfflineNotice(
          result?.error ||
            'Resume uploaded, but the backend did not return extracted skills.'
        );
      }
    } catch (error) {
      console.error('RESUME UPLOAD ERROR:', error);
      setUploadedResume(docMeta);
      setOfflineNotice(
        error?.message ||
          'Could not connect to the backend NLP parser. Please make sure the FastAPI server is running.'
      );
    } finally {
      setIsProcessing(false);
    }

  };



  const handleDrop = (e) => {

    e.preventDefault();

    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {

      handleFileProcess(e.dataTransfer.files[0]);

    }

  };



  const handleFileChange = (e) => {

    if (e.target.files && e.target.files[0]) {

      handleFileProcess(e.target.files[0]);

    }

  };



  const handleAddManualSkill = (e) => {

    e.preventDefault();

    if (!newSkillName.trim()) return;

    addSkill(skillCategory, newSkillName.trim());

    setNewSkillName('');

    setIsAddModalOpen(false);

  };



  const skillCategories = [

    { key: 'technical', label: 'Programming & Core Tech', list: skills.technical || [] },

    { key: 'frameworks', label: 'Frameworks & Libraries', list: skills.frameworks || [] },

    { key: 'tools', label: 'Developer Tools & Cloud', list: skills.tools || [] },

    { key: 'soft', label: 'Domain & Soft Competencies', list: skills.soft || [] },

  ];



  return (

    <div className="space-y-8">

      {/* Page Header */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">

        <div>

          <div className="flex items-center gap-2 mb-1">

            <h1 className="text-2xl font-bold tracking-tight text-slate-100">

              Stage 1: Resume Upload & Skill Extraction

            </h1>

            <StatusBadge variant="cyan" size="xs">Stage 01 / 08</StatusBadge>

          </div>

          <p className="text-xs sm:text-sm text-slate-400">

            Submit your resume to trigger NLP parsing, or manually verify your candidate skill profile.

          </p>

        </div>



        {allUserSkills.length > 0 && (

          <Button

            variant="primary"

            size="sm"

            onClick={() => navigate('/roles')}

            icon={ArrowRight}

          >

            Continue to Target Role Matching

          </Button>

        )}

      </div>



      {/* Upload Zone */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-7 space-y-4">

          <div

            onDragOver={(e) => {

              e.preventDefault();

              setIsDragging(true);

            }}

            onDragLeave={() => setIsDragging(false)}

            onDrop={handleDrop}

            onClick={() => fileInputRef.current?.click()}

            className={`rounded-xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${

              isDragging

                ? 'border-cyan-400 bg-cyan-950/20'

                : 'border-slate-800 hover:border-slate-700 bg-[#0a0f1d]/80'

            }`}

          >

            <input

              ref={fileInputRef}

              type="file"

              accept=".pdf,.docx,.txt"

              className="hidden"

              onChange={handleFileChange}

            />



            {isProcessing ? (

              <LoadingSpinner

                size="lg"

                text="Parsing document with NLP model..."

                className="py-6"

              />

            ) : (

              <div className="space-y-4">

                <div className="w-14 h-14 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-sm">

                  <FileUp className="w-7 h-7" />

                </div>

                <div>

                  <h3 className="text-base font-semibold text-slate-100 mb-1">

                    Drag and drop your resume here, or <span className="text-cyan-400">browse files</span>

                  </h3>

                  <p className="text-xs text-slate-400">

                    Supports standard PDF, DOCX, or plain TXT files (Maximum 10MB)

                  </p>

                </div>

              </div>

            )}

          </div>



          {/* Error Message */}

          {errorMessage && (

            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">

              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />

              <span>{errorMessage}</span>

            </div>

          )}



          {/* Backend Status Notice */}

          {offlineNotice && (

            <div className="p-4 rounded-lg bg-slate-900 border border-amber-500/30 text-xs text-slate-300 space-y-1.5">

              <div className="flex items-center gap-2 text-amber-400 font-semibold">

                <Server className="w-4 h-4" />

                <span>Backend NLP Engine Offline</span>

              </div>

              <p className="text-slate-400 leading-relaxed">

                {offlineNotice}

              </p>

              <div className="pt-1 text-[11px] text-cyan-300 font-mono">

                Tip: You can add your skills using the “Add Skill” button to continue testing the full workflow immediately!

              </div>

            </div>

          )}



          {/* Uploaded File Info Card */}

          {uploadedResume && (

            <Card className="p-4 bg-slate-900/60 border-slate-800">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">

                    <FileText className="w-5 h-5" />

                  </div>

                  <div>

                    <h4 className="text-sm font-semibold text-slate-100">{uploadedResume.name}</h4>

                    <p className="text-[11px] text-slate-400">

                      {uploadedResume.size} • Uploaded {uploadedResume.uploadedAt}

                    </p>

                  </div>

                </div>

                <StatusBadge variant="success" size="xs">Document Loaded</StatusBadge>

              </div>

            </Card>

          )}

        </div>



        {/* Right Column: Extracted Skills & Management */}

        <div className="lg:col-span-5 space-y-4">

          <Card className="p-6">

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">

              <div className="flex items-center gap-2">

                <Cpu className="w-4 h-4 text-cyan-400" />

                <h3 className="font-semibold text-slate-100 text-sm">

                  Candidate Skill Profile

                </h3>

              </div>

              <Button

                variant="outline"

                size="sm"

                onClick={() => setIsAddModalOpen(true)}

                icon={Plus}

              >

                Add Skill

              </Button>

            </div>



            {allUserSkills.length === 0 ? (

              <div className="py-8 text-center text-slate-500 space-y-2">

                <Info className="w-8 h-8 mx-auto text-slate-600" />

                <p className="text-xs font-medium text-slate-400">

                  No skills extracted or entered yet.

                </p>

                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">

                  Upload your resume or click “Add Skill” to define your technical competencies.

                </p>

              </div>

            ) : (

              <div className="space-y-4">

                <div className="text-xs text-slate-400">

                  Total Verified Skills:{' '}

                  <strong className="text-cyan-400">{allUserSkills.length}</strong>

                </div>



                {skillCategories.map((category) => (

                  <div key={category.key} className="space-y-1.5">

                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">

                      {category.label} ({category.list.length})

                    </div>

                    {category.list.length === 0 ? (

                      <p className="text-[11px] text-slate-600 italic">None listed</p>

                    ) : (

                      <div className="flex flex-wrap gap-1.5">

                        {category.list.map((skill) => (

                          <span

                            key={skill}

                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-slate-200 group"

                          >

                            <span>{skill}</span>

                            <button

                              onClick={() => removeSkill(category.key, skill)}

                              className="text-slate-500 hover:text-rose-400 transition-colors"

                              title={`Remove ${skill}`}

                            >

                              <X className="w-3 h-3" />

                            </button>

                          </span>

                        ))}

                      </div>

                    )}

                  </div>

                ))}

              </div>

            )}

          </Card>

        </div>

      </div>



      {/* Manual Skill Addition Modal */}

      <Modal

        isOpen={isAddModalOpen}

        onClose={() => setIsAddModalOpen(false)}

        title="Add Verified Skill to Candidate Profile"

      >

        <form onSubmit={handleAddManualSkill} className="space-y-4">

          <div>

            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">

              Skill Category

            </label>

            <select

              value={skillCategory}

              onChange={(e) => setSkillCategory(e.target.value)}

              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"

            >

              <option value="technical">Programming & Core Tech</option>

              <option value="frameworks">Frameworks & Libraries</option>

              <option value="tools">Developer Tools & Cloud</option>

              <option value="soft">Domain & Soft Competencies</option>

            </select>

          </div>



          <div>

            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">

              Skill or Technology Name

            </label>

            <input

              type="text"

              placeholder="e.g. Python, React, Docker, PostgreSQL"

              value={newSkillName}

              onChange={(e) => setNewSkillName(e.target.value)}

              autoFocus

              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"

            />

          </div>



          <div className="flex justify-end gap-2 pt-2">

            <Button

              type="button"

              variant="secondary"

              size="sm"

              onClick={() => setIsAddModalOpen(false)}

            >

              Cancel

            </Button>

            <Button type="submit" variant="primary" size="sm">

              Save Skill

            </Button>

          </div>

        </form>

      </Modal>

    </div>

  );

};
