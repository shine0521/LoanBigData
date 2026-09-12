<!--
  ResultPage.vue - 评分结果页（路由：/result，name: result）
  风格：现代金融科技风 — Hero 评分 + 银行详情卡片 + 安全提示
  流程：先 5-10 秒加载动画 → 加载完成展示评分
-->
<template>
  <div class="page-result">

    <!-- ===== 加载中 ===== -->
    <div v-if="loading" class="loading-page">
      <DecorationBg />
      <div class="loading-card">
        <div class="loading-icon-wrap">
          <div class="loading-ring loading-ring-1" />
          <div class="loading-ring loading-ring-2" />
          <div class="loading-ring loading-ring-3" />
          <div class="loading-center">
            <AppIcon name="database" color="#4A90E2" size="0.7rem" />
          </div>
        </div>
        <p class="loading-title">个人综合评分</p>
        <p class="loading-tip">{{ loadingTip }}<span class="dot-anim">.</span></p>
        <div class="loading-progress">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }" />
        </div>
        <p class="loading-status">已完成 {{ Math.floor(progressPercent) }}%</p>
      </div>
    </div>

    <!-- ===== 结果内容 ===== -->
    <template v-else-if="comprehensive">
      <!-- 蓝色 Hero -->
      <div class="hero">
        <DecorationBg />

        <!-- 顶部小标签 -->
        <div class="hero-top">
          <span class="hero-top-badge"><AppIcon name="bolt" color="#FFD740" size="0.36rem" /> 实时评估</span>
        </div>

        <p class="hero-label">您的综合评分</p>

        <!-- 评分大数字（带圆环进度） -->
        <div class="hero-score-wrap">
          <svg class="score-ring" viewBox="0 0 200 200">
            <circle class="ring-bg" cx="100" cy="100" r="86" fill="none" stroke-width="8" />
            <circle
              class="ring-fg"
              cx="100" cy="100" r="86"
              fill="none"
              stroke-width="8"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="ringOffset"
              :transform="'rotate(-90 100 100)'"
            />
          </svg>
          <div class="hero-score" :class="scoreColorClass">
            <span class="score-num">{{ comprehensive.score }}</span>
            <span class="score-divider">/</span>
            <span class="score-total">1000</span>
          </div>
        </div>

        <!-- 等级标签 + 评价 -->
        <div class="hero-level-badge" :class="levelBadgeClass">
          <AppIcon :name="levelIconName" :color="levelIconColor" size="0.36rem" />
          <span>{{ comprehensive.levelName }}</span>
        </div>
        <p class="hero-comment">{{ levelComment }}</p>

        <!-- 底部白色卡片（向上凸出） -->
        <div class="hero-bottom-card">
          <div class="card-header">
            <span class="card-title"><AppIcon name="database" color="#4A90E2" size="0.42rem" /> 合作机构评分详情</span>
            <span class="card-desc">数据来源：银行大数据</span>
          </div>

          <!-- 四行银行评分 -->
          <div class="bank-list">
            <div
              v-for="bank in banks"
              :key="bank.scoreType"
              class="bank-item"
            >
              <div class="bank-left">
                <BankIcon :score-type="bank.scoreType" size="0.96rem" />
                <span class="bank-name">{{ getBankMeta(bank.scoreType).displayName }}</span>
              </div>
              <div class="bank-right">
                <span class="bank-score" :class="getBankScoreClass(bank.score)">
                  {{ bank.score }}
                </span>
                <span class="bank-level" :class="getBankLevelClass(bank.score)">
                  {{ getLevelText(bank.score) }}
                </span>
              </div>
            </div>
          </div>

          <!-- 重新查询按钮 -->
          <div class="action-row">
            <button class="restart-btn" @click="handleRestart">
              <AppIcon name="refresh" color="#fff" size="0.42rem" />
              <span>重新查询</span>
            </button>
          </div>

          <!-- 安全提示 -->
          <p class="security-tip">
            <AppIcon name="info" color="#999" size="0.32rem" />
            <span>评分结果仅供参考，实际业务以银行官方审核为准</span>
          </p>
        </div>
      </div>
    </template>

    <!-- ===== 无结果 / 错误 ===== -->
    <div v-else class="empty-page">
      <DecorationBg />
      <span class="empty-icon">📋</span>
      <p class="empty-title">暂无评分数据</p>
      <p class="empty-sub">{{ errorMsg || '查询失败，请稍后重试' }}</p>
      <button class="restart-btn" @click="handleRestart">返回</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRiskStore } from '@/stores/risk'
