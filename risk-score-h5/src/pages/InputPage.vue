<!--
  InputPage.vue - 信息输入页（合理放大 + 居中下移）
  风格：现代金融科技风 — 顶部蓝紫渐变 + 浮动装饰圆斑 + 白色卡片表单
  数据流：校验通过 → 纯前端跳转 ResultPage（零后端回传）

  尺寸策略：标题 ~55px (1.4x)，输入框 ~60px (1.36x)，按钮 ~60px
  适配基准：375px 设计稿，rem = 37.5px，确保 320-414px 屏完整显示
-->
<template>
  <div class="page-input">
    <!-- 背景装饰 -->
    <DecorationBg />

    <!-- 顶部 Hero 区 -->
    <div class="hero">
      <!-- 顶部认证徽章（玻璃拟态） -->
      <div class="hero-badge">
        <span class="badge-icon"><AppIcon name="shield" color="#fff" /></span>
        <span class="badge-text">银行级安全加密 · 权威认证</span>
      </div>

      <!-- 主标题 -->
      <div class="hero-titles">
        <h1 class="hero-title">银行评分大数据</h1>
        <h1 class="hero-title hero-title-accent">专业查询</h1>
        <div class="hero-underline"><span /></div>
        <p class="hero-subtitle">全面 · 精准 · 银行级安全</p>
      </div>

      <!-- 数据条 -->
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-num">5<span>+</span></div>
          <div class="stat-label">合作银行</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-num">10<span>s</span></div>
          <div class="stat-label">极速出分</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-num">99.9<span>%</span></div>
          <div class="stat-label">数据准确</div>
        </div>
      </div>
    </div>

    <!-- 白色表单卡片 -->
    <div class="form-card">
      <!-- 顶部提示条 -->
      <div class="tip-bar">
        <AppIcon name="bell" color="#4A90E2" size="0.5rem" />
        <span class="tip-text">为保证数据准确，请输入真实信息</span>
      </div>

      <!-- 3 个圆角胶囊输入框 -->
      <div class="fields">
        <div class="field-pill" :class="{ focus: focusField === 'name' }">
          <span class="field-icon"><AppIcon name="user" color="#4A90E2" size="0.56rem" /></span>
          <input
            v-model="form.name"
            class="field-input"
            placeholder="请输入本人姓名"
            maxlength="30"
            @focus="focusField = 'name'"
            @blur="(focusField = '', validateField('name'))"
          />
        </div>
        <div class="field-pill" :class="{ focus: focusField === 'idCard' }">
          <span class="field-icon"><AppIcon name="idcard" color="#4A90E2" size="0.56rem" /></span>
          <input
            v-model="form.idCard"
            class="field-input"
            placeholder="请输入本人身份证号"
            maxlength="18"
            inputmode="text"
            @focus="focusField = 'idCard'"
            @blur="(focusField = '', validateField('idCard'))"
          />
        </div>
        <div class="field-pill" :class="{ focus: focusField === 'phone' }">
          <span class="field-icon"><AppIcon name="phone" color="#4A90E2" size="0.56rem" /></span>
          <input
            v-model="form.phone"
            class="field-input"
            placeholder="请输入本人手机号"
            maxlength="11"
            inputmode="numeric"
            @focus="focusField = 'phone'"
            @blur="(focusField = '', validateField('phone'))"
          />
        </div>
      </div>

      <!-- 友情提示（柔和橙底） -->
      <div class="friend-tip">
        <div class="friend-tip-header">
          <span class="friend-tip-icon"><AppIcon name="info" color="#C2580E" size="0.5rem" /></span>
          <span class="friend-tip-title">友情提示</span>
        </div>
        <p>我司不是提供央行征信和个人爬虫等隐私数据查询，也不提供贷款及信用修复复业务。</p>
        <p class="friend-tip-warn">所有要求你进行汇款、转账、非法刷单、买理财、承诺包下款的操作，都是诈骗！</p>
      </div>

      <!-- 协议勾选（修复：改回原生 span + 点击事件直接挂 box） -->
      <div class="agreement" @click.self="toggleAgreement">
        <span
          class="agreement-box"
          :class="{ checked: agreed }"
          role="checkbox"
          :aria-checked="agreed"
          tabindex="0"
          @click.stop="toggleAgreement"
          @keydown.enter.prevent="toggleAgreement"
          @keydown.space.prevent="toggleAgreement"
        >
          <span v-if="agreed" class="agreement-tick">✓</span>
        </span>
        <span class="agreement-text">
          我已阅读并同意
          <a class="agreement-link" @click.stop="openAgreement('user')">《用户协议》</a>
          <a class="agreement-link" @click.stop="openAgreement('privacy')">《隐私政策》</a>
          <a class="agreement-link" @click.stop="openAgreement('auth')">《授权书》</a>
          ，点击勾选即代表您同意上述法律文书相关条款。
        </span>
      </div>

      <!-- 立即查询按钮 -->
      <button
        class="pay-btn"
        :class="{ disabled: !canSubmit }"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        <span class="pay-btn-shine" />
        <span class="pay-btn-text">立即查询</span>
        <span class="pay-btn-arrow"><AppIcon name="arrowRight" color="#fff" size="0.5rem" /></span>
      </button>

      <!-- 底部信任标识 -->
      <div class="trust-row">
        <span class="trust-item"><AppIcon name="lock" color="#999" size="0.36rem" /> 信息加密</span>
        <span class="trust-item"><AppIcon name="shield" color="#999" size="0.36rem" /> 隐私保护</span>
        <span class="trust-item"><AppIcon name="database" color="#999" size="0.36rem" /> 银行数据</span>
      </div>
    </div>

    <!-- 协议弹窗 -->
    <div v-if="popupType" class="agreement-overlay" @click.self="popupType = ''">
      <div class="agreement-popup">
        <div class="popup-header">
          <h3>{{ popupTitle }}</h3>
          <span class="close-btn" @click="popupType = ''"><AppIcon name="close" color="#666" size="0.5rem" /></span>
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
import {
  validateName,
  validateIdCard,
  validatePhone,
  getNameError,
  getIdCardError,
  getPhoneError,
} from '@/utils/validators'
import AppIcon from '@/components/icons/AppIcons.vue'
import DecorationBg from '@/components/DecorationBg.vue'

