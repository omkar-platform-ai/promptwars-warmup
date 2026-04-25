import { z } from 'zod';

export const TopicSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
});

export type Topic = z.infer<typeof TopicSchema>;

export const ExplanationSchema = z.object({
  topic: z.string(),
  level: z.enum(['L1', 'L2']),
  content: z.string(),
});

export type Explanation = z.infer<typeof ExplanationSchema>;

export const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correct: z.enum(['a', 'b', 'c', 'd']),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizResponseSchema = z.array(QuizQuestionSchema);

export type QuizResponse = z.infer<typeof QuizResponseSchema>;

export const MasteryRecordSchema = z.object({
  userId: z.string(),
  topicName: z.string(),
  levelReached: z.enum(['L1', 'L2']),
  masteryScore: z.number().min(0).max(100),
  timestamp: z.string(), // ISO date string
});

export type MasteryRecord = z.infer<typeof MasteryRecordSchema>;
