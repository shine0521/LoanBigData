<!--
  FormField.vue - 通用表单字段组件
  props:
    label: 字段标签
    placeholder: 占位文字
    modelValue: 绑定值（v-model）
    error: 错误提示文字（空字符串表示无错误）
    type: input 类型（默认 text）
    maxlength: 最大输入长度
    clearable: 是否显示清除按钮（默认 true）
-->
<template>
  <div class="form-field" :class="{ 'has-error': error }">
    <label v-if="label" class="field-label">{{ label }}</label>
    <div class="field-wrapper">
      <input
        class="field-input"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :inputmode="inputmode"
        autocomplete="off"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <!-- 清除按钮 -->
      <span
        v-if="clearable && modelValue"
        class="clear-btn"
        @click="handleClear"
        role="button"
        aria-label="清除"
      >✕</span>
    </div>
    <!-- 错误提示 -->
    <p v-if="error" class="field-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  placeholder?: string
  modelValue?: string
  error?: string
  type?: string
  maxlength?: number | string
  clearable?: boolean
  inputmode?: 'text' | 'numeric' | 'tel' | 'email' | 'search'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  clearable: true,
  error: '',
  modelValue: '',
  inputmode: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [e: FocusEvent]
  'focus': [e: FocusEvent]
}>()

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  let value = target.value
  // 身份证号自动转大写
  if (props.type === 'idcard') {
    value = value.toUpperCase()
    emit('update:modelValue', value)
    // 同步修正 DOM 值（避免光标跳位）
    target.value = value
  } else {
    emit('update:modelValue', value)
  }
}

function handleClear() {
  emit('update:modelValue', '')
}

function handleBlur(e: FocusEvent) {
  emit('blur', e)
}

function handleFocus(e: FocusEvent) {
  emit('focus', e)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.form-field {
  width: 100%;
}

.field-label {
  display: block;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $color-text-primary;
  margin-bottom: $spacing-xs;
}

.field-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input {
  width: 100%;
  height: 1.173rem; // 44px
  padding: 0 $spacing-xl 0 $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-primary;
  background-color: $color-bg-white;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  outline: none;
  transition: border-color $duration-fast;

  &::placeholder {
    color: $color-text-placeholder;
  }

  &:focus {
    border-color: $color-primary;
  }

  &:disabled {
    background-color: $color-bg;
    color: $color-text-disabled;
    cursor: not-allowed;
  }
}

// 有错误时
.has-error .field-input {
  border-color: $color-danger;
  &:focus {
    border-color: $color-danger;
  }
}

.clear-btn {
  position: absolute;
  right: $spacing-sm;
  width: 0.533rem;
  height: 0.533rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  z-index: 1;
  &:hover {
    color: $color-text-secondary;
  }
}

.field-error {
  margin-top: $spacing-xs;
  font-size: $font-size-xs;
  color: $color-danger;
  line-height: 1.2;
}
</style>
