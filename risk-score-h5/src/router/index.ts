// ============================================
// 路由配置
// ============================================
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/pages/InputPage.vue'),
    meta: { title: '风险评分评估' },
  },
  {
    path: '/result',
    name: 'result',
    component: () => import('@/pages/ResultPage.vue'),
    meta: { title: '评分结果' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由切换后更新页面标题
router.afterEach((to) => {
  const title = (to.meta.title as string) || '风险评分'
  document.title = title
})

export default router
