import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Search, 
  Layers, 
  Check, 
  ArrowRight, 
  Briefcase, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { roleService } from '../services/api/roleService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { selectedRole, setSelectedRole, allUserSkills, triggerGapAnalysis } = useApp();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      const res = await roleService.getRoles();
      setRoles(res.data || []);
      setLoading(false);
    };
    fetchRoles();
  }, []);

  const handleSelectRole = async (role) => {
    setSelectedRole(role);
    await triggerGapAnalysis(role);
  };

  const categories = ['All', ...new Set(roles.map((r) => r.category))];

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || role.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Stage 2: Target Role Selection & Benchmark Matching
            </h1>
            <StatusBadge variant="cyan" size="xs">Stage 02 / 08</StatusBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Select the desired professional role to evaluate your candidate profile against industry benchmark competencies.
          </p>
        </div>

        {selectedRole && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/gap-analysis')}
            icon={ArrowRight}
          >
            View Skill Gap Matrix
          </Button>
        )}
      </div>

      {/* Notice if no skills uploaded yet */}
      {allUserSkills.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Note:</strong> You have not uploaded a resume or added skills yet. You can select a target role to view its requirements, or upload your resume first for matching.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/resume')}
            className="shrink-0"
          >
            Upload Resume First
          </Button>
        </div>
      )}

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles or technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-medium'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" text="Loading benchmark role taxonomy..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => {
            const isSelected = selectedRole?.id === role.id;
            return (
              <Card
                key={role.id}
                interactive
                onClick={() => handleSelectRole(role)}
                className={`p-6 flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-500/40 shadow-glow-cyan/20'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      {role.category}
                    </span>
                    <span className="text-xs text-slate-400">{role.level}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center justify-between">
                    <span>{role.title}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {role.description}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Benchmark Skills ({role.requiredSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.requiredSkills.slice(0, 6).map((s) => (
                        <span
                          key={s.name}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          {s.name}
                        </span>
                      ))}
                      {role.requiredSkills.length > 6 && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">
                          +{role.requiredSkills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">
                    {isSelected ? 'Active Benchmark' : 'Click to select'}
                  </span>
                  <span className={`font-semibold ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {isSelected ? 'Selected' : 'Select Role →'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
