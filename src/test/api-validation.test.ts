import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const ExplainSchema = z.object({
  topic: z.string().min(1),
  level: z.union([z.literal(1), z.literal(2)]),
})

const QuizSchema = z.object({
  explanation: z.string().min(1),
})

describe('API Input Validation', () => {
  it('validates explain route input correctly', () => {
    const valid = ExplainSchema.safeParse(
      { topic: 'recursion', level: 1 }
    )
    expect(valid.success).toBe(true)
  })

  it('rejects invalid level value', () => {
    const invalid = ExplainSchema.safeParse(
      { topic: 'recursion', level: 3 }
    )
    expect(invalid.success).toBe(false)
  })

  it('validates quiz route input correctly', () => {
    const valid = QuizSchema.safeParse(
      { explanation: 'Recursion is like Russian dolls.' }
    )
    expect(valid.success).toBe(true)
  })

  it('rejects empty explanation', () => {
    const invalid = QuizSchema.safeParse({ explanation: '' })
    expect(invalid.success).toBe(false)
  })
})
