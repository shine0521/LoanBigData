<template>
  <div class="page-container">
    <!-- 工具栏 -->
    <TableToolbar>
      <template #left>
        <span class="page-title">用户信息记录</span>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon> 导出
        </el-button>
      </template>
      <template #right>
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 260px"
        />
        <el-select v-model="searchForm.riskLevel" placeholder="风险等级" clearable style="width: 120px">
          <el-option label="全部" :value="undefined" />
          <el-option label="低风险" :value="1" />
          <el-option label="中风险" :value="2" />
          <el-option label="高风险" :value="3" />
        </el-select>
        <el-input v-model="searchForm.keyword" placeholder="姓名/手机号" clearable style="width: 160px" @keyup.enter="handleSearch" />
      </template>
    </TableToolbar>

    <!-- 实时同步提示 -->
    <div v-if="notifyStore.showTip" class="sync-tip">
      <el-icon color="#1890ff"><Bell /></el-icon>
      {{ notifyStore.newRecordTip }}
      <el-button type="primary" link size="small" @click="handleNewRecord">
        刷新列表
      </el-button>
    </div>

    <!-- 表格 -->
    <div class="card-container">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="记录ID" width="90" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="idCard" label="身份证" width="180">
          <template #default="{ row }">
            <MaskText :text="row.idCard" type="idCard" />
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140">
          <template #default="{ row }">
            <MaskText :text="row.phone" type="phone" />
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="风险等级" width="100" align="center">
          <template #default="{ row }">
            <RiskTag :level="row.riskLevel" />
          </template>
        </el-table-column>
        <el-table-column prop="comprehensiveScore" label="综合评分" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.comprehensiveScore != null">{{ row.comprehensiveScore }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="assessmentNo" label="评估单号" width="160">
          <template #default="{ row }">
            <span v-if="row.assessmentNo">{{ row.assessmentNo }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="submitSource" label="来源" width="80">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.submitSource }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" min-width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Bell } from '@element-plus/icons-vue'
import { profileApi } from '@/api'
import { useNotifyStore } from '@/stores/notify'
import TableToolbar from '@/components/TableToolbar.vue'
import MaskText from '@/components/MaskText.vue'
import RiskTag from '@/components/RiskTag.vue'
import { formatDate } from '@/utils/format'
import type { CustomerProfile } from '@/types'

const notifyStore = useNotifyStore()

const tableData = ref<CustomerProfile[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const searchForm = reactive({
  keyword: '',
  riskLevel: undefined as number | undefined,
  dateRange: [] as string[],
})

// 注册 WebSocket 刷新回调
function handleNewRecord() {
  notifyStore.showTip = false
  pagination.page = 1
  fetchData()
}

async function fetchData() {
  loading.value = true
  try {
    const [startDate, endDate] = searchForm.dateRange || []
    const res = await profileApi.getProfiles({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      riskLevel: searchForm.riskLevel,
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

function handleExport() {
  ElMessage.info('导出功能（占位）')
}

onMounted(() => {
  fetchData()
  // 注册刷新回调
  notifyStore.registerRefresh('profile', () => {
    if (document.visibilityState === 'visible') {
      fetchData()
    }
  })
})

onUnmounted(() => {
  notifyStore.unregisterRefresh('profile')
})
</script>

<style scoped lang="scss">
.page-container {
  .page-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-right: 16px;
  }
}

.sync-tip {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 10px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
  font-size: 14px;
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

.text-muted {
  color: #c0c4cc;
}
</style>
