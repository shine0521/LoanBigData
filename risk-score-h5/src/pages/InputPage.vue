<!-- ============================================
  InputPage.vue - 查询输入页（高端金融风）
  深蓝 + 金色点缀；几何装饰；标题字效
  ============================================ -->
<template>
  <div class="page">
    <!-- Hero 区域（深蓝 + 金色装饰） -->
    <div class="hero">
      <!-- 背景几何装饰 SVG -->
      <svg class="hero-decor hero-decor--tl" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="60" fill="none" stroke="rgba(212,175,55,0.18)" stroke-width="1"/>
        <circle cx="20" cy="20" r="40" fill="none" stroke="rgba(212,175,55,0.12)" stroke-width="1"/>
        <circle cx="20" cy="20" r="20" fill="none" stroke="rgba(212,175,55,0.10)" stroke-width="1"/>
      </svg>
      <svg class="hero-decor hero-decor--br" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M 180 0 L 200 0 L 200 20" fill="none" stroke="rgba(212,175,55,0.3)" stroke-width="1"/>
        <path d="M 160 0 L 200 0 L 200 40" fill="none" stroke="rgba(212,175,55,0.2)" stroke-width="1"/>
        <path d="M 140 0 L 200 0 L 200 60" fill="none" stroke="rgba(212,175,55,0.1)" stroke-width="1"/>
      </svg>

      <!-- 顶部徽章（金色描边） -->
      <div class="hero-badge">
        <van-icon name="shield-o" />
        <span>银行级安全加密 · 权威认证</span>
      </div>

      <!-- 主标题 + 装饰 + 副标题 -->
      <div class="hero-title-wrap">
        <h1 class="hero-title">百行评分大数据</h1>
        <div class="hero-divider">
          <span class="divider-line"></span>
          <span class="divider-diamond">◆</span>
          <span class="divider-line"></span>
        </div>
        <h2 class="hero-subtitle">专业查询</h2>
        <div class="hero-tagline">BANK · CREDIT · SCORE</div>
      </div>
    </div>

    <!-- 表单卡（白底 + 顶部金边） -->
    <div class="form-card">
      <!-- 顶部友情提示（van-notice-bar） -->
      <van-notice-bar
        left-icon="info-o"
        color="#1565C0"
        background="#E3F2FD"
        :scrollable="false"
        class="tip-blue"
      >
        为保证数据准确，请输入真实信息
      </van-notice-bar>

      <!-- 表单 -->
      <van-cell-group inset class="field-group">
        <van-field
          v-model="form.name"
          left-icon="contact"
          placeholder="请输入本人姓名"
          clearable
          maxlength="20"
          autocomplete="off"
          :error-message="errors.name"
          @blur="onBlur('name')"
        />
        <van-field
          v-model="form.idCard"
          left-icon="idcard"
          placeholder="请输入本人身份证号"
          clearable
          maxlength="18"
          autocomplete="off"
          :error-message="errors.idCard"
          @blur="onBlur('idCard')"
        />
        <van-field
          v-model="form.phone"
          type="tel"
          left-icon="phone-o"
          placeholder="请输入本人手机号"
          clearable
          maxlength="11"
          autocomplete="off"
          :error-message="errors.phone"
          @blur="onBlur('phone')"
        />
        <van-field
          v-model="form.staffId"
          type="digit"
          left-icon="manager-o"
          placeholder="请输入员工号"
          clearable
          maxlength="6"
          autocomplete="off"
          :error-message="errors.staffId"
          @blur="onBlur('staffId')"
        />
      </van-cell-group>

      <!-- 警告块（橙字 + 灰色 ! 图标） -->
      <div class="warning-block">
        <div class="warning-row">
          <van-icon name="warning-o" />
          <span>本人对查询输入的三要素的真实性负责，如有虚假，愿意承担由此产生的一切后果！</span>
        </div>
        <div class="warning-row">
          <van-icon name="warning-o" />
          <span>请务必输入查询人实名手机号，查询的非公开结果以手机号为准。</span>
        </div>
        <div class="warning-row warning-row--indent">
          <span>1.本报告不涉及金融场景的应用。</span>
        </div>
      </div>

      <!-- 友情提示（橙底 van-notice-bar） -->
      <van-notice-bar
        left-icon="warning-o"
        color="#C2580E"
        background="#FFF4E6"
        :scrollable="false"
        class="tip-orange"
      >
        <div class="tip-orange-content">
          <p class="tip-orange-title">友情提示：</p>
          <p>我司不是提供央行征信和个人爬虫等隐私数据查询，也不提供贷款及信用修复业务。</p>
          <p class="tip-orange-emph">所有要求你进行汇款、转账、非法刷单、买理财、承诺包下款的操作，都是诈骗！</p>
        </div>
      </van-notice-bar>

      <!-- 协议勾选 -->
      <div class="agreement-box">
        <input
          type="checkbox"
          class="agreement-checkbox"
          :checked="privacyAgreed"
          @change="toggleAgreement"
        />
        <span class="agreement-text">
          我已阅读并同意
          <a class="agreement-link" @click.stop.prevent="onViewAgreement">《用户协议》</a>
          <a class="agreement-link" @click.stop.prevent="onViewAgreement">《隐私政策》</a>
          <a class="agreement-link" @click.stop.prevent="onViewAgreement">《授权书》</a>
          ，点击勾选即代表您同意上述法律文书的相关条款并签署上述法律文书。
        </span>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-wrap">
        <van-button
          round
          type="primary"
          class="submit-btn"
          :loading="submitting"
          loading-text="提交中..."
          @click="onSubmit"
        >
          立即查询
        </van-button>
      </div>

      <!-- 底部信任标识 -->
      <div class="footer-trust">
        <van-icon name="passed" />
        <span>专业 · 安全 · 银行级数据加密</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useRiskStore } from '@/stores/risk'
