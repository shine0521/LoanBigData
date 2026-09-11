<template>
  <div class="page-container">
    <!-- 工具栏 -->
    <TableToolbar>
      <template #left>
        <span class="page-title">评分记录</span>
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
        <el-input v-model="searchForm.keyword" placeholder="姓名/单号" clearable style="width: 160px" @keyup.enter="handleSearch" />
      </template>
    </TableToolbar>

    <!-- 表格 -->
    <div class="card-container">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="assessmentNo" label="评估单号" width="160" />
        <el-table-column prop="customerName" label="姓名" width="100" />
        <el-table-column prop="comprehensiveScore" label="综合分" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.comprehensiveScore != null" :style="{ color: getScoreColor(row.comprehensiveScore) }">
              {{ row.comprehensiveScore }}
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="中行" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.bocScore != null">{{ row.bocScore }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="工行" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.icbcScore != null">{{ row.icbcScore }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="农行" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.abcScore != null">{{ row.abcScore }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="建行" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.ccbScore != null">{{ row.ccbScore }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="等级" width="100" align="center">
          <template #default="{ row }">
            <RiskTag :level="row.riskLevel" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 2" size="small" type="success">完成</el-tag>
            <el-tag v-else-if="row.status === 3" size="small" type="danger">失败</el-tag>
            <el-tag v-else-if="row.status === 1" size="small" type="warning">计算中</el-tag>
            <el-tag v-else size="small" type="info">待处理</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="评估时间" min-width="170">
          <template #default="{ row }">
            {{ formatDate(row.assessedAt || row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDetail(row)">详情</el-button>
            <el-button type="warning" link size="small" @click="handleRecalc(row)">重算</el-button>
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

    <!-- 详情抽屉 -->
    <el-drawer v-model="drawerVisible" title="评分详情" size="600px" direction="rtl">
      <template v-if="detailData">
        <!-- 基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="评估单号">{{ detailData.assessmentNo }}</el-descriptions-item>
          <el-descriptions-item label="客户姓名">{{ detailData.customerName }}</el-descriptions-item>
          <el-descriptions-item label="综合评分">
            <span :style="{ color: getScoreColor(detailData.comprehensiveScore) }">
              {{ detailData.comprehensiveScore ?? '-' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <RiskTag :level="detailData.riskLevel" />
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="detailData.status === 2" size="small" type="success">完成</el-tag>
            <el-tag v-else size="small" type="info">-</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="评估时间">
            {{ formatDate(detailData.assessedAt || detailData.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 各行评分明细 -->
        <div class="score-section">
          <div class="section-title">评分明细</div>
          <el-table :data="detailData.scores" border size="small">
            <el-table-column prop="scoreType" label="评分类型" width="120">
              <template #default="{ row }">
                {{ getScoreTypeLabel(row.scoreType) }}
              </template>
            </el-table-column>
            <el-table-column prop="score" label="分数" width="90" align="center">
              <template #default="{ row }">
                <span :style="{ color: getScoreColor(row.score) }">{{ row.score }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="riskLevel" label="风险等级" width="100" align="center">
              <template #default="{ row }">
                <RiskTag :level="row.riskLevel" />
              </template>
            </el-table-column>
            <el-table-column prop="trend" label="趋势" width="80" align="center">
              <template #default="{ row }">
                <span v-if="row.trend === 'up'" style="color: #52c41a;">↑</span>
                <span v-else-if="row.trend === 'down'" style="color: #ff4d4f;">↓</span>
                <span v-else style="color: #909399;">→</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="warning" link size="small" @click="openCorrect(row)">修正</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </el-drawer>

    <!-- 评分修正弹窗 -->
    <el-dialog v-model="correctVisible" title="人工修正评分" width="420px">
      <el-form ref="correctFormRef" :model="correctData" label-width="80px">
        <el-form-item label="当前分数">{{ correctData.score }}</el-form-item>
        <el-form-item label="修正分数" prop="score">
          <el-input-number v-model="correctData.score" :min="0" :max="1000" />
        </el-form-item>
        <el-form-item label="修正原因" prop="reason">
          <el-input v-model="correctData.reason" type="textarea" :rows="3" placeholder="必填，说明修正原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="correctVisible = false">取消</el-button>
        <el-button type="primary" :loading="correctLoading" @click="handleCorrect">确认修正</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { assessmentApi } from '@/api'
import TableToolbar from '@/components/TableToolbar.vue'
import RiskTag from '@/components/RiskTag.vue'
import { formatDate } from '@/utils/format'
import type { Assessment, AssessmentDetail, ScoreDetail } from '@/types'

const tableData = ref<Assessment[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const searchForm = reactive({
  keyword: '',
  riskLevel: undefined as number | undefined,
  dateRange: [] as string[],
})

// 详情抽屉
const drawerVisible = ref(false)
const detailData = ref<AssessmentDetail | null>(null)

// 修正弹窗
const correctVisible = ref(false)
const correctFormRef = ref<FormInstance>()
const correctLoading = ref(false)
const correctData = reactive({ id: 0, score: 0, reason: '' })

const SCORE_TYPE_LABELS: Record<string, string> = {
  comprehensive: '综合评分',
  boc: '中国银行',
  icbc: '中国工商银行',
  abc: '中国农业银行',
  ccb: '中国建设银行',
}

function getScoreTypeLabel(type: string): string {
  return SCORE_TYPE_LABELS[type] ?? type
}

function getScoreColor(score: number | null | undefined): string {
  if (score == null) return '#909399'
  if (score >= 800) return '#52c41a'
  if (score >= 600) return '#faad14'
  return '#ff4d4f'
}

async function fetchData() {
  loading.value = true
  try {
    const [startDate, endDate] = searchForm.dateRange || []
    const res = await assessmentApi.getAssessments({
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

async function openDetail(row: Assessment) {
  try {
    const res = await assessmentApi.getAssessmentDetail(row.id)
    detailData.value = res.data
    drawerVisible.value = true
  } catch {
    ElMessage.error('获取详情失败')
  }
}

async function handleRecalc(row: Assessment) {
  try {
    await assessmentApi.recalcAssessment(row.id)
    ElMessage.success('重算任务已提交')
    fetchData()
  } catch { /* error handled by api */ }
}

function openCorrect(row: ScoreDetail) {
  correctData.id = row.id
  correctData.score = row.score
  correctData.reason = ''
  correctVisible.value = true
}

async function handleCorrect() {
  if (!correctData.reason.trim()) {
    ElMessage.warning('请填写修正原因')
    return
  }
  correctLoading.value = true
  try {
    await assessmentApi.correctScore(correctData.id, {
      score: correctData.score,
      reason: correctData.reason,
    })
    ElMessage.success('修正成功')
    correctVisible.value = false
    // 刷新详情
    if (detailData.value) {
      openDetail(detailData.value)
    }
  } finally {
    correctLoading.value = false
  }
}

function handleExport() {
  ElMessage.info('导出功能（占位）')
}

onMounted(() => {
  fetchData()
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

.score-section {
  margin-top: 24px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }
}
</style>
