// ============================================
// main.ts - 应用入口
// 注册：Vant、Pinia、Vue Router、Axios 拦截器
// ============================================
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Vant 样式（按需引入基础样式 + 常用组件）
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
