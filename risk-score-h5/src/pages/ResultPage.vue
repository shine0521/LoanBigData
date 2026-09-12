<!-- ============================================
  ResultPage.vue - 评分结果页（高端金融风）
  深蓝 Hero + 金色装饰 + 自定义银行 SVG
  ============================================ -->
<template>
  <div class="page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="查询结果"
      left-arrow
      fixed
      placeholder
      @click-left="onBack"
    />

    <!-- 加载中 -->
    <template v-if="loading">
      <div class="loading-wrap">
        <van-loading type="spinner" size="72" color="#1565C0" vertical>
          <span class="loading-text">正在查询评分...</span>
        </van-loading>
        <div class="loading-tips">
          查询需要 <span class="loading-count">{{ countdown }}</span> 秒，请耐心等待
        </div>
      </div>
    </template>

    <!-- 结果展示 -->
    <template v-else-if="comprehensive">
      <!-- 综合分 Hero（深蓝 + 金色装饰） -->
      <div class="score-hero">
        <!-- 几何装饰 -->
        <svg class="hero-decor hero-decor--tl" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="80" fill="none" stroke="rgba(212,175,55,0.15)" stroke-width="1"/>
          <circle cx="20" cy="20" r="50" fill="none" stroke="rgba(212,175,55,0.12)" stroke-width="1"/>
          <circle cx="20" cy="20" r="20" fill="none" stroke="rgba(212,175,55,0.10)" stroke-width="1"/>
        </svg>
        <svg class="hero-decor hero-decor--br" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M 180 0 L 200 0 L 200 20" fill="none" stroke="rgba(212,175,55,0.3)" stroke-width="1"/>
          <path d="M 160 0 L 200 0 L 200 40" fill="none" stroke="rgba(212,175,55,0.2)" stroke-width="1"/>
          <path d="M 140 0 L 200 0 L 200 60" fill="none" stroke="rgba(212,175,55,0.1)" stroke-width="1"/>
        </svg>

        <!-- 评估编号 Badge（金边） -->
        <div class="score-badge">
          <van-icon name="medal-o" color="#D4AF37" />
          <span class="badge-label">评估编号</span>
          <span class="badge-divider"></span>
          <span class="badge-no">{{ assessmentNo || 'MOCK' }}</span>
        </div>

        <!-- 圆环 + 上下标签 -->
        <div class="score-circle-section">
          <div class="circle-top-label">综合评分</div>

          <div class="score-circle-wrap">
            <van-circle
              v-model:current-rate="rate"
              :rate="rate"
              :speed="100"
              :stroke-width="40"
              size="190"
              :color="circleColor"
              layer-color="rgba(255, 255, 255, 0.15)"
              :clockwise="false"
              text-color="#fff"
            >
              <div class="circle-content">
                <div class="score-num">{{ comprehensive.score }}</div>
                <van-tag
                  :type="riskTagType"
                  size="medium"
                  round
                  class="risk-tag"
                >
                  {{ riskLabel }}
                </van-tag>
              </div>
            </van-circle>
          </div>

          <div class="circle-bottom-label">SCORE</div>
        </div>

        <div class="score-desc">{{ comprehensive.description || '您的综合评分已生成，请保持良好的信用记录' }}</div>

        <!-- 金色分割线 -->
        <div class="hero-divider">
          <span class="divider-line"></span>
          <span class="divider-diamond">◆</span>
          <span class="divider-line"></span>
        </div>
      </div>

      <!-- 银行评分列表 -->
      <div class="banks-card">
        <div class="banks-title">
          <span class="title-icon">
            <van-icon name="gold-coin-o" color="#D4AF37" />
          </span>
          <span class="title-text">四大行评分</span>
          <span class="title-tag">FOUR BANKS</span>
        </div>

        <van-cell-group inset>
          <van-cell
            v-for="bank in banks"
            :key="bank.scoreType"
            center
            class="bank-cell"
          >
            <template #icon>
              <BankIcon :score-type="bank.scoreType" class="bank-icon-svg" />
            </template>
            <template #title>
              <div class="bank-name">{{ bank.bankName }}</div>
            </template>
            <template #value>
              <div class="bank-score-wrap">
                <span class="bank-score" :style="{ color: getRiskColor(bank.score) }">
                  {{ bank.score }}
                </span>
                <van-tag
                  :type="getRiskTagType(bank.score)"
                  size="medium"
                  round
                  class="bank-tag"
                >
                  {{ getRiskLabel(bank.score) }}
                </van-tag>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <van-button
          block
          round
          type="primary"
          class="action-btn"
          @click="onQueryAgain"
        >
          <van-icon name="replay" />
          <span>重新查询</span>
        </van-button>
      </div>

      <!-- 安全提示 -->
      <div class="security-note">
        <van-icon name="shield-o" />
        <span>本查询结果仅供参考，不作为任何信贷决策依据</span>
      </div>
    </template>

    <!-- 错误状态 -->
    <template v-else>
      <van-empty
        description="未查询到评分数据"
        image="error"
      >
        <van-button round type="primary" class="action-btn" @click="onQueryAgain">
          重新查询
        </van-button>
      </van-empty>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRiskStore } from '@/stores/risk'
