<!-- ============================================
  BankIcon.vue - 自定义银行 SVG 图标
  4 行专属图标（中行/工行/农行/建行）
  高端金融风：单色描边 + 居中徽记
  ============================================ -->
<template>
  <span class="bank-icon" :class="`bank-icon--${scoreType}`">
    <!-- 中国银行：圆形外框 + 中字 -->
    <svg v-if="scoreType === 'boc'" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="none" :stroke="color" stroke-width="2"/>
      <text x="32" y="42" font-family="serif" font-size="28" font-weight="700"
            text-anchor="middle" :fill="color">中</text>
    </svg>

    <!-- 工商银行：方底圆角 + ICBC 字 -->
    <svg v-else-if="scoreType === 'icbc'" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="52" height="52" rx="6" fill="none" :stroke="color" stroke-width="2"/>
      <text x="32" y="40" font-family="serif" font-size="20" font-weight="700"
            text-anchor="middle" :fill="color">工</text>
    </svg>

    <!-- 农业银行：盾形 + 农字 -->
    <svg v-else-if="scoreType === 'abc'" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6 L54 14 L54 36 Q54 50 32 58 Q10 50 10 36 L10 14 Z"
            fill="none" :stroke="color" stroke-width="2" stroke-linejoin="round"/>
      <text x="32" y="42" font-family="serif" font-size="24" font-weight="700"
            text-anchor="middle" :fill="color">农</text>
    </svg>

    <!-- 建设银行：菱形 + 建字 -->
    <svg v-else-if="scoreType === 'ccb'" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6 L58 32 L32 58 L6 32 Z" fill="none" :stroke="color" stroke-width="2" stroke-linejoin="round"/>
      <text x="32" y="40" font-family="serif" font-size="22" font-weight="700"
            text-anchor="middle" :fill="color">建</text>
    </svg>

    <!-- 默认 fallback：盾牌 -->
    <svg v-else viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6 L54 14 L54 36 Q54 50 32 58 Q10 50 10 36 L10 14 Z"
            fill="none" :stroke="color" stroke-width="2" stroke-linejoin="round"/>
      <path d="M22 32 L29 39 L42 24" fill="none" :stroke="color" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    scoreType: 'boc' | 'icbc' | 'abc' | 'ccb' | string
    color?: string
  }>(),
  { color: '#1565C0' }
)
</script>

<style lang="scss" scoped>
.bank-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  font-size: inherit;
  line-height: 1;
  vertical-align: middle;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>