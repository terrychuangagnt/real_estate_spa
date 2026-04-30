/**
 * 日期與價格格式化單元測試
 * 基於 src/api/landPrice.js 的 formatDate, formatPrice 等函數
 */

import { describe, it, expect } from 'vitest'

// 模擬 landPrice.js 的 formatDate 函數
function formatDate(dateStr) {
  if (!dateStr) return ''
  if (dateStr.length === 7) {
    return `${dateStr.substring(0, 3)}/${dateStr.substring(3, 5)}/${dateStr.substring(5, 7)}`
  }
  if (dateStr.length === 8) {
    return `${dateStr.substring(0, 4)}/${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`
  }
  return dateStr
}

// 模擬 landPrice.js 的 formatPrice 函數
function formatPrice(value) {
  if (value === null || value === undefined || value === 0) return '0'
  return Math.round(value).toLocaleString()
}

// 模擬 transformRecord 的 transform 邏輯
function transformRecord(row) {
  return {
    totalPrice: row.total_price ? parseFloat(row.total_price) / 10000 : 0,
    totalPriceDisplay: row.total_price ? Math.round(parseFloat(row.total_price) / 10000).toLocaleString() : '0',
    unitPrice: row.unit_price_sqm ? parseFloat(row.unit_price_sqm) * 3.306 / 10000 : 0,
    unitPriceDisplay: row.unit_price_sqm ? Math.round(parseFloat(row.unit_price_sqm) * 3.306 / 10000).toLocaleString() : '0',
    district: row.district || '',
    transactionType: row.transaction_type || '',
    cityCode: row.city_code || '',
    hasParking: row.parking_price > 0,
  }
}

describe('formatDate', () => {
  it('should handle 7-digit R.O.C. date format', () => {
    expect(formatDate('1150306')).toBe('115/03/06')
    expect(formatDate('1140101')).toBe('114/01/01')
    expect(formatDate('0121225')).toBe('012/12/25')
  })

  it('should handle 8-digit full year date format', () => {
    expect(formatDate('20240306')).toBe('2024/03/06')
    expect(formatDate('19110101')).toBe('1911/01/01')
    expect(formatDate('20251231')).toBe('2025/12/31')
  })

  it('should handle null/undefined/empty', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('')).toBe('')
  })

  it('should return unmodified string for unexpected length', () => {
    expect(formatDate('2024-03-06')).toBe('2024-03-06')
    expect(formatDate('2024/03/06')).toBe('2024/03/06')
  })

  it('should handle single digit month/day padding', () => {
    expect(formatDate('1150101')).toBe('115/01/01')
  })
})

describe('formatPrice', () => {
  it('should format positive numbers with thousand separators', () => {
    expect(formatPrice(12345.67)).toBe('12,346')
    expect(formatPrice(1000)).toBe('1,000')
    expect(formatPrice(999999)).toBe('999,999')
  })

  it('should handle 0', () => {
    expect(formatPrice(0)).toBe('0')
  })

  it('should handle null/undefined', () => {
    expect(formatPrice(null)).toBe('0')
    expect(formatPrice(undefined)).toBe('0')
  })

  it('should round fractional prices', () => {
    expect(formatPrice(1234.49)).toBe('1,234')
    expect(formatPrice(1234.51)).toBe('1,235')
  })

  it('should handle single digit', () => {
    expect(formatPrice(5)).toBe('5')
  })
})

describe('transformRecord', () => {
  it('should transform complete record', () => {
    const row = {
      city_code: 'f',
      district: '信義區',
      transaction_type: '買賣',
      total_price: 33060000,
      unit_price_sqm: 1000000,
      parking_price: 1500000,
    }
    const result = transformRecord(row)
    
    expect(result.totalPrice).toBe(3306)
    expect(result.totalPriceDisplay).toBe('3,306')
    expect(result.unitPrice).toBe(330.6)
    expect(result.unitPriceDisplay).toBe('331')
    expect(result.district).toBe('信義區')
    expect(result.transactionType).toBe('買賣')
    expect(result.cityCode).toBe('f')
    expect(result.hasParking).toBe(true)
  })

  it('should handle missing values', () => {
    const row = {
      city_code: 'h',
      transaction_type: '租賃',
    }
    const result = transformRecord(row)
    
    expect(result.totalPrice).toBe(0)
    expect(result.totalPriceDisplay).toBe('0')
    expect(result.unitPrice).toBe(0)
    expect(result.hasParking).toBe(false)
    expect(result.district).toBe('')
  })

  it('should handle zero price', () => {
    const row = {
      city_code: 'a',
      total_price: 0,
      unit_price_sqm: 0,
      parking_price: 0,
    }
    const result = transformRecord(row)
    
    expect(result.totalPrice).toBe(0)
    expect(result.totalPriceDisplay).toBe('0')
  })

  it('should convert sqm to 萬/坪 correctly', () => {
    // 1000 元/sqm * 3.306 / 10000 = 0.3306 萬/坪
    const row = { unit_price_sqm: 1000 }
    const result = transformRecord(row)
    expect(result.unitPrice).toBeCloseTo(0.3306, 4)
  })
})
