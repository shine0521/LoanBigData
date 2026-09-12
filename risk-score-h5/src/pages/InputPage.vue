<!-- ============================================
  InputPage.vue - 输入页（Vant 4 全组件）
  - van-nav-bar / van-notice-bar / van-cell-group / van-field
  - van-checkbox / van-button / van-loading
  严格按 375px 设计稿，rem 基准 37.5px
  ============================================ -->
<template>
  <div class="page">
    <!-- 顶部渐变 Hero + 标题（蓝紫渐变仍保留，Vant 主题色装饰） -->
    <div class="hero">
      <div class="hero-badge">
        <van-icon name="shield-o" size="16" color="#fff" />
        <span>银行级安全加密 · 权威认证</span>
      </div>
      <h1 class="hero-title">银行评分大数据</h1>
      <h2 class="hero-subtitle">专业查询</h2>
    </div>

    <!-- 表单卡（白底圆角浮起） -->
    <div class="form-card">
      <!-- 友情提示 -->
      <van-notice-bar
        left-icon="volume-o"
        :scrollable="false"
        color="#1989fa"
        background="#ecf5ff"
        text="为保证数据准确，请输入真实信息"
        class="tip-bar"
      />

      <!-- 三要素输入 -->
      <van-cell-group inset class="field-group">
        <van-field
          v-model="form.name"
          left-icon="contact"
          placeholder="请输入本人姓名"
          clearable
          maxlength="20"
          :error-message="errors.name"
          @blur="validateField('name')"
        />
        <van-field
          v-model="form.idCard"
          left-icon="idcard"
          placeholder="请输入本人身份证号"
          clearable
          maxlength="18"
          :error-message="errors.idCard"
          @blur="validateField('idCard')"
        />
        <van-field
          v-model="form.phone"
          left-icon="phone-o"
          placeholder="请输入本人手机号"
          type="tel"
          clearable
          maxlength="11"
          :error-message="errors.phone"
          @blur="validateField('phone')"
        />
      </van-cell-group>

      <!-- 警告提示 -->
      <div class="warning-block">
        <div class="warning-row">
          <van-icon name="warning-o" color="#ff976a" />
          <span>本人对查询输入的三要素的真实性负责，如有虚假，愿意承担由此产生的一切后果！</span>
        </div>
        <div class="warning-row">
          <van-icon name="warning-o" color="#ff976a" />
          <span>请务必输入查询人实名手机号，查询的非公开结果以手机号为准。</span>
        </div>
        <div class="warning-note">1.本报告不涉及金融场景的应用。</div>
      </div>

      <!-- 友情提示（橙底） -->
      <van-notice-bar
        left-icon="info-o"
        :scrollable="false"
        wrapable
        color="#C2580E"
        background="#FFF4E6"
        class="tip-orange"
      >
        <template #default>
          <div class="tip-orange-content">
            <p class="tip-orange-title">友情提示：</p>
            <p>我司不是提供央行征信和个人爬虫等隐私数据查询，也不提供贷款及信用修复业务。</p>
            <p class="tip-orange-emph">所有要求你进行汇款、转账、非法刷单、买理财、承诺包下款的操作，都是诈骗！</p>
          </div>
        </template>
      </van-notice-bar>

      <!-- 协议勾选 -->
      <van-checkbox
        v-model="agreed"
        shape="square"
        class="agreement-box"
      >
        <span class="agreement-text">
          我已阅读并同意
          <a href="javascript:;" class="agreement-link" @click.stop="openLink('user')">《用户协议》</a>
          <a href="javascript:;" class="agreement-link" @click.stop="openLink('privacy')">《隐私政策》</a>
          <a href="javascript:;" class="agreement-link" @click.stop="openLink('auth')">《授权书》</a>
          ，点击勾选即代表您同意上述法律文书的相关条款并签署上述法律文书。
        </span>
      </van-checkbox>

      <!-- 提交按钮 -->
      <van-button
        block
        round
        type="primary"
        native-type="button"
        :loading="submitting"
        loading-text="查询中..."
        :disabled="!canSubmit"
        class="submit-btn"
        @click="onSubmit"
      >
        立即查询
      </van-button>
    </div>

    <!-- 底部安全标识 -->
    <div class="footer-trust">
      <van-icon name="passed" color="#07c160" />
      <span>专业 · 安全 · 银行级数据加密</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useRiskStore } from '@/stores/risk'
import type { SubmitParams } from '@/api/risk'

const router = useRouter()
const store = useRiskStore()

// 表单数据
const form = reactive<SubmitParams>({
  name: '',
  idCard: '',
  phone: '',
})

// 协议勾选
const agreed = ref(false)

// 提交状态
const submitting = ref(false)

// 错误信息
const errors = reactive({
  name: '',
  idCard: '',
  phone: '',
})

// 校验：可以扩展到 utils/validators
function validateField(field: 'name' | 'idCard' | 'phone') {
  errors[field] = ''
  if (field === 'name') {
    if (!form.name.trim()) errors.name = '请输入姓名'
    else if (form.name.trim().length < 2) errors.name = '姓名至少 2 个字'
  } else if (field === 'idCard') {
    if (!form.idCard) errors.idCard = '请输入身份证号'
    else if (!/^\d{17}[\dXx]$/.test(form.idCard)) errors.idCard = '身份证号格式不正确'
  } else if (field === 'phone') {
    if (!form.phone) errors.phone = '请输入手机号'
    else if (!/^1[3-9]\d{9}$/.test(form.phone)) errors.phone = '手机号格式不正确'
  }
}

