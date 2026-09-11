<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h2>风险评分管理平台</h2>
        <p>管理员登录</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入账号"
            prefix-icon="User"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-row">
            <el-input
              v-model="form.captcha"
              placeholder="请输入图形验证码"
              prefix-icon="Key"
              style="flex: 1"
              @keyup.enter="handleLogin"
            />
            <!-- 验证码图片占位：实际从后端获取 -->
            <div class="captcha-img" @click="refreshCaptcha">
              <span class="captcha-placeholder">{{ captchaText }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-tip">
        默认账号：<strong>admin</strong> &nbsp;|&nbsp; 密码：<strong>123456</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { loginApi } from '@/api'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const captchaText = ref('AB12')

const form = reactive({
  username: 'admin',
  password: '123456',
  captcha: '',
  captchaKey: 'captcha-key-placeholder',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

// 刷新验证码（占位）
function refreshCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  captchaText.value = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function handleLogin() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    const res = await loginApi.login({
      username: form.username,
      password: form.password,
      captcha: form.captcha,
      captchaKey: form.captchaKey,
    })

    userStore.setToken(res.data.token)
    userStore.setUserInfo(res.data.user)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch {
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px 40px 30px;
  width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

  .login-header {
    text-align: center;
    margin-bottom: 32px;

    h2 {
      font-size: 24px;
      color: #303133;
      margin-bottom: 8px;
    }

    p {
      color: #909399;
      font-size: 14px;
    }
  }

  .captcha-row {
    display: flex;
    gap: 12px;
    align-items: center;

    .captcha-img {
      width: 120px;
      height: 40px;
      background: #f0f2f5;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;

      .captcha-placeholder {
        font-family: 'Courier New', monospace;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 6px;
        color: #409eff;
        user-select: none;
      }
    }
  }

  .login-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }

  .login-tip {
    margin-top: 16px;
    text-align: center;
    font-size: 12px;
    color: #909399;
  }
}
</style>
