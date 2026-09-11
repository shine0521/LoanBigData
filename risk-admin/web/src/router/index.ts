import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layout/AdminLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '工作台', icon: 'DataAnalysis' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileList.vue'),
        meta: { title: '用户信息记录', icon: 'Document' },
      },
      {
        path: 'customer',
        name: 'Customer',
        component: () => import('@/views/customer/CustomerList.vue'),
        meta: { title: '用户信息管理', icon: 'User' },
      },
      {
        path: 'assessment',
        name: 'Assessment',
        component: () => import('@/views/assessment/AssessmentList.vue'),
        meta: { title: '评分记录', icon: 'Star' },
      },
      {
        path: 'system/admin-user',
        name: 'AdminUser',
        component: () => import('@/views/system/AdminUser.vue'),
        meta: { title: '管理员账号', icon: 'UserFilled' },
      },
      {
        path: 'system/operation-log',
        name: 'OperationLog',
        component: () => import('@/views/system/OperationLog.vue'),
        meta: { title: '操作日志', icon: 'List' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫：登录拦截
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth !== false)

  if (requiresAuth && !userStore.isLoggedIn()) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn()) {
    next('/')
  } else {
    next()
  }
})

export default router
