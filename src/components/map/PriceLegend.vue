<template>
  <div class="price-legend">
    <h4>價格圖例（萬／坪）</h4>
    <div class="legend-bar" :style="{ background: gradientCSS }"></div>
    <div class="legend-scale">
      <span>&lt; 20</span>
      <span>20 － 50</span>
      <span>50 － 100</span>
      <span>100 － 200</span>
      <span>&gt; 200</span>
    </div>
    <div class="legend-swatches">
      <div v-for="tier in tiers" :key="tier.label" class="legend-item" :style="{ background: tier.color }">
        <span class="label">{{ tier.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const tiers = [
  { label: '< 20',     color: '#4CAF50', min: 0,    max: 20   },
  { label: '20 ~ 50',  color: '#FFEB3B', min: 20,   max: 50   },
  { label: '50 ~ 100', color: '#FF9800', min: 50,   max: 100  },
  { label: '100 ~ 200',color: '#F44336', min: 100,  max: 200  },
  { label: '> 200',    color: '#9C27B0', min: 200,  max: 9999 },
]

const gradientCSS = 'linear-gradient(to right, #4CAF50, #FFEB3B, #FF9800, #F44336, #9C27B0)'
</script>

<style scoped>
.price-legend {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  min-width: 180px;
  user-select: none;
}
.price-legend h4 {
  margin: 0 0 8px;
  font-size: 13px;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 6px;
}
.legend-bar {
  height: 16px;
  border-radius: 3px;
  margin-bottom: 6px;
}
.legend-scale {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
  margin-bottom: 8px;
}
.legend-swatches {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  color: #fff;
  font-size: 9px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  white-space: nowrap;
  overflow: hidden;
}
/* 淺底改白字 shadow */
.legend-item[style*='#FFEB3B'] { color: #333; text-shadow: none; }
</style>
