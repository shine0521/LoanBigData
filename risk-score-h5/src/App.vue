<template>
  <div id="app-root">
    <router-view v-slot="{ Component }">
      <transition name="slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
// ============================================
// App.vue - 路由出口
// 页面级样式（nav-bar / safe-area）由各页面负责
// ============================================
</script>

<style lang="scss">
// App 容器：撑满整屏，让 Vant 组件自动铺开
#app-root {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f7fa;
  overflow-x: hidden;
}

// 页面切换动画：左右滑入
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-30%);
  opacity: 0;
}
</style>