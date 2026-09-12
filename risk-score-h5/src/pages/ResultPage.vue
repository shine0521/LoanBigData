<!-- ============================================
  ResultPage.vue - 评分结果页（Vant 4 全组件）
  - van-nav-bar / van-circle / van-cell / van-tag / van-button
  - 加载态: van-skeleton
  ============================================ -->
<template>
  <div class="page">
    <!-- 顶部导航（Vant 自带返回按钮） -->
    <van-nav-bar
      title="查询结果"
      left-arrow
      fixed
      placeholder
      @click-left="onBack"
    />

    <!-- 加载中骨架屏 -->
    <template v-if="loading">
      <div class="loading-wrap">
        <van-loading type="spinner" size="36" color="#4A90E2" vertical>
          <span class="loading-text">正在查询评分...</span>
        </van-loading>
        <div class="loading-tips">查询需要 5-10 秒，请耐心等待</div>
      </div>
    </template>

    <!-- 结果展示 -->
    <template v-else-if="comprehensive">
      <!-- 综合分卡片（蓝紫渐变 Hero） -->
      <div class="score-hero">
        <div class="score-badge">
          <van-icon name="certificate-o" color="#FFD700" />
          <span>评估编号：{{ assessmentNo || 'MOCK' }}</span>
        </div>

        <div class="score-circle-wrap">
          <van-circle
            v-model:current-rate="rate"
            :rate="rate"
            :speed="100"
            :stroke-width="80"
            size="240"
            color="linear-gradient(135deg, #FFD700 0%, #FF9900 100%)"
            layer-color="rgba(255, 255, 255, 0.18)"
            :clockwise="false"
            text-color="#fff"
          >
            <div class="circle-content">
              <div class="score-num">{{ comprehensive.score }}</div>
              <div class="score-unit">/ 1000</div>
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

        <div class="score-desc">{{ comprehensive.description || '您的综合评分已生成，请保持良好的信用记录' }}</div>
      </div>

      <!-- 银行评分列表（白底卡） -->
      <div class="banks-card">
        <div class="banks-title">
          <van-icon name="gold-coin-o" color="#FF9900" />
          <span>四行评分详情</span>
        </div>

        <van-cell-group inset>
          <van-cell
            v-for="bank in banks"
            :key="bank.scoreType"
            :title="bank.bankName"
            :label="`${bank.bankName} 评分`"
            :icon="bankIcon(bank.scoreType)"
            center
            class="bank-cell"
          >
            <template #value>
              <div class="bank-score-wrap">
                <span class="bank-score" :style="{ color: getRiskColor(bank.score) }">
                  {{ bank.score }}
                </span>
                <van-tag
                  :type="getRiskTagType(bank.score)"
                  size="medium"
                  round
                >
                  {{ getRiskLabel(bank.score) }}
                </van-tag>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 操作按钮组 -->
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
        <van-button
          block
          round
          plain
          type="primary"
          class="action-btn action-btn--secondary"
          @click="onShare"
        >
          <van-icon name="share-o" />
          <span>分享结果</span>
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
import { showToast } from 'vant'
import { useRiskStore } from '@/stores/risk'

// 银行名映射（前端本地，不依赖后端）
const BANK_META: Record<string, string> = {
  boc: '中国银行',
  icbc: '工商银行',
  abc: '农业银行',
  ccb: '建设银行',
}

const router = useRouter()
const store = useRiskStore()

// 加载状态
const loading = ref(true)

// 评分数据
const comprehensive = computed(() => store.getComprehensive())
const banks = computed(() => store.getBanks())
const assessmentNo = computed(() => store.assessmentNo)

// 综合分对应比例（用于 van-circle 动画）
const rate = ref(0)

// 风险颜色
function getRiskColor(score: number): string {
  if (score >= 800) return '#00C853'
  if (score >= 600) return '#FF9900'
  return '#FF3D00'
}

function getRiskLabel(score: number): string {
  if (score >= 800) return '低风险'
  if (score >= 600) return '中风险'
  return '高风险'
}

function getRiskTagType(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 800) return 'success'
  if (score >= 600) return 'warning'
  return 'danger'
}

// 综合分风险标签
const riskLabel = computed(() => {
  if (!comprehensive.value) return ''
  return getRiskLabel(comprehensive.value.score)
})

const riskTagType = computed<'success' | 'warning' | 'danger'>(() => {
  if (!comprehensive.value) return 'success'
  return getRiskTagType(comprehensive.value.score)
})

// 银行图标（用 Vant 自带的 o 图标）
function bankIcon(_scoreType: string): string {
  // 中行/工行/农行/建行 → 用 balance-o
  return 'balance-o'
}

// 返回
function onBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'index' })
  }
}

// 重新查询
function onQueryAgain() {
  store.reset()
  router.replace({ name: 'index' })
}

