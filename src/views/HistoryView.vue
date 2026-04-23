<template>
  <!-- 搜尋歷史區 -->
  <el-row :gutter="16" class="history-row">
    <el-col :span="12">
      <el-card class="history-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span><el-icon><Clock /></el-icon> 搜尋歷史</span>
            <el-button text type="danger" :icon="Delete" @click="clearHistory">清除</el-button>
          </div>
        </template>

        <el-table :data="store.recentSearches" style="width: 100%">
          <el-table-column prop="county" label="縣市" width="100" />
          <el-table-column prop="district" label="行政區" width="100" />
          <el-table-column prop="time" label="搜尋時間" />
        </el-table>

        <el-empty v-if="store.recentSearches.length === 0" description="尚無搜尋紀錄" />
      </el-card>
    </el-col>

    <el-col :span="12">
      <el-card class="stats-card" shadow="hover">
        <template #header>
          <span><el-icon><DataAnalysis /></el-icon> 統計資訊</span>
        </template>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="總交易筆數">
            <el-tag type="success">{{ store.totalTransactions }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="平均單價">
            {{ store.avgPrice }} 萬元/坪
          </el-descriptions-item>
          <el-descriptions-item label="已安裝套件">
            <el-tag type="primary">Element Plus</el-tag>
            <el-tag type="success">Pinia</el-tag>
            <el-tag type="warning">Vue Router</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="專案狀態">
            <el-tag type="success">開發中</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </el-col>
  </el-row>

  <!-- 房產類型分佈 -->
  <el-row :gutter="16" class="chart-row" v-if="store.records.length > 0">
    <el-col :span="24">
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <span><el-icon><TrendCharts /></el-icon> 搜尋結果分佈</span>
        </template>

        <el-table :data="chartData" stripe style="width: 100%">
          <el-table-column prop="category" label="房產類型" />
          <el-table-column prop="count" label="筆數" sortable />
        </el-table>
      </el-card>
    </el-col>
  </el-row>

  <el-empty v-else description="先搜尋一些資料來查看分佈圖表" />
</template>

<script setup>
import { computed } from 'vue'
import { useRealEstateStore } from '../stores/realEstate.js'
import { Clock, Delete, DataAnalysis, TrendCharts } from '@element-plus/icons-vue'

const store = useRealEstateStore()

function clearHistory() {
  store.recentSearches = []
}

const chartData = computed(() => {
  const counts = {}
  store.records.forEach(r => {
    counts[r.landCategory] = (counts[r.landCategory] || 0) + 1
  })
  return Object.keys(counts).map(cat => ({ category: cat, count: counts[cat] }))
})
</script>

<style scoped>
.history-row, .chart-row { margin-bottom: 16px; }

.history-card, .stats-card, .chart-card {
  background: #fff;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 600;
  color: #333;
}
</style>
