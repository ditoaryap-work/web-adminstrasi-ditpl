import { describe, it, expect } from 'vitest'
import { formatIndoDate, formatSmartDateRange } from './date'

describe('Date Utilities', () => {
  describe('formatIndoDate', () => {
    it('returns "-" for empty string', () => {
      expect(formatIndoDate('')).toBe('-')
    })

    it('returns original string for invalid date', () => {
      expect(formatIndoDate('invalid-date')).toBe('invalid-date')
    })
  })

  describe('formatSmartDateRange', () => {
    it('formats same month and year correctly', () => {
      expect(formatSmartDateRange('2026-04-01', '2026-04-03')).toBe('1 s/d 3 April 2026')
    })

    it('formats same day correctly', () => {
      expect(formatSmartDateRange('2026-04-03', '2026-04-03')).toBe('3 April 2026')
    })

    it('formats different month, same year correctly', () => {
      expect(formatSmartDateRange('2026-03-28', '2026-04-03')).toBe('28 Maret s/d 3 April 2026')
    })

    it('formats different year correctly', () => {
      expect(formatSmartDateRange('2025-12-28', '2026-01-03')).toBe('28 Desember 2025 s/d 3 Januari 2026')
    })
    
    it('returns original string if dates are invalid', () => {
      expect(formatSmartDateRange('abc', 'def')).toBe('abc s/d def')
    })
    
    it('handles one missing date correctly', () => {
      expect(formatSmartDateRange('2026-01-01', '')).toBe('1 Jan 2026 s/d -')
    })
  })
})
