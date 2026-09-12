<!--
  DecorationBg.vue - 背景装饰层：浮动的渐变圆斑 + 微点阵
  使用：放在页面根 div 下，绝对定位，不抢事件
-->
<template>
  <div class="decoration-bg" aria-hidden="true">
    <div class="blob blob-1" />
    <div class="blob blob-2" />
    <div class="blob blob-3" />
    <svg class="dots" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <pattern id="dot-pattern" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.4)" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#dot-pattern)" />
    </svg>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.decoration-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.55;
  animation: float 12s ease-in-out infinite;

  &.blob-1 {
    width: 7rem;     // 280px
    height: 7rem;
    top: -3rem;
    right: -2rem;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, transparent 70%);
  }

  &.blob-2 {
    width: 5rem;
    height: 5rem;
    top: 6rem;
    left: -2rem;
    background: radial-gradient(circle, rgba(108, 92, 231, 0.35) 0%, transparent 70%);
    animation-delay: -4s;
  }

  &.blob-3 {
    width: 6rem;
    height: 6rem;
    top: 14rem;
    right: -3rem;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%);
    animation-delay: -8s;
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(10px, -15px) scale(1.05); }
}

.dots {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4rem;
  opacity: 0.6;
}
</style>