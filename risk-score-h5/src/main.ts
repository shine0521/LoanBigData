// ============================================
// main.ts - 应用入口
// 注册：Vant 4 / Pinia / Vue Router
// ============================================
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 全局样式
import './assets/styles/global.scss'

// Vant 样式（Vite 构建会自动 tree-shake 未用组件）
import 'vant/lib/index.css'

// 创建 Vue 实例
const app = createApp(App)

// 注册 Pinia
const pinia = createPinia()
app.use(pinia)

// 注册 Vue Router
app.use(router)

// 挂载
app.mount('#app')