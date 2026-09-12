<!--
  InputPage.vue - v4 照着图2重设计
  ─────────────────────────────────────
  核心要求：
  1. 撑满整宽（width:100% + 左右小边距），不要 max-width 限制
  2. 巨大标题（1.5rem+）居中显示
  3. 简洁：移除装饰（数据条/3列功能/footer/浮动装饰）
  4. 居中：所有元素垂直居中分布
  5. 勾选框 100% 可勾（label 包裹 + @click 主动 toggle）
  ─────────────────────────────────────
-->
<template>
  <div class="page">

    <!-- ============ Hero（标题放大3倍 + 拆3行） ============ -->
    <header class="hero">
      <!-- 安全徽章（椭圆框 + 盾形，图标3倍） -->
      <div class="hero-badge">
        <span class="badge-dot">
          <AppIcon name="shield" color="#fff" size="1.26rem" />
        </span>
        <span class="badge-text">银行级安全加密 · 权威认证</span>
      </div>

      <!-- 巨大标题拆 3 行（4-3-4 字，避免 7 字放大3倍撑爆 viewport） -->
      <h1 class="title title-1">银行评分</h1>
      <h1 class="title title-2">大数据</h1>
      <h2 class="title title-3">专业查询</h2>
    </header>

    <!-- ============ 表单卡（撑满整宽） ============ -->
    <section class="card">

      <!-- 提示条 -->
      <div class="tip-bar">
        <span class="tip-icon">
          <AppIcon name="bell" color="#4A90E2" size="0.48rem" />
        </span>
        <span class="tip-text">为保证数据准确，请输入真实信息</span>
      </div>

      <!-- 输入项 -->
      <div class="fields">
        <div class="field" :class="{ active: focusField === 'name' }">
          <span class="field-icon">
            <AppIcon name="user" color="#4A90E2" size="0.56rem" />
          </span>
          <input
            v-model="form.name"
            class="field-input"
            placeholder="请输入本人姓名"
            maxlength="30"
            @focus="focusField = 'name'"
            @blur="focusField = ''"
          />
        </div>

        <div class="field" :class="{ active: focusField === 'idCard' }">
          <span class="field-icon">
            <AppIcon name="idcard" color="#4A90E2" size="0.56rem" />
          </span>
          <input
            v-model="form.idCard"
            class="field-input"
            placeholder="请输入本人身份证号"
            maxlength="18"
            inputmode="text"
            @focus="focusField = 'idCard'"
            @blur="focusField = ''"
          />
        </div>

        <div class="field" :class="{ active: focusField === 'phone' }">
          <span class="field-icon">
            <AppIcon name="phone" color="#4A90E2" size="0.56rem" />
          </span>
          <input
            v-model="form.phone"
            class="field-input"
            placeholder="请输入本人手机号"
            maxlength="11"
            inputmode="numeric"
            @focus="focusField = 'phone'"
            @blur="focusField = ''"
          />
        </div>
      </div>

      <!-- 警告 + 友情提示（橙底渐变） -->
      <div class="warning">
        <div class="warning-row">
          <span class="warning-icon">
            <AppIcon name="warning" color="#C2580E" size="0.5rem" />
          </span>
          <span class="warning-text">本人对查询输入的三要素的真实性负责，如有虚假，愿意承担由此产生的一切后果！</span>
        </div>
        <div class="warning-row">
          <span class="warning-icon">
            <AppIcon name="warning" color="#C2580E" size="0.5rem" />
          </span>
          <span class="warning-text">请务必输入查询人实名手机号，查询的非公开结果以手机号为准。</span>
        </div>
        <p class="warning-note">1.本报告不涉及金融场景的应用。</p>
      </div>

      <!-- 友情提示（橙底） -->
      <div class="tip-orange">
        <p class="tip-orange-title">友情提示：</p>
        <p>我司不是提供央行征信和个人爬虫等隐私数据查询，也不提供贷款及信用修复业务。</p>
        <p class="tip-orange-emph">所有要求你进行汇款、转账、非法刷单、买理财、承诺包下款的操作，都是诈骗！</p>
      </div>

      <!-- 协议（label 包裹 + @click 主动 toggle，零事件依赖） -->
      <label class="agreement">
        <input
          type="checkbox"
          class="agreement-native"
          :checked="agreed"
          @click="toggleAgreement"
          @change="toggleAgreement"
        />
        <span class="agreement-text">
          我已阅读并同意
          <a class="agreement-link" @click.prevent.stop="openAgreement('user')">《用户协议》</a>
          <a class="agreement-link" @click.prevent.stop="openAgreement('privacy')">《隐私政策》</a>
          <a class="agreement-link" @click.prevent.stop="openAgreement('auth')">《授权书》</a>
          ，点击勾选即代表您同意上述法律文书的相关条款并签署上述法律文书。
        </span>
      </label>

      <!-- 提交按钮 -->
      <button
        class="submit"
        :class="{ disabled: !canSubmit }"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        <span class="submit-text">立 即 查 询</span>
      </button>
    </section>

    <!-- ============ 协议弹窗 ============ -->
    <div v-if="popupType" class="popup-mask" @click.self="popupType = ''">
      <div class="popup">
        <div class="popup-head">
          <h3>{{ popupTitle }}</h3>
          <span class="popup-close" @click="popupType = ''">
            <AppIcon name="close" color="#666" size="0.5rem" />
          </span>
        </div>
        <div class="popup-body">
          <p>{{ popupContent }}</p>
          <p class="popup-todo">（本页面仅为前端展示，协议详情待接入正式文本）</p>
        </div>
        <div class="popup-foot">
          <button class="popup-confirm" @click="popupType = ''">我已知晓</button>
        </div>
      </div>
    </div>

    <!-- ============ Toast ============ -->
    <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRiskStore } from '@/stores/risk'
