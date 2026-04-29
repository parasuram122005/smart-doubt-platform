import React, { useState, useEffect, useMemo } from 'react';
import API from '../services/api';
import { Table } from '../components/ui/Table';
import { Tabs } from '../components/ui/Tabs';
import { ActivityTimeline } from '../components/ui/ActivityTimeline';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getMockActivityTimeline } from '../utils/mockData';
import AIAnswerCard from '../components/AIAnswerCard';
import VerificationBanner from '../components/VerificationBanner';
import Banner from '../components/Banner';
import VoteControls from '../components/VoteControls';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, X, MessageSquare, BookOpen, User, Calendar } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Raven Modal State
  const [showRavenModal, setShowRavenModal] = useState(false);
  const [ravenMessage, setRavenMessage] = useState('');
  const [ravenSent, setRavenSent] = useState(false);
  
  // Received Raven Replies
  const [ravenReplies, setRavenReplies] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchFilter(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchMyDoubts = async () => {
      try {
        setLoading(true);
        const url = searchFilter ? `/doubts/my?search=${encodeURIComponent(searchFilter)}` : '/doubts/my';
        const { data } = await API.get(url);
        setDoubts(data.data || []);
      } catch (err) {
        setDoubts([]);
      } finally {
        setLoading(false);
      }
    };
    const fetchNotifications = async () => {
      try {
        const { data } = await API.get('/notifications');
        if (data.success) {
          setRavenReplies(data.data.filter(n => n.type === 'raven_reply' && !n.read) || []);
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchMyDoubts();
    fetchNotifications();
  }, [searchFilter]);

  const markReplyAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setRavenReplies(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to mark reply as read:', err);
    }
  };

  const filteredDoubts = useMemo(() => {
    let filtered = doubts;
    if (activeTab !== 'ALL') {
      filtered = filtered.filter(d => d.status === activeTab);
    }
    return filtered;
  }, [doubts, activeTab]);
  
  // Calculate stats for top mini-cards
  const total = doubts.length;
  const resolved = doubts.filter(d => d.status === 'SOLVED').length;
  const pending = doubts.filter(d => d.status !== 'SOLVED').length;

  const tableCols = [
    { header: 'Title', cell: (row) => <div className="font-semibold">{row.title}</div> },
    { header: 'Subject', cell: (row) => row.subjectId?.subjectName || '--' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Posted', cell: (row) => <span className="text-theme-text-muted">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ];

  const rowAction = (row) => {
    setSelectedDoubt(row);
  };

  if (loading) {
    return (
      <div className="flex animate-pulse space-x-6">
        <div className="flex-1 space-y-6"><div className="h-40 bg-theme-border/30 rounded-2xl"/><div className="h-96 bg-theme-border/30 rounded-2xl"/></div>
        <div className="w-80 h-screen bg-theme-border/30 rounded-2xl"/>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col xl:flex-row gap-8">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <VerificationBanner />
        <Banner 
          title="Welcome, Scholar. What knowledge do you seek today?"
          role="student"
          buttons={[
            { label: 'Post New Doubt', to: '/post-doubt' },
            { label: 'View My Doubts', onClick: () => { document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' }) } }
          ]}
        />
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
           <div>
              <h1 className="text-2xl font-extrabold text-theme-text tracking-tight">Your Tracking Board</h1>
              <p className="mt-1 text-sm text-theme-text-muted">Monitor doubts, verify answers, and request more help.</p>
           </div>
           <Link
             to="/post-doubt"
             className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold text-white bg-theme-accent hover:bg-theme-accent-hover shadow-sm transition-all hover:shadow-md"
           >
             <Plus className="w-4 h-4 mr-2" /> Ask Question
           </Link>
        </div>

        {/* Dense Stats Micro Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-theme-border/50 shadow-soft">
            <p className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">Total Filed</p>
            <p className="text-2xl font-black mt-1 text-theme-text">{total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-theme-border/50 shadow-soft">
            <p className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-black mt-1 text-emerald-600">{resolved}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-theme-border/50 shadow-soft">
            <p className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">Pending Action</p>
            <p className="text-2xl font-black mt-1 text-amber-600">{pending}</p>
          </div>
        </div>

        {/* Filters & Tabs Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
           <Tabs 
             tabs={[
               { id: 'ALL', label: 'All Quests' },
               { id: 'PENDING', label: 'Pending' },
               { id: 'SOLVED', label: 'Resolved' }
             ]}
             activeTab={activeTab}
             onChange={(id) => { setActiveTab(id); setSelectedDoubt(null); }}
           />
           <div className="flex items-center space-x-2 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
               <Search className="w-4 h-4 absolute left-3 top-2.5 flex items-center text-theme-text-muted" />
               <input
                 type="text"
                 placeholder="Filter doubts..."
                 value={searchInput}
                 onChange={e => setSearchInput(e.target.value)}
                 className="w-full pl-9 pr-3 py-2 text-sm border border-theme-border/60 rounded-lg bg-white outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent"
               />
             </div>
           </div>
        </div>

        {/* Dense Table */}
        <div className="flex-1">
          <Table columns={tableCols} data={filteredDoubts} onRowClick={rowAction} />
          {filteredDoubts.length === 0 && !loading && (
            <div className="py-16 text-center bg-white rounded-2xl border border-theme-border/50 mt-4">
              <p className="text-theme-text-muted text-sm italic font-cormorant">
                No quests await you... yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Right Panel: Detail / Activity */}
      <div className="w-full xl:w-96 flex-shrink-0 flex flex-col space-y-6">
        <AnimatePresence mode="wait">
          {selectedDoubt ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-soft border border-theme-border/50 overflow-hidden flex flex-col"
            >
              {/* Detail Header */}
              <div className="p-5 border-b border-theme-border/50 bg-theme-bg/30 flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={selectedDoubt.status} />
                    <span className="text-[10px] text-theme-text-muted uppercase tracking-widest font-medium">
                      {new Date(selectedDoubt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-theme-text text-base leading-snug">{selectedDoubt.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedDoubt(null)}
                  className="p-1.5 rounded-lg hover:bg-theme-border/30 text-theme-text-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Detail Body */}
              <div className="p-5 overflow-y-auto max-h-[calc(100vh-20rem)] space-y-5">
                {/* Subject */}
                <div className="flex items-center text-xs font-bold text-theme-accent uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 mr-2" />
                  {selectedDoubt.subjectId?.subjectName || 'General'}
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-theme-text-muted uppercase tracking-wider mb-2">Your Question</h4>
                  <p className="text-sm text-theme-text leading-relaxed whitespace-pre-wrap bg-theme-bg/50 p-4 rounded-xl border border-theme-border/50">
                    {selectedDoubt.description}
                  </p>
                </div>

                {/* AI Answer (if exists or requestable) */}
                <div>
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

                {/* Faculty Answer */}
                {selectedDoubt.status === 'SOLVED' && selectedDoubt.answer && (
                  <div>
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Faculty Answer</h4>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <div className="flex items-center text-sm font-bold text-theme-text mb-3">
                        <Avatar name={selectedDoubt.facultyId?.name} role="faculty" className="w-6 h-6 text-[10px] mr-2" />
                        {selectedDoubt.facultyId?.name || 'Faculty'}
                      </div>
                      <p className="text-sm text-theme-text leading-relaxed whitespace-pre-wrap">{selectedDoubt.answer}</p>
                      <VoteControls doubtId={selectedDoubt._id} initialVotes={selectedDoubt.votes} />
                      {selectedDoubt.updatedAt && (
                        <div className="flex items-center mt-3 pt-3 border-t border-emerald-100 text-xs text-emerald-600">
                          <Calendar className="w-3 h-3 mr-1.5" />
                          Resolved on {new Date(selectedDoubt.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status messages */}
                {selectedDoubt.status === 'CLAIMED' && (
                  <div className="p-4 text-center text-sm text-blue-600 bg-blue-50 rounded-xl border border-blue-100">
                    <User className="w-4 h-4 inline mr-2" />
                    A faculty member is currently working on your answer.
                  </div>
                )}
                {selectedDoubt.status === 'PENDING' && (
                  <div className="p-4 text-center text-sm text-amber-600 bg-amber-50 rounded-xl border border-amber-100">
                    Waiting for a faculty member to claim this doubt.
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="activity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-soft border border-theme-border/50 overflow-hidden">
                <div className="p-5 border-b border-theme-border/50 bg-theme-bg/30">
                  <h3 className="font-bold text-theme-text">Recent Activity Stream</h3>
                </div>
                <div className="p-5 overflow-y-auto max-h-[500px]">
                   <ActivityTimeline activities={getMockActivityTimeline(doubts)} />
                </div>
              </div>

              {ravenReplies.map(reply => (
                <div key={reply._id} className="bg-[#111111] p-6 rounded-2xl border border-[#C9A227]/50 shadow-[0_0_20px_rgba(201,162,39,0.15)] flex flex-col items-start relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A227]"></div>
                   <div className="flex items-center gap-3 mb-3">
                     <MessageSquare className="w-5 h-5 text-[#C9A227]" />
                     <h4 className="font-cinzel font-bold text-[#C9A227] tracking-wider uppercase text-sm">Response from the Masters</h4>
                   </div>
                   <div className="w-full bg-[#1a1410] border border-[#2B1D12] p-4 rounded-xl mb-4">
                     <p className="text-sm font-cormorant text-[#F8F6F0] italic leading-relaxed whitespace-pre-wrap">
                       "{reply.message.split(':').slice(1).join(':').trim()}"
                     </p>
                     <p className="mt-3 text-xs font-bold text-[#C9A227] text-right uppercase tracking-widest font-cinzel">
                       — {reply.message.split(':')[0].replace('RAVEN REPLY from ', '')}
                     </p>
                   </div>
                   <button 
                     onClick={() => markReplyAsRead(reply._id)}
                     className="text-xs font-bold px-4 py-2 border border-[#C9A227]/30 text-[#D7D3C8] rounded-lg hover:text-[#C9A227] hover:border-[#C9A227] transition-all self-end"
                   >
                     Acknowledge
                   </button>
                </div>
              ))}

              <div className="bg-[#111111] p-6 rounded-2xl border border-[#C9A227]/30 shadow-[inset_0_0_15px_rgba(201,162,39,0.05)] flex flex-col items-start">
                 <h4 className="font-cinzel font-bold text-[#C9A227] mb-2 tracking-wider">Require Urgent Counsel?</h4>
                 <p className="text-sm font-cormorant text-[#D7D3C8]/80 leading-relaxed mb-4">
                   If your quest is of utmost urgency, dispatch a raven to the Masters of the Archives, citing your tracker ID.
                 </p>
                 <button 
                   onClick={() => { setShowRavenModal(true); setRavenSent(false); setRavenMessage(''); }}
                   className="text-xs font-bold px-4 py-2 bg-[#C9A227] text-[#0F2E1D] rounded-lg hover:bg-[#D4AF37] transition-all shadow-[0_0_10px_rgba(201,162,39,0.3)] hover:shadow-[0_0_15px_rgba(201,162,39,0.5)]"
                 >
                   Dispatch Raven
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════ RAVEN MODAL ═══════ */}
      <AnimatePresence>
        {showRavenModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111111] border border-[#C9A227]/40 rounded-2xl shadow-[0_0_30px_rgba(201,162,39,0.15)] max-w-md w-full overflow-hidden"
            >
              <div className="p-6 border-b border-[#2B1D12]">
                <div className="flex justify-between items-center">
                  <h3 className="font-cinzel font-bold text-xl text-[#C9A227] tracking-wider">Dispatch a Raven</h3>
                  <button onClick={() => setShowRavenModal(false)} className="text-[#D7D3C8]/50 hover:text-[#C9A227] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {ravenSent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#0F2E1D] rounded-full mx-auto mb-4 flex items-center justify-center border border-[#C9A227]/30">
                      <MessageSquare className="w-8 h-8 text-[#C9A227]" />
                    </div>
                    <h4 className="font-cinzel font-bold text-lg text-[#F8F6F0] mb-2">Raven Dispatched!</h4>
                    <p className="font-cormorant text-[#D7D3C8]/80">The Masters have received your urgent plea. They will seek you out shortly.</p>
                  </div>
                ) : (
                  <>
                    <p className="font-cormorant text-[#D7D3C8]/80 mb-4 leading-relaxed">
                      Pen your urgent message to the faculty. Include any relevant tracking numbers or specifics of your plight.
                    </p>
                    <textarea
                      value={ravenMessage}
                      onChange={(e) => setRavenMessage(e.target.value)}
                      placeholder="My lords, I seek guidance regarding..."
                      className="w-full h-32 bg-[#1a1410] border border-[#2B1D12] rounded-xl p-4 text-[#F8F6F0] text-sm focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none resize-none font-sans"
                    ></textarea>
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        onClick={() => setShowRavenModal(false)}
                        className="px-4 py-2 text-sm font-bold text-[#D7D3C8]/70 hover:text-[#F8F6F0] transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={!ravenMessage.trim()}
                        onClick={async () => {
                          try {
                            await API.post('/notifications/raven', { message: ravenMessage });
                            setRavenSent(true);
                            setTimeout(() => setShowRavenModal(false), 3000);
                          } catch (err) {
                            console.error('Failed to send raven', err);
                          }
                        }}
                        className="px-5 py-2 bg-[#0F2E1D] text-[#C9A227] border border-[#C9A227]/30 font-bold text-sm rounded-lg hover:bg-[#1a4a2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send Raven
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StudentDashboard;