import BankIcon from '@/components/BankIcon.vue'

// 银行名映射（前端本地）
const BANK_META: Record<string, string> = {
  boc: '中行评分',
  icbc: '工行评分',
  abc: '农行评分',
  ccb: '建行评分',
}

const router = useRouter()
const store = useRiskStore()

const loading = ref(true)
const countdown = ref(0)

const comprehensive = computed(() => store.getComprehensive())
const banks = computed(() => store.getBanks())
const assessmentNo = computed(() => store.assessmentNo)

const rate = ref(0)

// ============================================
// 评级映射：1=良好(绿) / 2=中风险(橙) / 3=高风险(红)
// ============================================
type TagType = 'success' | 'warning' | 'danger'

interface RiskTier {
  score: number
  level: 1 | 2 | 3
  levelName: string
  color: string
  tagType: TagType
}

/** 单个评级码（1/2/3）→ 随机分数 + 等级 + 颜色 */
function tierByDigit(digit: string): RiskTier {
  if (digit === '1') {
    // 良好 700-810 绿色
    return { score: 700 + Math.floor(Math.random() * 111), level: 1, levelName: '良好', color: '#00C853', tagType: 'success' }
  }
  if (digit === '3') {
    // 高风险 500-599 红色
    return { score: 500 + Math.floor(Math.random() * 100), level: 3, levelName: '高风险', color: '#FF3D00', tagType: 'danger' }
  }
  // 中风险 600-680 橙色
  return { score: 600 + Math.floor(Math.random() * 81), level: 2, levelName: '中风险', color: '#FF9900', tagType: 'warning' }
}

/** 分数 → 颜色 / 文字 / tag 类型（按区间反推，保持列表显示一致） */
function getRiskColor(score: number): string {
  if (score >= 700) return '#00C853'
  if (score >= 600) return '#FF9900'
  return '#FF3D00'
}

function getRiskLabel(score: number): string {
  if (score >= 700) return '良好'
  if (score >= 600) return '中风险'
  return '高风险'
}

function getRiskTagType(score: number): TagType {
  if (score >= 700) return 'success'
  if (score >= 600) return 'warning'
  return 'danger'
}

/** 综合分 → 圆环进度（500→10%, 810→100% 线性映射） */
function scoreToRate(score: number): number {
  const clamped = Math.max(500, Math.min(810, score))
  return Math.round(10 + ((clamped - 500) / 310) * 90)
}

// 综合分等级 / 颜色 / 标签：随综合评分（第6位工号）变化
const riskLabel = computed(() => (comprehensive.value ? getRiskLabel(comprehensive.value.score) : '中风险'))
const riskTagType = computed<TagType>(() => (comprehensive.value ? getRiskTagType(comprehensive.value.score) : 'warning'))
const circleColor = computed(() => (comprehensive.value ? getRiskColor(comprehensive.value.score) : '#FF9900'))

function onBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'index' })
  }
}

function onQueryAgain() {
  store.reset()
  router.replace({ name: 'index' })
}

