const KnowledgeEntry = require('../models/KnowledgeEntry');
const Doubt = require('../models/Doubt');

/**
 * Pure MongoDB retrieval-based AI service.
 * No external API calls — uses text search + scoring to find the best
 * matching knowledge base entries and resolved doubts, then combines
 * them into a structured answer.
 */

// Retrieve the top matching knowledge entries for a question
async function retrieveContext(question, subjectHint = '') {
  const results = [];

  // 1. Search the knowledge base using MongoDB $text
  try {
    const kbResults = await KnowledgeEntry.find(
      { $text: { $search: question } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .lean();

    for (const entry of kbResults) {
      results.push({
        source: 'knowledge_base',
        question: entry.question,
        answer: entry.answer,
        subject: entry.subject,
        score: entry.score,
      });
    }
  } catch (err) {
    console.error('KB text search failed:', err.message);
  }

  // 2. Also search resolved doubts for crowd-sourced answers
  try {
    const resolvedResults = await Doubt.find(
      { $text: { $search: question }, status: 'RESOLVED', answer: { $ne: '' } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(3)
      .populate('subjectId', 'subjectName')
      .lean();

    for (const doubt of resolvedResults) {
      results.push({
        source: 'resolved_doubt',
        question: doubt.title,
        answer: doubt.answer,
        subject: doubt.subjectId?.subjectName || 'General',
        score: doubt.score * 0.8, // Slight penalty vs curated KB
      });
    }
  } catch (err) {
    console.error('Resolved doubt search failed:', err.message);
  }

  // Sort all results by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 5);
}

// Calculate confidence level from retrieval scores
function calculateConfidence(contexts) {
  if (!contexts || contexts.length === 0) return 'none';
  const topScore = contexts[0]?.score || 0;
  if (topScore >= 3) return 'high';
  if (topScore >= 1.5) return 'medium';
  if (topScore >= 0.5) return 'low';
  return 'none';
}

// Generate an AI answer by combining retrieved context
async function generateAnswer(question, subjectName = '') {
  try {
    const contexts = await retrieveContext(question, subjectName);
    const confidence = calculateConfidence(contexts);

    if (confidence === 'none' || contexts.length === 0) {
      return {
        answer: "Sorry, I couldn't find a relevant answer in our knowledge base for this question. A faculty member will be able to provide a detailed answer soon.",
        confidence: 'none',
        sources: [],
      };
    }

    // Build a composite answer from the best matching entries
    const primaryMatch = contexts[0];
    let compositeAnswer = '';

    // Use the top match as the primary answer
    compositeAnswer += primaryMatch.answer;

    // If there are additional relevant matches, add supplementary info
    const supplementary = contexts.slice(1, 3).filter(c => c.score >= 1.0);
    if (supplementary.length > 0) {
      compositeAnswer += '\n\n━━━ Related Information ━━━\n\n';
      for (const ctx of supplementary) {
        compositeAnswer += `📌 ${ctx.question}\n${ctx.answer}\n\n`;
      }
    }

    const sources = contexts.slice(0, 3).map(c => ({
      question: c.question,
      subject: c.subject,
      source: c.source === 'resolved_doubt' ? 'Previously Resolved' : 'Knowledge Base',
    }));

    return {
      answer: compositeAnswer.trim(),
      confidence,
      sources,
    };
  } catch (error) {
    console.error('AI answer generation failed:', error);
    return {
      answer: 'An error occurred while searching the knowledge base. Please try again.',
      confidence: 'none',
      sources: [],
    };
  }
}

module.exports = { generateAnswer, retrieveContext };
