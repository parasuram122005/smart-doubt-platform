import React, { useState } from 'react';
import API from '../services/api';
import { motion } from 'framer-motion';

const AnswerForm = ({ doubt, onSuccess, onCancel }) => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Answer cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await API.put(`/doubts/answer/${doubt._id}`, { answer });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Oops, we encountered an issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white p-6 rounded-2xl shadow-soft border border-theme-accent/20"
    >
      <h4 className="text-lg font-bold text-theme-text mb-4">Draft Answer</h4>
      <div className="mb-4 text-sm bg-theme-bg p-4 rounded-xl border border-theme-border/50">
        <span className="font-semibold text-theme-text opacity-70">Replying to: </span> 
        <span className="text-theme-text">{doubt.title}</span>
      </div>
      
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="answer" className="sr-only">Provide your detailed answer</label>
          <textarea
            id="answer"
            rows={5}
            className="block w-full focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent sm:text-base border border-theme-border/70 rounded-xl p-4 transition-shadow shadow-sm outline-none resize-none bg-white placeholder-theme-text-muted"
            placeholder="Write a clear, detailed explanation..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-5 py-2.5 border border-theme-border shadow-sm text-sm font-semibold rounded-xl text-theme-text bg-white hover:bg-theme-bg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-theme-accent hover:bg-theme-accent-hover shadow-sm transition-colors"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Answer'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default AnswerForm;