import { getAssessment } from '@/api/risk'
import type { QueryScoreResponse } from '@/api/risk'
import AppIcon from '@/components/icons/AppIcons.vue'
import BankIcon from '@/components/icons/BankIcon.vue'
import DecorationBg from '@/components/DecorationBg.vue'

const router = useRouter()
const store = useRiskStore()

// ---------- 状态 ----------
const loading = ref(false)
const errorMsg = ref('')
const elapsedSeconds = ref(0)
const progressPercent = ref(0)

const loadingTips = [
  '正在连接安全评估引擎',
  '正在获取银行信用数据',
  '正在分析多维度风险因子',
  '正在计算综合评分',
  '正在生成各银行评分',
]
const loadingTip = ref(loadingTips[0])

let elapsedTimer: ReturnType<typeof setInterval> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null
let tipTimer: ReturnType<typeof setInterval> | null = null

// ---------- 计算属性 ----------
const comprehensive = computed(() => store.resultData?.comprehensive ?? null)
const banks = computed(() => store.resultData?.banks ?? [])

// 圆环进度（满分 1000）
const circumference = 2 * Math.PI * 86 // ~540
const ringOffset = computed(() => {
  const s = comprehensive.value?.score ?? 0
  return circumference * (1 - s / 1000)
})

const scoreColorClass = computed(() => {
  const s = comprehensive.value?.score ?? 0
  if (s >= 800) return 'score-high'
  if (s >= 600) return 'score-mid'
  return 'score-low'
})

const levelBadgeClass = computed(() => {
  const s = comprehensive.value?.score ?? 0
  if (s >= 800) return 'badge-low'
  if (s >= 600) return 'badge-mid'
  return 'badge-high'
})

const levelIconName = computed(() => {
  const s = comprehensive.value?.score ?? 0
  if (s >= 800) return 'check'
  if (s >= 600) return 'info'
  return 'warning'
})

const levelIconColor = computed(() => {
  const s = comprehensive.value?.score ?? 0
  if (s >= 800) return '#00C853'
  if (s >= 600) return '#FFD740'
  return '#FF3D00'
})

const levelComment = computed(() => {
  const s = comprehensive.value?.score ?? 0
  if (s >= 800) return '信用表现优秀 · 银行高度认可'
  if (s >= 600) return '信用表现良好 · 按时履约即可'
  return '信用需关注 · 建议提升履约记录'
})

// ---------- 银行映射 ----------
const bankMeta: Record<string, { displayName: string }> = {
  boc:  { displayName: '中行评分' },
  icbc: { displayName: '工行评分' },
  abc:  { displayName: '农行评分' },
  ccb:  { displayName: '建行评分' },
}

function getBankMeta(scoreType: string): { displayName: string } {
  return bankMeta[scoreType] ?? { displayName: scoreType }
}

// ---------- 银行分数辅助 ----------
function getBankScoreClass(score: number) {
  if (score >= 800) return 'bank-score-high'
  if (score >= 600) return 'bank-score-mid'
  return 'bank-score-low'
}

function getBankLevelClass(score: number) {
  if (score >= 800) return 'bank-level-high'
  if (score >= 600) return 'bank-level-mid'
  return 'bank-level-low'
}

function getLevelText(score: number): string {
  if (score >= 800) return '低风险'
  if (score >= 600) return '中风险'
  return '高风险'
}

// ---------- 加载逻辑 ----------
onMounted(async () => {
  if (store.resultData) return

  const no = store.assessmentNo
  const hasFormData = !!store.formData.name

  if (!no && !hasFormData) {
    router.replace({ name: 'index' })
    return
  }

  loading.value = true
  startTimers()

  const waitMs = 5000 + Math.floor(Math.random() * 5001)

  try {
    await new Promise<void>((resolve) => setTimeout(resolve, waitMs))

    if (!no) {
      const rand = () => 600 + Math.floor(Math.random() * 51)
      const mockResult: QueryScoreResponse = {
        comprehensive: { score: rand(), level: 2, levelName: '中风险' },
        banks: [
          { scoreType: 'boc',  score: rand(), level: 2, levelName: '中风险', trend: 'stable' },
          { scoreType: 'icbc', score: rand(), level: 2, levelName: '中风险', trend: 'stable' },
          { scoreType: 'abc',  score: rand(), level: 2, levelName: '中风险', trend: 'stable' },
          { scoreType: 'ccb',  score: rand(), level: 2, levelName: '中风险', trend: 'stable' },
        ],
        assessmentNo: 'MOCK' + Date.now(),
      }
      store.saveResult(mockResult)
      return
    }

    const result = await getAssessment(no)
    store.saveResult(result)
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : '查询评分失败'
  } finally {
    stopTimers()
    loading.value = false
  }
})

