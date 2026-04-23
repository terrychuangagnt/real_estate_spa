<template>
  <!-- 搜尋表單卡片 -->
  <div class="search-card">
    <el-form :model="form" label-width="80px" @submit.prevent="onSearch">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-form-item label="縣市">
            <el-select v-model="form.county" placeholder="請選擇縣市" filterable>
              <el-option v-for="c in counties" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="行政區">
            <el-select v-model="form.district" placeholder="請選擇行政區" filterable>
              <el-option v-for="d in districts" :key="d" :label="d" :value="d" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="關鍵詞">
            <el-input v-model="form.keyword" placeholder="路名 / 門牌號碼" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="類型">
            <el-select v-model="form.landCategory" placeholder="請選擇房產類型">
              <el-option label="全部" value="全部" />
              <el-option label="住宅" value="住宅" />
              <el-option label="商業" value="商業" />
              <el-option label="工業" value="工業" />
            </el-select>
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
    <el-col :span="8">
      <el-card shadow="hover">
        <el-statistic title="搜尋結果" :value="store.totalTransactions" />
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="hover">
        <el-statistic title="平均單價">
          <template #suffix> 萬元/坪</template>
          <template #value="{ value }">{{ store.avgPrice }}</template>
        </el-statistic>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="hover">
        <el-statistic title="搜尋耗時">
          <template #suffix>ms</template>
          <template #value="{ value }">{{ searchTime }}</template>
        </el-statistic>
      </el-card>
    </el-col>
  </el-row>

  <!-- 資料表格 -->
  <div class="table-card" v-if="store.records.length > 0">
    <el-table :data="store.records" stripe border style="width: 100%" v-loading="store.loading">
      <el-table-column prop="id" label="交易編號" width="120" />
      <el-table-column prop="address" label="房屋地址" min-width="200">
        <template #default="{ row }">
          <div class="addr-wrap">
            <el-icon><Location /></el-icon>
            <span>{{ row.address }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="landCategory" label="房產類別" width="90" />
      <el-table-column prop="houseType" label="房屋類型" width="120" />
      <el-table-column prop="transactionDate" label="交易日期" width="110" />
      <el-table-column prop="totalPrice" label="總價（萬元）" width="130" sortable>
        <template #default="{ row }">
          <span class="price">{{ row.totalPrice.toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="unitAreaPrice" label="單價（萬/坪）" width="110" sortable>
        <template #default="{ row }">
          <span class="unit-price">{{ row.unitAreaPrice.toFixed(1) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="floor" label="樓層" width="80" />
      <el-table-column prop="area" label="面積（坪）" width="90" sortable>
        <template #default="{ row }">
          <span class="area">{{ row.area.toFixed(1) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="developer" label="建商" width="100" />
      <el-table-column prop="hasElevator" label="電梯" width="70" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.hasElevator" type="success" size="small">有</el-tag>
          <el-tag v-else type="danger" size="small">無</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-text type="info">共 {{ store.totalTransactions }} 筆交易紀錄</el-text>
    </div>
  </div>

  <el-empty v-else description="請選擇「縣市」和「行政區」後按下「開始查詢」" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRealEstateStore } from '../stores/realEstate.js'
import { Search, Refresh, Location } from '@element-plus/icons-vue'

const store = useRealEstateStore()
const searchTime = ref(0)

const form = ref({
  county: '台北市',
  district: '信義區',
  keyword: '',
  landCategory: '全部',
})

const counties = ['台北市', '新北市', '台中市', '台南市', '高雄市', '桃園市']
const districts = ['信義區', '大安區', '中山區', '中正區', '萬華區', '松山區', '內湖區', '南港區', '文山區', '士林區']

onMounted(() => {
  // 初始查詢台北市信義區
  form.value.county = '台北市'
  form.value.district = '信義區'
  onSearch()
})

async function onSearch() {
  const start = Date.now()
  await store.search(form.value)
  searchTime.value = Date.now() - start
}

function onReset() {
  form.value = {
    county: '台北市',
    district: '信義區',
    keyword: '',
    landCategory: '全部',
  }
  store.records = []
}
</script>

<style scoped>
.search-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 20px 24px;
}

.stats-row { margin: 16px 0; }

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
</style>