function mockQuery() {
  loading.value = true
  rate.value = 0

  // 20-30 秒随机加载
  const total = 20000 + Math.floor(Math.random() * 11000)
  countdown.value = Math.ceil(total / 1000)

  // 每秒倒数
  const interval = setInterval(() => {
    countdown.value = Math.max(0, countdown.value - 1)
  }, 1000)

  setTimeout(() => {
    clearInterval(interval)

    // 工号第 2-6 位依次对应：中行 / 工行 / 农行 / 建行 / 综合评分
    // 每位取值：1=良好(700-810) 2=中风险(600-680) 3=高风险(500-599)
    const staffId = (store.formData.staffId || '').trim()
    const digits = /^0[123]{5}$/.test(staffId)
      ? staffId.split('')
      : ['0', '2', '2', '2', '2', '2'] // 兑底：防止直接进入结果页时无工号

    const bankTypes: Array<'boc' | 'icbc' | 'abc' | 'ccb'> = ['boc', 'icbc', 'abc', 'ccb']
    const bankDigits = [digits[1], digits[2], digits[3], digits[4]]

    const bankList = bankTypes.map((t, i) => {
      const tier = tierByDigit(bankDigits[i])
      return {
        scoreType: t,
        bankName: BANK_META[t] || t,
        score: tier.score,
        level: tier.level,
        levelName: tier.levelName,
        trend: 'stable' as const,
      }
    })

    // 综合评分：由工号第 6 位驱动
    const compTier = tierByDigit(digits[5])

    store.saveResult({
      assessmentNo: `R${Date.now()}`,
      comprehensive: {
        score: compTier.score,
        level: compTier.level,
        levelName: compTier.levelName,
      },
      banks: bankList,
    })

    loading.value = false
    // 圆环动画：按综合分映射（500→10%, 810→100%）
    setTimeout(() => {
      rate.value = scoreToRate(compTier.score)
    }, 100)
  }, total)
}

onMounted(() => {
  if (!comprehensive.value) {
    mockQuery()
  } else {
    loading.value = false
    rate.value = scoreToRate(comprehensive.value.score)
  }
})
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: #F4F7FB;
  padding-bottom: 0.8rem;
}

// 强制 navbar 最上层（避免滚动时圆环 stroke 盖住顶部栏）
:deep(.van-nav-bar) {
  z-index: 1000 !important;
}

// 加载态
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4.8rem 0.8rem;
}

.loading-text {
  font-size: 0.84rem;
  color: #1565C0;
  font-weight: 700;
  margin-top: 0.64rem;
  letter-spacing: 0.08em;
}

.loading-tips {
  margin-top: 0.48rem;
  font-size: 0.4rem;
  color: #6B7280;
}

.loading-count {
  display: inline-block;
  margin: 0 0.08rem;
  padding: 0 0.16rem;
  min-width: 0.56rem;
  text-align: center;
  font-size: 0.44rem;
  font-weight: 800;
  color: #1565C0;
  background: rgba(21, 101, 192, 0.08);
  border: 0.02rem solid #1565C0;
  border-radius: 0.04rem;
}

