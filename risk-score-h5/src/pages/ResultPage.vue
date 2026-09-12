<!--
  ResultPage.vue - 重设计 v3
  ─────────────────────────────────────
  - 加载页：全屏渐变 + 居中大圆环 + 进度条
  - 结果页：Hero 评分 + 银行列表卡 + 优势区 + footer（填满 viewport）
  - 与 InputPage 保持统一视觉语言
  ─────────────────────────────────────
-->
<template>
  <div class="page">

    <!-- ============ 加载中 ============ -->
    <div v-if="loading" class="loading">
      <DecorationBg />
      <div class="loading-card">
        <div class="loading-icon-wrap">
          <div class="ring ring-1" />
          <div class="ring ring-2" />
          <div class="ring ring-3" />
          <div class="loading-center">
            <AppIcon name="database" color="#4A90E2" size="1rem" />
          </div>
        </div>
        <p class="loading-title">个人综合评分</p>
        <p class="loading-tip">{{ loadingTip }}<span class="dots">.</span></p>
        <div class="loading-progress">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }" />
        </div>
        <p class="loading-status">已完成 {{ Math.floor(progressPercent) }}%</p>
      </div>
    </div>

    <!-- ============ 结果内容 ============ -->
    <template v-else-if="comprehensive">
      <header class="hero">
        <DecorationBg />

        <div class="hero-top">
          <span class="hero-badge">
            <AppIcon name="bolt" color="#FFD740" size="0.4rem" /> 实时评估
          </span>
        </div>

        <p class="hero-label">您的综合评分</p>

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

        <div class="hero-level" :class="levelBadgeClass">
          <AppIcon :name="levelIconName" :color="levelIconColor" size="0.42rem" />
          <span>{{ comprehensive.levelName }}</span>
        </div>
        <p class="hero-comment">{{ levelComment }}</p>
      </header>

      <!-- 银行详情卡 -->
      <section class="card">
        <div class="card-head">
          <div class="card-title">
            <AppIcon name="database" color="#4A90E2" size="0.5rem" />
            <span>合作机构评分详情</span>
          </div>
          <span class="card-desc">数据来源：银行大数据</span>
        </div>

        <div class="bank-list">
          <div
            v-for="bank in banks"
            :key="bank.scoreType"
            class="bank-item"
          >
            <div class="bank-left">
              <BankIcon :scoreType="bank.scoreType" size="1.4rem" />
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

        <div class="actions">
          <button class="restart" @click="handleRestart">
            <AppIcon name="refresh" color="#fff" size="0.5rem" />
            <span>重新查询</span>
          </button>
        </div>

        <p class="security-tip">
          <AppIcon name="info" color="#9AAAC2" size="0.36rem" />
          <span>评分结果仅供参考，实际业务以银行官方审核为准</span>
        </p>
      </section>

      <!-- 核心优势 3 列 -->
      <section class="features">
        <div class="feature">
          <div class="feature-icon icon-blue">
            <AppIcon name="bolt" color="#fff" size="0.6rem" />
          </div>
          <div class="feature-title">10秒极速</div>
          <div class="feature-desc">智能引擎<br />秒级响应</div>
        </div>
        <div class="feature">
          <div class="feature-icon icon-purple">
            <AppIcon name="shield" color="#fff" size="0.6rem" />
          </div>
          <div class="feature-title">银行级安全</div>
          <div class="feature-desc">金融级加密<br />隐私保护</div>
        </div>
        <div class="feature">
          <div class="feature-icon icon-cyan">
            <AppIcon name="database" color="#fff" size="0.6rem" />
          </div>
          <div class="feature-title">5+银行数据</div>
          <div class="feature-desc">主流商业银行<br />真实可靠</div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-links">
          <a class="footer-link" @click="showToast('客服电话：400-888-8888')">在线客服</a>
          <span class="footer-sep">|</span>
          <a class="footer-link" @click="showToast('关于本平台')">关于我们</a>
          <span class="footer-sep">|</span>
          <a class="footer-link" @click="showToast('服务协议')">服务协议</a>
        </div>
        <p class="footer-copy">© 2026 银行评分大数据 · 京ICP备XXXXXXXX号</p>
      </footer>
    </template>

    <!-- ============ 空状态 ============ -->
    <div v-else class="empty">
      <DecorationBg />
      <span class="empty-icon">📋</span>
      <p class="empty-title">暂无评分数据</p>
      <p class="empty-sub">{{ errorMsg || '查询失败，请稍后重试' }}</p>
      <button class="restart" @click="handleRestart">返回</button>
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