const router = useRouter()
const store = useRiskStore()

const form = reactive({ name: '', idCard: '', phone: '' })
const focusField = ref<'' | 'name' | 'idCard' | 'phone'>('')

const nameError = ref('')
const idCardError = ref('')
const phoneError = ref('')

function validateField(field: 'name' | 'idCard' | 'phone') {
  if (field === 'name') nameError.value = getNameError(form.name)
  else if (field === 'idCard') idCardError.value = getIdCardError(form.idCard)
  else phoneError.value = getPhoneError(form.phone)
}

const agreed = ref(false)
function toggleAgreement() {
  agreed.value = !agreed.value
  console.log('[agreement] toggled:', agreed.value) // 调试日志
}

const popupType = ref<'' | 'user' | 'privacy' | 'auth'>('')
const popupTitleMap: Record<string, string> = { user: '用户协议', privacy: '隐私政策', auth: '授权书' }
const popupTitle = computed(() => (popupType.value ? popupTitleMap[popupType.value] : ''))
const popupContentMap: Record<string, string> = {
  user: '本协议是您与本平台之间关于使用本服务所订立的协议。请仔细阅读。',
  privacy: '我们重视您的隐私，会严格保护您提交的个人信息安全。',
  auth: '您授权本平台查询与您相关的风险评估数据用于评分。',
}
const popupContent = computed(() => (popupType.value ? popupContentMap[popupType.value] : ''))

function openAgreement(type: 'user' | 'privacy' | 'auth') { popupType.value = type }

const canSubmit = computed(() => {
  return (
    validateName(form.name) &&
    validateIdCard(form.idCard) &&
    validatePhone(form.phone) &&
    agreed.value
  )
})

