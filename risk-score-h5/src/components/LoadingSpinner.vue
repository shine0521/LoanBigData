<!--
  LoadingSpinner.vue - 加载动画组件
  props:
    text: 加载提示文字
    size: 尺寸（small | medium | large）
-->
<template>
  <div class="loading-spinner" :class="`size-${size}`">
    <div class="spinner-ring">
      <div class="ring-item" v-for="i in 3" :key="i" />
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  text: '加载中...',
  size: 'medium',
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;

  &.size-small {
    .spinner-ring {
      width: 0.533rem;
      height: 0.533rem;
    }
    .ring-item {
      width: 0.533rem;
      height: 0.533rem;
    }
    .loading-text {
      font-size: $font-size-xs;
    }
  }

  &.size-large {
    .spinner-ring {
      width: 1.067rem;
      height: 1.067rem;
    }
    .ring-item {
      width: 1.067rem;
      height: 1.067rem;
    }
    .loading-text {
      font-size: $font-size-md;
    }
  }
}

.spinner-ring {
  position: relative;
  width: 0.747rem; // 28px
  height: 0.747rem; // 28px
}

.ring-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 0.747rem;
  height: 0.747rem;
  border-radius: $radius-full;
  border: 2px solid transparent;
  border-top-color: $color-primary;
  animation: spinner-rotate 1.2s linear infinite;

  &:nth-child(1) {
    animation-delay: 0s;
  }
  &:nth-child(2) {
    animation-delay: -0.4s;
    border-top-color: rgba($color-primary, 0.6);
  }
  &:nth-child(3) {
    animation-delay: -0.8s;
    border-top-color: rgba($color-primary, 0.3);
  }
}

@keyframes spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: $font-size-xs;
  color: $color-text-secondary;
}
</style>