const loading = ref(false)
const errorMsg = ref('')
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

const comprehensive = computed(() => store.resultData?.comprehensive ?? null)
const banks = computed(() => store.resultData?.banks ?? [])

const circumference = 2 * Math.PI * 86
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

const bankMeta: Record<string, { displayName: string }> = {
  boc:  { displayName: '中行评分' },
  icbc: { displayName: '工行评分' },
  abc:  { displayName: '农行评分' },
  ccb:  { displayName: '建行评分' },
}

function getBankMeta(scoreType: string): { displayName: string } {
  return bankMeta[scoreType] ?? { displayName: scoreType }
}

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

function startTimers() {
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

const toastMsg = ref('')
function showToast(msg: string, duration = 2500) {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, duration)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

// =============================================================
// 根容器
// =============================================================
.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #F4F7FC;
  overflow-x: hidden;
  padding-bottom: env(safe-area-inset-bottom);
}

.hero,
.card,
.features,
.footer,
.loading-card,
.empty {
  width: 100%;
  max-width: 10rem;
}

// =============================================================
// 加载页
// =============================================================
.loading {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
  background: linear-gradient(180deg, #4A90E2 0%, #6C7CE7 28%, #A8B6F0 52%, #F4F7FC 100%);
}

.loading-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 0.48rem;
  padding: $spacing-xl $spacing-md $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  box-shadow: 0 16px 48px rgba(74, 100, 180, 0.24);
}

.loading-icon-wrap {
  position: relative;
  width: 4.8rem;     // 180px
  height: 4.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-xs;
}

.ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4px solid transparent;
}

.ring-1 {
  border-top-color: #4A90E2;
  animation: spin 1.2s linear infinite;
}

.ring-2 {
  border-right-color: #6C5CE7;
  inset: 0.32rem;
  animation: spin 1.6s linear reverse infinite;
}

.ring-3 {
  border-bottom-color: #A55EEA;
  inset: 0.64rem;
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
  font-size: 1.067rem;
  font-weight: 800;
  color: $color-text-primary;
  margin: 0;
  letter-spacing: 0.04em;
}

.loading-tip {
  font-size: $font-size-md;
  color: $color-text-secondary;
  margin: 0;
  text-align: center;
}

.dots {
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
  font-size: $font-size-sm;
  color: #4A90E2;
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.02em;
}

// =============================================================
// Hero 区
// =============================================================
.hero {
  position: relative;
  padding: 1.4rem $spacing-md $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.08rem;
  padding: 0.16rem 0.4rem;
  background: rgba(255, 215, 64, 0.15);
  border: 1px solid rgba(255, 215, 64, 0.4);
  border-radius: $radius-full;
  font-size: 0.32rem;
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

.hero-score-wrap {
  position: relative;
  width: 4.8rem;
  height: 4.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: $spacing-sm;
  z-index: 2;
}

.score-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));

  .ring-bg { stroke: rgba(255, 255, 255, 0.25); }

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
  font-size: 2.4rem;
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
  font-size: 0.853rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.hero-level {
  display: inline-flex;
  align-items: center;
  gap: 0.16rem;
  padding: 0.24rem $spacing-lg;
  border-radius: 0.64rem;
  font-size: $font-size-md;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-top: $spacing-md;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 2;
}

