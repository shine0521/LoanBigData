<!--
  InputPage.vue - 重设计 v3
  ─────────────────────────────────────
  设计目标（UI 设计师视角）：
  1. 填满整个 viewport，无空白蓝渐变
  2. 蓝色渐变 hero + 浮起白卡 + 底部功能区 + footer
  3. 大字标题 + 居中布局 + 强视觉层级
  4. 移动端 60px 输入/按钮（黄金 tap target）
  5. 勾选框用原生 label 包裹，零 bug
  6. 真实可信的产品感（功能卡片+备案+版权）
  ─────────────────────────────────────
-->
<template>
  <div class="page">

    <!-- ============ Hero ============ -->
    <header class="hero">
      <DecorationBg />

      <!-- 安全徽章 -->
      <div class="hero-badge">
        <span class="badge-dot"><AppIcon name="shield" color="#fff" size="0.42rem" /></span>
        <span class="badge-text">银行级安全加密 · 权威认证</span>
      </div>

      <!-- 主标题区 -->
      <div class="hero-titles">
        <h1 class="title-main">银行评分大数据</h1>
        <h1 class="title-accent">专业查询</h1>
        <div class="title-underline"><i /></div>
        <p class="title-sub">全面 · 精准 · 银行级安全</p>
      </div>

      <!-- 数据条 -->
      <div class="stats">
        <div class="stat">
          <div class="stat-num">5<span>+</span></div>
          <div class="stat-label">合作银行</div>
        </div>
        <div class="stat-sep" />
        <div class="stat">
          <div class="stat-num">10<span>s</span></div>
          <div class="stat-label">极速出分</div>
        </div>
        <div class="stat-sep" />
        <div class="stat">
          <div class="stat-num">99.9<span>%</span></div>
          <div class="stat-label">数据准确</div>
        </div>
      </div>
    </header>

    <!-- ============ 表单卡 ============ -->
    <section class="card">
      <!-- 提示条 -->
      <div class="tip-bar">
        <span class="tip-icon"><AppIcon name="bell" color="#4A90E2" size="0.48rem" /></span>
        <span class="tip-text">为保证数据准确，请输入真实信息</span>
      </div>

      <!-- 输入项 -->
      <div class="fields">
        <div class="field" :class="{ active: focusField === 'name' }">
          <span class="field-icon"><AppIcon name="user" color="#4A90E2" size="0.56rem" /></span>
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
          <span class="field-icon"><AppIcon name="idcard" color="#4A90E2" size="0.56rem" /></span>
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
          <span class="field-icon"><AppIcon name="phone" color="#4A90E2" size="0.56rem" /></span>
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

      <!-- 友情提示 -->
      <div class="warning">
        <div class="warning-title">
          <span class="warning-icon"><AppIcon name="info" color="#C2580E" size="0.5rem" /></span>
          <span>友情提示</span>
        </div>
        <p>我司不是提供央行征信和个人爬虫等隐私数据查询，也不提供贷款及信用修复业务。</p>
        <p class="warning-emph">所有要求你进行汇款、转账、非法刷单、买理财、承诺包下款的操作，都是诈骗！</p>
      </div>

      <!-- 协议（原生 checkbox appearance:none 直接做样式，零事件冲突） -->
      <label class="agreement">
        <input
          v-model="agreed"
          type="checkbox"
          class="agreement-native"
        />
        <span class="agreement-text">
          我已阅读并同意
          <a class="agreement-link" @click.prevent.stop="openAgreement('user')">《用户协议》</a>
          <a class="agreement-link" @click.prevent.stop="openAgreement('privacy')">《隐私政策》</a>
          <a class="agreement-link" @click.prevent.stop="openAgreement('auth')">《授权书》</a>
          ，点击勾选即代表您同意上述法律文书相关条款。
        </span>
      </label>

      <!-- 提交按钮 -->
      <button
        class="submit"
        :class="{ disabled: !canSubmit }"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        <span class="submit-shine" />
        <span class="submit-text">立 即 查 询</span>
        <span class="submit-arrow"><AppIcon name="arrowRight" color="#fff" size="0.5rem" /></span>
      </button>

      <!-- 卡内信任条 -->
      <div class="trust">
        <span class="trust-item">
          <AppIcon name="lock" color="#9AAAC2" size="0.36rem" />
          <span>信息加密</span>
        </span>
        <span class="trust-sep">·</span>
        <span class="trust-item">
          <AppIcon name="shield" color="#9AAAC2" size="0.36rem" />
          <span>隐私保护</span>
        </span>
        <span class="trust-sep">·</span>
        <span class="trust-item">
          <AppIcon name="database" color="#9AAAC2" size="0.36rem" />
          <span>银行数据</span>
        </span>
      </div>
    </section>

    <!-- ============ 核心优势 3 列 ============ -->
    <section class="features">
      <div class="feature">
        <div class="feature-icon icon-blue">
          <AppIcon name="bolt" color="#fff" size="0.6rem" />
        </div>
        <div class="feature-title">10秒极速</div>
        <div class="feature-desc">智能引擎秒级响应<br />无需漫长等待</div>
      </div>
      <div class="feature">
        <div class="feature-icon icon-purple">
          <AppIcon name="shield" color="#fff" size="0.6rem" />
        </div>
        <div class="feature-title">银行级安全</div>
        <div class="feature-desc">金融级数据加密<br />全程隐私保护</div>
      </div>
      <div class="feature">
        <div class="feature-icon icon-cyan">
          <AppIcon name="database" color="#fff" size="0.6rem" />
        </div>
        <div class="feature-title">5+银行数据</div>
        <div class="feature-desc">覆盖主流商业银行<br />数据真实可靠</div>
      </div>
    </section>

    <!-- ============ Footer ============ -->
    <footer class="footer">
      <div class="footer-links">
        <a class="footer-link" @click="showToast('客服电话：400-888-8888')">在线客服</a>
        <span class="footer-sep">|</span>
        <a class="footer-link" @click="openAgreement('user')">用户协议</a>
        <span class="footer-sep">|</span>
        <a class="footer-link" @click="openAgreement('privacy')">隐私政策</a>
      </div>
      <p class="footer-copy">© 2026 银行评分大数据 · 京ICP备XXXXXXXX号</p>
    </footer>

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
import DecorationBg from '@/components/DecorationBg.vue'

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
const popupTitleMap: Record<string, string> = { user: '用户协议', privacy: '隐私政策', auth: '授权书' }
const popupContentMap: Record<string, string> = {
  user: '本协议是您与本平台之间关于使用本服务所订立的协议。请仔细阅读。',
  privacy: '我们重视您的隐私，会严格保护您提交的个人信息安全。',
  auth: '您授权本平台查询与您相关的风险评估数据用于评分。',
}
const popupTitle = computed(() => (popupType.value ? popupTitleMap[popupType.value] : ''))
const popupContent = computed(() => (popupType.value ? popupContentMap[popupType.value] : ''))
function openAgreement(type: 'user' | 'privacy' | 'auth') { popupType.value = type }

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
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

