import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import API from '../services/api';
import { StatusBadge } from '../components/ui/StatusBadge';
import AnswerForm from '../components/AnswerForm';
import AIAnswerCard from '../components/AIAnswerCard';
import VerificationBanner from '../components/VerificationBanner';
import Banner from '../components/Banner';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, Mail, BookOpen, AlertCircle, CheckCircle, Inbox, Calendar } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);

  // Left pane tab: open vs claimed vs resolved
  const [activeView, setActiveView] = useState('open');

  const [searchInput, setSearchInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Inbox data
  const [allDoubts, setAllDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Resolved data
  const [resolvedDoubts, setResolvedDoubts] = useState([]);
  const [resolvedLoading, setResolvedLoading] = useState(false);
  const [resolvedFetched, setResolvedFetched] = useState(false);
  
  const [selectedDoubt, setSelectedDoubt] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearchFilter(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchOpenDoubts = async (query = searchFilter) => {
    try {
      setLoading(true);
      setError('');
      const url = query ? `/doubts/open?search=${encodeURIComponent(query)}` : '/doubts/open';
      const { data } = await API.get(url);
      if (data.success) {
        setAllDoubts(data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to the server.');
      setAllDoubts(prev => prev.length > 0 ? prev : []);
    } finally {
      setLoading(false);
    }
  };

  const fetchResolvedDoubts = useCallback(async (query = searchFilter) => {
    try {
      setResolvedLoading(true);
      const url = query ? `/doubts/faculty/resolved?search=${encodeURIComponent(query)}` : '/doubts/faculty/resolved';
      const { data } = await API.get(url);
      if (data.success) {
        setResolvedDoubts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch resolved doubts:', err);
    } finally {
      setResolvedLoading(false);
      setResolvedFetched(true);
    }
  }, [searchFilter]);

  // Fetch data when tab switches or search changes
  useEffect(() => {
    if (activeView === 'resolved') {
      fetchResolvedDoubts(searchFilter);
    } else {
      fetchOpenDoubts(searchFilter);
    }
  }, [activeView, searchFilter]);

  const handleClaim = async (id) => {
    try {
      setError('');
      const { data } = await API.put(`/doubts/claim/${id}`);
      fetchOpenDoubts();
      if (selectedDoubt?._id === id) {
        setSelectedDoubt(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim doubt.');
    }
  };

  const handleAnswerSuccess = () => {
    fetchOpenDoubts();
    setSelectedDoubt(null);
    // Reset resolved cache so it refetches if user switches tab
    setResolvedFetched(false);
  };

  const viewDoubts = useMemo(() => {
    const userId = user?.id || user?._id;
    if (activeView === 'open') {
      return allDoubts.filter(d => d.status === 'PENDING' || d.status === 'AI_ANSWERED');
    } else if (activeView === 'claimed') {
      return allDoubts.filter(d => d.status === 'CLAIMED' && d.facultyId?._id === userId);
    }
    return [];
  }, [allDoubts, user, activeView]);

  // The list to show in the left pane
  const displayList = activeView === 'resolved' ? resolvedDoubts : viewDoubts;
  const isListLoading = activeView !== 'resolved' ? loading : resolvedLoading;

  // Stats
  const resolvedCount = resolvedDoubts.length;
  const openCount = allDoubts.filter(d => d.status === 'PENDING' || d.status === 'AI_ANSWERED').length;
  const claimedCount = allDoubts.filter(d => d.status === 'CLAIMED' && d.facultyId?._id === (user?.id || user?._id)).length;

  if (loading && activeView !== 'resolved') {
     return (
        <div className="flex animate-pulse space-x-6 h-full">
           <div className="w-1/3 bg-theme-border/30 rounded-2xl"></div>
           <div className="flex-1 bg-theme-border/30 rounded-2xl"></div>
        </div>
     );
  }

  return (
    <div className="w-full">
      <VerificationBanner />
      <Banner 
        title="Guide the seekers of knowledge."
        role="faculty"
        buttons={[
          { label: 'Open Doubts', onClick: () => { setActiveView('open'); setSelectedDoubt(null); } },
          { label: 'My Resolved Doubts', onClick: () => { setActiveView('resolved'); setSelectedDoubt(null); } }
        ]}
      />
    <div className="w-full h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 -mb-8 pb-8">
      
      {/* Left Pane: Dense Master List */}
      <div className="w-full md:w-1/3 lg:w-[400px] flex flex-col bg-white rounded-2xl border border-theme-border/50 shadow-soft overflow-hidden">
        {/* Tab Header */}
        <div className="p-4 border-b border-theme-border/50 bg-theme-bg/30">
          <div className="flex items-center gap-1 mb-4 p-1 bg-theme-border/20 rounded-xl">
            <button
              onClick={() => { setActiveView('open'); setSelectedDoubt(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeView === 'open'
                  ? 'bg-white text-theme-text shadow-sm'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              Open
              {openCount > 0 && (
                <span className="bg-theme-accent/10 text-theme-accent text-[10px] font-bold px-1.5 py-0.5 rounded-md">{openCount}</span>
              )}
            </button>
            <button
              onClick={() => { setActiveView('claimed'); setSelectedDoubt(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeView === 'claimed'
                  ? 'bg-white text-theme-text shadow-sm'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Claimed
              {claimedCount > 0 && (
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{claimedCount}</span>
              )}
            </button>
            <button
              onClick={() => { setActiveView('resolved'); setSelectedDoubt(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeView === 'resolved'
                  ? 'bg-white text-theme-text shadow-sm'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Resolved
              {resolvedCount > 0 && (
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{resolvedCount}</span>
              )}
            </button>
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-theme-text-muted" />
             <input type="text" placeholder="Search doubts..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-theme-border/60 rounded-lg outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
           {error && activeView !== 'resolved' && (
             <div className="p-4 text-xs text-red-600 bg-red-50 border-b border-red-100 flex items-center">
               <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
               {error}
             </div>
           )}

           {isListLoading ? (
             <div className="p-6 space-y-4">
               {[0, 1, 2].map(i => (
                 <div key={i} className="h-20 bg-theme-border/20 animate-pulse rounded-xl" />
               ))}
             </div>
           ) : (
             <div className="divide-y divide-theme-border/40">
               {displayList.map(doubt => (
                 <div 
                   key={doubt._id}
                   onClick={() => setSelectedDoubt(doubt)}
                   className={`p-4 cursor-pointer transition-colors ${selectedDoubt?._id === doubt._id ? 'bg-theme-bg/80 border-l-4 border-theme-accent pl-3' : 'hover:bg-theme-bg/50 border-l-4 border-transparent pl-3'}`}
                 >
                   <div className="flex justify-between items-start mb-2">
                      <StatusBadge status={doubt.status} className="scale-90 origin-left" />
                      <span className="text-[10px] text-theme-text-muted font-medium uppercase tracking-widest">
                        {new Date(doubt.updatedAt || doubt.createdAt).toLocaleDateString()}
                      </span>
                   </div>
                   <h4 className="font-bold text-theme-text text-sm mb-1 leading-snug line-clamp-2">{doubt.title}</h4>
                   <div className="flex items-center text-xs text-theme-text-muted mt-2">
                      <Avatar name={doubt.studentId?.name} className="w-5 h-5 text-[8px] mr-2 ring-1 ring-theme-border" />
                      <span className="truncate">{doubt.studentId?.name || 'Anonymous Student'}</span>
                   </div>
                   {/* Show answer preview for resolved */}
                   {activeView === 'resolved' && doubt.answer && (
                     <p className="mt-2 text-xs text-theme-text-muted line-clamp-1 italic">
                       "{doubt.answer.substring(0, 80)}..."
                     </p>
                   )}
                 </div>
               ))}
               {displayList.length === 0 && !error && (
                  <div className="p-8 text-center text-theme-text-muted text-sm italic font-cormorant">
                     No quests await you... yet.
                  </div>
               )}
             </div>
           )}
        </div>
      </div>

      {/* Right Pane: Detail & Action Panel */}
      <div className="flex-1 bg-white rounded-2xl border border-theme-border/50 shadow-soft overflow-hidden flex flex-col relative">
         {!selectedDoubt ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-theme-bg/30">
               <div className="w-16 h-16 bg-theme-bg rounded-2xl flex items-center justify-center border border-theme-border shadow-sm mb-4">
                  <Info className="w-8 h-8 text-theme-text-muted" />
               </div>
               <h3 className="text-xl font-bold text-theme-text">No Thread Selected</h3>
               <p className="mt-2 text-theme-text-muted text-sm max-w-sm">
                 {activeView === 'resolved' 
                   ? 'Select a resolved doubt from the left to review your answer and student details.'
                   : 'Select a doubt from the stream on the left to view full context, claim it, or draft your answer.'}
               </p>
            </div>
         ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
               {/* Detail Header Context */}
               <div className="p-6 border-b border-theme-border/50 bg-theme-bg/30 relative">
                  <div className="flex items-center space-x-3 text-xs font-bold text-theme-accent mb-3 uppercase tracking-wider">
                     <BookOpen className="w-4 h-4" />
                     <span>{selectedDoubt.subjectId?.subjectName || 'General Academia'}</span>
                  </div>
                  <h2 className="text-2xl font-black text-theme-text leading-tight pr-20">{selectedDoubt.title}</h2>
                  <div className="absolute top-6 right-6">
                     <StatusBadge status={selectedDoubt.status} />
                  </div>
               </div>

               {/* Scrollable Content Body */}
               <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Student Persona Block */}
                  <div className="flex items-center p-4 bg-theme-bg rounded-xl border border-theme-border/50">
                     <Avatar name={selectedDoubt.studentId?.name} className="w-12 h-12 text-sm shadow-sm" />
                     <div className="ml-4">
                        <p className="font-bold text-theme-text">{selectedDoubt.studentId?.name || 'Student Name'}</p>
                        <p className="text-sm text-theme-text-muted mt-0.5 flex items-center">
                           <Mail className="w-3 h-3 mr-1.5" />
                           {selectedDoubt.studentId?.email || 'No email provided'}
                        </p>
                     </div>
                  </div>

                  {/* Dense Query Body */}
                  <div>
                     <h4 className="text-xs font-bold text-theme-text-muted uppercase tracking-wider mb-3">Context & Query</h4>
                     <div className="prose prose-sm max-w-none text-theme-text bg-white p-5 rounded-xl border border-theme-border/50 shadow-sm leading-relaxed whitespace-pre-wrap">
                        {selectedDoubt.description}
                     </div>
                  </div>

                  {/* AI Pre-Analysis */}
                  <div>
                     <h4 className="text-xs font-bold text-theme-text-muted uppercase tracking-wider mb-3">AI Pre-Analysis</h4>
                     <AIAnswerCard
                       doubtId={selectedDoubt._id}
                       question={`${selectedDoubt.title}. ${selectedDoubt.description}`}
                       subjectName={selectedDoubt.subjectId?.subjectName}
                       aiAnswer={selectedDoubt.aiAnswer}
                       aiConfidence={selectedDoubt.aiConfidence}
                       aiFeedback={selectedDoubt.aiFeedback}
                       compact={true}
                     />
                  </div>

                  {/* Action or Draft Area */}
                  {(selectedDoubt.status === 'PENDING' || selectedDoubt.status === 'AI_ANSWERED') && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 border-t border-theme-border/50">
                        <div className="bg-theme-accent/5 border border-theme-accent/20 rounded-xl p-5 text-center">
                           <h4 className="font-bold text-theme-text mb-2">Ready to assist?</h4>
                           <p className="text-sm text-theme-text-muted mb-4 max-w-md mx-auto">By claiming this doubt, it will be locked to your desk and removed from the active open queue for other faculty.</p>
                           <button onClick={() => handleClaim(selectedDoubt._id)} className="px-6 py-2.5 bg-theme-accent text-white font-bold rounded-lg shadow-sm hover:bg-theme-accent-hover transition-colors">
                              Claim Doubt
                           </button>
                        </div>
                     </motion.div>
                  )}

                  {selectedDoubt.status === 'CLAIMED' && selectedDoubt.facultyId?._id === (user?.id || user?._id) && (
                     <div className="pt-4 border-t border-theme-border/50">
                        <AnswerForm doubt={selectedDoubt} onSuccess={handleAnswerSuccess} onCancel={() => {}} />
                     </div>
                  )}

                  {selectedDoubt.status === 'CLAIMED' && selectedDoubt.facultyId?._id !== (user?.id || user?._id) && (
                     <div className="p-4 text-center text-sm text-theme-text-muted rounded-xl bg-theme-bg">
                        Currently being addressed by another faculty member.
                     </div>
                  )}

                  {selectedDoubt.status === 'SOLVED' && (
                     <div>
                        <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">
                          {activeView === 'resolved' ? 'Your Answer' : 'Faculty Answer'}
                        </h4>
                        <div className="prose prose-sm max-w-none text-theme-text bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm leading-relaxed whitespace-pre-wrap">
                           {selectedDoubt.answer}
                        </div>
                        {selectedDoubt.updatedAt && (
                          <div className="flex items-center mt-3 text-xs text-emerald-600">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            Resolved on {new Date(selectedDoubt.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>

    </div>
    </div>
  );
};

export default FacultyDashboard;
