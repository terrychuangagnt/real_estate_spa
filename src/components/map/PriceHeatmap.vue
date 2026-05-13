<template>
  <!-- heatmap layer rendered imperatively on the map -->
</template>

<script setup>
import { watch, ref, onBeforeUnmount, toRaw } from 'vue'
import L from 'leaflet'
import 'leaflet.heat'

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
    const lat = Number(r.lat)
    const lng = Number(r.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    data.push([lat, lng, Math.min(price / 200, 1.0)])
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
    const map = toRaw(props.map)
    if (!map || !records || records.length === 0) {
      if (heatLayer.value) {
        map?.removeLayer(heatLayer.value)
        heatLayer.value = null
      }
      return
    }
    const heatData = generateHeatmapData(records)
    if (heatLayer.value) {
      map.removeLayer(heatLayer.value)
      heatLayer.value = null
    }
    if (heatData.length === 0) {
      return
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
    }).addTo(map)
  },
  { deep: true, immediate: false },
)

watch(
  () => props.map,
  () => {
    if (props.records.length > 0) {
      const records = props.records
      if (heatLayer.value && toRaw(props.map)) {
        toRaw(props.map).removeLayer(heatLayer.value)
        heatLayer.value = null
      }
      const heatData = generateHeatmapData(records)
      const map = toRaw(props.map)
      if (map && heatData.length > 0) {
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
        }).addTo(map)
      }
    }
  },
)

onBeforeUnmount(() => {
  const map = toRaw(props.map)
  if (heatLayer.value && map) {
    map.removeLayer(heatLayer.value)
    heatLayer.value = null
  }
})

defineExpose({ priceColor, generateHeatmapData })
</script>

<style scoped>
/* no root element needed; heatmap is drawn onto the parent map */
</style>