function handleSubmit() {
  validateField('name'); validateField('idCard'); validateField('phone')
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
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

// ============================================================
// 根容器：浅蓝渐变背景（与 global 一致）
// ============================================================
.page-input {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #4A90E2 0%, #6C7CE7 28%, #A8B6F0 52%, #E8EEFB 75%, #FFFFFF 100%);
  padding-bottom: $spacing-xl;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1.6rem;   // 顶部下移（≈60px）
}

.hero,
.form-card {
  width: 100%;
  max-width: 10rem; // 375px 居中
}

// ============================================================
// Hero 区
// ============================================================
.hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md $spacing-md;
  color: #fff;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.16rem;
  padding: 0.16rem 0.42rem 0.16rem 0.2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: $radius-full;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.badge-icon {
  display: inline-flex;
  width: 0.5rem;
  height: 0.5rem;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4A90E2 0%, #6C5CE7 100%);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.4);
}

.badge-text {
  font-size: $font-size-xs;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

// 主标题（合理放大：1.467rem ≈ 55px，原 40px 的 1.4x）
.hero-titles {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 0.16rem;
}

.hero-title {
  font-size: 1.467rem;   // ~55px
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: 0.04em;
  margin: 0;
  background: linear-gradient(180deg, #fff 0%, #F0F4FF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 12px rgba(74, 144, 226, 0.4));
  word-break: keep-all;
}

.hero-title-accent {
  font-size: 1.6rem;     // ~60px
  letter-spacing: 0.08em;
}

.hero-underline {
  margin-top: 0.2rem;
  width: 1.6rem;
  height: 0.08rem;
  background: linear-gradient(90deg, transparent 0%, #fff 50%, transparent 100%);
  border-radius: 2px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 0.16rem;
    height: 0.16rem;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  }
}

.hero-subtitle {
  font-size: $font-size-xs;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 0.2rem;
  letter-spacing: 0.16em;
  font-weight: 500;
}

// Hero 底部数据条
.hero-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 8rem;
  margin-top: $spacing-sm;
  padding: 0.24rem $spacing-md;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 0.32rem;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.04rem;
}

.stat-num {
  font-size: $font-size-lg;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;

  span {
    font-size: $font-size-xs;
    font-weight: 500;
    opacity: 0.9;
    margin-left: 0.04rem;
  }
}

.stat-label {
  font-size: 0.28rem;   // 10.5px
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.04em;
}

.stat-divider {
  width: 1px;
  height: 0.64rem;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 $spacing-xs;
}

// ============================================================
// 白色表单卡片
// ============================================================
.form-card {
  position: relative;
  z-index: 2;
  margin: -0.4rem $spacing-md 0;
  background: #fff;
  border-radius: 0.4rem;
  padding: $spacing-md $spacing-md $spacing-lg;
  box-shadow: 0 12px 32px rgba(74, 100, 180, 0.18), 0 4px 8px rgba(74, 100, 180, 0.08);
}

// 提示条
.tip-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.16rem;
  padding: $spacing-xs 0 $spacing-sm;
}

.tip-text {
  font-size: $font-size-sm;
  color: #4A90E2;
  font-weight: 500;
}

// 输入框（合理放大：高度 1.6rem ≈ 60px，原 44px 的 1.36x）
.fields {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.field-pill {
  display: flex;
  align-items: center;
  gap: 0.24rem;
  height: 1.6rem;   // 60px
  background: #F4F7FC;
  border: 1.5px solid transparent;
  border-radius: 0.64rem;
  padding: 0 $spacing-md;
  transition: all $duration-fast;

  &:focus-within,
  &.focus {
    background: #fff;
    border-color: #4A90E2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.12);
  }
}

.field-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: 0;
  outline: none;
  font-size: 0.48rem;   // 18px
  color: $color-text-primary;
  font-weight: 500;
  letter-spacing: 0.02em;
  min-width: 0;          // 防止 input 撑爆 flex

  &::placeholder {
    color: #B8C2D0;
    font-size: 0.48rem;
    font-weight: 400;
  }
}

// ============================================================
// 友情提示
// ============================================================
.friend-tip {
  margin-top: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: linear-gradient(135deg, #FFF7EC 0%, #FFEBD9 100%);
  border: 1px solid #FFD9B3;
  border-radius: $radius-md;
  color: #C2580E;
  font-size: $font-size-xs;
  line-height: 1.65;
}

.friend-tip-header {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  margin-bottom: 0.12rem;
  font-weight: 600;
}

.friend-tip-icon {
  display: inline-flex;
}

.friend-tip-title {
  font-size: $font-size-xs;
  font-weight: 700;
  color: #C2580E;
}

.friend-tip-warn {
  margin-top: 0.12rem;
  font-weight: 600;
  color: #A64800;
}

// ============================================================
// 协议勾选（修复：box 改 span 自定义复选框 + 键盘可访问）
// ============================================================
.agreement {
  display: flex;
  align-items: flex-start;
  gap: 0.24rem;
  margin-top: $spacing-md;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.agreement-box {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.56rem;     // 21px（明确可点击尺寸）
  height: 0.56rem;
  margin-top: 0.04rem;
  border: 1.5px solid #C8C8C8;
  border-radius: 0.08rem;
  background: #fff;
  transition: all $duration-fast;
  user-select: none;

  &.checked {
    background: $color-primary;
    border-color: $color-primary;
  }
}

.agreement-tick {
  color: #fff;
  font-size: 0.36rem;  // 13.5px 勾（相对 21px 框显得大）
  font-weight: 900;
  line-height: 1;
}

.agreement-text {
  flex: 1;
  font-size: $font-size-xs;
  color: $color-text-secondary;
  line-height: 1.6;
  word-break: break-word;
}

.agreement-link {
  color: $color-primary;
  text-decoration: none;
  margin: 0 0.04rem;
  font-weight: 500;
}

// ============================================================
// 立即查询按钮（合理放大：高度 1.6rem ≈ 60px）
// ============================================================
.pay-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.24rem;
  width: 100%;
  margin-top: $spacing-lg;
  height: 1.6rem;       // 60px
  border: 0;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, #4A90E2 0%, #6C5CE7 50%, #A55EEA 100%);
  color: #fff;
  font-size: 0.533rem;  // 20px
  font-weight: 700;
  letter-spacing: 0.08em;
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.4), 0 2px 6px rgba(74, 144, 226, 0.3);
  cursor: pointer;
  overflow: hidden;
  transition: all $duration-fast;
  -webkit-tap-highlight-color: transparent;

  .pay-btn-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
    animation: shine 2.4s ease-in-out infinite;
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 4px 10px rgba(108, 92, 231, 0.4);
  }

  &.disabled,
  &:disabled {
    background: #C8D3E0;
    box-shadow: none;
    cursor: not-allowed;
    opacity: 0.85;
    .pay-btn-shine { display: none; }
    .pay-btn-arrow { display: none; }
  }
}

