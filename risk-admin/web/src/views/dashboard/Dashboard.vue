<template>
  <div class="page-container">
    <div class="page-header">
      <span class="title">工作台</span>
      <span class="subtitle">{{ currentDate }}</span>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e6f7ff;">
            <el-icon size="24" color="#1890ff"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dashData.todaySubmitCount }}</div>
            <div class="stat-label">今日提交量</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #fff7e6;">
            <el-icon size="24" color="#faad14;"><Search /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dashData.todayQueryCount }}</div>
            <div class="stat-label">今日查询量</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #f6ffed;">
            <el-icon size="24" color="#52c41a;"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dashData.totalCustomerCount }}</div>
            <div class="stat-label">客户总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #fff1f0;">
            <el-icon size="24" color="#ff4d4f;"><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dashData.todaySubmitCount }}</div>
            <div class="stat-label">今日评估量</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <!-- 风险分布饼图 -->
      <el-col :span="12">
        <div class="card-container">
          <div class="card-title">风险分布</div>
          <div ref="pieRef" class="chart-container"></div>
        </div>
      </el-col>
      <!-- 各银行平均分柱状图 -->
      <el-col :span="12">
        <div class="card-container">
          <div class="card-title">各银行平均评分</div>
          <div ref="barRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 最近提交记录 -->
    <div class="card-container recent-list">
      <div class="card-title">最近提交记录</div>
      <el-table :data="dashData.recentProfiles" stripe style="width: 100%">
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
        <el-table-column prop="submitSource" label="来源" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.submitSource }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="风险等级" width="100">
          <template #default="{ row }">
            <RiskTag :level="row.riskLevel" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { ElMessage } from 'element-plus'
import { dashboardApi } from '@/api'
import { formatDate } from '@/utils/format'
import MaskText from '@/components/MaskText.vue'
import RiskTag from '@/components/RiskTag.vue'
import { Document, Search, User, Star } from '@element-plus/icons-vue'

// 日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
})

// 工作台数据
const dashData = reactive({
  todaySubmitCount: 0,
  todayQueryCount: 0,
  totalCustomerCount: 0,
  riskDistribution: { low: 0, medium: 0, high: 0 },
  bankAvgScores: { boc: 0, icbc: 0, abc: 0, ccb: 0 },
  recentProfiles: [] as any[],
})

// 图表实例
const pieRef = ref<HTMLElement>()
const barRef = ref<HTMLElement>()
let pieChart: ECharts | null = null
let barChart: ECharts | null = null

function initPieChart() {
  if (!pieRef.value) return
  pieChart = echarts.init(pieRef.value)
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
      },
      data: [
        { value: dashData.riskDistribution.low, name: '低风险', itemStyle: { color: '#52c41a' } },
        { value: dashData.riskDistribution.medium, name: '中风险', itemStyle: { color: '#faad14' } },
        { value: dashData.riskDistribution.high, name: '高风险', itemStyle: { color: '#ff4d4f' } },
      ],
    }],
  }
  pieChart.setOption(option)
}

function initBarChart() {
  if (!barRef.value) return
  barChart = echarts.init(barRef.value)
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['中行', '工行', '农行', '建行'],
      axisLabel: { fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1000,
      axisLabel: { fontSize: 12 },
    },
    series: [{
      type: 'bar',
      barWidth: '40%',
      data: [
        { value: dashData.bankAvgScores.boc, itemStyle: { color: '#409eff' } },
        { value: dashData.bankAvgScores.icbc, itemStyle: { color: '#e6a23c' } },
        { value: dashData.bankAvgScores.abc, itemStyle: { color: '#67c23a' } },
        { value: dashData.bankAvgScores.ccb, itemStyle: { color: '#f56c6c' } },
      ],
      label: { show: true, position: 'top', fontSize: 12 },
    }],
  }
  barChart.setOption(option)
}

async function fetchDashboard() {
  try {
    const res = await dashboardApi.getDashboard()
    const data = res.data
    dashData.todaySubmitCount = data.todaySubmitCount
    dashData.todayQueryCount = data.todayQueryCount
    dashData.totalCustomerCount = data.totalCustomerCount
    dashData.riskDistribution = data.riskDistribution
    dashData.bankAvgScores = data.bankAvgScores
    dashData.recentProfiles = data.recentProfiles || []

    await nextTick()
    initPieChart()
    initBarChart()
  } catch {
    // 使用空数据初始化图表
    await nextTick()
    initPieChart()
    initBarChart()
  }
}

onMounted(() => {
  fetchDashboard()
  window.addEventListener('resize', () => {
    pieChart?.resize()
    barChart?.resize()
  })
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
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }

    .subtitle {
      font-size: 14px;
      color: #909399;
    }
  }
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;

  .stat-icon {
    width: 52px;
    height: 52px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 13px;
      color: #909399;
      margin-top: 4px;
    }
  }
}

.chart-row {
  margin-bottom: 16px;
}

.card-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
  }
}

.chart-container {
  height: 260px;
  width: 100%;
}

.recent-list {
  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
  }
}
</style>