import {
  validateName,
  validateIdCard,
  validatePhone,
} from '@/utils/validators'
import AppIcon from '@/components/icons/AppIcons.vue'

const router = useRouter()
const store = useRiskStore()

const form = reactive({ name: '', idCard: '', phone: '' })
const focusField = ref<'' | 'name' | 'idCard' | 'phone'>('')
const agreed = ref(false)

const canSubmit = computed(() => {
  return (
    validateName(form.name) &&
    validateIdCard(form.idCard) &&
    validatePhone(form.phone) &&
    agreed.value
  )
})

const popupType = ref<'' | 'user' | 'privacy' | 'auth'>('')
const popupTitleMap: Record<string, string> = {
  user: '用户协议',
  privacy: '隐私政策',
  auth: '授权书',
}
const popupContentMap: Record<string, string> = {
  user: '本协议是您与本平台之间关于使用本服务所订立的协议。请仔细阅读。',
  privacy: '我们重视您的隐私，会严格保护您提交的个人信息安全。',
  auth: '您授权本平台查询与您相关的风险评估数据用于评分。',
}
const popupTitle = computed(() => (popupType.value ? popupTitleMap[popupType.value] : ''))
const popupContent = computed(() => (popupType.value ? popupContentMap[popupType.value] : ''))
function openAgreement(type: 'user' | 'privacy' | 'auth') {
  popupType.value = type
}

function handleSubmit() {
  if (!validateName(form.name)) return showToast('请检查姓名输入')
  if (!validateIdCard(form.idCard)) return showToast('请检查身份证号')
  if (!validatePhone(form.phone)) return showToast('请检查手机号')
  if (!agreed.value) return showToast('请先阅读并同意协议')

  store.saveFormData({ name: form.name, idCard: form.idCard, phone: form.phone })
  router.push({ name: 'result' })
}

const toastMsg = ref('')
function showToast(msg: string, duration = 2500) {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, duration)
}

