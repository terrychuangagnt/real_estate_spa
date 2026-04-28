<template>
  <div class="map-wrapper">
    <div ref="mapContainerRef" id="map-container"></div>
    
    <PriceHeatmap
      v-if="records.length > 0 && heatmapVisible"
      :records="records"
      :map="map"
      class="map-heatmap"
    />
    <MarkerCluster
      v-if="records.length > 0"
      :records="records"
      :map="map"
      class="map-markers"
    />
    <PriceLegend class="map-legend" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
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
let map = null
const store = useRealEstateStore()

const records = ref([])

watch(() => store.mapMode, (mode) => {
  if (mode === 'map' && map) {
    map.invalidateSize()
  }
})

watch(() => store.records, (newRecords) => {
  if (newRecords && newRecords.length > 0) {
    records.value = newRecords.map(r => ({
      lat: Number(r.Lat) || Number(r.lat),
      lng: Number(r.Lng) || Number(r.lng),
      price: Number(r.Price) || Number(r.price),
      area: Number(r.Area) || Number(r.area),
      unitPrice: Number(r.UnitPrice) || Number(r.unitPrice),
      houseType: r.HouseType || r.houseType || '',
      buildingType: r.BuildingType || r.buildingType || '',
      floorTotal: r.FloorTotal || r.floorTotal || 0,
      floorBuilding: r.FloorBuilding || r.floorBuilding || 0,
      latitude: r.Latitude || r.latitude || '',
      longitude: r.Longitude || r.longitude || '',
      city: r.City || r.city || '',
      district: r.District || r.district || '',
      address: r.Address || r.address || '',
      transaction: r.Transaction || r.transaction || '',
    }))
  }
}, { deep: true })

onMounted(async () => {
  await nextTick()
  
  map = L.map('map-container').setView([25.0330, 121.5654], 12)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
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
  height: 100%;
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
</style>
