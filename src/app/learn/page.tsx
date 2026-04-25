'use client';

import { useState, FormEvent, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';

function LearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get('topic') || '';
  
  const [searchInput, setSearchInput] = useState(initialTopic);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const {
    topic,
    level,
    explanation,
    quiz,
    score,
    relatedTopics,
    isLoading,
    error,
    fetchTopic,
    submitQuiz,
    goDeeper
  } = useAdaptiveLearning();

  // If there's an initial topic in URL but we haven't fetched it yet
  useState(() => {
    if (initialTopic && !topic) {
      fetchTopic(initialTopic);
    }
  });

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

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans flex flex-col items-center">
      <div className="w-full max-w-3xl mt-12 flex flex-col gap-8">
        
        <header className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">What do you want to learn?</h1>
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Try: recursion, photosynthesis, GST..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-[#00ff88] transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !searchInput.trim()}
              className="absolute right-2 top-2 bottom-2 bg-[#00ff88] text-black px-6 rounded-lg font-medium hover:bg-[#00cc6a] disabled:opacity-50 transition-colors"
            >
              {isLoading && !explanation ? 'Loading...' : 'Learn'}
            </button>
          </form>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </header>

        <AnimatePresence mode="wait">
          {explanation && (
            <motion.div
              key="explanation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold capitalize">{explanation.topic}</h2>
                <span className="px-3 py-1 bg-[#00ff88]/20 text-[#00ff88] rounded-full text-sm font-bold border border-[#00ff88]/30">
                  Level {explanation.level.replace('L', '')}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                {explanation.content}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {quiz && score === null && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
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
                    <div key={i} className="flex flex-col gap-3">
                      <p className="font-medium text-lg">{i + 1}. {q.question}</p>
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
                            <span className="text-gray-200">{opt.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleQuizSubmit}
                disabled={isLoading || Object.keys(answers).length !== quiz.length}
                className="mt-8 w-full bg-[#00ff88] text-black font-bold py-4 rounded-xl hover:bg-[#00cc6a] disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Checking...' : 'Submit Quiz'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {score !== null && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-8 rounded-2xl border flex flex-col items-center text-center ${
                score >= 50 ? 'bg-[#00ff88]/10 border-[#00ff88]/30' : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">
                {score >= 50 ? 'Great job!' : "Let's go deeper"}
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
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Deep Dive (Level 2)'}
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
