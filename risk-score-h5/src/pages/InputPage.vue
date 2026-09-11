<!--
  InputPage.vue - 信息输入页（路由：/，name: index）
  风格：蓝色渐变 Hero + 白色圆角表单卡片
  数据流：校验通过 → 调用 submit → 保存 assessmentNo → 跳转结果页
-->
<template>
  <div class="page-input">
    <!-- 顶部蓝色 Hero 区 -->
    <div class="hero">
      <!-- 装饰徽章：盾牌 + 文本，上移并放大 1.5x -->
      <div class="hero-badge" aria-hidden="true">
        <span class="badge-icon">
          <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
            <path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" fill="#fff" opacity="0.95"/>
            <path d="M10.5 14.5l-2.5-2.5 1.4-1.4 1.1 1.1 4.1-4.1 1.4 1.4-5.5 5.5z" fill="#4A90E2"/>
          </svg>
        </span>
        <span class="badge-text">银行级安全加密 · 权威认证</span>
      </div>
      <div class="hero-titles">
        <h1 class="hero-title">银行评分大数据</h1>
        <h1 class="hero-title">专业查询</h1>
      </div>
    </div>

    <!-- 白色表单卡片 -->
    <div class="form-card">
      <!-- 铃铛 + 提示 -->
      <div class="tip-bar">
        <span class="tip-bell">🔔</span>
        <span class="tip-text">为保证数据准确，请输入真实信息</span>
      </div>

      <!-- 3 个圆角胶囊输入框 -->
      <div class="fields">
        <div class="field-pill">
          <input
            v-model="form.name"
            class="field-input"
            placeholder="请输入本人姓名"
            maxlength="30"
            @blur="validateField('name')"
          />
        </div>
        <div class="field-pill">
          <input
            v-model="form.idCard"
            class="field-input"
            placeholder="请输入本人身份证号"
            maxlength="18"
            inputmode="text"
            @blur="validateField('idCard')"
          />
        </div>
        <div class="field-pill">
          <input
            v-model="form.phone"
            class="field-input"
            placeholder="请输入本人手机号"
            maxlength="11"
            inputmode="numeric"
            @blur="validateField('phone')"
          />
        </div>
      </div>

      <!-- 警告提示区 -->
      <div class="warning-block">
        <div class="warning-row">
          <span class="warn-icon">⚠️</span>
          <span class="warn-text">
            本人对查询输入的三要素的真实性负责，如有虚假，愿意承担由此产生的一切后果！
          </span>
        </div>
        <div class="warning-row">
          <span class="warn-icon">⚠️</span>
          <span class="warn-text">
            请务必输入查询人实名手机号，查询的非公开结果以手机号为准。
          </span>
        </div>
        <div class="tip-line">1.本报告不涉及金融场景的应用。</div>
      </div>

      <!-- 友情提示 -->
      <div class="friend-tip">
        <p class="friend-tip-title">友情提示：</p>
        <p>我司不是提供央行征信和个人爬虫等隐私数据查询，也不提供贷款及信用修复复业务。</p>
        <p>所有要求你进行汇款、转账、非法刷单、买理财、承诺包下款的操作，都是诈骗！</p>
      </div>

      <!-- 协议勾选 -->
      <div class="agreement" @click="toggleAgreement">
        <div class="agreement-box" :class="{ checked: agreed }">
          <span v-if="agreed" class="agreement-tick">✓</span>
        </div>
        <span class="agreement-text">
          我已阅读并同意
          <a class="agreement-link" @click.stop="openAgreement('user')">《用户协议》</a>
          <a class="agreement-link" @click.stop="openAgreement('privacy')">《隐私政策》</a>
          <a class="agreement-link" @click.stop="openAgreement('auth')">《授权书》</a>
          ，点击勾选即代表您同意上述法律文书的相关条款并签署上述法律文书。
        </span>
      </div>

      <!-- 立即查询按钮 -->
      <button
        class="pay-btn"
        :class="{ disabled: !canSubmit, loading: store.submitting }"
        :disabled="!canSubmit || store.submitting"
        @click="handleSubmit"
      >
        <span v-if="store.submitting">提交中...</span>
        <span v-else>立即查询</span>
      </button>
    </div>

    <!-- 协议弹窗（简易占位） -->
    <div v-if="popupType" class="agreement-overlay" @click.self="popupType = ''">
      <div class="agreement-popup">
        <div class="popup-header">
          <h3>{{ popupTitle }}</h3>
          <span class="close-btn" @click="popupType = ''">&times;</span>
        </div>
        <div class="popup-body">
          <p>{{ popupContent }}</p>
          <p class="popup-todo">（本页面仅为前端展示，协议详情待接入正式文本）</p>
        </div>
        <div class="popup-footer">
          <button class="popup-confirm" @click="popupType = ''">我已知晓</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toastMsg" class="toast-tip">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRiskStore } from '@/stores/risk'
