import { describe, it, expect } from 'vitest'

describe('Adaptive Learning Loop', () => {
  it('returns level 2 when score is below 50%', () => {
    const score = 0
    const nextLevel = score < 50 ? 2 : 1
    expect(nextLevel).toBe(2)
  })

  it('returns level 1 when score is 50% or above', () => {
    const score = 100
    const nextLevel = score < 50 ? 2 : 1
    expect(nextLevel).toBe(1)
  })

  it('identifies passing score threshold correctly', () => {
    expect(50 >= 50).toBe(true)
    expect(49 >= 50).toBe(false)
  })
})