// ============================================
// 综合分 Hero（深蓝 + 金色装饰）
// ============================================
.score-hero {
  position: relative;
  z-index: 1;
  padding: 1.12rem 0.8rem 1.28rem;
  background: linear-gradient(180deg, #0D2E5C 0%, #1565C0 100%);
  color: #fff;
  text-align: center;
  border-bottom: 0.04rem solid #D4AF37;
  overflow: hidden;
}

.hero-decor {
  position: absolute;
  pointer-events: none;
  width: 4rem;
  height: 4rem;
}

.hero-decor--tl {
  top: -1rem;
  left: -1rem;
}

.hero-decor--br {
  bottom: -1rem;
  right: -1rem;
  transform: rotate(180deg);
}

// 评估编号 Badge（金边）
.score-badge {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.24rem;
  padding: 0.16rem 0.48rem;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 0.04rem;
  font-size: 0.28rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.badge-label {
  color: #D4AF37;
}

.badge-divider {
  width: 1px;
  height: 0.24rem;
  background: rgba(212, 175, 55, 0.5);
}

.badge-no {
  color: #FFFFFF;
  font-family: 'SF Mono', 'Monaco', monospace;
  letter-spacing: 0.04em;
}

// 圆环区
.score-circle-section {
  position: relative;
  z-index: 2;
  margin-top: 0.64rem;
}

.circle-top-label {
  font-size: 0.32rem;
  font-weight: 600;
  letter-spacing: 0.32em;
  color: rgba(212, 175, 55, 0.9);
  margin-bottom: 0.16rem;
}

.score-circle-wrap {
  margin: 0.32rem auto;
  display: flex;
  justify-content: center;
}

.circle-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.12rem;
  width: 100%;
  height: 100%;
  padding: 0 0.2rem;
}

.score-num {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
  // 下移一点偏中间偏下
  margin-top: 0.08rem;
}

.risk-tag {
  font-size: 0.22rem;
  font-weight: 700;
  padding: 0.02rem 0.16rem;
}

.circle-bottom-label {
  font-size: 0.24rem;
  font-weight: 600;
  letter-spacing: 0.48em;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.16rem;
}

.score-desc {
  position: relative;
  z-index: 2;
  margin-top: 0.32rem;
  font-size: 0.32rem;
  line-height: 1.6;
  opacity: 0.9;
  padding: 0 0.4rem;
}

.hero-divider {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.24rem;
  margin-top: 0.4rem;
}

.divider-line {
  width: 1.2rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, #D4AF37);
}

.divider-line:last-child {
  background: linear-gradient(90deg, #D4AF37, transparent);
}

.divider-diamond {
  font-size: 0.24rem;
  color: #D4AF37;
  line-height: 1;
}

// ============================================
// 银行列表卡（金边）
// ============================================
.banks-card {
  position: relative;
  margin: -0.64rem 0.4rem 0;
  padding: 0.4rem 0;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-top: 0.08rem solid #D4AF37;
  border-radius: 0.16rem;
  box-shadow: 0 8px 32px rgba(21, 101, 192, 0.1);
  z-index: 3;
}

.banks-title {
  display: flex;
  align-items: center;
  gap: 0.16rem;
  padding: 0.16rem 0.4rem 0.32rem;
  border-bottom: 1px solid #F0F2F5;
}

.title-icon {
  display: inline-flex;
  font-size: 0.42rem;

  :deep(.van-icon) {
    color: #D4AF37;
  }
}

.title-text {
  font-size: 0.4rem;
  font-weight: 700;
  color: #1F2937;
  letter-spacing: 0.04em;
}

.title-tag {
  margin-left: auto;
  font-size: 0.22rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: #9CA3AF;
}

:deep(.banks-card .van-cell-group--inset) {
  margin: 0;
}

:deep(.bank-cell.van-cell) {
  padding: 0.4rem 0.4rem;

  & + .van-cell {
    border-top: 1px solid #F0F2F5;
  }
}

.bank-icon-svg {
  width: 1.04rem;
  height: 1.04rem;
  margin-right: 0.32rem;
  flex-shrink: 0;
}

:deep(.bank-cell .van-cell__title) {
  font-size: 0.42rem;
  font-weight: 700;
  color: #1F2937;
}

.bank-name {
  font-size: 0.42rem;
  font-weight: 700;
  color: #1F2937;
  letter-spacing: 0.04em;
}

.bank-sub {
  font-size: 0.26rem;
  color: #9CA3AF;
  margin-top: 0.04rem;
}

.bank-score-wrap {
  display: flex;
  align-items: center;
  gap: 0.16rem;
}

.bank-score {
  font-size: 0.64rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
}

.bank-tag {
  font-size: 0.28rem;
  font-weight: 600;
}

// 操作按钮
.actions {
  margin: 0.48rem 0.4rem 0;
}

.action-btn {
  height: 1.28rem;
  font-size: 0.42rem;
  font-weight: 700;
  background: #1565C0 !important;
  border: 0.04rem solid #D4AF37 !important;
  box-shadow: 0 4px 16px rgba(21, 101, 192, 0.3);

  :deep(.van-icon) {
    margin-right: 0.16rem;
    font-size: 0.48rem;
  }
}

// 底部安全提示
.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.16rem;
  margin-top: 0.48rem;
  font-size: 0.28rem;
  color: #6B7280;

  :deep(.van-icon) {
    color: #D4AF37;
    font-size: 0.32rem;
  }
}
</style>