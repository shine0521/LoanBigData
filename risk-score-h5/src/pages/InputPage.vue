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

    <!-- ============ Hero（只保留标题） ============ -->
    <header class="hero">
      <!-- 安全徽章（椭圆框 + 盾形） -->
      <div class="hero-badge">
        <span class="badge-dot">
          <AppIcon name="shield" color="#fff" size="0.42rem" />
        </span>
        <span class="badge-text">银行级安全加密 · 权威认证</span>
      </div>

      <!-- 巨大标题 -->
      <h1 class="title-main">银行评分大数据</h1>
      <h2 class="title-sub">专业查询</h2>
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
  padding: 0.8rem $spacing-md 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;          // 水平居中
  text-align: center;
  flex-shrink: 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.16rem;
  padding: 0.18rem 0.4rem 0.18rem 0.2rem;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: $radius-full;
  margin-bottom: 0.32rem;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.badge-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.48rem;
  height: 0.48rem;
  background: #4A90E2;
  border-radius: $radius-full;
}

.badge-text {
  font-size: 0.32rem;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

// 巨大主标题（占整宽，居中显示）
// 用 clamp(vw自适应)：320px屏 ~41px，375px屏 ~48px，414px屏 ~54px
.title-main {
  width: 100%;
  font-size: clamp(0.95rem, 13vw, 1.4rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  letter-spacing: 0.04em;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.title-sub {
  width: 100%;
  font-size: clamp(0.95rem, 13vw, 1.4rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  letter-spacing: 0.04em;
  margin: 0.08rem 0 0 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

// =============================================================
// 表单卡：撑满整宽（不要 max-width）
// =============================================================
.card {
  width: 100%;                  // 撑满
  margin: 0.32rem $spacing-md 0; // 左右只留边距
  padding: 0.48rem 0.32rem 0.4rem;
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
  padding-bottom: 0.32rem;
  border-bottom: 1px solid $color-border-light;
  margin-bottom: 0.32rem;
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
// 输入框（60-65px 高）
// =============================================================
.fields {
  display: flex;
  flex-direction: column;
  gap: 0.24rem;
}

.field {
  display: flex;
  align-items: center;
  height: 1.6rem;               // 60px
  padding: 0 0.32rem;
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
  margin-right: 0.24rem;
}

.field-input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 0.48rem;           // 18px
  color: $color-text-primary;
  min-width: 0;
  letter-spacing: 0.02em;

  &::placeholder {
    color: #B0B8C2;
    font-weight: 400;
  }
}

// =============================================================
// 警告行
// =============================================================
.warning {
  margin-top: 0.32rem;
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.warning-row {
  display: flex;
  align-items: flex-start;
  gap: 0.16rem;
}

.warning-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.04rem;
}

.warning-text {
  font-size: 0.32rem;
  color: #1A1A1A;
  line-height: 1.6;
  font-weight: 500;
}

.warning-note {
  font-size: 0.32rem;
  color: #1A1A1A;
  margin: 0.08rem 0 0 0.4rem;
  line-height: 1.6;
}

// =============================================================
// 友情提示（橙底）
// =============================================================
.tip-orange {
  margin-top: 0.32rem;
  padding: 0.32rem 0.32rem;
  background: linear-gradient(135deg, #FFF4E6 0%, #FFE6CC 100%);
  border-radius: 0.16rem;
  border: 1px solid #FFD9A6;

  p {
    margin: 0;
    font-size: 0.34rem;
    color: #C2580E;
    line-height: 1.6;
  }
}

.tip-orange-title {
  font-weight: 700 !important;
  margin-bottom: 0.08rem !important;
}

.tip-orange-emph {
  font-weight: 600 !important;
  margin-top: 0.08rem !important;
}

// =============================================================
// 协议（label 包裹 + 原生 checkbox）
// =============================================================
.agreement {
  display: flex;
  align-items: flex-start;
  gap: 0.24rem;
  margin-top: 0.4rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.agreement-native {
  flex-shrink: 0;
  appearance: none;
  -webkit-appearance: none;
  width: 0.6rem;                // 22.5px
  height: 0.6rem;
  margin: 0.06rem 0 0 0;
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
  font-size: 0.32rem;
  color: #1A1A1A;
  line-height: 1.6;
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
// 提交按钮（撑满整宽，大圆角）
// =============================================================
.submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 1.733rem;             // 65px
  margin-top: 0.48rem;
  border: 0;
  border-radius: 0.853rem;      // 32px 大圆角
  background: linear-gradient(135deg, #4A90E2 0%, #6C5CE7 50%, #A55EEA 100%);
  color: #fff;
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.32em;       // 「立 即 查 询」加间距
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
  // letter-spacing 会让第一个字左偏，这里补偿
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
