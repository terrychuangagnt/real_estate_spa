/**
 * CITY_MAP / REVERSE_CITY_MAP 一致性測試
 */

import { describe, it, expect } from 'vitest'

// 模擬 landPrice.js 的 CITY_MAP
const CITY_MAP = {
  'a': '台北市', 'b': '台中市', 'c': '基隆市', 'd': '台南市',
  'e': '高雄市', 'f': '新北市', 'g': '宜蘭縣', 'h': '桃園市',
  'i': '嘉義市', 'j': '新竹縣', 'k': '苗栗縣', 'm': '南投縣',
  'n': '彰化縣', 'o': '新竹市', 'p': '雲林縣', 'q': '嘉義縣',
  't': '屏東縣', 'u': '花蓮縣', 'v': '台東縣', 'w': '金門縣',
  'x': '澎湖縣'
}

const REVERSE_CITY_MAP = Object.fromEntries(
  Object.entries(CITY_MAP).map(([k, v]) => [v, k])
)

describe('CITY_MAP consistency', () => {
  it('should have exactly 21 cities', () => {
    expect(Object.keys(CITY_MAP).length).toBe(21)
  })

  it('all city codes should be unique single letters', () => {
    const codes = Object.keys(CITY_MAP)
    const uniqueCodes = [...new Set(codes)]
    expect(uniqueCodes.length).toBe(21)
    expect(codes.every(c => c.length === 1)).toBe(true)
  })

  it('all city codes should be unique single letters', () => {
    const codes = Object.keys(CITY_MAP).sort()
    const uniqueCodes = [...new Set(codes)]
    expect(codes.length).toBe(21)
    expect(codes).toEqual(uniqueCodes)
    expect(codes).toContain('a')
    expect(codes).toContain('x')
    // 'l' is not used (no city for 'l')
    expect(codes).not.toContain('l')
  })

  it('should include key city names', () => {
    expect(CITY_MAP['a']).toBe('台北市')
    expect(CITY_MAP['b']).toBe('台中市')
    expect(CITY_MAP['f']).toBe('新北市')
    expect(CITY_MAP['h']).toBe('桃園市')
    expect(CITY_MAP['w']).toBe('金門縣')
    expect(CITY_MAP['x']).toBe('澎湖縣')
  })
})

describe('REVERSE_CITY_MAP consistency', () => {
  it('should map all city names back to codes', () => {
    for (const [code, name] of Object.entries(CITY_MAP)) {
      expect(REVERSE_CITY_MAP[name]).toBe(code)
    }
  })

  it('bidirectional mapping should be consistent', () => {
    for (const [code, name] of Object.entries(CITY_MAP)) {
      expect(REVERSE_CITY_MAP[name]).toBe(code)
      expect(CITY_MAP[REVERSE_CITY_MAP[name]]).toBe(name)
    }
  })

  it('should have same number of keys as CITY_MAP', () => {
    expect(Object.keys(REVERSE_CITY_MAP).length).toBe(21)
  })

  it('no duplicate city names', () => {
    const names = Object.values(CITY_MAP)
    const uniqueNames = [...new Set(names)]
    expect(uniqueNames.length).toBe(21)
  })
})