.badge-low  { background: rgba(0, 229, 255, 0.2);  border: 1px solid rgba(0, 229, 255, 0.5);  color: #B0F5FF; }
.badge-mid  { background: rgba(255, 215, 64, 0.2);  border: 1px solid rgba(255, 215, 64, 0.5);  color: #FFE082; }
.badge-high { background: rgba(255, 110, 110, 0.2); border: 1px solid rgba(255, 110, 110, 0.5); color: #FFB0B0; }

.hero-comment {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.85);
  margin: 0.24rem 0 0 0;
  letter-spacing: 0.04em;
  z-index: 2;
  text-align: center;
  padding: 0 $spacing-md;
}

// =============================================================
// 银行详情卡
// =============================================================
.card {
  position: relative;
  z-index: 3;
  margin: -$spacing-md $spacing-md 0;
  padding: $spacing-md;
  background: #fff;
  border-radius: 0.48rem;
  box-shadow:
    0 12px 32px rgba(74, 100, 180, 0.18),
    0 4px 8px rgba(74, 100, 180, 0.08);
}

.card-head {
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

.bank-list {
  display: flex;
  flex-direction: column;
}

.bank-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md 0;
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
  font-size: 0.64rem;
  font-weight: 600;
  color: $color-text-primary;
  white-space: nowrap;
}

.bank-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.12rem;
}

.bank-score {
  font-size: 0.96rem;
  font-weight: 800;
  line-height: 1;

  &.bank-score-high { color: $color-risk-low; }
  &.bank-score-mid  { color: $color-risk-medium; }
  &.bank-score-low  { color: $color-risk-high; }
}

.bank-level {
  font-size: $font-size-xs;
  font-weight: 600;
  padding: 0.06rem 0.24rem;
  border-radius: $radius-sm;

  &.bank-level-high { background: rgba(0, 200, 83, 0.1);  color: $color-risk-low; }
  &.bank-level-mid  { background: rgba(255, 153, 0, 0.1); color: $color-risk-medium; }
  &.bank-level-low  { background: rgba(255, 61, 0, 0.1);  color: $color-risk-high; }
}

.actions {
  margin-top: $spacing-lg;
}

.restart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.16rem;
  width: 100%;
  height: 1.733rem;
  border: 0;
  border-radius: 0.853rem;
  background: linear-gradient(135deg, #4A90E2 0%, #6C5CE7 100%);
  color: #fff;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.32);
  cursor: pointer;
  transition: all $duration-fast;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: translateY(1px);
    box-shadow: 0 4px 12px rgba(108, 92, 231, 0.32);
  }
}

.security-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.12rem;
  margin-top: $spacing-md;
  padding-top: $spacing-sm;
  border-top: 1px solid $color-border-light;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  line-height: 1.5;
}

// =============================================================
// 核心优势 3 列
// =============================================================
.features {
  display: flex;
  gap: $spacing-sm;
  margin: $spacing-md $spacing-md 0;
  padding: 0;
}

.feature {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.16rem;
  padding: $spacing-md 0.16rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: $radius-md;
  box-shadow: 0 4px 12px rgba(74, 100, 180, 0.06);
  text-align: center;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 0.24rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.icon-blue   { background: linear-gradient(135deg, #4A90E2 0%, #5BA0F2 100%); }
.icon-purple { background: linear-gradient(135deg, #6C5CE7 0%, #A55EEA 100%); }
.icon-cyan   { background: linear-gradient(135deg, #00CEC9 0%, #0984E3 100%); }

.feature-title {
  font-size: $font-size-sm;
  font-weight: 700;
  color: $color-text-primary;
  margin-top: 0.04rem;
}

.feature-desc {
  font-size: 0.28rem;
  color: $color-text-secondary;
  line-height: 1.5;
}

// =============================================================
// Footer
// =============================================================
.footer {
  margin-top: $spacing-md;
  padding: 0 $spacing-md env(safe-area-inset-bottom);
  text-align: center;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  margin-bottom: 0.16rem;
}

.footer-link {
  font-size: $font-size-xs;
  color: $color-text-secondary;
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.footer-sep {
  color: #C8D0DD;
}

.footer-copy {
  font-size: 0.28rem;
  color: $color-text-placeholder;
  margin: 0;
}

// =============================================================
// 空状态
// =============================================================
.empty {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: $spacing-sm;
  padding: $spacing-xl $spacing-md;
  text-align: center;
  background: linear-gradient(180deg, #4A90E2 0%, #F4F7FC 100%);
}

.empty-icon {
  font-size: 2rem;
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
  font-size: $font-size-md;
  color: $color-text-secondary;
  margin: 0;
  z-index: 1;
}

.empty .restart {
  width: auto;
  padding: 0 $spacing-xl;
  margin-top: $spacing-md;
  z-index: 1;
}

// Toast（结果页用）
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
  font-size: $font-size-sm;
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-md;
  z-index: 9999;
  pointer-events: none;
  max-width: 80%;
  text-align: center;
}
</style>
