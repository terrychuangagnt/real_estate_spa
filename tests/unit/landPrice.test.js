/**
 * landPrice API 單元測試
 * 測試 getCities、getDistricts、searchLandPrice 三個函數
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCities, getDistricts, searchLandPrice } from '../../src/api/landPrice.js'

// Helper：建立 mock fetch，預設回傳 ok=true
function mockFetch(data, ok = true) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => data,
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─────────────────────────────────────────────────────────────────────────────
// getCities
// ─────────────────────────────────────────────────────────────────────────────
describe('getCities()', () => {
  it('成功時解析並回傳 name / code / count 陣列', async () => {
    mockFetch([
      { name: '台北市', code: 'a', count: 100 },
      { name: '台中市', code: 'b', count: 80 },
    ])

    const result = await getCities()

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ name: '台北市', code: 'a', count: 100 })
    expect(result[1]).toEqual({ name: '台中市', code: 'b', count: 80 })
  })

  it('API 回傳非陣列格式（物件）時，直接回傳該物件而不拋錯', async () => {
    const nonArray = { cities: [{ name: '台北市', code: 'a', count: 1 }] }
    mockFetch(nonArray)

    const result = await getCities()

    // 非陣列時走 `return data || []` 分支
    expect(result).toEqual(nonArray)
  })

  it('fetch 失敗（HTTP 500）時回傳空陣列', async () => {
    mockFetch(null, false)

    const result = await getCities()

    expect(result).toEqual([])
  })

  it('fetch 本身 reject 時回傳空陣列', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Error')))

    const result = await getCities()

    expect(result).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// getDistricts
// ─────────────────────────────────────────────────────────────────────────────
describe('getDistricts(city)', () => {
  it('傳縣市名稱（"台北市"）時，產生正確 URL（city_code=a）', async () => {
    mockFetch({ districts: ['信義區', '大安區'] })

    await getDistricts('台北市')

    const calledUrl = vi.mocked(fetch).mock.calls[0][0]
    expect(calledUrl).toContain('city_code=a')
  })

  it('傳縣市代碼（"a"）時，URL 也包含 city_code=a', async () => {
    mockFetch({ districts: ['信義區'] })

    await getDistricts('a')

    const calledUrl = vi.mocked(fetch).mock.calls[0][0]
    expect(calledUrl).toContain('city_code=a')
  })

  it('傳空字串時，回傳空陣列且不發出任何請求', async () => {
    vi.stubGlobal('fetch', vi.fn())

    const result = await getDistricts('')

    expect(result).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
  })

  it('API 回傳 { districts: [...] } 時，回傳純字串陣列', async () => {
    mockFetch({ districts: ['信義區', '大安區', '中山區'] })

    const result = await getDistricts('台北市')

    expect(result).toEqual(['信義區', '大安區', '中山區'])
  })

  it('fetch 失敗（HTTP 500）時回傳空陣列', async () => {
    mockFetch(null, false)

    const result = await getDistricts('台北市')

    expect(result).toEqual([])
  })

  it('fetch 本身 reject 時回傳空陣列', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Error')))

    const result = await getDistricts('台北市')

    expect(result).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// searchLandPrice
// ─────────────────────────────────────────────────────────────────────────────
describe('searchLandPrice(params)', () => {
  // 產生最小可用的成功回應
  function makeApiResponse(records = [], overrides = {}) {
    return {
      records,
      total: records.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      ...overrides,
    }
  }

  it('基本 params（county, district, page, pageSize）產生正確 querystring', async () => {
    mockFetch(makeApiResponse())

    await searchLandPrice({ county: '台北市', district: '大安區', page: 2, pageSize: 20 })

    const calledUrl = vi.mocked(fetch).mock.calls[0][0]
    expect(calledUrl).toContain('city_code=a')
    expect(calledUrl).toContain('district=%E5%A4%A7%E5%AE%89%E5%8D%80')  // URL encoded '大安區'
    expect(calledUrl).toContain('page=2')
    expect(calledUrl).toContain('page_size=20')
  })

  it('minPrice: 500（萬）→ querystring min_price=5000000', async () => {
    mockFetch(makeApiResponse())

    await searchLandPrice({ county: '台北市', minPrice: 500, page: 1, pageSize: 10 })

    const calledUrl = vi.mocked(fetch).mock.calls[0][0]
    expect(calledUrl).toContain('min_price=5000000')
  })

  it('sortBy: "tradeDate" → querystring sort_by=trade_date', async () => {
    mockFetch(makeApiResponse())

    await searchLandPrice({ county: '台北市', sortBy: 'tradeDate', page: 1, pageSize: 10 })

    const calledUrl = vi.mocked(fetch).mock.calls[0][0]
    expect(calledUrl).toContain('sort_by=trade_date')
  })

  it('transformRecord 正確轉換：total_price 10000000（元）→ totalPrice 1000（萬）', async () => {
    const rawRecord = {
      total_price: 10000000,
      district: '信義區',
      address: '測試路1號',
      trade_date: '1150101',
    }
    mockFetch(makeApiResponse([rawRecord]))

    const result = await searchLandPrice({ county: '台北市', page: 1, pageSize: 10 })

    expect(result.data).toHaveLength(1)
    expect(result.data[0].totalPrice).toBe(1000)
    expect(result.data[0].district).toBe('信義區')
  })

  it('回傳結構包含 data、total、page、pageSize、totalPages', async () => {
    mockFetch(makeApiResponse([], { total: 42, page: 3, pageSize: 15, totalPages: 3 }))

    const result = await searchLandPrice({ county: '台北市', page: 3, pageSize: 15 })

    expect(result).toMatchObject({
      data: [],
      total: 42,
      page: 3,
      pageSize: 15,
      totalPages: 3,
    })
  })

  it('fetch 失敗（HTTP 500）時回傳空結果物件', async () => {
    mockFetch(null, false)

    const result = await searchLandPrice({ county: '台北市', page: 1, pageSize: 10 })

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      perPage: 10,
      totalPages: 0,
    })
  })

  it('fetch 本身 reject 時回傳空結果物件', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Error')))

    const result = await searchLandPrice({ county: '台北市', page: 1, pageSize: 10 })

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      perPage: 10,
      totalPages: 0,
    })
  })

  it('使用 cityCode 代碼傳入時，city_code 正確對應', async () => {
    mockFetch(makeApiResponse())

    await searchLandPrice({ cityCode: 'b', page: 1, pageSize: 10 })

    const calledUrl = vi.mocked(fetch).mock.calls[0][0]
    expect(calledUrl).toContain('city_code=b')
  })

  it('unitPriceMin（萬/坪）→ unit_price_min（元/sqm）換算正確', async () => {
    mockFetch(makeApiResponse())

    await searchLandPrice({ county: '台北市', unitPriceMin: 1, page: 1, pageSize: 10 })

    const calledUrl = vi.mocked(fetch).mock.calls[0][0]
    // 1 萬/坪 = 10000 / 3.306 ≈ 3024.8 元/sqm
    const params = new URL(calledUrl, 'http://localhost').searchParams
    const unitPriceMin = parseFloat(params.get('unit_price_min'))
    expect(unitPriceMin).toBeCloseTo(10000 / 3.306, 1)
  })
})
