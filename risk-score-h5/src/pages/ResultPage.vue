<!--
  ResultPage.vue - 评分结果页（路由：/result，name: result）
  风格：蓝色 Hero "个人综合评分" + 白色卡片四行银行评分
  流程：先 5-10 秒加载动画 → 加载完成展示评分
-->
<template>
  <div class="page-result">

    <!-- ===== 加载中 ===== -->
    <div v-if="loading" class="loading-page">
      <div class="loading-icon">
        <div class="loading-ring" />
        <span class="loading-star">🛡️</span>
      </div>
      <p class="loading-title">个人综合评分</p>
      <p class="loading-tip">{{ loadingTip }}</p>
      <div class="loading-progress">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }" />
      </div>
    </div>

    <!-- ===== 结果内容 ===== -->
    <template v-else-if="comprehensive">
      <!-- 蓝色 Hero -->
      <div class="hero">
        <p class="hero-label">您的综合评分</p>
        <div class="hero-score" :class="scoreColorClass">
          <span class="score-num">{{ comprehensive.score }}</span>
          <span class="score-divider">/</span>
          <span class="score-total">1000</span>
        </div>
        <div class="hero-level-badge" :class="levelBadgeClass">
          {{ comprehensive.levelName }}
        </div>
      </div>

      <!-- 白色卡片：四行银行评分 -->
      <div class="result-card">
        <!-- 卡片标题 -->
        <div class="card-header">
          <span class="card-title">合作机构评分详情</span>
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
              <span class="bank-logo">{{ getBankMeta(bank.scoreType).logo }}</span>
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
            重新查询
          </button>
        </div>

        <!-- 安全提示 -->
        <p class="security-tip">
          ⚠️ 评分结果仅供参考，实际业务以银行官方审核为准
        </p>
      </div>
    </template>

    <!-- ===== 无结果 / 错误 ===== -->
    <div v-else class="empty-page">
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

const router = useRouter()
const store = useRiskStore()

// ---------- 状态 ----------
const loading = ref(false)
const errorMsg = ref('')
const elapsedSeconds = ref(0)
const progressPercent = ref(0)

const loadingTips = [
  '正在连接安全评估引擎...',
  '正在获取信用数据...',
  '正在分析风险因子...',
  '正在计算综合评分...',
  '正在生成各银行评分...',
]
const loadingTip = ref(loadingTips[0])

let elapsedTimer: ReturnType<typeof setInterval> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null
let tipTimer: ReturnType<typeof setInterval> | null = null

// ---------- 计算属性 ----------
const comprehensive = computed(() => store.resultData?.comprehensive ?? null)
const banks = computed(() => store.resultData?.banks ?? [])

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

// ---------- 银行映射（scoreType → 显示名 + logo） ----------
const bankMeta: Record<string, { displayName: string; logo: string }> = {
  boc:  { displayName: '中行评分', logo: '🏦' },
  icbc: { displayName: '工行评分', logo: '🏛' },
  abc:  { displayName: '农行评分', logo: '🌾' },
  ccb:  { displayName: '建行评分', logo: '🏗' },
}

