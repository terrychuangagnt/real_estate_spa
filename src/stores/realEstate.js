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
    page: 1,
    pageSize: 10,
    sortBy: 'tradeDate',
    sortOrder: 'desc',
  })
  const recentSearches = ref([])
  
  // 分頁資訊
  const pagination = ref({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  })
  
  const totalTransactions = computed(() => pagination.value.total)
  
  const avgPrice = computed(() => {
    if (records.value.length === 0) return 0
    const sum = records.value.reduce((acc, r) => acc + (Number(r.unitPrice) || 0), 0)
    return (sum / records.value.length).toFixed(0)
  })

  async function search(params) {
    loading.value = true
    error.value = null
    searchParams.value = { ...searchParams.value, ...params }

    try {
      const { searchLandPrice } = await import('../api/landPrice.js')
      const result = await searchLandPrice(searchParams.value)
      records.value = result.data || []
      pagination.value = {
        total: result.total || 0,
        page: result.page || 1,
        pageSize: result.pageSize || 10,
        totalPages: result.totalPages || 0,
      }
      if (!recentSearches.value.find(s => s.county === searchParams.value.county && s.district === searchParams.value.district)) {
        recentSearches.value.unshift({ county: searchParams.value.county, district: searchParams.value.district, time: new Date().toLocaleString('zh-TW') })
        if (recentSearches.value.length > 5) recentSearches.value.pop()
      }
    } catch (e) {
      error.value = e.message
      records.value = []
    } finally {
      loading.value = false
    }
  }

  function setPage(page) {
    search({ page })
  }

  function nextPage() {
    if (pagination.value.page < pagination.value.totalPages) {
      search({ page: pagination.value.page + 1 })
    }
  }

  function prevPage() {
    if (pagination.value.page > 1) {
      search({ page: pagination.value.page - 1 })
    }
  }

  function resetParams() {
    searchParams.value = {
      county: '台北市',
      district: '信義區',
      keyword: '',
      landCategory: '全部',
      page: 1,
      pageSize: 10,
      sortBy: 'tradeDate',
      sortOrder: 'desc',
    }
  }

  return {
    records, loading, error, searchParams, recentSearches,
    totalTransactions, avgPrice, search,
    pagination, setPage, nextPage, prevPage, resetParams,
  }
})
