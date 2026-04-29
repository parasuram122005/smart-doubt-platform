import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import API from '../services/api';
import SearchBar from '../components/SearchBar';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Avatar } from '../components/ui/Avatar';
import VoteControls from '../components/VoteControls';
import Banner from '../components/Banner';
import { AuthContext } from '../contexts/AuthContext';

const ExpandableDoubtCard = React.memo(({ doubt }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className="bg-[#F8F6F0] rounded-2xl shadow-soft border border-[#2B1D12]/20 overflow-hidden cursor-pointer hover:shadow-hover hover:border-[#C9A227]/50 transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-6">
         <div className="flex justify-between items-start mb-4">
            <StatusBadge status={doubt.status} />
            <span className="text-xs font-medium text-theme-text-muted">
              {new Date(doubt.createdAt).toLocaleDateString()}
            </span>
         </div>
         <h4 className="text-lg font-bold text-theme-text mb-2 line-clamp-2 leading-snug">{doubt.title}</h4>
         <div className="flex items-center text-xs text-theme-text-muted mb-4 pb-4 border-b border-theme-border/50">
            <Avatar name={doubt.studentId?.name} className="w-5 h-5 text-[8px] mr-2" />
            <span>by {doubt.studentId?.name || 'Student'}</span>
         </div>
         <p className="text-sm text-theme-text-muted line-clamp-3 mb-2">{doubt.description}</p>
         
         <div className="flex justify-center mt-2 text-theme-accent">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
         </div>
      </div>

      <AnimatePresence>
         {expanded && doubt.answer && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }} 
               animate={{ opacity: 1, height: 'auto' }} 
               exit={{ opacity: 0, height: 0 }}
               className="bg-theme-bg/50 border-t border-theme-border/50 p-6"
            >
               <div className="flex items-center text-sm font-bold text-theme-text mb-3">
                  <Avatar name={doubt.facultyId?.name} role="faculty" className="w-6 h-6 text-[10px] mr-3" />
                  Answered by {doubt.facultyId?.name || 'Faculty'}
               </div>
               <div className="text-sm text-theme-text leading-relaxed whitespace-pre-wrap">
                  {doubt.answer}
               </div>
               <VoteControls doubtId={doubt._id} initialVotes={doubt.votes} />
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
});

ExpandableDoubtCard.displayName = 'ExpandableDoubtCard';

const KnowledgeBasePage = () => {
  const { user } = useContext(AuthContext);
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  // Stable fetch function using useCallback
  const fetchDoubts = useCallback(async (searchQuery = '') => {
    try {
      setLoading(true);
      const url = searchQuery 
        ? `/doubts/knowledge-base?search=${encodeURIComponent(searchQuery)}` 
        : '/doubts/knowledge-base';
      const { data } = await API.get(url);
      setDoubts(data.data || []);
    } catch (err) {
      console.error('Failed to fetch knowledge base:', err);
      // Only set empty on error if we never loaded data
      setDoubts(prev => prev.length > 0 ? prev : []);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch — runs exactly once
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDoubts();
    }
  }, [fetchDoubts]);

  return (
    <div className="w-full h-full p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-cinzel font-bold text-theme-text tracking-wider">The Archives</h1>
        <p className="font-cormorant italic text-theme-text-muted text-lg mt-1">Search the gathered wisdom of the realm.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
         {/* Sidebar Filter Area */}
         <div className="w-full md:w-64 flex-shrink-0 space-y-6">
            <div className="bg-[#1a1410] text-[#F8F6F0] p-5 rounded-2xl shadow-soft border border-[#2B1D12]">
               <h3 className="font-cinzel font-bold text-[#C9A227] mb-4 border-b border-[#2B1D12] pb-2">Filter Library</h3>
               <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm text-theme-text-muted cursor-pointer hover:text-theme-text">
                     <input type="checkbox" className="rounded text-theme-accent focus:ring-theme-accent/50" />
                     <span>Data Structures</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-theme-text-muted cursor-pointer hover:text-theme-text">
                     <input type="checkbox" className="rounded text-theme-accent focus:ring-theme-accent/50" />
                     <span>Algorithms</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-theme-text-muted cursor-pointer hover:text-theme-text">
                     <input type="checkbox" className="rounded text-theme-accent focus:ring-theme-accent/50" />
                     <span>Operating Systems</span>
                  </label>
               </div>
            </div>

            <div className="bg-[#0F2E1D] p-5 rounded-2xl border border-[#C9A227]/30 shadow-[inset_0_0_20px_rgba(201,162,39,0.05)]">
               <Layers className="w-6 h-6 text-[#C9A227] mb-3" />
               <p className="text-sm font-cinzel font-bold text-[#F8F6F0] leading-tight tracking-wider">Seek further wisdom?</p>
               <p className="text-xs text-[#D7D3C8]/80 mt-2 font-cormorant">Enter the realm to post a new inquiry directly to the masters.</p>
            </div>
         </div>

         {/* Main Grid Content */}
         <div className="flex-1 flex flex-col">
            <SearchBar onSearch={fetchDoubts} />
            
            {loading ? (
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
               {[0, 1, 2, 3].map(i => (
                 <div key={i} className="h-64 bg-theme-border/30 animate-pulse rounded-2xl" />
               ))}
             </div>
            ) : (
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                  {doubts.map(doubt => (
                    <ExpandableDoubtCard key={doubt._id} doubt={doubt} />
                  ))}
                  
                  {doubts.length === 0 && (
                     <div className="col-span-full py-20 text-center bg-[#F8F6F0] rounded-2xl border border-[#2B1D12]/20">
                        <p className="text-[#2B1D12] italic font-cormorant text-lg">No ancient texts match your search.</p>
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
