import React, { useState } from 'react';
import { MessageSquare, Clock, CheckCircle, User, BookOpen, ImageIcon, Send, XCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAnswerCard from './AIAnswerCard';
import API from '../services/api';

const DoubtCard = ({ doubt, onClaim, onAnswerClick, userRole, currentUserId, onDoubtUpdate }) => {
  const [suggestionText, setSuggestionText] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const statusConfig = {
    PENDING: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: <Clock className="w-3.5 h-3.5 mr-1.5" /> },
    OPEN: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: <Clock className="w-3.5 h-3.5 mr-1.5" /> },
    AI_ANSWERED: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> },
    CLAIMED: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: <User className="w-3.5 h-3.5 mr-1.5" /> },
    SOLVED: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> },
    RESOLVED: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> },
  };

  const urgencyConfig = {
    low: { color: 'text-[#556B2F]', bg: 'bg-[#556B2F]/10', border: 'border-[#556B2F]/20', label: 'Low Urgency' },
    medium: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Medium Urgency' },
    high: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'High Urgency' }
  };

  const status = statusConfig[doubt.status] || statusConfig.PENDING;
  const urgency = urgencyConfig[doubt.urgency || 'medium'];

  const submitSuggestion = async () => {
    if (!suggestionText.trim()) return;
    try {
      setLoadingSuggestion(true);
      await API.post(`/doubts/${doubt._id}/suggest`, { answer: suggestionText });
      setSuggestionText('');
      if (onDoubtUpdate) onDoubtUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to submit suggestion');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const reviewSuggestion = async (suggestionId, action) => {
    try {
      await API.put(`/doubts/${doubt._id}/suggest/${suggestionId}`, { action });
      if (onDoubtUpdate) onDoubtUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to review suggestion');
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-soft hover:shadow-hover border border-theme-border/50 overflow-hidden transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex flex-wrapjustify-between items-start mb-5 gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-theme-bg text-theme-text border border-theme-border">
              <BookOpen className="w-3 h-3 mr-1.5 text-theme-accent" />
              {doubt.subjectId?.subjectName || 'General'}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${status.bg} ${status.color} ${status.border}`}>
              {status.icon}
              {doubt.status}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${urgency.bg} ${urgency.color} ${urgency.border}`}>
              {urgency.label}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-theme-text mb-3 leading-tight line-clamp-2">{doubt.title}</h3>
        <p className="text-theme-text-muted text-sm leading-relaxed mb-4 whitespace-pre-wrap">{doubt.description}</p>

        {doubt.imageUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-theme-border/50 max-w-sm">
                <img src={`http://localhost:5000${doubt.imageUrl}`} alt="Doubt Attachment" className="w-full h-auto object-cover" />
            </div>
        )}

        <div className="flex items-center text-xs text-theme-text-muted mb-4 pb-4 border-b border-theme-border/50">
          <span className="font-medium">By {doubt.studentId?.name || 'Student'}</span>
          <span className="mx-2 opacity-50">•</span>
          <span>{doubt.createdAt ? new Date(doubt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}</span>
        </div>

        {/* AI Answer Section */}
        {((doubt.aiAnswer && doubt.aiConfidence === 'high') || (userRole === 'student' && doubt.aiAnswer)) && (
          <div className="mb-4">
            <AIAnswerCard
              doubtId={doubt._id}
              question={`${doubt.title}. ${doubt.description}`}
              subjectName={doubt.subjectId?.subjectName}
              aiAnswer={doubt.aiAnswer}
              aiConfidence={doubt.aiConfidence}
              aiFeedback={doubt.aiFeedback}
              compact={true}
            />
          </div>
        )}

        {/* Suggestions Section */}
        {doubt.suggestions && doubt.suggestions.length > 0 && (
            <div className="mb-4 space-y-3">
                <h4 className="text-sm font-bold text-theme-text flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1.5 text-theme-text-muted" /> Peer Suggestions
                </h4>
                {doubt.suggestions.map((sug) => (
                    <div key={sug._id} className="bg-theme-bg/30 p-3 rounded-lg border border-theme-border flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <p className="text-sm text-theme-text-muted">{sug.answer}</p>
                            <div className="mt-1 flex gap-2 items-center text-xs">
                                <span className="font-medium text-theme-text">By {sug.studentId?.name || 'A Student'}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sug.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : sug.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {sug.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        {userRole === 'faculty' && sug.status === 'pending' && doubt.facultyId?._id === currentUserId && (
                             <div className="flex gap-2">
                                 <button onClick={() => reviewSuggestion(sug._id, 'approve')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100">
                                     <Check className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => reviewSuggestion(sug._id, 'reject')} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                                     <XCircle className="w-4 h-4" />
                                 </button>
                             </div>
                        )}
                    </div>
                ))}
            </div>
        )}

        {/* Suggestion Input for Students */}
        {userRole === 'student' && doubt.status !== 'SOLVED' && doubt.status !== 'RESOLVED' && doubt.studentId?._id !== currentUserId && (
            <div className="mt-4 flex gap-2">
                <input 
                    type="text"
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder="Suggest a solution to help..."
                    className="flex-1 text-sm bg-theme-bg/50 border border-theme-border rounded-xl px-3 py-2 outline-none focus:border-theme-accent text-theme-text"
                />
                <button 
                  onClick={submitSuggestion}
                  disabled={loadingSuggestion || !suggestionText.trim()}
                  className="bg-theme-accent text-white px-3 py-2 rounded-xl hover:bg-theme-accent-hover disabled:opacity-50"
                >
                   <Send className="w-4 h-4" />
                </button>
            </div>
        )}

        {/* Faculty Answer */}
        {doubt.answer && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="mt-4 bg-theme-bg/50 rounded-xl p-4 border border-theme-border/50"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start text-sm font-semibold text-theme-text mb-3">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-theme-accent" />
                  Answered by {doubt.facultyId?.name || 'Faculty'}
                </div>
                {/* Availability Indicator */}
                {doubt.facultyId && (
                  <div className="flex items-center mt-1 ml-6 space-x-1.5">
                    {(() => {
                      const lastActive = doubt.facultyId.lastActiveAt ? new Date(doubt.facultyId.lastActiveAt).getTime() : 0;
                      const isNow = doubt.facultyId.isActive || (Date.now() - lastActive < 300000); // 5 mins
                      const isRecent = !isNow && (Date.now() - lastActive < 900000); // 15 mins

                      if (isNow) {
                        return <><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /><span className="text-xs font-bold text-emerald-600">Active Now</span></>;
                      } else if (isRecent) {
                        return <><span className="w-2 h-2 bg-amber-500 rounded-full" /><span className="text-xs font-bold text-amber-600">Recently Active</span></>;
                      } else {
                        return <><span className="w-2 h-2 bg-gray-400 rounded-full" /><span className="text-xs font-medium text-gray-500">Offline</span></>;
                      }
                    })()}
                  </div>
                )}
              </div>
              
              {/* Answer Time diff */}
              {doubt.updatedAt && (
                <div className="text-xs text-theme-text-muted mt-2 sm:mt-0 font-medium">
                  {Math.round((new Date(doubt.updatedAt).getTime() - new Date(doubt.createdAt).getTime()) / 60000) > 0 
                    ? `Answered in ${Math.round((new Date(doubt.updatedAt).getTime() - new Date(doubt.createdAt).getTime()) / 60000)} minutes`
                    : 'Answered instantly'
                  }
                </div>
              )}
            </div>
            <p className="text-theme-text-muted text-sm leading-relaxed whitespace-pre-wrap">{doubt.answer}</p>
          </motion.div>
        )}

        {/* Actions */ }
        <div className="mt-5 flex justify-end space-x-3">
          {userRole === 'faculty' && (doubt.status === 'PENDING' || doubt.status === 'OPEN' || doubt.status === 'AI_ANSWERED') && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onClaim(doubt._id)}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-theme-accent hover:bg-theme-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-accent transition-colors shadow-sm"
            >
              Claim to Answer
            </motion.button>
          )}
          {userRole === 'faculty' && doubt.status === 'CLAIMED' && doubt.facultyId?._id === currentUserId && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAnswerClick(doubt)}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-theme-accent hover:bg-theme-accent-hover shadow-sm"
            >
              Provide Answer
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DoubtCard;
