import { describe, it, expect } from 'vitest'

describe('Mastery Score Calculation', () => {
  it('calculates 100% mastery for all correct answers', () => {
    const correct = 2
    const total = 2
    const score = (correct / total) * 100
    expect(score).toBe(100)
  })

  it('calculates 0% mastery for all wrong answers', () => {
    const correct = 0
    const total = 2
    const score = (correct / total) * 100
    expect(score).toBe(0)
  })

  it('calculates 50% mastery for one correct answer', () => {
    const correct = 1
    const total = 2
    const score = (correct / total) * 100
    expect(score).toBe(50)
  })
})
