<template>
  <!-- heatmap layer rendered imperatively on the map -->
</template>

<script setup>
import { watch, ref, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet.heat'

/* ── 各行政區大致中心座標（用於產生熱力圖素材） ── */
const DISTRICT_CENTERS = {
  // 台北市
  '士林區':     [25.0900, 121.5200],
  '北投區':     [25.1200, 121.5050],
  '內湖區':     [25.0800, 121.5800],
  '南港區':     [25.0400, 121.6050],
  '松山區':     [25.0520, 121.5750],
  '信義區':     [25.0330, 121.5654],
  '大安區':     [25.0250, 121.5450],
  '中山區':     [25.0580, 121.5350],
  '中正區':     [25.0250, 121.5300],
  '萬華區':     [25.0150, 121.4980],
  '大同區':     [25.0620, 121.5000],
  '基隆市':     [25.1350, 121.7500],
  '台南市':     [23.0000, 120.2300],
  '高雄市':     [22.6270, 120.3000],
  '新北市':     [25.0000, 121.4500],
  '宜蘭縣':     [24.7500, 121.7500],
  '桃園市':     [24.9900, 121.3100],
  '新竹縣':     [24.8200, 121.0100],
  '新竹市':     [24.8050, 120.9700],
  '苗栗縣':     [24.5700, 120.8100],
  '南投縣':     [23.9000, 120.6800],
  '彰化縣':     [24.0500, 120.5500],
  '雲林縣':     [23.7100, 120.5300],
  '嘉義縣':     [23.4700, 120.4400],
  '花蓮縣':     [23.9700, 121.6000],
  '台東縣':     [22.7600, 121.1500],
  '金門縣':     [24.4300, 118.3200],
  '澎湖縣':     [23.5800, 119.5700],
  // 台中市
  '中區':   [24.1450, 120.6700],
  '東區':   [24.1400, 120.6900],
  '南區':   [24.1200, 120.6700],
  '西區':   [24.1450, 120.6600],
  '北區':   [24.1600, 120.6700],
  '北屯區': [24.1900, 120.7000],
  '西屯區': [24.1700, 120.6500],
  '南屯區': [24.1100, 120.6300],
  '烏日區': [24.0300, 120.6300],
  '大肚區': [24.1700, 120.5600],
  '沙鹿區': [24.2500, 120.5400],
  '豐原區': [24.3100, 120.6800],
  '潭子區': [24.2200, 120.7300],
  '大肚區': [24.1700, 120.5600],
  '大里區': [24.0900, 120.6800],
  '太平區': [24.1000, 120.7600],
  '霧峰區': [24.0500, 120.6700],
  '龍井區': [24.2100, 120.5600],
  '梧棲區': [24.3200, 120.5800],
  '大雅區': [24.2400, 120.6400],
  '后里區': [24.3100, 120.6800],
}

/* ── Props & Events ── */
const props = defineProps({
  records: { type: Array, default: () => [] },
  map:     { type: Object, default: null },
})

/* ── 產生熱力圖素材（含隨機播散） ── */
function generateHeatmapData(records) {
  const data = []
  records.forEach((r) => {
    const price = r.unitPrice || r.totalPrice || 0
    if (price <= 0) return
    const base = DISTRICT_CENTERS[r.district] || DISTRICT_CENTERS[r.city]
    if (!base) return
    // 在行政區中心附近隨機播散（半徑 ~3km ≈ 0.03 deg）
    for (let i = 0; i < 3; i++) {
      const lat = base[0] + (Math.random() - 0.5) * 0.03
      const lng = base[1] + (Math.random() - 0.5) * 0.03
      data.push([lat, lng, Math.min(price / 200, 1.0)])
    }
  })
  return data
}

/* ── 色階計算 ── */
function priceColor(price) {
  if (price < 20)   return '#4CAF50'
  if (price < 50)   return '#FFEB3B'
  if (price < 100)  return '#FF9800'
  if (price < 200)  return '#F44336'
  return '#9C27B0'
}

const heatLayer = ref(null)

watch(
  () => props.records,
  (records) => {
    if (!props.map || !records || records.length === 0) {
      if (heatLayer.value) {
        props.map.removeLayer(heatLayer.value)
        heatLayer.value = null
      }
      return
    }
    const heatData = generateHeatmapData(records)
    if (heatLayer.value) {
      props.map.removeLayer(heatLayer.value)
    }
    heatLayer.value = L.heatLayer(heatData, {
      radius: 35,
      blur: 28,
      maxZoom: 15,
      gradient: {
        0:  '#4CAF50',
        0.25: '#FFEB3B',
        0.5:  '#FF9800',
        0.75: '#F44336',
        1:    '#9C27B0',
      },
    }).addTo(props.map)
  },
  { deep: true, immediate: false },
)

onBeforeUnmount(() => {
  if (heatLayer.value && props.map) {
    props.map.removeLayer(heatLayer.value)
    heatLayer.value = null
  }
})

defineExpose({ priceColor, generateHeatmapData })
</script>

<style scoped>
/* no root element needed; heatmap is drawn onto the parent map */
</style>
