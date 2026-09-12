<!--
  BankIcon.vue - 4 大行 SVG 扁平化 logo（带品牌色）
  使用：根据 scoreType 选对应 bank，自动适配宽度
  风格：圆角方形 + 中央字标（不是真 logo，规避商标）
-->
<template>
  <span class="bank-icon" :style="{ background: bg }">
    <span class="bank-icon-text" :style="{ color: fg }">{{ letter }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  scoreType: string
  size?: string  // CSS size, e.g. '32px'
}>(), { size: '0.853rem' /* 32px */ })

const meta: Record<string, { letter: string; bg: string; fg: string }> = {
  boc:  { letter: '中', bg: 'linear-gradient(135deg, #C8102E 0%, #8B0A1F 100%)', fg: '#fff' },  // 中行 红
  icbc: { letter: '工', bg: 'linear-gradient(135deg, #E60012 0%, #B8000E 100%)', fg: '#fff' },  // 工行 红
  abc:  { letter: '农', bg: 'linear-gradient(135deg, #00A651 0%, #007A3D 100%)', fg: '#fff' },  // 农行 绿
  ccb:  { letter: '建', bg: 'linear-gradient(135deg, #003C8F 0%, #002766 100%)', fg: '#fff' },  // 建行 蓝
}

const m = computed(() => meta[props.scoreType] ?? { letter: '?', bg: '#999', fg: '#fff' })
const letter = computed(() => m.value.letter)
const bg = computed(() => m.value.bg)
const fg = computed(() => m.value.fg)
</script>

<style lang="scss" scoped>
.bank-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: v-bind(size);
  height: v-bind(size);
  border-radius: 0.16rem; // 6px
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
  font-family: 'PingFang SC', 'Helvetica Neue', sans-serif;
  font-weight: 700;
  user-select: none;
}

.bank-icon-text {
  font-size: 0.48rem; // 18px
  line-height: 1;
}
</style>