<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // 阻止浏览器默认右键菜单（后台管理场景）
  document.addEventListener('contextmenu', (e) => {
    // 可选：放开此注释可屏蔽右键菜单
    // e.preventDefault()
  })
})
</script>