function validateAll(): boolean {
  validateField('name')
  validateField('idCard')
  validateField('phone')
  return !errors.name && !errors.idCard && !errors.phone
}

// 按钮可点击
const canSubmit = computed(() => {
  return (
    !!form.name.trim() &&
    !!form.idCard &&
    !!form.phone &&
    agreed.value &&
    !submitting.value
  )
})

// 协议链接
function openLink(type: 'user' | 'privacy' | 'auth') {
  const label = type === 'user' ? '《用户协议》' : type === 'privacy' ? '《隐私政策》' : '《授权书》'
  showToast(`查看${label}（演示）`)
}

// 提交
function onSubmit() {
  if (!validateAll()) {
    showToast('请检查输入')
    return
  }
  if (!agreed.value) {
    showToast('请先勾选并同意协议')
    return
  }
  submitting.value = true
  // 保存表单 → 跳转结果页
  store.saveFormData({ name: form.name, idCard: form.idCard, phone: form.phone })
  setTimeout(() => {
    submitting.value = false
    router.push({ name: 'result' })
  }, 300)
}
</script>

<style lang="scss" scoped>
// ============================================
// 页面整体
// ============================================
.page {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, #4A90E2 0%, #6C5CE7 50%, #A55EEA 100%);
  padding-bottom: 0.8rem;
  padding-top: env(safe-area-inset-top, 0);
}

// ============================================
// Hero 区域（蓝紫渐变 + 标题）
// ============================================
.hero {
  padding: 0.96rem 0.8rem 1.2rem;
  text-align: center;
  color: #fff;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.16rem;
  padding: 0.16rem 0.48rem;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 1rem;
  font-size: 0.32rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.hero-title {
  margin: 0.64rem 0 0.16rem;
  font-size: clamp(1.2rem, 8.5vw, 1.6rem);
  font-weight: 900;
  letter-spacing: 0.06em;
  line-height: 1.15;
  text-shadow: 0 3px 16px rgba(0, 0, 0, 0.28);
}

.hero-subtitle {
  margin: 0;
  font-size: clamp(0.9rem, 6vw, 1.1rem);
  font-weight: 800;
  letter-spacing: 0.32em;
  opacity: 0.95;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.22);
}

// ============================================
// 表单卡（白底圆角）
// ============================================
.form-card {
  margin: 0 0.64rem;
  padding: 0.4rem 0 0.48rem;
  background: #fff;
  border-radius: 0.4rem;
  box-shadow:
    0 16px 40px rgba(74, 100, 180, 0.18),
    0 4px 8px rgba(74, 100, 180, 0.08);
}

// 友情提示（蓝色）
:deep(.tip-bar) {
  border-radius: 0.16rem;
  margin: 0 0 0.32rem;
  font-size: 0.34rem;
}

// 输入框组
:deep(.field-group.van-cell-group--inset) {
  margin: 0;
}

:deep(.field-group .van-field) {
  padding: 0.36rem 0.32rem;
  font-size: 0.42rem;
}

:deep(.field-group .van-field__left-icon) {
  margin-right: 0.24rem;
  font-size: 0.56rem;
  color: #4A90E2;
}

:deep(.field-group .van-field__control) {
  font-size: 0.42rem;
}

:deep(.field-group .van-field__error-message) {
  font-size: 0.28rem;
}

// 警告块
.warning-block {
  margin: 0.32rem 0.32rem 0;
  padding: 0.32rem;
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.warning-row {
  display: flex;
  align-items: flex-start;
  gap: 0.16rem;
  font-size: 0.32rem;
  color: #1a1a1a;
  line-height: 1.6;
}

.warning-note {
  font-size: 0.32rem;
  color: #1a1a1a;
  margin-left: 0.4rem;
  line-height: 1.6;
}

// 友情提示（橙底）
:deep(.tip-orange.van-notice-bar) {
  margin: 0.32rem 0.32rem;
  padding: 0.32rem;
  border-radius: 0.16rem;
  border: 1px solid #FFD9A6;
  background: linear-gradient(135deg, #FFF4E6 0%, #FFE6CC 100%) !important;
}

.tip-orange-content {
  color: #C2580E;
  font-size: 0.32rem;
  line-height: 1.7;
}

.tip-orange-title {
  font-weight: 700;
  margin: 0 0 0.08rem !important;
}

.tip-orange-emph {
  font-weight: 600;
  margin: 0.16rem 0 0 !important;
}

// 协议勾选
.agreement-box {
  margin: 0.32rem 0.4rem 0;
  align-items: flex-start;

  :deep(.van-checkbox__icon) {
    margin-top: 0.04rem;
  }
}

.agreement-text {
  font-size: 0.32rem;
  color: #1a1a1a;
  line-height: 1.7;
}

.agreement-link {
  color: #4A90E2;
  text-decoration: none;
  font-weight: 600;
}

// 提交按钮
.submit-btn {
  margin: 0.48rem 0.4rem 0.32rem;
  height: 1.6rem;
  font-size: 0.48rem;
  font-weight: 800;
  letter-spacing: 0.32em;
  background: linear-gradient(135deg, #4A90E2 0%, #6C5CE7 50%, #A55EEA 100%);
  border: 0;
}

// 底部信任标识
.footer-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.16rem;
  margin-top: 0.64rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.28rem;
  letter-spacing: 0.04em;
}
</style>