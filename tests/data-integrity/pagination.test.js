/**
 * 分頁測試
 * 驗證不同分頁大小與頁碼的資料一致性
 */

import { describe, it, expect } from 'vitest'

const BASE_URL = 'http://localhost:3002'

function fetchJSON(url) {
  return fetch(url).then(r => r.json())
}

describe('Pagination integrity', () => {
  it('should return consistent total across multiple queries', async () => {
    const t1 = await fetchJSON(`${BASE_URL}/api/search?city_code=f&page_size=10`)
    const t2 = await fetchJSON(`${BASE_URL}/api/search?city_code=f&page_size=5`)
    const t3 = await fetchJSON(`${BASE_URL}/api/search?city_code=f&page_size=20`)
    
    expect(t1.total).toBe(t2.total)
    expect(t1.total).toBe(t3.total)
  })

  it('page 2 data should not overlap page 1', async () => {
    const page1 = await fetchJSON(`${BASE_URL}/api/search?city_code=f&page=1&page_size=10`)
    const page2 = await fetchJSON(`${BASE_URL}/api/search?city_code=f&page=2&page_size=10`)
    
    // 第 1 頁的最後一筆應該與第 2 頁的第一筆不同
    if (page1.data.length > 0 && page2.data.length > 0) {
      const lastOfPage1 = page1.data[page1.data.length - 1]
      const firstOfPage2 = page2.data[0]
      // 確保有足夠資料做比對
      expect(page1.total).toBeGreaterThanOrEqual(10)
      // 使用 search_id 或 trade_date 區分 (id 欄位用於記錄比對)
      expect(page1.data.some(r => r.id !== undefined)).toBe(true)
      expect(lastOfPage1.id).not.toBe(firstOfPage2.id)
    }
  })

  it('total should be enough pages for page_size=N', async () => {
    for (const size of [5, 10, 20, 50]) {
      const result = await fetchJSON(`${BASE_URL}/api/search?city_code=f&page_size=${size}`)
      const expectedPages = Math.ceil(result.total / size)
      expect(result.totalPages).toBeGreaterThanOrEqual(expectedPages - 1)
    }
  })

  it('max page should still return valid response', async () => {
    const result = await fetchJSON(`${BASE_URL}/api/search?city_code=f&page_size=10`)
    const maxPage = Math.max(1, result.totalPages)
    
    const response = await fetchJSON(`${BASE_URL}/api/search?city_code=f&page=${maxPage}&page_size=10`)
    expect(response.data).toBeDefined()
    expect(response.totalPages).toBe(result.totalPages)
  })
})
