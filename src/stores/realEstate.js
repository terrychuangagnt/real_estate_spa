/**
 * 實價查詢狀態管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRealEstateStore = defineStore('realEstate', () => {
  const records = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchParams = ref({
    county: '台北市',
    district: '信義區',
    keyword: '',
    landCategory: '全部',
  })
  const recentSearches = ref([])

  const totalTransactions = computed(() => records.value.length)

  const avgPrice = computed(() => {
    if (records.value.length === 0) return 0
    const sum = records.value.reduce((acc, r) => acc + r.unitAreaPrice, 0)
    return (sum / records.value.length).toFixed(1)
  })

  async function search(params) {
    loading.value = true
    error.value = null

    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 800))

    searchParams.value = { ...params }

    const { searchLandPrice } = await import('../api/landPrice.js')
    try {
      records.value = await searchLandPrice(params)
      if (!recentSearches.value.find(s => s.county === params.county && s.district === params.district)) {
        recentSearches.value.push({ county: params.county, district: params.district, time: new Date().toLocaleString('zh-TW') })
        if (recentSearches.value.length > 5) recentSearches.value.shift()
      }
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    records, loading, error, searchParams, recentSearches,
    totalTransactions, avgPrice, search,
  }
})