import { submit } from '@/api/risk'
import {
  validateName,
  validateIdCard,
  validatePhone,
  getNameError,
  getIdCardError,
  getPhoneError,
} from '@/utils/validators'

const router = useRouter()
const store = useRiskStore()

// ---------- 表单数据 ----------
const form = reactive({
  name: '',
  idCard: '',
  phone: '',
})

// ---------- 校验 ----------
const nameError = ref('')
const idCardError = ref('')
const phoneError = ref('')

function validateField(field: 'name' | 'idCard' | 'phone') {
  if (field === 'name') nameError.value = getNameError(form.name)
  else if (field === 'idCard') idCardError.value = getIdCardError(form.idCard)
  else phoneError.value = getPhoneError(form.phone)
}

// ---------- 协议勾选 ----------
const agreed = ref(false)
function toggleAgreement() {
  agreed.value = !agreed.value
}

// ---------- 协议弹窗 ----------
const popupType = ref<'' | 'user' | 'privacy' | 'auth'>('')
const popupTitleMap: Record<string, string> = {
  user: '用户协议',
  privacy: '隐私政策',
  auth: '授权书',
}
const popupTitle = computed(() => (popupType.value ? popupTitleMap[popupType.value] : ''))
const popupContentMap: Record<string, string> = {
  user: '本协议是您与本平台之间关于使用本服务所订立的协议。请仔细阅读。',
  privacy: '我们重视您的隐私，会严格保护您提交的个人信息安全。',
  auth: '您授权本平台查询与您相关的风险评估数据用于评分。',
}
const popupContent = computed(() => (popupType.value ? popupContentMap[popupType.value] : ''))

function openAgreement(type: 'user' | 'privacy' | 'auth') {
  popupType.value = type
}

// ---------- 提交 ----------
const canSubmit = computed(() => {
  return (
    validateName(form.name) &&
    validateIdCard(form.idCard) &&
    validatePhone(form.phone) &&
    agreed.value &&
    !store.submitting
  )
})

