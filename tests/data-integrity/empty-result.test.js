/**
 * 極端條件測試 - 空結果
 * 測試各種極端條件下的錯誤處理
 */

import { describe, it, expect } from 'vitest'

const BASE_URL = 'http://localhost:3002'

function fetchJSON(url) {
  return fetch(url).then(r => r.json())
}

describe('Empty result edge cases', () => {
  it('should handle non-existent district gracefully', async () => {
    const result = await fetchJSON(`${BASE_URL}/api/search?city_code=f&district=不存在的區&page_size=5`)
    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('should handle empty string parameters', async () => {
    const result = await fetchJSON(`${BASE_URL}/api/search?city_code=f&page_size=0`)
    expect(result).toHaveProperty('data')
  })

  it('should handle large page number', async () => {
    const result = await fetchJSON(`${BASE_URL}/api/search?city_code=f&page=999999&page_size=10`)
    expect(result.data).toBeDefined()
  })

  it('should handle missing city_code in search', async () => {
    const result = await fetchJSON(`${BASE_URL}/api/search?page_size=5`)
    expect(result).toHaveProperty('data')
  })
})