function getBankMeta(scoreType: string): { displayName: string; logo: string } {
  return bankMeta[scoreType] ?? { displayName: scoreType, logo: '🏦' }
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
  // 已加载则直接显示
  if (store.resultData) return

  const no = store.assessmentNo
  const hasFormData = !!store.formData.name

  // 没有评估单号 + 没有表单数据 → 回首页
  if (!no && !hasFormData) {
    router.replace({ name: 'index' })
    return
  }

  loading.value = true
  startTimers()

  const waitMs = 5000 + Math.floor(Math.random() * 5001) // 5-10 秒随机加载

  try {
    await new Promise<void>((resolve) => setTimeout(resolve, waitMs))

    // ========== 纯前端分支：没有评估单号 → 生成 mock 随机评分（600-650）==========
    if (!no) {
      const rand = () => 600 + Math.floor(Math.random() * 51) // 600-650 随机
      const mockResult: QueryScoreResponse = {
        comprehensive: {
          score: rand(),
          level: 2,
          levelName: '中风险',
        },
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

    // ========== 正常分支：有评估单号 → 调后端 API ==========
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

// ---------- 重新查询 ----------
function handleRestart() {
  store.reset()
  router.push({ name: 'index' })
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

// ============================================================
// 根容器：浅蓝渐变背景（与 InputPage 一致）
// ============================================================
.page-result {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #6BB8FF 0%, #9DC9F8 22%, #C7DFFA 38%, #FFFFFF 62%);
  padding-bottom: $spacing-xl;
  overflow-x: hidden;
}

// ============================================================
// 加载页：居中图标 + 文字 + 进度条（整体放大 2x、上移、文字深色）
// ============================================================
.loading-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 60vh;
  gap: $spacing-md;
  padding-top: 4.8rem;       // 上移：约 Hero 底部位置
  padding-left: $spacing-md;
  padding-right: $spacing-md;
  padding-bottom: $spacing-xl;
}

.loading-icon {
  position: relative;
  width: 3.2rem;            // 原 1.6rem 放大 2x
  height: 3.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-ring {
  position: absolute;
  inset: 0;
  border: 6px solid rgba(74, 144, 226, 0.2);    // 加粗、原白色调改为蓝色调配合深字
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-star {
  font-size: 1.44rem;        // 原 0.72rem 放大 2x
  line-height: 1;
  z-index: 1;
}

.loading-title {
  font-size: $font-size-xxl;  // 原 $font-size-lg (20px) 放大 2x → ~32px
  font-weight: 800;
  color: $color-text-primary; // 深色字体
  text-shadow: none;
  margin: 0;
}

.loading-tip {
  font-size: $font-size-md;   // 原 $font-size-xs (14px) 放大 2x → 18px
  color: $color-text-secondary; // 深色字体
  margin: 0;
}

.loading-progress {
  width: 60%;
  max-width: 280px;
  height: 6px;               // 原 3px 放大 2x
  background: rgba(74, 144, 226, 0.2);
  border-radius: $radius-full;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: $color-primary;
  border-radius: $radius-full;
  transition: width 0.3s ease-out;
}

// ============================================================
// Hero 区（与 InputPage 同色）整体放大 2x
// ============================================================
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.4rem $spacing-md $spacing-xl;
  min-height: 6.4rem;
  color: #fff;
  text-align: center;
  gap: $spacing-md;
}

.hero-label {
  font-size: $font-size-md;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin: 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.hero-score {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  line-height: 1;
}

.score-num {
  font-size: 2.987rem; // ~112px（原 56px 放大 2x）
  font-weight: 800;
  letter-spacing: -0.04em;
}

.score-divider,
.score-total {
  font-size: 1.28rem; // ~48px（原 24px 放大 2x）
  font-weight: 600;
  opacity: 0.7;
}

.hero-level-badge {
  display: inline-block;
  padding: 0.2rem $spacing-xl;
  border-radius: 0.533rem;
  font-size: $font-size-md;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-top: $spacing-sm;
}

// 分数颜色（综合分）
.score-high { color: #00E5FF; }   // 蓝白（低风险）
.score-mid  { color: #FFD740; }   // 黄白（中风险）
.score-low  { color: #FF6E6E; }   // 粉白（高风险）

// 等级标签
.badge-low  { background: rgba(0, 229, 255, 0.2); border: 1px solid rgba(0, 229, 255, 0.4); color: #00E5FF; }
.badge-mid  { background: rgba(255, 215, 64, 0.2);  border: 1px solid rgba(255, 215, 64, 0.4);  color: #FFD740; }
.badge-high { background: rgba(255, 110, 110, 0.2); border: 1px solid rgba(255, 110, 110, 0.4); color: #FF6E6E; }

// ============================================================
// 白色结果卡片（下移）
// ============================================================
.result-card {
  margin: 1.6rem $spacing-md 0;
  background: #fff;
  border-radius: 0.32rem 0.32rem 0 0;
  padding: $spacing-md $spacing-md $spacing-xl;
  box-shadow: 0 -4px 12px rgba(46, 107, 176, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $spacing-sm;
  border-bottom: 1px solid $color-border;
  margin-bottom: $spacing-sm;
}

.card-title {
  font-size: $font-size-xl; // 原 $font-size-sm (16px) 放大 0.5x → 24px
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
  gap: 0;
}

.bank-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md 0;
  border-bottom: 1px solid rgba($color-border, 0.5);

  &:last-child {
    border-bottom: 0;
  }
}

.bank-left {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.bank-logo {
  width: 0.853rem;
  height: 0.853rem;
  background: $color-bg-light;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-md;
  line-height: 1;
  flex-shrink: 0;
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
  gap: 0.04rem;
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
  font-size: $font-size-xs;
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
  width: 100%;
  height: 1.013rem;
  border: 0;
  border-radius: 0.533rem;
  background: linear-gradient(90deg, #9DC9F8 0%, #6BB8FF 50%, #4A90E2 100%);
  color: #fff;
  font-size: $font-size-sm;
  font-weight: 700;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  cursor: pointer;
  transition: all $duration-fast;
  -webkit-tap-highlight-color: transparent;

  &:active { transform: translateY(1px); }
}

// ============================================================
// 安全提示
// ============================================================
.security-tip {
  margin-top: $spacing-md;
  text-align: center;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  line-height: 1.5;
}

// ============================================================
// 空状态
// ============================================================
.empty-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: $spacing-sm;
  padding: $spacing-xl $spacing-md;
  text-align: center;
}

.empty-icon {
  font-size: 1.6rem;
}

.empty-title {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $color-text-primary;
  margin: 0;
}

.empty-sub {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  margin: 0;
}

.empty-page .restart-btn {
  width: auto;
  padding: 0 $spacing-xl;
  margin-top: $spacing-md;
}
</style>
