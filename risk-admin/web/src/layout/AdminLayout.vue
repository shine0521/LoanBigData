<template>
  <el-container class="layout-container">
    <!-- 左侧侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="aside">
      <!-- Logo 区域 -->
      <div class="logo-area">
        <span v-if="!isCollapsed" class="logo-text">风险评分管理平台</span>
        <span v-else class="logo-text logo-text--short">风</span>
        <el-icon class="collapse-btn" @click="isCollapsed = !isCollapsed">
          <Fold v-if="!isCollapsed" />
          <Expand v-else />
        </el-icon>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :unique-opened="true"
        router
        class="side-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>工作台</template>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><Document /></el-icon>
          <template #title>用户信息记录</template>
        </el-menu-item>
        <el-menu-item index="/customer">
          <el-icon><User /></el-icon>
          <template #title>用户信息管理</template>
        </el-menu-item>
        <el-menu-item index="/assessment">
          <el-icon><Star /></el-icon>
          <template #title>评分记录</template>
        </el-menu-item>

        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/admin-user">管理员账号</el-menu-item>
          <el-menu-item index="/system/operation-log">操作日志</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="header-left">
          <!-- 面包屑 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 未读消息角标 -->
          <el-badge :value="notifyStore.unreadCount" :hidden="!notifyStore.hasUnread" :max="99">
            <el-icon class="header-icon" size="18">
              <Bell />
            </el-icon>
          </el-badge>

          <!-- 用户信息下拉 -->
          <el-dropdown @command="handleUserCommand">
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">{{ userStore.userInfo?.realName || userStore.userInfo?.username || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main">
        <!-- 实时同步提示条 -->
        <transition name="slide-fade">
          <div v-if="notifyStore.showTip" class="sync-tip-bar">
            <el-icon color="#1890ff"><Bell /></el-icon>
            {{ notifyStore.newRecordTip }}
            <el-button type="primary" link size="small" @click="goToProfile">查看</el-button>
            <el-icon class="close-btn" @click="notifyStore.showTip = false"><Close /></el-icon>
          </div>
        </transition>

        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNotifyStore } from '@/stores/notify'
import { useWebSocket } from '@/hooks/useWebSocket'
import {
  Fold, Expand, DataAnalysis, Document, User, Star, Setting,
  Bell, ArrowDown, Close,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const notifyStore = useNotifyStore()

// 启动 WebSocket
useWebSocket()

// 侧边栏折叠状态
const isCollapsed = ref(false)

// 当前路由
const currentRoute = computed(() => route)

// 高亮菜单
const activeMenu = computed(() => route.path)

// 用户下拉操作
function handleUserCommand(cmd: string) {
  if (cmd === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}

// 跳转到用户记录页
function goToProfile() {
  notifyStore.showTip = false
  router.push('/profile')
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.aside {
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logo-area {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #263445;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  overflow: hidden;

  .logo-text--short {
    font-size: 18px;
  }

  .collapse-btn {
    cursor: pointer;
    flex-shrink: 0;
    color: #bfcbd9;
    &:hover { color: #fff; }
  }
}

.side-menu {
  border-right: none;
  background: #304156;
  flex: 1;
  overflow-y: auto;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    color: #bfcbd9;
    &:hover {
      background: #263445;
      color: #fff;
    }
  }

  :deep(.el-menu-item.is-active) {
    background: #263445;
    color: #409eff;
    border-right: 3px solid #409eff;
  }
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  height: 56px;

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .header-icon {
    cursor: pointer;
    color: #606266;
    &:hover { color: #409eff; }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #606266;
    &:hover { color: #409eff; }

    .username {
      font-size: 14px;
    }
  }
}

.main {
  background: #f0f2f5;
  padding: 16px;
  overflow-y: auto;
}

// 实时同步提示条
.sync-tip-bar {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 10px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
  font-size: 14px;

  .close-btn {
    margin-left: auto;
    cursor: pointer;
    &:hover { opacity: 0.7; }
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
