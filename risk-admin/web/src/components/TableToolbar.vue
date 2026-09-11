<template>
  <div class="toolbar">
    <!-- 左侧插槽：新增、导入等按钮 -->
    <div class="toolbar-left">
      <slot name="left"></slot>
    </div>
    <!-- 右侧插槽：搜索表单 -->
    <div class="toolbar-right">
      <slot name="right"></slot>
      <!-- 搜索 & 重置按钮 -->
      <el-button type="primary" @click="$emit('search')">查询</el-button>
      <el-button @click="$emit('reset')">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['search', 'reset'])
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;

  .toolbar-left {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
}
</style>