@keyframes shine {
  0% { left: -100%; }
  60%, 100% { left: 100%; }
}

.pay-btn-text {
  position: relative;
  z-index: 1;
}

.pay-btn-arrow {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  animation: arrow-pulse 1.6s ease-in-out infinite;
}

@keyframes arrow-pulse {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
}

// ============================================================
// 底部信任标识
// ============================================================
.trust-row {
  display: flex;
  justify-content: center;
  gap: $spacing-md;
  margin-top: $spacing-md;
}

.trust-item {
  display: inline-flex;
  align-items: center;
  gap: 0.08rem;
  font-size: 0.28rem;
  color: #999;
}

// ============================================================
// 协议弹窗
// ============================================================
.agreement-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: $z-index-popup;
  display: flex;
  align-items: flex-end;
  animation: fade-in 0.2s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.agreement-popup {
  width: 100%;
  background: #fff;
  border-radius: $radius-lg $radius-lg 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  height: 1.173rem;
  background: linear-gradient(135deg, #4A90E2 0%, #6C5CE7 100%);
  color: #fff;
  font-size: $font-size-sm;
  font-weight: 600;
  border: 0;
  border-radius: $radius-md;
  cursor: pointer;
}

// ============================================================
// Toast
// ============================================================
.toast-tip {
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
  animation: toast-in 0.2s ease-out;
}

@keyframes toast-in {
  from { opacity: 0; transform: translate(-50%, -40%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
}
</style>