async function handleSubmit() {
  // 完整校验
  validateField('name')
  validateField('idCard')
  validateField('phone')
  if (!validateName(form.name)) return showToast('请检查姓名输入')
  if (!validateIdCard(form.idCard)) return showToast('请检查身份证号')
  if (!validatePhone(form.phone)) return showToast('请检查手机号')
  if (!agreed.value) return showToast('请先阅读并同意协议')

  store.saveFormData({ name: form.name, idCard: form.idCard, phone: form.phone })
  store.setSubmitting(true)

  try {
    const result = await submit({
      name: form.name,
      idCard: form.idCard,
      phone: form.phone,
    })
    store.saveAssessmentNo(result.assessmentNo)
    router.push({ name: 'result' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '提交失败，请稍后重试'
    showToast(msg)
  } finally {
    store.setSubmitting(false)
  }
}

// ---------- Toast ----------
const toastMsg = ref('')
function showToast(msg: string, duration = 2500) {
  toastMsg.value = msg
  setTimeout(() => {
    toastMsg.value = ''
  }, duration)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

// ---------- 根容器：浅蓝渐变背景 ----------
.page-input {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #6BB8FF 0%, #9DC9F8 18%, #C7DFFA 35%, #FFFFFF 60%);
  padding-bottom: $spacing-xl;
  overflow-x: hidden;
}

// ---------- Hero 区 ----------
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;          // 靠上，便于徽章进一步上移
  gap: $spacing-sm;                      // 原 $spacing-md，缩小让徽章靠近标题
  padding: $spacing-sm $spacing-md 0.8rem; // 底部 padding 缩小一半（原 1.6rem → 0.8rem）
  min-height: 5rem;                      // 同步缩高
  color: #fff;
}

.hero-titles {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-title {
  font-size: 1.6rem;   // 原 1.067rem × 1.5 → ~60px
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.04em;
  margin: 0;
  text-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  word-break: keep-all;
}
// 更大屏幕上再放大一档
@media (min-width: 768px) {
  .hero-title { font-size: 1.92rem; } // 原 1.28rem × 1.5 → ~72px
}

// ---------- Hero 徽章（上移、整体放大 1.5x） ----------
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.24rem;                         // 原 0.16rem × 1.5
  padding: 0.2rem 0.6rem 0.2rem 0.3rem; // 原 0.13 / 0.4 / 0.13 / 0.2，× 1.5
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: $radius-full;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.badge-icon {
  display: inline-flex;
  width: 0.72rem;    // 原 0.48rem × 1.5 → ~27px
  height: 0.72rem;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4A90E2 0%, #2E6BB0 100%);
  border-radius: 50%;
  box-shadow: 0 3px 6px rgba(74, 144, 226, 0.4);  // 阴影也加深
}

.badge-text {
  font-size: $font-size-md;            // 原 $font-size-xs (14px) → $font-size-md (18px) × 1.3+
  font-weight: 700;                    // 原 600 → 700
  color: #fff;
  letter-spacing: 0.06em;              // 原 0.04em → 0.06em
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

// ---------- 白色表单卡片（与 hero 接驳） ----------
.form-card {
  position: relative;
  margin: 0 $spacing-md 0;              // 取消负 margin-top，与 hero 完全脱开
  background: #fff;
  border-radius: 0.32rem;
  padding: $spacing-md $spacing-md $spacing-xl;
  box-shadow: 0 4px 16px rgba(46, 107, 176, 0.12);
  z-index: 1;
}

// ---------- 铃铛提示条 ----------
.tip-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  padding: $spacing-xs 0 $spacing-md;
  color: $color-text-secondary;
}
.tip-bell {
  font-size: $font-size-sm;
}
.tip-text {
  font-size: $font-size-xs;
}

// ---------- 圆角胶囊输入框 ----------
.fields {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.field-pill {
  display: flex;
  align-items: center;
  height: 1.013rem; // ~38px
  background: $color-bg-light;
  border-radius: 0.533rem; // 大圆角胶囊
  padding: 0 $spacing-md;
}

.field-input {
  width: 100%;
  height: 100%;
  background: transparent;
  border: 0;
  outline: none;
  font-size: $font-size-sm;
  color: $color-text-primary;
  &::placeholder {
    color: #B8B8B8;
    font-size: $font-size-sm;
  }
}

// ---------- 警告提示块 ----------
.warning-block {
  margin-top: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.warning-row {
  display: flex;
  align-items: flex-start;
  gap: $spacing-xs;
}
.warn-icon {
  font-size: $font-size-sm;
  line-height: 1.4;
}
.warn-text {
  flex: 1;
  font-size: $font-size-xs;
  color: $color-text-secondary;
  line-height: 1.5;
}

.tip-line {
  margin-left: 0.32rem;
  font-size: $font-size-xs;
  color: $color-text-secondary;
  line-height: 1.7;
}

// ---------- 友情提示（粉橙底） ----------
.friend-tip {
  margin-top: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: #FFF3EB;
  border-radius: $radius-md;
  color: #C2580E;
  font-size: $font-size-xs;
  line-height: 1.6;
}
.friend-tip-title {
  font-weight: 600;
  margin-bottom: $spacing-xs;
}

// ---------- 协议勾选 ----------
.agreement {
  display: flex;
  align-items: flex-start;
  gap: $spacing-xs;
  margin-top: $spacing-md;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.agreement-box {
  flex-shrink: 0;
  width: 0.36rem;
  height: 0.36rem;
  margin-top: 0.04rem;
  border: 1.5px solid #C8C8C8;
  border-radius: 0.053rem;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $duration-fast;
  &.checked {
    background: $color-primary;
    border-color: $color-primary;
  }
}
.agreement-tick {
  color: #fff;
  font-size: 0.24rem;
  font-weight: 700;
  line-height: 1;
}
.agreement-text {
  flex: 1;
  font-size: $font-size-xs;
  color: $color-text-secondary;
  line-height: 1.6;
}
.agreement-link {
  color: $color-primary;
  text-decoration: none;
  margin: 0 0.04rem;
}

// ---------- 立即查询按钮 ----------
.pay-btn {
  display: block;
  width: 100%;
  margin-top: $spacing-lg;
  height: 1.12rem;
  border: 0;
  border-radius: 0.56rem;
  background: linear-gradient(90deg, #9DC9F8 0%, #6BB8FF 50%, #4A90E2 100%);
  color: #fff;
  font-size: $font-size-md;
  font-weight: 700;
  letter-spacing: 0.04em;
  box-shadow: 0 6px 16px rgba(74, 144, 226, 0.35);
  cursor: pointer;
  transition: all $duration-fast;
  -webkit-tap-highlight-color: transparent;
  &:active { transform: translateY(1px); }
  &.disabled,
  &:disabled {
    background: #C0D0E5;
    box-shadow: none;
    cursor: not-allowed;
  }
  &.loading { opacity: 0.85; }
}

// ---------- 协议弹窗 ----------
.agreement-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: $z-index-popup;
  display: flex;
  align-items: flex-end;
}
.agreement-popup {
  width: 100%;
  background: #fff;
  border-radius: $radius-lg $radius-lg 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  border-bottom: 1px solid $color-border;
  h3 { font-size: $font-size-md; font-weight: 600; }
}
.close-btn {
  font-size: $font-size-lg;
  color: $color-text-secondary;
  cursor: pointer;
  padding: $spacing-xs;
}
.popup-body {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  line-height: 1.8;
}
.popup-todo {
  margin-top: $spacing-md;
  color: $color-text-placeholder;
  font-size: $font-size-xs;
}
.popup-footer {
  padding: $spacing-md;
  border-top: 1px solid $color-border;
}
.popup-confirm {
  width: 100%;
  height: 1.013rem;
  background: $color-primary;
  color: #fff;
  font-size: $font-size-sm;
  font-weight: 600;
  border: 0;
  border-radius: $radius-md;
  cursor: pointer;
}

// ---------- Toast ----------
.toast-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.75);
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