import { getNameError, getIdCardError, getPhoneError, getStaffIdError } from '@/utils/validators'

const router = useRouter()
const store = useRiskStore()

// 表单
const form = reactive({
  name: '',
  idCard: '',
  phone: '',
  staffId: '',
})

// 校验错误
const errors = reactive({
  name: '',
  idCard: '',
  phone: '',
  staffId: '',
})

// 协议勾选
const privacyAgreed = computed(() => store.privacyAgreed)
function toggleAgreement(e: Event) {
  const target = e.target as HTMLInputElement
  store.setPrivacyAgreed(target.checked)
}

// 提交状态
const submitting = ref(false)

// 失焦校验
function onBlur(field: 'name' | 'idCard' | 'phone' | 'staffId') {
  if (field === 'name') {
    errors.name = getNameError(form.name)
  } else if (field === 'idCard') {
    errors.idCard = getIdCardError(form.idCard)
  } else if (field === 'phone') {
    errors.phone = getPhoneError(form.phone)
  } else if (field === 'staffId') {
    errors.staffId = getStaffIdError(form.staffId)
  }
}

// 提交
async function onSubmit() {
  if (!privacyAgreed.value) {
    showToast('请先勾选并同意协议')
    return
  }

  // 全量校验
  const nameErr = getNameError(form.name)
  const idErr = getIdCardError(form.idCard)
  const phoneErr = getPhoneError(form.phone)
  const staffIdErr = getStaffIdError(form.staffId)

  errors.name = nameErr
  errors.idCard = idErr
  errors.phone = phoneErr
  errors.staffId = staffIdErr

  if (nameErr || idErr || phoneErr || staffIdErr) {
    // 员工号错误时弹框（用户明确要求弹框）
    if (form.staffId.trim() && form.staffId !== '896896') {
      showDialog({
        title: '员工号输入错误',
        message: '请输入正确的员工号',
        confirmButtonText: '我知道了',
      })
      return
    }
    showToast(nameErr || idErr || phoneErr || staffIdErr)
    return
  }

  submitting.value = true
  store.setSubmitting(true)
  store.saveFormData({ ...form })

  // 模拟提交延迟（前端跳转，不调 API）
  setTimeout(() => {
    submitting.value = false
    store.setSubmitting(false)
    router.push({ name: 'result' })
  }, 200)
}

function onViewAgreement() {
  showToast('协议查看功能开发中')
}
</script>

<style lang="scss" scoped>
// ============================================
// 页面整体（浅灰背景）
// ============================================
.page {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: #F4F7FB;
  padding-bottom: 0.8rem;
  padding-top: env(safe-area-inset-top, 0);
}

