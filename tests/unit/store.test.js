/**
 * Pinia Store 單元測試
 * 測試 realEstate store 的 actions、computed、edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRealEstateStore } from '../../src/stores/realEstate.js'

vi.mock('../../src/api/landPrice.js', () => ({
  searchLandPrice: vi.fn(),
  getDistricts: vi.fn(),
  getCities: vi.fn(),
}))

import { searchLandPrice } from '../../src/api/landPrice.js'

describe('realEstate Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should have correct default values', () => {
      const store = useRealEstateStore()
      expect(store.records).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.searchParams.county).toBe('台北市')
      expect(store.searchParams.district).toBe('信義區')
      expect(store.searchParams.page).toBe(1)
      expect(store.searchParams.pageSize).toBe(10)
    })
  })

  describe('search action', () => {
    it('should set loading to true during search', async () => {
      const store = useRealEstateStore()
      const promise = store.search({ county: '台北市', district: '大安區', page: 1 })
      expect(store.loading).toBe(true)
      await promise
      expect(store.loading).toBe(false)
    })

    it('should set records when search succeeds', async () => {
      const store = useRealEstateStore()
      vi.mocked(searchLandPrice).mockResolvedValue({
        data: [
          { district: '信義區', transactionType: '買賣', totalPriceDisplay: '3,306' },
          { district: '大安區', transactionType: '預售屋', totalPriceDisplay: '5,500' },
        ],
        total: 150,
        page: 1,
        pageSize: 10,
        totalPages: 15,
      })

      await store.search({ county: '台北市', district: '信義區', page: 1 })
      
      expect(store.records).toHaveLength(2)
      expect(store.totalTransactions).toBe(150)
      expect(store.pagination.page).toBe(1)
      expect(store.pagination.totalPages).toBe(15)
    })

    it('should set error when search fails', async () => {
      const store = useRealEstateStore()
      vi.mocked(searchLandPrice).mockRejectedValue(new Error('API 連線錯誤'))

      await store.search({ county: '台北市', district: '信義區' })
      
      expect(store.error).toBe('API 連線錯誤')
      expect(store.records).toEqual([])
    })
  })

  describe('pagination actions', () => {
  it('should increment page', async () => {
    const store = useRealEstateStore()
    vi.mocked(searchLandPrice).mockResolvedValue({
      data: [], total: 100, page: 2, pageSize: 10, totalPages: 10,
    })

    await store.search({ county: '台北市', page: 1 })
    await store.setPage(2)
    
    expect(store.searchParams.page).toBe(2)
    expect(store.pagination.page).toBe(2)
  })
  })

  describe('recentSearches', () => {
    it('should keep max 5 recent searches', async () => {
      const store = useRealEstateStore()
      vi.mocked(searchLandPrice).mockResolvedValue({
        data: [], total: 0, page: 1, pageSize: 10, totalPages: 0,
      })

      // Simulate 6 searches
      for (let i = 1; i <= 6; i++) {
        await store.search({ county: `測試縣${i}`, district: `測試區${i}`, page: 1 })
      }

      expect(store.recentSearches).toHaveLength(5)
    })

    it('should add new searches to the front', async () => {
      const store = useRealEstateStore()
      vi.mocked(searchLandPrice).mockResolvedValue({
        data: [], total: 0, page: 1, pageSize: 10, totalPages: 0,
      })

      expect(store.recentSearches).toHaveLength(0)
      await store.search({ county: '台北市', district: '信義區', page: 1 })
      expect(store.recentSearches).toHaveLength(1)
      expect(store.recentSearches[0].county).toBe('台北市')
    })
  })

  describe('mapMode control', () => {
    it('should default to list mode', () => {
      const store = useRealEstateStore()
      expect(store.mapMode).toBe('list')
    })

    it('should toggle between list and map', () => {
      const store = useRealEstateStore()
      store.setMapMode('map')
      expect(store.mapMode).toBe('map')
      store.setMapMode('list')
      expect(store.mapMode).toBe('list')
    })

    it('should toggle heatmap visibility', () => {
      const store = useRealEstateStore()
      expect(store.heatmapVisible).toBe(true)
      store.toggleHeatmap()
      expect(store.heatmapVisible).toBe(false)
      store.toggleHeatmap()
      expect(store.heatmapVisible).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('should calculate avgPrice correctly', async () => {
      const store = useRealEstateStore()
      vi.mocked(searchLandPrice).mockResolvedValue({
        data: [
          { unitPrice: 20 },
          { unitPrice: 30 },
          { unitPrice: 50 },
        ],
        total: 3, page: 1, pageSize: 10, totalPages: 1,
      })

      await store.search({ county: '台北市', page: 1 })
      expect(store.avgPrice).toBe('33') // (20+30+50)/3 = 33.33, rounded
    })

    it('should return 0 avgPrice with no records', () => {
      const store = useRealEstateStore()
      expect(store.avgPrice).toBe(0)
    })
  })

  describe('resetParams', () => {
    it('should reset all defaults', async () => {
      const store = useRealEstateStore()
      await store.search({ county: '台中市', district: '北區', page: 5, pageSize: 50 })
      store.resetParams()
      
      expect(store.searchParams.county).toBe('台北市')
      expect(store.searchParams.district).toBe('信義區')
      expect(store.searchParams.page).toBe(1)
      expect(store.searchParams.pageSize).toBe(10)
    })
  })
})
