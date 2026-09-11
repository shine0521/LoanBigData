<template>
  <span :class="className" :title="text">{{ displayText }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text: string
  type?: 'phone' | 'idCard' | 'name'
  showFull?: boolean // 详情页可展开完整值
}

const props = withDefaults(defineProps<Props>(), {
  type: 'name',
  showFull: false,
})

const displayText = computed(() => {
  if (props.showFull || !props.text) return props.text

  switch (props.type) {
    case 'phone':
      // 13800138000 → 138****8000
      if (props.text.length < 7) return props.text
      return props.text.slice(0, 3) + '****' + props.text.slice(-4)

    case 'idCard':
      // 110101199001011234 → 110101********1234
      if (props.text.length < 10) return props.text
      return props.text.slice(0, 6) + '********' + props.text.slice(-4)

    case 'name':
    default:
      // 张三 → 张*；欧阳锋 → 欧*锋
      if (!props.text || props.text.length <= 1) return props.text
      if (props.text.length === 2) return props.text[0] + '*'
      return props.text[0] + '*' + props.text[props.text.length - 1]
  }
})

const className = computed(() => {
  return ''
})
</script>

<script lang="ts">
export default {
  name: 'MaskText',
}
</script>
