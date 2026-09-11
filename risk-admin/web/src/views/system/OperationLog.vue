<template>
  <div class="page-container">
    <div class="page-header">
      <span class="title">操作日志</span>
    </div>

    <!-- 搜索 -->
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="操作人/操作内容" clearable style="width: 180px" @keyup.enter="handleSearch" />
      <el-select v-model="searchForm.module" placeholder="模块" clearable style="width: 140px">
        <el-option label="用户管理" value="customer" />
        <el-option label="评分管理" value="assessment" />
        <el-option label="系统管理" value="system" />
      </el-select>
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 260px"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="card-container">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="module" label="模块" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="动作" width="140" />
        <el-table-column prop="targetType" label="操作对象" width="120">
          <template #default="{ row }">
            {{ row.targetType || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="createdAt" label="操作时间" min-width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="fetchData"
          @size-change="fetchData"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="操作详情" width="640px">
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item label="操作人">{{ currentRow.operator }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ currentRow.module }}</el-descriptions-item>
        <el-descriptions-item label="动作">{{ currentRow.action }}</el-descriptions-item>
        <el-descriptions-item label="操作对象">{{ currentRow.targetType }} #{{ currentRow.targetId }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentRow.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ formatDate(currentRow.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="变更前">
          <pre style="margin: 0; white-space: pre-wrap; font-size: 12px;">{{ formatJson(currentRow.beforeData) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="变更后">
          <pre style="margin: 0; white-space: pre-wrap; font-size: 12px;">{{ formatJson(currentRow.afterData) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { systemApi } from '@/api'
import { formatDate } from '@/utils/format'
import type { OperationLog } from '@/types'

const tableData = ref<OperationLog[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const searchForm = reactive({
  keyword: '',
  module: '',
  dateRange: [] as string[],
})

const detailVisible = ref(false)
const currentRow = ref<OperationLog | null>(null)

async function fetchData() {
  loading.value = true
  try {
    const [startDate, endDate] = searchForm.dateRange || []
    const res = await systemApi.getOperationLogs({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      module: searchForm.module || undefined,
      startDate,
      endDate,
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  Object.assign(searchForm, { keyword: '', module: '', dateRange: [] })
  handleSearch()
}

function openDetail(row: OperationLog) {
  currentRow.value = row
  detailVisible.value = true
}

function formatJson(data: any): string {
  if (!data) return '(无)'
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.page-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
  align-items: center;
}

.card-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
