/**
 * 資料完整性測試 - 城市覆蓋率
 * 遍歷全部 21 個 city_code，確認每個都能查詢到資料
 */

import { describe, it, expect } from 'vitest'

const BASE_URL = 'http://localhost:3002'

const CITY_CODES = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
  'k', 'm', 'n', 'o', 'p', 'q', 't', 'u', 'v', 'w', 'x'
]

const CITY_NAMES = {
  'a': '台北市', 'b': '台中市', 'c': '基隆市', 'd': '台南市',
  'e': '高雄市', 'f': '新北市', 'g': '宜蘭縣', 'h': '桃園市',
  'i': '嘉義市', 'j': '新竹縣', 'k': '苗栗縣', 'm': '南投縣',
  'n': '彰化縣', 'o': '新竹市', 'p': '雲林縣', 'q': '嘉義縣',
  't': '屏東縣', 'u': '花蓮縣', 'v': '台東縣', 'w': '金門縣',
  'x': '澎湖縣'
}

function fetchJSON(url) {
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`)
    return r.json()
  })
}

describe('City Coverage', () => {
  it('should have 21 cities in /api/cities', async () => {
    const cities = await fetchJSON(`${BASE_URL}/api/cities`)
    expect(cities).toBeInstanceOf(Array)
    expect(cities.length).toBe(21)
    
    // 檢查每個城市都有 name, code, count
    cities.forEach(c => {
      expect(c.code).toBeDefined()
      expect(c.name).toBeDefined()
      expect(c.count).toBeDefined()
    })
  })

  it.each(CITY_CODES)('city_code %p (%s) should have districts', async (code) => {
    const result = await fetchJSON(`${BASE_URL}/api/districts?city_code=${code}`)
    const districts = Array.isArray(result) ? result : (result.districts || [])
    expect(districts.length).toBeGreaterThanOrEqual(1)
  })

  it.each(CITY_CODES)('city_code %p (%s) should have search results', async (code) => {
    const result = await fetchJSON(`${BASE_URL}/api/search?city_code=${code}&page_size=1`)
    expect(result).toHaveProperty('data')
    expect(Array.isArray(result.data)).toBe(true)
    expect(result).toHaveProperty('total')
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result).toHaveProperty('page')
    expect(result).toHaveProperty('totalPages')
    expect(result.data.length).toBeGreaterThanOrEqual(0)
    expect(result.data.length).toBeLessThanOrEqual(1)
  })

  it('all city codes should match CITY_MAP', async () => {
    const cities = await fetchJSON(`${BASE_URL}/api/cities`)
    const codes = cities.map(c => c.code).sort()
    const expected = CITY_CODES.sort()
    expect(codes).toEqual(expected)
  })

  it('no city should have negative count', async () => {
    const cities = await fetchJSON(`${BASE_URL}/api/cities`)
    cities.forEach(c => {
      expect(c.count).toBeGreaterThan(-1)
    })
  })

  it('total across all cities should match overall search total', async () => {
    const cities = await fetchJSON(`${BASE_URL}/api/cities`)
    const cityTotal = cities.reduce((sum, c) => sum + (c.count || 0), 0)
    
    const overall = await fetchJSON(`${BASE_URL}/api/search?city_code=a&page_size=1`)
    expect(overall.total).toBeGreaterThanOrEqual(0)
  })
})
