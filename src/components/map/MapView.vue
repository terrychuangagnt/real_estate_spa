<template>
  <div class="map-wrapper">
    <div ref="mapContainerRef" id="map-container"></div>
    
    <PriceHeatmap
      v-if="locatableRecords.length > 0 && heatmapVisible"
      :records="locatableRecords"
      :map="map"
      class="map-heatmap"
    />
    <MarkerCluster
      v-if="locatableRecords.length > 0"
      :records="locatableRecords"
      :map="map"
      class="map-markers"
    />
    <div v-if="hasRecordsWithoutCoordinates" class="map-empty-state">
      <strong>目前資料沒有可用座標</strong>
      <span>已顯示底圖，無法建立標記或熱力圖。</span>
    </div>
    <PriceLegend class="map-legend" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.heat'
import PriceLegend from './PriceLegend.vue'
import PriceHeatmap from './PriceHeatmap.vue'
import MarkerCluster from './MarkerCluster.vue'
import { useRealEstateStore } from '../../stores/realEstate.js'

const mapContainerRef = ref(null)
const map = ref(null)
const store = useRealEstateStore()

const records = ref([])
const locatableRecords = computed(() => records.value.filter((record) => record.hasCoordinates))
const hasRecordsWithoutCoordinates = computed(() => records.value.length > 0 && locatableRecords.value.length === 0)

function toFiniteNumber(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue
    const number = Number(value)
    if (Number.isFinite(number)) return number
  }
  return null
}

function normalizeCoordinate(record, keys, min, max) {
  const value = toFiniteNumber(...keys.map((key) => record[key]))
  return value !== null && value >= min && value <= max ? value : null
}

function normalizeRecord(record) {
  const lat = normalizeCoordinate(record, ['Lat', 'lat', 'Latitude', 'latitude'], -90, 90)
  const lng = normalizeCoordinate(record, ['Lng', 'lng', 'Lon', 'lon', 'Longitude', 'longitude'], -180, 180)

  return {
    lat,
    lng,
    hasCoordinates: lat !== null && lng !== null,
    price: toFiniteNumber(record.Price, record.price, record.totalPrice) || 0,
    area: toFiniteNumber(record.Area, record.area, record.buildingArea) || 0,
    unitPrice: toFiniteNumber(record.UnitPrice, record.unitPrice) || 0,
    houseType: record.HouseType || record.houseType || record.propertyType || '',
    buildingType: record.BuildingType || record.buildingType || '',
    floorTotal: record.FloorTotal || record.floorTotal || record.totalFloors || 0,
    floorBuilding: record.FloorBuilding || record.floorBuilding || 0,
    city: record.City || record.city || '',
    district: record.District || record.district || '',
    address: record.Address || record.address || '',
    transaction: record.Transaction || record.transaction || record.transactionType || '',
  }
}

watch(() => store.mapMode, (mode) => {
  if (mode === 'map' && map.value) {
    map.value.invalidateSize()
  }
})

watch(() => store.records, (newRecords) => {
  records.value = Array.isArray(newRecords) ? newRecords.map(normalizeRecord) : []
}, { deep: true, immediate: true })

onMounted(async () => {
  await nextTick()
  
  map.value = L.map('map-container').setView([25.0330, 121.5654], 12)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value)
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 600px;
}

#map-container {
  width: 100%;
  height: 600px;
  min-height: 600px;
}

.map-heatmap {
  pointer-events: none;
}

.map-legend {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1000;
}

.map-empty-state {
  position: absolute;
  left: 50%;
  top: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transform: translateX(-50%);
  max-width: min(360px, calc(100% - 32px));
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
  color: #303133;
  text-align: center;
}

.map-empty-state span {
  color: #606266;
  font-size: 13px;
}
</style>
