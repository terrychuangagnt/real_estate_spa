<template>
  <!-- MarkerCluster is rendered imperatively on the parent map -->
</template>

<script setup>
import { watch, ref, onBeforeUnmount, toRaw } from 'vue'
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
    if (toRaw(props.map)) {
      toRaw(props.map).removeLayer(clusterGroup)
    }
    clusterGroup.clearLayers()
    clusterGroup = null
  }
}

function addMarkers(records) {
  if (!records || records.length === 0) return

  clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
  })

  records.forEach((r) => {
    const lat = r.lat || r.latitude
    const lng = r.lng || r.longitude || r.lon
    if (lat == null || lng == null) return

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

  if (props.map) {
    props.map.addLayer(clusterGroup)
  }
}

watch(
  () => props.records,
  (newRecords, oldRecords) => {
    if (newRecords !== oldRecords) {
      if (clusterGroup && props.map) {
        props.map.removeLayer(clusterGroup)
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
      newMap.addLayer(clusterGroup)
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
