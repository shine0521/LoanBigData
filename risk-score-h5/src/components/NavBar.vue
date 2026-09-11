<!--
  NavBar.vue - 顶部导航栏组件
  props:
    title: 导航标题
    showBack: 是否显示返回按钮（默认 true）
-->
<template>
  <div class="navbar">
    <div class="navbar-left">
      <span v-if="showBack" class="back-btn" @click="handleBack" role="button" aria-label="返回">
        <span class="back-icon">←</span>
      </span>
    </div>
    <div class="navbar-title">{{ title }}</div>
    <div class="navbar-right" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  title?: string
  showBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '风险评分',
  showBack: true,
})

const router = useRouter()

function handleBack() {
  router.back()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.navbar {
  position: sticky;
  top: 0;
  z-index: $z-index-navbar;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 1.173rem; // 44px
  padding: 0 $spacing-md;
  background-color: $color-bg-white;
  border-bottom: 1px solid $color-border;

  &-left,
  &-right {
    width: 1.333rem; // 50px
  }

  &-title {
    flex: 1;
    text-align: center;
    font-size: $font-size-lg;
    font-weight: 600;
    color: $color-text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.back-icon {
  font-size: $font-size-xl;
  color: $color-text-primary;
  line-height: 1;
}
</style>
