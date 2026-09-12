// ============================================
// main.ts - 应用入口
// 注册：Vant 4（按需引入） / Pinia / Vue Router
// ============================================
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 全局样式
import './assets/styles/global.scss'

// Vant 4 样式
import 'vant/lib/index.css'

// Vant 4 按需引入组件（tree-shake 友好）
import {
  Button,
  Field,
  Cell,
  CellGroup,
  NavBar,
  NoticeBar,
  Checkbox,
  CheckboxGroup,
  Loading,
  Circle,
  Tag,
  Icon,
  Empty,
  Toast,
  Dialog,
  Notify,
  Form,
} from 'vant'

// 创建 Vue 实例
const app = createApp(App)

// 注册 Pinia
const pinia = createPinia()
app.use(pinia)

// 注册 Vue Router
app.use(router)

// 注册 Vant 组件
const vantComponents = [
  Button,
  Field,
  Cell,
  CellGroup,
  NavBar,
  NoticeBar,
  Checkbox,
  CheckboxGroup,
  Loading,
  Circle,
  Tag,
  Icon,
  Empty,
  Toast,
  Dialog,
  Notify,
  Form,
]
vantComponents.forEach((comp) => app.use(comp))

// 挂载
app.mount('#app')