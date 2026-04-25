<template>
  <div class="search-view">
    <!-- 搜尋表單卡片 -->
    <div class="search-card">
      <el-form :model="form" label-width="80px" @submit.prevent="onSearch">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="縣市">
              <el-select v-model="form.county" placeholder="請選擇縣市" filterable @change="onCountyChange">
                <el-option
                  v-for="c in cityList"
                  :key="c.name"
                  :label="`${c.name} (${c.count})`"
                  :value="c.name"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="行政區">
              <el-select
                v-model="form.district"
                placeholder="請選擇行政區"
                filterable
                :loading="districtsLoading"
                :disabled="currentDistricts.length === 0"
              >
                <el-option
                  v-for="d in currentDistricts"
                  :key="d"
                  :label="d"
                  :value="d"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="交易類型">
              <el-select v-model="form.type" placeholder="請選擇交易類型" clearable>
                <el-option label="全部" value="" />
                <el-option label="買賣" value="買賣" />
                <el-option label="預售屋" value="預售屋" />
                <el-option label="租賃" value="租賃" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="關鍵詞">
              <el-input v-model="form.keyword" placeholder="輸入路名 / 門牌號碼" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="價格範圍（萬）">
              <el-input-number v-model="form.priceMin" :min="0" :step="100" placeholder="最低" style="width: 45%" />
              <span style="padding: 0 8px">-</span>
              <el-input-number v-model="form.priceMax" :min="0" :step="100" placeholder="最高" style="width: 45%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="每坪價格（萬/坪）">
              <el-input-number v-model="form.unitPriceMin" :min="0" :step="1" placeholder="最低" style="width: 45%" />
              <span style="padding: 0 8px">-</span>
              <el-input-number v-model="form.unitPriceMax" :min="0" :step="1" placeholder="最高" style="width: 45%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="坪數範圍（坪）">
              <el-input-number v-model="form.minArea" :min="0" :step="5" placeholder="最小" style="width: 45%" />
              <span style="padding: 0 8px">-</span>
              <el-input-number v-model="form.maxArea" :min="0" :step="5" placeholder="最大" style="width: 45%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" :loading="store.loading" @click="onSearch" :icon="Search">
            開始查詢
          </el-button>
          <el-button @click="onReset" :icon="Refresh">清除</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 統計摘要卡片 -->
    <el-row :gutter="16" class="stats-row" v-if="store.records.length > 0">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="搜尋結果" :value="store.totalTransactions" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="平均單價" :value="store.avgPrice">
            <template #suffix> 萬元/坪</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="搜尋耗時" :value="searchTime">
            <template #suffix>ms</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="頁數" :value="store.pagination.page" :value-style="{ fontSize: '18px' }">
            <template #suffix> / {{ store.pagination.totalPages }}</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 資料表格 -->
    <div class="table-card" v-if="store.records.length > 0">
      <el-table :data="store.records" stripe border style="width: 100%" v-loading="store.loading" :height="500">
        <el-table-column prop="district" label="行政區" width="70" fixed />
        <el-table-column prop="transactionType" label="類型" width="90" sortable>
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.transactionType)" size="small">{{ row.transactionType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="房屋地址" min-width="200">
          <template #default="{ row }">
            <div class="addr-wrap">
              <el-icon><Location /></el-icon>
              <span>{{ row.address }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="buildingType" label="房屋類型" width="130" />
        <el-table-column prop="tradeDate" label="交易日期" width="90" sortable>
          <template #default="{ row }">
            <span>{{ formatDate(row.tradeDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalPriceDisplay" label="總價（萬元）" width="140" sortable>
          <template #default="{ row }">
            <span class="price">{{ row.totalPriceDisplay }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unitPriceDisplay" label="單價（萬/坪）" width="130" sortable>
          <template #default="{ row }">
            <span class="unit-price">{{ row.unitPriceDisplay }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="landArea" label="土地面積（坪）" width="120" sortable>
          <template #default="{ row }">
            <span>{{ formatArea(row.landArea) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="buildingArea" label="建物面積（坪）" width="120" sortable>
          <template #default="{ row }">
            <span>{{ formatArea(row.buildingAreaSqm || row.buildingArea) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="parkingPriceDisplay" label="車位價（萬）" width="120" sortable>
          <template #default="{ row }">
            <span v-if="row.hasParking" class="price">{{ row.parkingPriceDisplay }}</span>
            <span v-else class="text-muted">無車位</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁元件 -->
      <div class="pagination-wrapper">
        <el-pagination
          :current-page="store.pagination.page"
          :page-size="store.pagination.pageSize"
          :total="store.pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-empty v-else :image-size="200" description="請選擇「縣市」和「行政區」後按下「開始查詢」" />

    <!-- 最近搜尋 -->
    <div class="recent-search" v-if="store.recentSearches.length > 0">
      <h4>最近搜尋</h4>
      <el-tag
        v-for="(s, index) in store.recentSearches"
        :key="index"
        class="recent-tag"
        closable
        @close="store.recentSearches.splice(store.recentSearches.indexOf(s), 1)"
      >
        {{ s.county }} / {{ s.district }} - {{ s.time }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRealEstateStore } from '../stores/realEstate.js'
import { Search, Refresh, Location } from '@element-plus/icons-vue'
import { getDistricts, getCities } from '../api/landPrice.js'

const store = useRealEstateStore()
const searchTime = ref(0)
const districtsLoading = ref(false)
const currentDistricts = ref([])
const cityList = ref([])

const form = ref({
  county: '台北市',
  district: '信義區',
  keyword: '',
  type: '',
  priceMin: 0,
  priceMax: 0,
  unitPriceMin: 0,
  unitPriceMax: 0,
  minArea: 0,
  maxArea: 0,
})

onMounted(async () => {
  // 載入所有縣市列表
  const cities = await getCities()
  cityList.value = cities
  
  if (form.value.county) {
    await loadDistricts()
    form.value.district = currentDistricts.value[0] || form.value.district
  }
})

async function loadDistricts() {
  if (!form.value.county) return
  
  districtsLoading.value = true
  try {
    const districts = await getDistricts(form.value.county)
    currentDistricts.value = districts || []
  } finally {
    districtsLoading.value = false
  }
}

async function onCountyChange() {
  currentDistricts.value = []
  if (cityList.value.find(c => c.name === form.value.county)) {
    form.value.district = ''
    await loadDistricts()
    if (currentDistricts.value.length > 0) {
      form.value.district = currentDistricts.value[0]
    }
  }
}

async function onSearch() {
  if (!form.value.county || !form.value.district) {
    alert('請選擇縣市和行政區')
    return
  }
  
  const start = Date.now()
  await store.search({
    county: form.value.county,
    district: form.value.district,
    keyword: form.value.keyword,
    type: form.value.type,
    minPrice: form.value.priceMin || undefined,
    maxPrice: form.value.priceMax || undefined,
    unitPriceMin: form.value.unitPriceMin || undefined,
    unitPriceMax: form.value.unitPriceMax || undefined,
    minArea: form.value.minArea || undefined,
    maxArea: form.value.maxArea || undefined,
    page: 1,
    pageSize: form.value.pageSize || 10,
    sortBy: 'tradeDate',
    sortOrder: 'desc',
  })
  searchTime.value = Date.now() - start
}

function formatTransactionDate(dateStr) {
  if (!dateStr) return ''
  const year = 1911 + parseInt(dateStr.substring(0, 3))
  const month = parseInt(dateStr.substring(3, 5))
  const day = parseInt(dateStr.substring(5, 7))
  return `${year}年${month}月${day}日`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  // 日期已統一為民國年格式 YYY/MM/DD，直接顯示
  return dateStr
}

function formatArea(area) {
  // area 单位为「坪」，直接显示
  return area ? Number(area).toFixed(1) : '-'
}

function getTypeColor(type) {
  const colors = {
    '買賣': 'success',
    '預售屋': 'warning',
    '租賃': 'info',
  }
  return colors[type] || 'default'
}

function handlePageChange(page) {
  store.setPage(page)
}

function handleSizeChange(size) {
  form.value.pageSize = size
  store.search({ pageSize: size, page: 1 })
}

function onReset() {
  form.value = {
    county: '台北市',
    district: currentDistricts.value[0] || '信義區',
    keyword: '',
    type: '',
    priceMin: 0,
    priceMax: 0,
    unitPriceMin: 0,
    unitPriceMax: 0,
    minArea: 0,
    maxArea: 0,
  }
  store.resetParams()
  store.records = []
}
</script>

<style scoped>
.search-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.search-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 24px;
}

.stat-card {
  text-align: center;
}

.stats-row { margin: 20px 0; }

.table-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 16px;
  margin-top: 16px;
}

.price {
  color: #e74c3c;
  font-weight: 600;
}

.unit-price {
  color: #27ae60;
  font-weight: 600;
}

.addr-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination-wrapper {
  text-align: center;
  margin-top: 16px;
}

.recent-search {
  margin-top: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.recent-search h4 {
  margin: 0 0 12px 0;
  color: #606266;
}

.recent-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.text-muted {
  color: #c0c4cc;
}
</style>
