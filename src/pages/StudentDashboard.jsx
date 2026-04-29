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
    fetchMyDoubts();
  }, [searchFilter]);

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

              <div className="bg-gradient-to-br from-theme-accent/10 to-theme-bg p-6 rounded-2xl border border-theme-accent/20 flex flex-col items-start">
                 <h4 className="font-bold text-theme-text mb-2">Need priority support?</h4>
                 <p className="text-xs text-theme-text-muted leading-relaxed mb-4">
                   If your doubt is exceptionally urgent, approach your faculty coordinator or ping them on the internal MS Teams channel referring to your Tracker ID.
                 </p>
                 <button className="text-xs font-bold px-3 py-1.5 bg-theme-accent text-white rounded-lg hover:bg-theme-accent-hover transition-colors">Documentation</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentDashboard;
