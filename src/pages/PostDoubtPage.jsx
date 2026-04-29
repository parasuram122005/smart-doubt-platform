import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Check, Search, AlertCircle, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AIAnswerCard from '../components/AIAnswerCard';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PostDoubtPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [fetchingSubjects, setFetchingSubjects] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // After posting, show the AI help flow instead of navigating away
  const [postedDoubt, setPostedDoubt] = useState(null);

  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    urgency: 'medium',
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);

  // Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setFetchingSubjects(true);
        const { data } = await API.get('/subjects');
        setSubjects(data.data);
      } catch (err) {
        setError('Failed to load subjects');
      } finally {
        setFetchingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size exceeds 5MB limit.');
        return;
      }
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const clearImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectId) {
      setError('Please select a subject.');
      return;
    }
    
    // Fallback allowing empty title/desc if image is provided (based on TC05-TC09)
    if (!formData.title && !formData.description && !formData.image) {
      setError('Validation error: Empty submission not allowed.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const payload = new FormData();
      payload.append('subjectId', formData.subjectId);
      payload.append('urgency', formData.urgency);
      if (formData.title) payload.append('title', formData.title);
      if (formData.description) payload.append('description', formData.description);
      if (formData.image) payload.append('image', formData.image);

      const { data } = await API.post('/doubts', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Don't navigate — show the AI help flow
      const selectedSub = subjects.find(s => s._id === formData.subjectId);
      setPostedDoubt({
        ...data.data,
        subjectName: selectedSub?.subjectName || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post doubt');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(sub => 
    sub.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSubject = subjects.find(s => s._id === formData.subjectId);

  // ═══════ POST-SUBMISSION VIEW WITH AI HELP ═══════
  if (postedDoubt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Success message */}
          <div className="bg-white rounded-2xl shadow-soft border border-emerald-200 overflow-hidden">
            <div className="px-8 py-6 bg-emerald-50 border-b border-emerald-100 flex items-center">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mr-4">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-emerald-800">Doubt Posted Successfully!</h3>
                <p className="text-sm text-emerald-600 mt-0.5">Faculty will be notified. Meanwhile, try our AI assistant below.</p>
              </div>
            </div>
            <div className="px-8 py-5">
              <h4 className="font-bold text-theme-text mb-1">{postedDoubt.title}</h4>
              <p className="text-sm text-theme-text-muted line-clamp-2">{postedDoubt.description}</p>
            </div>
          </div>

          {/* AI Answer Card */}
          <AIAnswerCard
            doubtId={postedDoubt._id}
            question={`${postedDoubt.title}. ${postedDoubt.description}`}
            subjectName={postedDoubt.subjectName}
            preloadedAnswer={postedDoubt.aiAnswer}
            preloadedConfidence={postedDoubt.aiConfidence}
          />

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => navigate('/student')}
              className="inline-flex items-center px-5 py-2.5 border border-theme-border rounded-xl text-sm font-bold text-theme-text bg-theme-bg/50 hover:bg-theme-bg transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Go to Dashboard
            </button>
            <button
              onClick={() => {
                setPostedDoubt(null);
                setFormData({ subjectId: '', title: '', description: '', urgency: 'medium', image: null });
                setImagePreview(null);
              }}
              className="inline-flex items-center px-5 py-2.5 text-sm font-bold text-white bg-theme-accent hover:bg-theme-accent-hover rounded-xl shadow-sm transition-colors"
            >
              Ask Another Question
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════ FORM VIEW ═══════
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-soft border border-theme-border/50 overflow-hidden"
      >
        <div className="px-8 py-8 md:py-10 border-b border-theme-border/50 bg-theme-bg/30 flex items-center">
          <div className="w-12 h-12 bg-theme-accent/10 rounded-2xl flex items-center justify-center mr-5">
             <HelpCircle className="w-6 h-6 text-theme-accent" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-theme-text tracking-tight">Post a New Doubt</h3>
            <p className="mt-1 text-base text-theme-text-muted">
              Get detailed help from faculty securely and quickly.
            </p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 flex items-center text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* Custom Subject Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-bold text-theme-text mb-2">Subject</label>
              
              {fetchingSubjects ? (
                 <div className="w-full h-12 bg-theme-border/30 rounded-xl animate-pulse flex items-center px-4">
                    <div className="w-1/3 h-4 bg-theme-border/50 rounded"></div>
                 </div>
              ) : (
                <div className="relative">
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between w-full py-3 px-4 border border-theme-border/70 bg-theme-bg/50 rounded-xl shadow-sm cursor-pointer hover:border-theme-accent/50 transition-all"
                  >
                    <span className={`truncate ${!selectedSubject ? 'text-theme-text-muted/60' : 'text-theme-text'}`}>
                      {selectedSubject ? selectedSubject.subjectName : 'Select a subject (e.g., Data Structures)'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-theme-text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-10 w-full mt-2 bg-white border border-theme-border rounded-xl shadow-hover overflow-hidden"
                      >
                        <div className="p-2 border-b border-theme-border/40 flex items-center px-3 bg-theme-bg/30">
                          <Search className="w-4 h-4 text-theme-text-muted mr-2 shrink-0" />
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-none outline-none text-sm py-1 placeholder-theme-text-muted/50 text-theme-text"
                            placeholder="Type to filter subjects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                        <ul className="max-h-60 overflow-y-auto p-1 py-2 custom-scrollbar">
                          {filteredSubjects.length > 0 ? (
                            filteredSubjects.map(sub => (
                              <li 
                                key={sub._id}
                                onClick={() => {
                                  setFormData({ ...formData, subjectId: sub._id });
                                  setIsDropdownOpen(false);
                                  setSearchQuery('');
                                }}
                                className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg text-sm transition-colors ${formData.subjectId === sub._id ? 'bg-theme-accent/10 text-theme-accent font-medium' : 'text-theme-text hover:bg-theme-bg'}`}
                              >
                                {sub.subjectName}
                                {formData.subjectId === sub._id && <Check className="w-4 h-4 text-theme-accent" />}
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-3 text-sm text-theme-text-muted text-center italic">
                              {subjects.length === 0 ? 'No subjects available' : 'No matching subjects found'}
                            </li>
                          )}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-bold text-theme-text mb-2">Question Title</label>
                <input
                  type="text"
                  id="title"
                  className="block w-full py-3 px-4 border border-theme-border/70 rounded-xl bg-theme-bg/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all text-theme-text placeholder-theme-text-muted/50"
                  placeholder="e.g., How to solve quadratic equations?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-bold text-theme-text mb-2">Detailed Description</label>
                <textarea
                  id="description"
                  rows={4}
                  className="block w-full py-3 px-4 border border-theme-border/70 rounded-xl bg-theme-bg/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all text-theme-text placeholder-theme-text-muted/50 resize-y"
                  placeholder="Explain the context of your doubt..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-bold text-theme-text mb-2">Urgency Level</label>
                <select
                  id="urgency"
                  className="block w-full py-3 px-4 border border-theme-border/70 rounded-xl bg-theme-bg/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all text-theme-text"
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                >
                  <option value="low">Low (1-2 days)</option>
                  <option value="medium">Medium (Within 24 hours)</option>
                  <option value="high">High (ASAP)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-theme-text mb-2">Attach Image (Optional)</label>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 cursor-pointer flex flex-col items-center justify-center py-3 px-4 border-2 border-dashed border-theme-border/70 hover:border-theme-accent/50 hover:bg-theme-bg/50 rounded-xl transition-all">
                      <div className="flex items-center text-sm text-theme-text-muted">
                        <ImageIcon className="w-5 h-5 mr-2" />
                        <span>Upload JPG/PNG</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg" 
                        className="hidden" 
                        onChange={handleImageChange}
                      />
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg border border-theme-border/50" />
                    <button 
                      type="button" 
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-3 sm:space-y-0">
              <button
                type="button"
                onClick={() => navigate('/student')}
                className="w-full sm:w-auto py-3 px-6 border border-theme-border bg-theme-bg/50 rounded-xl shadow-sm text-sm font-bold text-theme-text hover:bg-theme-bg transition-colors"
              >
                Discard
              </button>
              <motion.button
                whileHover={formData.subjectId && !loading ? { scale: 1.02 } : {}}
                whileTap={formData.subjectId && !loading ? { scale: 0.98 } : {}}
                type="submit"
                disabled={loading || !formData.subjectId}
                className={`w-full sm:w-auto inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-bold rounded-xl transition-colors ${(!formData.subjectId || loading) ? 'bg-theme-border text-theme-text-muted cursor-not-allowed opacity-70' : 'text-white bg-theme-accent hover:bg-theme-accent-hover'}`}
              >
                {loading ? 'Posting...' : 'Publish Question'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PostDoubtPage;