onUnmounted(() => stopTimers())

// ---------- 定时器 ----------
function startTimers() {
  elapsedSeconds.value = 0
  elapsedTimer = setInterval(() => { elapsedSeconds.value++ }, 1000)

  progressPercent.value = 0
  progressTimer = setInterval(() => {
    if (progressPercent.value < 90) {
      progressPercent.value += Math.random() * 8 + 2
      if (progressPercent.value > 90) progressPercent.value = 90
    }
  }, 300)

  let tipIndex = 0
  tipTimer = setInterval(() => {
    tipIndex = (tipIndex + 1) % loadingTips.length
    loadingTip.value = loadingTips[tipIndex]
  }, 1500)
}

function stopTimers() {
  if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null }
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null }
  if (tipTimer) { clearInterval(tipTimer); tipTimer = null }
  progressPercent.value = 100
}

function handleRestart() {
  store.reset()
  router.push({ name: 'index' })
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

// ============================================================
// 根容器
// ============================================================
.page-result {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #F4F7FC;
  overflow-x: hidden;
}

// ============================================================
// 加载页（居中卡片）
// ============================================================
.loading-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
}

.loading-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 8rem;
  background: #fff;
  border-radius: 0.48rem;
  padding: $spacing-xl $spacing-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  box-shadow: 0 16px 48px rgba(74, 100, 180, 0.18);
}

.loading-icon-wrap {
  position: relative;
  width: 3.2rem;
  height: 3.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-xs;
}

.loading-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
}

.loading-ring-1 {
  border-top-color: #4A90E2;
  animation: spin 1.2s linear infinite;
}

.loading-ring-2 {
  border-right-color: #6C5CE7;
  inset: 0.24rem;
  animation: spin 1.6s linear reverse infinite;
}

