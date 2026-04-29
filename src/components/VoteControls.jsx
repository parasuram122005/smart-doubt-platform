import React, { useState, useContext } from 'react';
import { ThumbsUp, ThumbsDown, Award } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import API from '../services/api';

const VoteControls = ({ doubtId, initialVotes }) => {
  const { user } = useContext(AuthContext);
  
  const [votes, setVotes] = useState({
    upvotes: initialVotes?.upvotes || 0,
    downvotes: initialVotes?.downvotes || 0,
    voters: initialVotes?.voters || []
  });

  const [loading, setLoading] = useState(false);

  // Find user's current vote
  const userVote = votes.voters.find(v => v.userId === (user?.id || user?._id))?.type;

  const handleVote = async (type) => {
    // Only students can vote legitimately, disabled otherwise
    if (user?.role !== 'student') return;
    
    // Prevent redundant click
    if (userVote === type) return;

    try {
      setLoading(true);
      
      // Optimistic update
      const newVotes = { ...votes, voters: [...votes.voters] };
      const existingUserIdx = newVotes.voters.findIndex(v => v.userId === (user?.id || user?._id));
      
      if (existingUserIdx !== -1) {
        const oldType = newVotes.voters[existingUserIdx].type;
        if (oldType === 'upvote') newVotes.upvotes -= 1;
        else newVotes.downvotes -= 1;
        
        newVotes.voters[existingUserIdx].type = type;
      } else {
        newVotes.voters.push({ userId: (user?.id || user?._id), type });
      }

      if (type === 'upvote') newVotes.upvotes += 1;
      else newVotes.downvotes += 1;

      setVotes(newVotes);

      // Fire API update silently
      await API.post(`/doubts/${doubtId}/vote`, { type });

    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setLoading(false);
    }
  };

  const isHighlyTrusted = votes.upvotes >= 5;

  return (
    <div className="mt-4 pt-4 border-t border-theme-border/50 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <button
          disabled={loading || user?.role !== 'student'}
          onClick={() => handleVote('upvote')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            userVote === 'upvote' 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' 
              : 'bg-white text-theme-text-muted hover:bg-theme-bg border-theme-border/60 hover:text-emerald-600 hover:border-emerald-200'
          } ${user?.role !== 'student' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
          title="Mark as helpful"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>{votes.upvotes}</span>
        </button>

        <button
          disabled={loading || user?.role !== 'student'}
          onClick={() => handleVote('downvote')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            userVote === 'downvote' 
              ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' 
              : 'bg-white text-theme-text-muted hover:bg-theme-bg border-theme-border/60 hover:text-red-600 hover:border-red-200'
          } ${user?.role !== 'student' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
          title="Mark as not helpful"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>{votes.downvotes}</span>
        </button>
      </div>

      {isHighlyTrusted && (
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Trusted Answer</span>
        </div>
      )}
    </div>
  );
};

export default VoteControls;