// ============================================
// Hero 区域（深蓝 + 金色装饰，高端金融风）
// ============================================
.hero {
  position: relative;
  padding: 1.12rem 0.8rem 1.6rem;
  background: linear-gradient(180deg, #0D2E5C 0%, #1565C0 100%);
  color: #FFFFFF;
  overflow: hidden;
  border-bottom: 0.04rem solid #D4AF37;
}

// 几何装饰
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

// 顶部金色徽章
.hero-badge {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.16rem;
  padding: 0.16rem 0.4rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 0.04rem;
  font-size: 0.28rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #D4AF37;

  :deep(.van-icon) {
    color: #D4AF37;
    font-size: 0.32rem;
  }
}

// 标题区
.hero-title-wrap {
  position: relative;
  z-index: 2;
  margin-top: 0.64rem;
  text-align: center;
}

.hero-title {
  margin: 0;
  font-size: 1.16rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1.2;
  white-space: nowrap;
  // 标题字效：白色微渐变（不算 UI 渐变，只是文字字效）
  background: linear-gradient(180deg, #FFFFFF 0%, #E8F0FE 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

// 金色装饰分割线
.hero-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.24rem;
  margin: 0.4rem 0;
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

.hero-subtitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.4em;
  color: #D4AF37;
}

.hero-tagline {
  margin-top: 0.32rem;
  font-size: 0.22rem;
  font-weight: 600;
  letter-spacing: 0.32em;
  color: rgba(255, 255, 255, 0.6);
}

// ============================================
// 表单卡（白底 + 顶部金边）
// ============================================
.form-card {
  position: relative;
  margin: -0.48rem 0.4rem 0;
  padding: 0.4rem 0 0.8rem;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-top: 0.08rem solid #D4AF37;
  border-radius: 0.16rem;
  box-shadow: 0 8px 32px rgba(21, 101, 192, 0.1);
  z-index: 2;
}

// 友情提示（蓝底）
:deep(.tip-blue.van-notice-bar) {
  margin: 0 0.32rem 0.32rem;
  padding: 0.24rem 0.32rem;
  border-radius: 0.08rem;
  border: 1px solid #BBDEFB;
  background: #E3F2FD !important;
  font-size: 0.32rem;
}

// 表单输入组
:deep(.field-group.van-cell-group--inset) {
  margin: 0 0.32rem;
  border-radius: 0.08rem;
  overflow: hidden;
  border: 1px solid #E5E7EB;
}

:deep(.field-group .van-field) {
  padding: 0.36rem 0.32rem;
  background: #FFFFFF;

  & + .van-field {
    border-top: 1px solid #F0F2F5;
  }

  :deep(.van-field__left-icon) {
    color: #1565C0;
    font-size: 0.56rem;
    margin-right: 0.24rem;
  }

  :deep(.van-field__control) {
    font-size: 0.4rem;
    color: #1F2937;
    font-weight: 500;
  }

  :deep(input::placeholder) {
    color: #9CA3AF;
    font-weight: 400;
  }
}

// 警告块（橙字 + 灰色 ! 图标）
.warning-block {
  margin: 0.32rem 0.4rem 0;
  font-size: 0.3rem;
  color: #4B5563;
  line-height: 1.8;
}

.warning-row {
  display: flex;
  align-items: flex-start;
  gap: 0.16rem;

  :deep(.van-icon) {
    color: #9CA3AF;
    font-size: 0.32rem;
    margin-top: 0.04rem;
    flex-shrink: 0;
  }
}

.warning-row--indent {
  padding-left: 0.48rem;
  font-size: 0.28rem;
  color: #6B7280;
}

// 友情提示（橙底）
:deep(.tip-orange.van-notice-bar) {
  margin: 0.32rem 0.32rem 0.16rem;
  padding: 0.32rem;
  border-radius: 0.08rem;
  border: 1px solid #FFD9A6;
  background: #FFF4E6 !important;
}

.tip-orange-content {
  color: #C2580E;
  font-size: 0.3rem;
  line-height: 1.7;

  p {
    margin: 0;
  }
}

.tip-orange-title {
  font-weight: 700;
  margin: 0 0 0.08rem !important;
  color: #A0450A;
}

.tip-orange-emph {
  font-weight: 600;
  margin: 0.16rem 0 0 !important;
  color: #C2580E;
}

// 协议勾选
.agreement-box {
  display: flex;
  align-items: flex-start;
  gap: 0.24rem;
  margin: 0.32rem 0.4rem 0;
}

.agreement-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 0.4rem;
  height: 0.4rem;
  border: 1.5px solid #9CA3AF;
  border-radius: 0.04rem;
  background: #FFFFFF;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 0.08rem;
  position: relative;
  transition: all 0.2s;

  &:checked {
    background: #1565C0;
    border-color: #1565C0;
  }

  &:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #FFFFFF;
    font-size: 0.3rem;
    font-weight: 800;
    line-height: 1;
  }
}

.agreement-text {
  font-size: 0.3rem;
  color: #4B5563;
  line-height: 1.7;
}

.agreement-link {
  color: #1565C0;
  text-decoration: none;
  font-weight: 600;
}

// 提交按钮包装（居中 + 缩短）
.submit-wrap {
  text-align: center;
  margin: 0.56rem 0 0.32rem;
}

// 提交按钮（纯银行蓝 + 金色描边，居中缩短）
.submit-btn {
  display: inline-block !important;
  min-width: 4.8rem;
  width: auto !important;
  height: 1.2rem !important;
  padding: 0 0.8rem !important;
  font-size: 0.4rem !important;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-align: center;
  background: #1565C0 !important;
  border: 0.04rem solid #D4AF37 !important;
  box-shadow: 0 4px 16px rgba(21, 101, 192, 0.3);
}

// 底部信任标识
.footer-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.16rem;
  margin-top: 0.48rem;
  color: #6B7280;
  font-size: 0.28rem;
  letter-spacing: 0.08em;
  background: transparent;

  :deep(.van-icon) {
    color: #D4AF37;
    font-size: 0.32rem;
  }
}
</style>