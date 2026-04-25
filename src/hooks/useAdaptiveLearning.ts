import { useState, useCallback } from 'react';
import { Explanation, QuizQuestion } from '../shared/types';

const USE_MOCK = false;

const MOCK_EXPLANATION_L1: Explanation = {
  topic: 'Recursion',
  level: 'L1',
  content: "Imagine a set of Russian Matryoshka dolls. You open the biggest one, and inside is a slightly smaller one. You open that, and there's an even smaller one inside. This continues until you reach the tiniest doll that can't be opened anymore. Recursion in programming is just like this! A function calls itself to solve a smaller version of the same problem, until it reaches a 'base case' (the tiniest doll) where it stops and returns the result.",
};

const MOCK_EXPLANATION_L2: Explanation = {
  topic: 'Recursion',
  level: 'L2',
  content: "Let's go deeper into Recursion. In memory, each time a function calls itself, it adds a new frame to the call stack. This means every 'doll' takes up space. If you forget your base case (the smallest doll), you'll keep adding frames until the stack overflows! Real-world example: traversing a file system hierarchy where each folder can contain more folders. You write a function `explore(folder)` that loops through items, and if an item is a folder, it calls `explore(item)`.",
};

const MOCK_QUIZ: QuizQuestion[] = [
  {
    question: "What is the base case in recursion?",
    options: ["The first call", "The condition that stops recursion", "The return value", "The function name"],
    correct: "b"
  },
  {
    question: "Which analogy best describes recursion?",
    options: ["A straight road", "A circle", "Russian dolls", "A triangle"],
    correct: "c"
  }
];

export const useAdaptiveLearning = () => {
  const [topic, setTopic] = useState<string>('');
  const [level, setLevel] = useState<'L1' | 'L2'>('L1');
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [masteryScore, setMasteryScore] = useState<number | null>(null);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopic = useCallback(async (newTopic: string, requestedLevel: 'L1' | 'L2' = 'L1') => {
    setIsLoading(true);
    setError(null);
    setTopic(newTopic);
    setLevel(requestedLevel);
    setScore(null);
    setMasteryScore(null);
    setRelatedTopics([]);

    try {
      if (USE_MOCK) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setExplanation(requestedLevel === 'L1' ? MOCK_EXPLANATION_L1 : MOCK_EXPLANATION_L2);
        setQuiz(MOCK_QUIZ);
      } else {
        // Live API calls
        const expRes = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: newTopic, level: requestedLevel })
        });
        if (!expRes.ok) throw new Error('Failed to fetch explanation');
        const expData = await expRes.json();
        setExplanation(expData);

        const quizRes = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: newTopic, level: requestedLevel })
        });
        if (!quizRes.ok) throw new Error('Failed to fetch quiz');
        const quizData = await quizRes.json();
        setQuiz(quizData);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitQuiz = useCallback(async (answers: string[]) => {
    if (!quiz) return;
    setIsLoading(true);

    try {
      let correctCount = 0;
      quiz.forEach((q, index) => {
        if (answers[index] === q.correct) correctCount++;
      });
      const calculatedScore = (correctCount / quiz.length) * 100;
      setScore(calculatedScore);

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setMasteryScore(75);
        if (calculatedScore >= 50) {
          setRelatedTopics(['Dynamic Programming', 'Trees and Graphs']);
        }
      } else {
        // Send mastery update
        const masteryRes = await fetch('/api/mastery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicName: topic,
            levelReached: level,
            masteryScore: calculatedScore
          })
        });
        if (!masteryRes.ok) throw new Error('Failed to update mastery');
        const masteryData = await masteryRes.json();
        setMasteryScore(masteryData.masteryScore);

        if (calculatedScore >= 50) {
          setRelatedTopics(['Dynamic Programming', 'Trees and Graphs']); // Mocking related topics for now
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting quiz');
    } finally {
      setIsLoading(false);
    }
  }, [quiz, topic, level]);

  const goDeeper = useCallback(() => {
    fetchTopic(topic, 'L2');
  }, [fetchTopic, topic]);

  return {
    topic,
    level,
    explanation,
    quiz,
    score,
    masteryScore,
    relatedTopics,
    isLoading,
    error,
    fetchTopic,
    submitQuiz,
    goDeeper
  };
};
