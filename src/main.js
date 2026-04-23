/**
 * 應用程式入口
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import SearchView from './views/SearchView.vue'
import HistoryView from './views/HistoryView.vue'

const routes = [
  { path: '/', redirect: '/search' },
  { path: '/search', name: 'Search', component: SearchView },
  { path: '/history', name: 'History', component: HistoryView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: undefined })

// 註冊所有圖示
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