// 分享
function onShare() {
  showToast('分享功能开发中')
}

// 模拟查询
function mockQuery() {
  loading.value = true
  rate.value = 0

  // 5-10s 随机加载
  const delay = 5000 + Math.random() * 5000
  setTimeout(() => {
    // 综合分 600-650
    const compScore = 600 + Math.floor(Math.random() * 51)
    // 4 银行各 600-650
    const bankList = ['boc', 'icbc', 'abc', 'ccb'].map((t) => ({
      scoreType: t as 'boc' | 'icbc' | 'abc' | 'ccb',
      bankName: BANK_META[t] || t,
      score: 600 + Math.floor(Math.random() * 51),
      level: 2 as const,
      levelName: '中风险',
      trend: 'stable' as const,
    }))

    store.saveResult({
      assessmentNo: `R${Date.now()}`,
      comprehensive: {
        score: compScore,
        level: compScore >= 800 ? 1 : compScore >= 600 ? 2 : 3,
        levelName: getRiskLabel(compScore),
      },
      banks: bankList,
    })

    loading.value = false
    // 触发 van-circle 动画
    setTimeout(() => {
      rate.value = Math.min(100, (compScore / 1000) * 100)
    }, 100)
  }, delay)
}

onMounted(() => {
  // 如果没有数据，自动 mock
  if (!comprehensive.value) {
    mockQuery()
  } else {
    loading.value = false
    rate.value = Math.min(100, (comprehensive.value.score / 1000) * 100)
  }
})
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f7fa;
  padding-bottom: 0.8rem;
}

// 加载态
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.2rem 0.8rem;
}

.loading-text {
  font-size: 0.42rem;
  color: #4A90E2;
  font-weight: 600;
  margin-top: 0.32rem;
}

.loading-tips {
  margin-top: 0.32rem;
  font-size: 0.32rem;
  color: #969799;
}

// 综合分 Hero（蓝紫渐变）
.score-hero {
  padding: 0.96rem 0.8rem 1.6rem;
  background: linear-gradient(135deg, #4A90E2 0%, #6C5CE7 50%, #A55EEA 100%);
  color: #fff;
  text-align: center;
}

.score-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.16rem;
  padding: 0.16rem 0.4rem;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 1rem;
  font-size: 0.28rem;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.score-circle-wrap {
  margin: 0.64rem auto 0.4rem;
  display: flex;
  justify-content: center;
}

.circle-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08rem;
}

.score-num {
  font-size: 1.6rem;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.32);
}

.score-unit {
  font-size: 0.32rem;
  opacity: 0.7;
  margin-bottom: 0.16rem;
}

.risk-tag {
  font-size: 0.32rem;
  font-weight: 700;
}

.score-desc {
  margin-top: 0.4rem;
  font-size: 0.34rem;
  line-height: 1.6;
  opacity: 0.92;
  padding: 0 0.4rem;
}

// 银行列表卡
.banks-card {
  margin: -0.8rem 0.4rem 0;
  padding: 0.4rem 0;
  background: #fff;
  border-radius: 0.32rem;
  box-shadow: 0 8px 24px rgba(74, 100, 180, 0.12);
  position: relative;
  z-index: 2;
}

.banks-title {
  display: flex;
  align-items: center;
  gap: 0.16rem;
  padding: 0 0.4rem 0.32rem;
  font-size: 0.42rem;
  font-weight: 700;
  color: #1a1a1a;
}

:deep(.banks-card .van-cell-group--inset) {
  margin: 0;
}

:deep(.bank-cell.van-cell) {
  padding: 0.32rem 0.4rem;
}

:deep(.bank-cell .van-cell__title) {
  font-size: 0.4rem;
  font-weight: 600;
}

:deep(.bank-cell .van-cell__label) {
  font-size: 0.28rem;
  color: #969799;
  margin-top: 0.08rem;
}

:deep(.bank-cell .van-cell__left-icon) {
  font-size: 0.56rem;
  color: #4A90E2;
  margin-right: 0.24rem;
}

.bank-score-wrap {
  display: flex;
  align-items: center;
  gap: 0.16rem;
}

.bank-score {
  font-size: 0.56rem;
  font-weight: 900;
  line-height: 1;
}

// 操作按钮
.actions {
  margin: 0.48rem 0.4rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.24rem;
}

.action-btn {
  height: 1.28rem;
  font-size: 0.42rem;
  font-weight: 700;

  :deep(.van-icon) {
    margin-right: 0.16rem;
    font-size: 0.48rem;
  }
}

.action-btn--secondary {
  background: #fff;
}

// 底部安全提示
.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.16rem;
  margin-top: 0.48rem;
  font-size: 0.28rem;
  color: #969799;

  :deep(.van-icon) {
    color: #1989fa;
    font-size: 0.32rem;
  }
}
</style>