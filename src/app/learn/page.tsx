'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';

// Level badge color config
const levelStyle = {
  L1: {
    background: '#1a3a2a',
    color: '#00ff88',
    border: '#00ff88',
  },
  L2: {
    background: '#3a1a1a',
    color: '#ff6b6b',
    border: '#ff6b6b',
  },
};

function LearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get('topic') || '';
  
  const [searchInput, setSearchInput] = useState(initialTopic);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hasInitFetched, setHasInitFetched] = useState(false);
  
  const {
    topic,
    level,
    explanation,
    quiz,
    score,
    relatedTopics,
    isLoading,
    error,
    overlay,
    fetchTopic,
    submitQuiz,
    goDeeper
  } = useAdaptiveLearning();

  // Fetch initial topic from URL params once
  useEffect(() => {
    if (initialTopic && !topic && !hasInitFetched) {
      setHasInitFetched(true);
      fetchTopic(initialTopic);
    }
  }, [initialTopic, topic, hasInitFetched, fetchTopic]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setAnswers({});
    router.push(`/learn?topic=${encodeURIComponent(searchInput)}`);
    fetchTopic(searchInput);
  };

  const handleAnswerSelect = (qIndex: number, optionLetter: string) => {
    setAnswers(prev => ({ ...prev, [qIndex]: optionLetter }));
  };

  const handleQuizSubmit = () => {
    if (!quiz) return;
    const answerArray = quiz.map((_, i) => answers[i] || '');
    submitQuiz(answerArray);
  };

  const handleRelatedClick = (related: string) => {
    setSearchInput(related);
    setAnswers({});
    router.push(`/learn?topic=${encodeURIComponent(related)}`);
    fetchTopic(related);
  };

  // Strip backticks from question text
  const cleanText = (text: string) => text.replace(/`/g, '');

  const currentLevelStyle = levelStyle[level] || levelStyle.L1;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans flex flex-col items-center">

      {/* ── OVERLAYS ── */}
      <AnimatePresence>
        {overlay === 'deeper' && (
          <motion.div
            key="overlay-deeper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                style={{ fontSize: '3rem', marginBottom: '12px' }}
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                🧠
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ color: '#ff6b6b', fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}
              >
                Not quite yet...
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{ color: '#00ff88', fontSize: '1.5rem', fontWeight: 700 }}
              >
                Let&apos;s go deeper
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '8px' }}
              >
                Generating a clearer explanation for you...
              </motion.p>
              {/* Level badge transition */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, type: 'spring', stiffness: 300 }}
                style={{
                  marginTop: '20px', display: 'inline-block',
                  padding: '6px 20px', borderRadius: '999px',
                  background: levelStyle.L2.background,
                  color: levelStyle.L2.color,
                  border: `1px solid ${levelStyle.L2.border}`,
                  fontWeight: 700, fontSize: '0.85rem',
                  boxShadow: `0 0 20px ${levelStyle.L2.color}40`,
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Level 2
                </motion.span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {overlay === 'success' && (
          <motion.div
            key="overlay-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                style={{ fontSize: '4rem', marginBottom: '12px' }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
              >
                ✅
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ color: '#00ff88', fontSize: '1.8rem', fontWeight: 700 }}
              >
                Nailed it! 🎉
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '8px' }}
              >
                Unlocking next concepts...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-3xl mt-12 flex flex-col gap-8">
        
        <header className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">What do you want to learn?</h1>
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              role="searchbox"
              aria-label="Enter a topic to learn"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Try: recursion, photosynthesis, GST..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-[#00ff88] transition-colors"
            />
            <button
              type="submit"
              aria-label="Start learning about this topic"
              disabled={isLoading || !searchInput.trim()}
              className="absolute right-2 top-2 bottom-2 bg-[#00ff88] text-black px-6 rounded-lg font-medium hover:bg-[#00cc6a] disabled:opacity-50 transition-colors"
            >
              {isLoading && !explanation ? 'Loading...' : 'Learn'}
            </button>
          </form>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </header>

        {/* ── EXPLANATION CARD ── */}
        <AnimatePresence mode="wait">
          {explanation && (
            <motion.div
              key={`explanation-${explanation.level}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
              role="article"
              aria-label={`Level ${explanation.level.replace('L', '')} explanation`}
              aria-live="polite"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold capitalize">{explanation.topic}</h2>
                <motion.span
                  key={`badge-${explanation.level}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  aria-label={`Current difficulty level ${explanation.level.replace('L', '')}`}
                  style={{
                    padding: '4px 14px',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: (levelStyle[explanation.level as 'L1' | 'L2'] || levelStyle.L1).background,
                    color: (levelStyle[explanation.level as 'L1' | 'L2'] || levelStyle.L1).color,
                    border: `1px solid ${(levelStyle[explanation.level as 'L1' | 'L2'] || levelStyle.L1).border}`,
                    boxShadow: `0 0 12px ${(levelStyle[explanation.level as 'L1' | 'L2'] || levelStyle.L1).color}30`,
                  }}
                >
                  Level {explanation.level.replace('L', '')}
                </motion.span>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                {explanation.content}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── QUIZ SECTION ── */}
        <AnimatePresence mode="wait">
          {quiz && score === null && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
              role="form"
              aria-label="Comprehension quiz"
              aria-live="polite"
            >
              <h3 className="text-xl font-semibold mb-6">Test your understanding</h3>
              <div className="space-y-8">
                {quiz.map((q, i) => {
                  const options = [
                    { id: 'a', text: q.options[0] },
                    { id: 'b', text: q.options[1] },
                    { id: 'c', text: q.options[2] },
                    { id: 'd', text: q.options[3] },
                  ];
                  return (
                    <fieldset key={i} className="flex flex-col gap-3 border-none p-0 m-0">
                      <legend className="font-medium text-lg mb-2">{i + 1}. {cleanText(q.question)}</legend>
                      <div className="flex flex-col gap-2">
                        {options.map((opt) => (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-colors ${
                              answers[i] === opt.id
                                ? 'bg-[#00ff88]/10 border-[#00ff88]'
                                : 'bg-black/20 border-white/10 hover:border-white/30'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${i}`}
                              value={opt.id}
                              checked={answers[i] === opt.id}
                              onChange={() => handleAnswerSelect(i, opt.id)}
                              className="w-4 h-4 text-[#00ff88] focus:ring-[#00ff88] border-gray-600 bg-gray-700"
                            />
                            <span className="text-gray-200">{cleanText(opt.text)}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
              <button
                onClick={handleQuizSubmit}
                aria-label="Submit quiz answers"
                disabled={isLoading || Object.keys(answers).length !== quiz.length}
                className="mt-8 w-full bg-[#00ff88] text-black font-bold py-4 rounded-xl hover:bg-[#00cc6a] disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Checking...' : 'Submit Quiz'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESULT SECTION ── */}
        <AnimatePresence mode="wait">
          {score !== null && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-8 rounded-2xl border flex flex-col items-center text-center ${
                score >= 50 ? 'bg-[#00ff88]/10 border-[#00ff88]/30' : 'bg-[#ff6b6b]/10 border-[#ff6b6b]/30'
              }`}
              aria-live="polite"
            >
              <h3 className="text-2xl font-bold mb-2">
                {score >= 50 ? 'Great job! 🎉' : "Let's go deeper 🧠"}
              </h3>
              <p className="text-gray-300 mb-6">
                You scored {score.toFixed(0)}% on this quiz.
              </p>
              
              {score >= 50 ? (
                <div className="w-full">
                  <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Explore Related Concepts</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {relatedTopics.map(rt => (
                      <button
                        key={rt}
                        onClick={() => handleRelatedClick(rt)}
                        aria-label={`Learn about related topic: ${rt}`}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm font-medium transition-colors"
                      >
                        {rt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAnswers({});
                    goDeeper();
                  }}
                  aria-label="Go to Level 2"
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl font-medium transition-colors"
                  style={{
                    background: levelStyle.L2.color,
                    color: '#fff',
                  }}
                >
                  {isLoading ? 'Loading...' : 'Deep Dive → Level 2'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </main>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>}>
      <LearnContent />
    </Suspense>
  );
}
