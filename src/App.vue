<template>
  <div id="app">
    <el-container>
      <!-- 側邊欄 -->
      <el-aside width="220px" class="aside">
        <div class="logo">
          <el-icon :size="28" color="#fff"><House /></el-icon>
          <span>實價查詢</span>
        </div>
        <el-menu
          :default-active="$route.path"
          router
          background-color="#1a1a2e"
          text-color="#a0a0b0"
          active-text-color="#818cf8"
          class="sidebar-menu"
        >
          <el-menu-item index="/search">
            <el-icon><Search /></el-icon>
            <span>實價查詢</span>
          </el-menu-item>
          <el-menu-item index="/history">
            <el-icon><History /></el-icon>
            <span>搜尋歷史</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主內容區 -->
      <el-main class="main-content">
        <div class="content-header">
          <h1>{{ pageTitle }}</h1>
        </div>
        <div class="content-body">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  const map = {
    '/search': '實價查詢',
    '/history': '搜尋歷史與統計',
  }
  return map[route.path] || '實價查詢'
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

#app {
  font-family: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  height: 100vh;
}

.el-container { height: 100vh; }

.aside {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.sidebar-menu { border-right: none; flex: 1; }

.main-content {
  background: #f0f2f5;
  overflow: auto;
}

.content-header {
  background: #fff;
  padding: 16px 24px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.content-header h1 {
  font-size: 22px;
  color: #1a1a2e;
  font-weight: 600;
}

.content-body {
  padding: 0 24px 24px;
}
</style>
