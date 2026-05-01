import { defineStore } from 'pinia';

export const useSearchStore = defineStore('search', {
  state: () => ({
    // 搜尋條件
    selectedCity: '',
    selectedDistrict: '',
    dateRange: {
      start: '',
      end: ''
    },
    priceRange: {
      min: 0,
      max: 100000000 // 預設上限 1 億
    },
    // 搜尋結果
    searchResults: [],
    isLoading: false,
    error: null,
    // 地圖狀態
    mapCenter: [25.033, 121.565], // 台灣中心點
    zoomLevel: 7
  }),
  
  getters: {
    isSearchDisabled: (state) => !state.selectedCity,
    hasResults: (state) => state.searchResults.length > 0
  },

  actions: {
    async performSearch() {
      this.isLoading = true;
      this.error = null;
      try {
        // 這裡之後由 Agent A 實作實際的 API 呼叫邏輯
        console.log('Performing search with:', this.$state);
        // 模擬 API 延遲
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.searchResults = []; 
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    setCity(city) {
      this.selectedCity = city;
      this.selectedDistrict = ''; // 重置行政區
    },

    setDistrict(district) {
      this.selectedDistrict = district;
    }
  }
});