// 协议勾选：@click 主动 toggle，完全不依赖 change 事件
function toggleAgreement(e: Event) {
  const target = e.target as HTMLInputElement | null
  if (target) {
    agreed.value = target.checked
  } else {
    agreed.value = !agreed.value
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

// =============================================================
// 根容器：撑满整宽（width:100%），所有元素居中
// =============================================================
.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  // 动态 viewport：iOS Safari 适配
  min-height: 100dvh;
  background: linear-gradient(180deg, #4A90E2 0%, #6C7CE7 18%, #A8B6F0 38%, #E8EEFB 58%, #F4F7FC 100%);
  display: flex;
  flex-direction: column;
  align-items: center;          // 水平居中
  justify-content: center;      // 垂直居中（hero+card 在 viewport 中央）
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
  overflow-x: hidden;
}

// =============================================================
// Hero：巨大标题（占顶部 ~28vh）
// =============================================================
.hero {
  width: 100%;
  padding: 1.28rem 1.28rem 1.6rem;   // 上下 padding 加大
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-shrink: 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  padding: 0.36rem 0.8rem 0.36rem 0.4rem;
  background: rgba(255, 255, 255, 0.22);
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  border-radius: $radius-full;
  margin-bottom: 0.64rem;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.badge-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.44rem;          // 0.48 → 1.44，3倍
  height: 1.44rem;
  background: #4A90E2;
  border-radius: $radius-full;
}

.badge-text {
  font-size: 0.96rem;       // 0.32 → 0.96，3倍
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
}

// 巨大标题（拆3行避免单行7字放大3倍撑爆 viewport）
// 320px 屏 → 2.2rem ≈ 82px, 375px 屏 → 2.6rem ≈ 98px, 414px 屏 → 2.8rem ≈ 105px
// 对比之前 1.4rem ≈ 52px，实际放大 ≈ 1.9-2x（再大 3x 7字一行撑爆）
.title {
  width: 100%;
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  letter-spacing: 0.04em;
  margin: 0;
  text-shadow: 0 3px 16px rgba(0, 0, 0, 0.28);
}

.title-1,
.title-2 {
  font-size: clamp(2.2rem, 25vw, 2.8rem);
}

.title-1 {
  margin-bottom: 0.12rem;
}

.title-2 {
  margin-bottom: 0.32rem;
}

.title-3 {
  font-size: clamp(1.5rem, 18vw, 1.9rem);
  font-weight: 800;
  opacity: 0.95;
}

// =============================================================
// 表单卡：两侧留更多空间（左右各 48px）
// =============================================================
.card {
  width: 100%;
  margin: 0.32rem 1.28rem 0;   // 0.853 → 1.28，左右各 48px 边距
  padding: 0.64rem 0.4rem 0.56rem;
  background: #fff;
  border-radius: 0.48rem;
  box-shadow:
    0 16px 40px rgba(74, 100, 180, 0.18),
    0 4px 8px rgba(74, 100, 180, 0.08);
  flex-shrink: 0;
}

// 提示条
.tip-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.16rem;
  padding-bottom: 0.48rem;        // 拉长 0.5 倍
  border-bottom: 1px solid $color-border-light;
  margin-bottom: 0.48rem;         // 拉长 0.5 倍
}

.tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tip-text {
  font-size: 0.36rem;
  color: #1A1A1A;
  font-weight: 500;
  letter-spacing: 0.02em;
}

// =============================================================
// 输入框（90px 高，拉长 1.5 倍）
// =============================================================
.fields {
  display: flex;
  flex-direction: column;
  gap: 0.36rem;                  // 0.24 → 0.36，列表项上下留出更多空间
}

.field {
  display: flex;
  align-items: center;
  height: 2.4rem;                // 60px → 90px，拉长 0.5 倍
  padding: 0 0.4rem;
  background: #F4F7FC;
  border: 1.5px solid transparent;
  border-radius: 0.16rem;
  transition: all $duration-fast;

  &.active {
    background: #fff;
    border-color: $color-primary;
    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.12);
  }
}

.field-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 0.32rem;
}

.field-input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 0.56rem;            // 18px → 21px
  color: $color-text-primary;
  min-width: 0;
  letter-spacing: 0.02em;

  &::placeholder {
    color: #B0B8C2;
    font-weight: 400;
  }
}

// =============================================================
// 警告行（拉长 0.5 倍）
// =============================================================
.warning {
  margin-top: 0.48rem;            // 0.32 → 0.48，上下留更多空间
  display: flex;
  flex-direction: column;
  gap: 0.24rem;                   // 0.16 → 0.24
}

.warning-row {
  display: flex;
  align-items: flex-start;
  gap: 0.16rem;
  min-height: 0.6rem;             // 拉长 0.5 倍
}

.warning-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.04rem;
}

.warning-text {
  font-size: 0.36rem;             // 0.32 → 0.36，字略大
  color: #1A1A1A;
  line-height: 1.7;
  font-weight: 500;
}

.warning-note {
  font-size: 0.36rem;
  color: #1A1A1A;
  margin: 0.16rem 0 0 0.4rem;     // 上下留空间
  line-height: 1.7;
}