.loading-ring-3 {
  border-bottom-color: #A55EEA;
  inset: 0.48rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-center {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: pulse-scale 1.5s ease-in-out infinite;
}

@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.loading-title {
  font-size: $font-size-xl;
  font-weight: 800;
  color: $color-text-primary;
  margin: 0;
  letter-spacing: 0.04em;
}

.loading-tip {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  margin: 0;
  text-align: center;
}

.dot-anim {
  display: inline-block;
  animation: dot-bounce 1.4s ease-in-out infinite;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: #4A90E2;
}

@keyframes dot-bounce {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

.loading-progress {
  width: 80%;
  max-width: 320px;
  height: 0.16rem;
  background: rgba(74, 144, 226, 0.15);
  border-radius: $radius-full;
  overflow: hidden;
  margin-top: $spacing-xs;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4A90E2 0%, #6C5CE7 50%, #A55EEA 100%);
  border-radius: $radius-full;
  transition: width 0.3s ease-out;
}

.loading-status {
  font-size: $font-size-xs;
  color: #4A90E2;
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.02em;
}

// ============================================================
// Hero 区（带背景装饰）
// ============================================================
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md $spacing-md $spacing-xl;
  background: linear-gradient(180deg, #4A90E2 0%, #6C7CE7 35%, #A8B6F0 60%, #F4F7FC 100%);
  overflow: hidden;
}

.hero-top {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-xs;
  z-index: 2;
}

.hero-top-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.08rem;
  padding: 0.12rem 0.32rem;
  background: rgba(255, 215, 64, 0.15);
  border: 1px solid rgba(255, 215, 64, 0.4);
  border-radius: $radius-full;
  font-size: 0.28rem;
  color: #FFD740;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.hero-label {
  font-size: $font-size-md;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.08em;
  z-index: 2;
}

// 评分大数字（带圆环）
.hero-score-wrap {
  position: relative;
  width: 4.8rem;
  height: 4.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: $spacing-xs;
  z-index: 2;
}

.score-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));

  .ring-bg {
    stroke: rgba(255, 255, 255, 0.25);
  }

  .ring-fg {
    stroke-linecap: round;
    transition: stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s;
    stroke: #FFD740;

    .score-high & { stroke: #00E5FF; }
    .score-mid &  { stroke: #FFD740; }
    .score-low &  { stroke: #FF6E6E; }
  }
}

.hero-score {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 0.16rem;
  line-height: 1;
}

.score-num {
  font-size: 2.4rem; // ~90px
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(180deg, #fff 0%, #F0F4FF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.score-divider,
.score-total {
  font-size: 0.853rem; // ~32px
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.hero-level-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.12rem;
  padding: 0.18rem $spacing-lg;
  border-radius: 0.533rem;
  font-size: $font-size-sm;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-top: $spacing-md;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 2;
}

.hero-comment {
  font-size: $font-size-xs;
  color: rgba(255, 255, 255, 0.85);
  margin: 0.24rem 0 0 0;
  letter-spacing: 0.04em;
  z-index: 2;
}

// 等级标签颜色
.badge-low  { background: rgba(0, 229, 255, 0.2);  border: 1px solid rgba(0, 229, 255, 0.5);  color: #B0F5FF; }
.badge-mid  { background: rgba(255, 215, 64, 0.2);  border: 1px solid rgba(255, 215, 64, 0.5);  color: #FFE082; }
.badge-high { background: rgba(255, 110, 110, 0.2); border: 1px solid rgba(255, 110, 110, 0.5); color: #FFB0B0; }

// ============================================================
// 白色底部卡片（向上凸出，盖住 hero 底部）
// ============================================================
.hero-bottom-card {
  position: relative;
  z-index: 3;
  margin-top: $spacing-lg;
  background: #fff;
  border-radius: 0.48rem 0.48rem 0 0;
  padding: $spacing-md $spacing-md $spacing-lg;
  box-shadow: 0 -8px 24px rgba(74, 100, 180, 0.12);
  width: calc(100% + #{$spacing-md} * 2);
  margin-left: -$spacing-md;
  margin-right: -$spacing-md;
  padding-bottom: $spacing-xl;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $spacing-sm;
  border-bottom: 1px solid $color-border-light;
  margin-bottom: $spacing-sm;
}

.card-title {
  display: inline-flex;
  align-items: center;
  gap: 0.16rem;
  font-size: $font-size-md;
  font-weight: 700;
  color: $color-text-primary;
}

.card-desc {
  font-size: $font-size-xs;
  color: $color-text-placeholder;
}

// ============================================================
// 四行银行评分
// ============================================================
.bank-list {
  display: flex;
  flex-direction: column;
}

.bank-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm 0;
  border-bottom: 1px solid $color-border-light;

  &:last-child {
    border-bottom: 0;
  }
}

.bank-left {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.bank-name {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-text-primary;
  white-space: nowrap;
}

.bank-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.08rem;
}

.bank-score {
  font-size: $font-size-xl;
  font-weight: 800;
  line-height: 1;

  &.bank-score-high { color: $color-risk-low; }
  &.bank-score-mid  { color: $color-risk-medium; }
  &.bank-score-low  { color: $color-risk-high; }
}

.bank-level {
  font-size: 0.28rem;
  font-weight: 600;
  padding: 0.04rem 0.213rem;
  border-radius: $radius-sm;

  &.bank-level-high { background: rgba(0, 200, 83, 0.1);  color: $color-risk-low; }
  &.bank-level-mid  { background: rgba(255, 153, 0, 0.1); color: $color-risk-medium; }
  &.bank-level-low  { background: rgba(255, 61, 0, 0.1);  color: $color-risk-high; }
}

// ============================================================
// 重新查询按钮
// ============================================================
.action-row {
  margin-top: $spacing-lg;
}

.restart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.16rem;
  width: 100%;
  height: 1.173rem;
  border: 0;
  border-radius: 0.587rem;
  background: linear-gradient(135deg, #4A90E2 0%, #6C5CE7 100%);
  color: #fff;
  font-size: $font-size-sm;
  font-weight: 700;
  letter-spacing: 0.04em;
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.32);
  cursor: pointer;
  transition: all $duration-fast;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: translateY(1px);
    box-shadow: 0 4px 12px rgba(108, 92, 231, 0.32);
  }
}

// ============================================================
// 安全提示
// ============================================================
.security-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.08rem;
  margin-top: $spacing-md;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  line-height: 1.5;
}

// ============================================================
// 空状态
// ============================================================
.empty-page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: $spacing-sm;
  padding: $spacing-xl $spacing-md;
  text-align: center;
  background: #F4F7FC;
}

.empty-icon {
  font-size: 1.6rem;
  z-index: 1;
}

.empty-title {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $color-text-primary;
  margin: 0;
  z-index: 1;
}

.empty-sub {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  margin: 0;
  z-index: 1;
}

.empty-page .restart-btn {
  width: auto;
  padding: 0 $spacing-xl;
  margin-top: $spacing-md;
  z-index: 1;
}
</style>