import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, ThumbsUp, ThumbsDown, RefreshCw, ChevronDown, ChevronUp, AlertCircle, Zap, BookOpen } from 'lucide-react';
import API from '../services/api';

const confidenceConfig = {
  high:   { label: 'High Confidence',   bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', icon: '🟢' },
  medium: { label: 'Medium Confidence', bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: '🟡' },
  low:    { label: 'Low Confidence',    bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', icon: '🟠' },
  none:   { label: 'No Match Found',    bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '🔴' },
};

const AIAnswerCard = ({ 
  doubtId, 
  question, 
  subjectName,
  aiAnswer: existingAnswer,
  aiConfidence: existingConfidence,
  aiFeedback: existingFeedback,
  compact = false,
  onAnswerGenerated 
}) => {
  const [answer, setAnswer] = useState(existingAnswer || '');
  const [confidence, setConfidence] = useState(existingConfidence || '');
  const [sources, setSources] = useState([]);
  const [feedback, setFeedback] = useState(existingFeedback || null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const [error, setError] = useState('');

  const fetchAIAnswer = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/ai/answer', {
        question: question,
        doubtId: doubtId,
        subjectName: subjectName || '',
      });
      if (data.success) {
        setAnswer(data.data.answer);
        setConfidence(data.data.confidence);
        setSources(data.data.sources || []);
        if (onAnswerGenerated) onAnswerGenerated(data.data);
      }
    } catch (err) {
      setError('Failed to generate AI answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (type) => {
    if (!doubtId) return;
    setFeedback(type);
    try {
      await API.post('/ai/feedback', { doubtId, feedback: type });
    } catch (err) {
      console.error('Feedback submission failed');
    }
  };

  const conf = confidenceConfig[confidence] || confidenceConfig.none;

  // No answer yet — show the "Get AI Help" button
  if (!answer && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #f0f7ff 0%, #f8f4ff 100%)',
          borderRadius: 14,
          border: '1px dashed #c7d2fe',
          padding: compact ? '14px 18px' : '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        whileHover={{ scale: 1.005, borderColor: '#818cf8' }}
        onClick={fetchAIAnswer}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
          }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>
              Get AI Suggested Answer
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              Search our knowledge base for an instant answer
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', fontSize: 13, fontWeight: 700,
          boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
        }}>
          <Sparkles size={14} /> Ask AI
        </div>
      </motion.div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          borderRadius: 14,
          border: '1px solid #e0e7ff',
          background: 'linear-gradient(135deg, #f0f7ff 0%, #f8f4ff 100%)',
          padding: 24,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Bot size={18} color="#fff" />
          </motion.div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>
              AI is searching the knowledge base...
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              Finding the most relevant answers for your question
            </p>
          </div>
        </div>
        {/* Skeleton lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[100, 85, 92, 60].map((w, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              style={{
                height: 14, borderRadius: 6, width: `${w}%`,
                background: 'linear-gradient(90deg, #e0e7ff 25%, #c7d2fe 50%, #e0e7ff 75%)',
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Answer displayed
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        borderRadius: 14,
        border: '1px solid #e0e7ff',
        background: '#fff',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(99,102,241,0.06)',
      }}
    >
      {/* Header */}
      <div
        onClick={() => compact && setExpanded(!expanded)}
        style={{
          padding: '14px 20px',
          background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)',
          borderBottom: expanded ? '1px solid #e0e7ff' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: compact ? 'pointer' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
          }}>
            <Bot size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#312e81', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            AI Suggested Answer
          </span>
          {/* Confidence badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 6,
            background: conf.bg, color: conf.color,
            border: `1px solid ${conf.border}`,
            fontSize: 11, fontWeight: 700,
          }}>
            {conf.icon} {conf.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Regenerate button */}
          <button
            onClick={(e) => { e.stopPropagation(); fetchAIAnswer(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px', borderRadius: 6,
              background: '#f3f4f6', border: '1px solid #e5e7eb',
              fontSize: 11, fontWeight: 600, color: '#6b7280',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; }}
          >
            <RefreshCw size={12} /> Retry
          </button>
          {compact && (expanded ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />)}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={compact ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Answer text */}
            <div style={{ padding: '20px 24px' }}>
              {error ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: 14 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              ) : (
                <div style={{
                  fontSize: 14, lineHeight: 1.75, color: '#374151',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {answer}
                </div>
              )}
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div style={{
                padding: '12px 24px',
                borderTop: '1px solid #f3f4f6',
                background: '#fafafe',
              }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Sources Referenced
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {sources.map((s, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 6,
                      background: '#f3f4f6', border: '1px solid #e5e7eb',
                      fontSize: 11, color: '#6b7280', fontWeight: 500,
                    }}>
                      <BookOpen size={10} /> {s.subject} — {s.source}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer — Disclaimer + Feedback */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid #f3f4f6',
              background: '#fafafe',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12,
            }}>
              {/* Disclaimer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af', fontSize: 11 }}>
                <Zap size={12} />
                <span>AI-generated from knowledge base. Faculty verification recommended.</span>
              </div>

              {/* Feedback */}
              {doubtId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', marginRight: 4 }}>Was this helpful?</span>
                  <button
                    onClick={() => submitFeedback('helpful')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 6,
                      background: feedback === 'helpful' ? '#ecfdf5' : '#f9fafb',
                      border: `1px solid ${feedback === 'helpful' ? '#a7f3d0' : '#e5e7eb'}`,
                      color: feedback === 'helpful' ? '#059669' : '#6b7280',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <ThumbsUp size={12} /> Yes
                  </button>
                  <button
                    onClick={() => submitFeedback('not_helpful')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 6,
                      background: feedback === 'not_helpful' ? '#fef2f2' : '#f9fafb',
                      border: `1px solid ${feedback === 'not_helpful' ? '#fecaca' : '#e5e7eb'}`,
                      color: feedback === 'not_helpful' ? '#dc2626' : '#6b7280',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <ThumbsDown size={12} /> No
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIAnswerCard;