// =============================================================
// 根容器：填满 viewport + 蓝色渐变背景
// =============================================================
.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(180deg, #4A90E2 0%, #6C7CE7 18%, #A8B6F0 38%, #E8EEFB 58%, #F4F7FC 80%, #F8FAFD 100%);
  overflow-x: hidden;
  padding-bottom: env(safe-area-inset-bottom);
}

// =============================================================
// Hero 区（约 30% viewport）
// =============================================================
.hero {
  position: relative;
  width: 100%;
  max-width: 10rem;
  padding: 1.4rem $spacing-md 1.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  color: #fff;
  z-index: 1;
}

// 徽章
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.16rem;
  padding: 0.16rem 0.48rem 0.16rem 0.2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: $radius-full;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.badge-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.5rem;
  height: 0.5rem;
  background: linear-gradient(135deg, #4A90E2 0%, #6C5CE7 100%);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.4);
}

.badge-text {
  font-size: $font-size-xs;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

// 主标题
.hero-titles {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 0.16rem;
}

.title-main {
  font-size: 1.067rem;   // 40px
  font-weight: 900;
  line-height: 1.15;
  margin: 0;
  letter-spacing: 0.04em;
  background: linear-gradient(180deg, #fff 0%, #F0F4FF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 12px rgba(74, 144, 226, 0.4));
}

.title-accent {
  font-size: 1.2rem;     // 45px
  font-weight: 900;
  line-height: 1.15;
  margin: 0;
  letter-spacing: 0.08em;
  background: linear-gradient(180deg, #fff 0%, #F0F4FF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 12px rgba(74, 144, 226, 0.4));
}

.title-underline {
  position: relative;
  width: 1.6rem;
  height: 0.08rem;
  margin: 0.16rem 0;
  background: linear-gradient(90deg, transparent 0%, #fff 50%, transparent 100%);
  border-radius: 2px;

  i {
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

.title-sub {
  font-size: $font-size-xs;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  letter-spacing: 0.16em;
  font-weight: 500;
}

// 数据条
.stats {
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

.stat {
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

.stat-sep {
  width: 1px;
  height: 0.56rem;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 $spacing-xs;
}

// =============================================================
// 表单卡（白底，向上浮）
// =============================================================
.card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 10rem;
  margin: -0.4rem $spacing-md 0;
  padding: $spacing-md;
  background: #fff;
  border-radius: 0.48rem;
  box-shadow:
    0 12px 32px rgba(74, 100, 180, 0.18),
    0 4px 8px rgba(74, 100, 180, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
}

// 提示条
.tip-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.16rem;
  padding: $spacing-xs 0 $spacing-md;
}

.tip-icon {
  display: inline-flex;
}

.tip-text {
  font-size: $font-size-sm;
  color: #4A90E2;
  font-weight: 600;
}

// 输入项（60px 大 tap target）
.fields {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.field {
  display: flex;
  align-items: center;
  gap: 0.24rem;
  height: 1.6rem;       // 60px
  padding: 0 $spacing-md;
  background: #F4F7FC;
  border: 1.5px solid transparent;
  border-radius: 0.64rem;
  transition: all $duration-fast;

  &.active,
  &:focus-within {
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
  font-weight: 500;
  color: $color-text-primary;
  letter-spacing: 0.02em;
  min-width: 0;

  &::placeholder {
    color: #B8C2D0;
    font-size: 0.48rem;
    font-weight: 400;
  }
}

// 友情提示
.warning {
  margin-top: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: linear-gradient(135deg, #FFF7EC 0%, #FFEBD9 100%);
  border: 1px solid #FFD9B3;
  border-radius: $radius-md;
  color: #C2580E;
  font-size: $font-size-xs;
  line-height: 1.65;
}

.warning-title {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  margin-bottom: 0.12rem;
  font-weight: 700;
}

.warning-icon {
  display: inline-flex;
}

.warning-emph {
  margin-top: 0.12rem;
  font-weight: 600;
  color: #A64800;
}

// 协议（label 包裹，原生 checkbox appearance:none + 自定义样式，零事件冲突）
.agreement {
  display: flex;
  align-items: flex-start;
  gap: 0.24rem;
  margin-top: $spacing-md;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

// 原生 checkbox 直接做视觉：appearance: none 后它就是一个 div，
// 点击事件天然穿透，label 包裹点击文字/勾都能触发 toggle
.agreement-native {
  flex-shrink: 0;
  appearance: none;
  -webkit-appearance: none;
  width: 0.56rem;     // 21px 勾选框
  height: 0.56rem;
  margin: 0.06rem 0 0 0;
  border: 1.5px solid #C8C8C8;
  border-radius: 0.08rem;
  background: #fff;
  cursor: pointer;
  position: relative;
  transition: all $duration-fast;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:checked {
    background: $color-primary;
    border-color: $color-primary;

    // CSS 画勾（教程 1.4 dpr-safe：用 border + rotate 不用图片）
    &::after {
      content: '';
      position: absolute;
      left: 0.18rem;
      top: 0.08rem;
      width: 0.12rem;
      height: 0.24rem;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
}

.agreement-text {
  flex: 1;
  font-size: $font-size-xs;
  color: $color-text-secondary;
  line-height: 1.6;
  word-break: break-word;
  min-width: 0; // 教程 flex 子项溢出处理
}

.agreement-link {
  color: $color-primary;
  text-decoration: none;
  margin: 0 0.04rem;
  font-weight: 600;
}

// 提交按钮
.submit {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.24rem;
  width: 100%;
  margin-top: $spacing-lg;
  height: 1.733rem;     // 65px（更大更突出）
  border: 0;
  border-radius: 0.853rem;
  background: linear-gradient(135deg, #4A90E2 0%, #6C5CE7 50%, #A55EEA 100%);
  color: #fff;
  font-size: 0.56rem;   // 21px
  font-weight: 700;
  letter-spacing: 0.16em;
  box-shadow:
    0 10px 24px rgba(108, 92, 231, 0.4),
    0 2px 6px rgba(74, 144, 226, 0.3);
  cursor: pointer;
  overflow: hidden;
  transition: all $duration-fast;
  -webkit-tap-highlight-color: transparent;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
    animation: submit-shine 2.4s ease-in-out infinite;
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
  }

  &.disabled,
  &:disabled {
    background: linear-gradient(135deg, #C8D3E0 0%, #B6C2D3 100%);
    box-shadow: none;
    cursor: not-allowed;
    opacity: 0.85;
    &::after { display: none; }
    .submit-arrow { display: none; }
  }
}

.submit-shine {
  // 占位元素，参考 .submit::after
}

@keyframes submit-shine {
  0% { left: -100%; }
  60%, 100% { left: 100%; }
}

.submit-text {
  position: relative;
  z-index: 1;
}

.submit-arrow {
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

// 卡内信任条
.trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  margin-top: $spacing-md;
  padding-top: $spacing-sm;
  border-top: 1px solid $color-border-light;
}

.trust-item {
  display: inline-flex;
  align-items: center;
  gap: 0.08rem;
  font-size: 0.28rem;  // 10.5px
  color: #6B7B95;
}

.trust-sep {
  color: #C8D0DD;
  font-size: 0.28rem;
}

// =============================================================
// 核心优势 3 列
// =============================================================
.features {
  display: flex;
  gap: $spacing-sm;
  width: 100%;
  max-width: 10rem;
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
  font-size: 0.28rem;   // 10.5px
  color: $color-text-secondary;
  line-height: 1.5;
}

// =============================================================
// Footer
// =============================================================
.footer {
  width: 100%;
  max-width: 10rem;
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
// 协议弹窗
// =============================================================
.popup-mask {
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

.popup {
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

.popup-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  border-bottom: 1px solid $color-border;
  h3 { font-size: $font-size-md; font-weight: 600; }
}

.popup-close {
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

.popup-foot {
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
