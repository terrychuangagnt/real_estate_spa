<template>
  <!-- MarkerCluster is rendered imperatively on the parent map -->
</template>

<script setup>
import { watch, onBeforeUnmount, toRaw } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const props = defineProps({
  records: { type: Array, default: () => [] },
  map: { type: Object, default: null },
})

let clusterGroup = null

function clearMarkers() {
  if (clusterGroup) {
    const map = toRaw(props.map)
    if (map) {
      map.removeLayer(clusterGroup)
    }
    clusterGroup.clearLayers()
    clusterGroup = null
  }
}

function isValidCoordinate(lat, lng) {
  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= -90
    && lat <= 90
    && lng >= -180
    && lng <= 180
}

function addMarkers(records) {
  const map = toRaw(props.map)
  if (!map || !records || records.length === 0) return

  clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
  })

  records.forEach((r) => {
    const lat = Number(r.lat)
    const lng = Number(r.lng)
    if (!isValidCoordinate(lat, lng)) return

    const price = r.unitPrice || r.totalPrice || '價格不詳'
    const tradeType = r.transactionType || '買賣'
    const address = r.address || r.district || '地址不詳'

    const marker = L.marker([lat, lng])
    marker.bindPopup(`
      <strong>價格：</strong>${price}<br>
      <strong>交易類型：</strong>${tradeType}<br>
      <strong>地址：</strong>${address}
    `)
    clusterGroup.addLayer(marker)
  })

  if (clusterGroup.getLayers().length > 0) {
    map.addLayer(clusterGroup)
  } else {
    clusterGroup = null
  }
}

watch(
  () => props.records,
  (newRecords, oldRecords) => {
    if (newRecords !== oldRecords) {
      const map = toRaw(props.map)
      if (clusterGroup && map) {
        map.removeLayer(clusterGroup)
      }
      clearMarkers()
      addMarkers(newRecords)
    }
  },
  { deep: true },
)

watch(
  () => props.map,
  (newMap) => {
    if (newMap && clusterGroup) {
      toRaw(newMap).addLayer(clusterGroup)
    } else if (newMap) {
      addMarkers(props.records)
    }
  },
)

onBeforeUnmount(() => {
  clearMarkers()
})
</script>

<style scoped>
/* No root element needed; cluster is drawn onto the parent map */
</style>
