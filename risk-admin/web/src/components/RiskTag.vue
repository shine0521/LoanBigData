<template>
  <el-tag :type="tagType" size="small" effect="light">
    {{ label }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

interface Props {
  level: number | null | undefined
  // 可选：直接传字符串标签
  label?: string
}

const props = defineProps<Props>()

const RISK_CONFIG: Record<number, { type: string; label: string }> = {
  1: { type: 'success', label: '低风险' },
  2: { type: 'warning', label: '中风险' },
  3: { type: 'danger', label: '高风险' },
}

const tagType = computed(() => {
  if (props.label) return 'info'
  if (props.level == null) return 'info'
  return RISK_CONFIG[props.level]?.type ?? 'info'
})

const label = computed(() => {
  if (props.label) return props.label
  if (props.level == null) return '-'
  return RISK_CONFIG[props.level]?.label ?? '-'
})
</script>

<script lang="ts">
export default {
  name: 'RiskTag',
}
</script>