// =============================================================
// 友情提示（橙底，拉长 0.5 倍）
// =============================================================
.tip-orange {
  margin-top: 0.48rem;            // 上下留更多空间
  padding: 0.48rem 0.4rem;        // 0.32 → 0.48，上下 padding 加大
  background: linear-gradient(135deg, #FFF4E6 0%, #FFE6CC 100%);
  border-radius: 0.16rem;
  border: 1px solid #FFD9A6;

  p {
    margin: 0;
    font-size: 0.36rem;           // 0.34 → 0.36
    color: #C2580E;
    line-height: 1.8;             // 1.6 → 1.8
  }
}

.tip-orange-title {
  font-weight: 700 !important;
  margin-bottom: 0.16rem !important;  // 0.08 → 0.16
}

.tip-orange-emph {
  font-weight: 600 !important;
  margin-top: 0.16rem !important;     // 0.08 → 0.16
}

// =============================================================
// 协议（label 包裹 + 原生 checkbox，拉长 0.5 倍）
// =============================================================
.agreement {
  display: flex;
  align-items: flex-start;
  gap: 0.24rem;
  margin-top: 0.56rem;           // 0.4 → 0.56
  padding: 0.16rem 0;            // 加一点上下 padding
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  min-height: 0.6rem;
}

.agreement-native {
  flex-shrink: 0;
  appearance: none;
  -webkit-appearance: none;
  width: 0.6rem;
  height: 0.6rem;
  margin: 0.1rem 0 0 0;          // 略偏下与文字基线对齐
  border: 1.5px solid #C8C8C8;
  border-radius: 0.09rem;
  background: #fff;
  cursor: pointer;
  position: relative;
  transition: all $duration-fast;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  display: inline-block;
  vertical-align: middle;
  touch-action: manipulation;

  &:checked {
    background: $color-primary;
    border-color: $color-primary;

    &::after {
      content: '';
      position: absolute;
      left: 0.2rem;
      top: 0.08rem;
      width: 0.13rem;
      height: 0.26rem;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
}

.agreement-text {
  flex: 1;
  font-size: 0.36rem;            // 0.32 → 0.36
  color: #1A1A1A;
  line-height: 1.7;
  word-break: break-word;
  min-width: 0;
}

.agreement-link {
  color: $color-primary;
  text-decoration: none;
  margin: 0 0.04rem;
  font-weight: 600;
}

// =============================================================
// 提交按钮（撑满整宽，大圆角，拉长 0.5 倍）
// =============================================================
.submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 2.6rem;               // 65px → 97.5px，拉长 0.5 倍
  margin-top: 0.72rem;           // 0.48 → 0.72
  border: 0;
  border-radius: 1.28rem;       // 32px → 48px
  background: linear-gradient(135deg, #4A90E2 0%, #6C5CE7 50%, #A55EEA 100%);
  color: #fff;
  font-size: 0.64rem;            // 0.56 → 0.64
  font-weight: 800;
  letter-spacing: 0.32em;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(108, 92, 231, 0.32);
  -webkit-tap-highlight-color: transparent;
  transition: all $duration-fast;

  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 6px 16px rgba(108, 92, 231, 0.32);
  }

  &.disabled,
  &:disabled {
    background: linear-gradient(135deg, #C8D0DD 0%, #B0B8C2 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    cursor: not-allowed;
  }
}

.submit-text {
  display: inline-block;
  margin-left: -0.32em;
}

// =============================================================
// 协议弹窗
// =============================================================
.popup-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-overlay;
  padding: $spacing-md;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.popup {
  width: 100%;
  max-width: 8rem;
  background: #fff;
  border-radius: 0.32rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.popup-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem $spacing-md;
  border-bottom: 1px solid $color-border-light;

  h3 {
    margin: 0;
    font-size: 0.48rem;
    font-weight: 700;
    color: $color-text-primary;
  }
}

.popup-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.6rem;
  height: 0.6rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.popup-body {
  flex: 1;
  padding: $spacing-md;
  overflow-y: auto;
  font-size: 0.36rem;
  color: $color-text-secondary;
  line-height: 1.6;

  p { margin: 0 0 $spacing-sm 0; }
}

.popup-todo {
  margin-top: $spacing-sm;
  padding-top: $spacing-sm;
  border-top: 1px dashed $color-border;
  color: $color-text-placeholder;
  font-size: 0.32rem;
}

.popup-foot {
  padding: $spacing-sm $spacing-md $spacing-md;
}

.popup-confirm {
  width: 100%;
  height: 1.173rem;
  border: 0;
  border-radius: 0.16rem;
  background: $color-primary;
  color: #fff;
  font-size: 0.4rem;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

// =============================================================
// Toast
// =============================================================
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
  font-size: 0.36rem;
  padding: 0.24rem 0.4rem;
  border-radius: 0.16rem;
  z-index: 9999;
  pointer-events: none;
  max-width: 80%;
  text-align: center;
}
</style>
