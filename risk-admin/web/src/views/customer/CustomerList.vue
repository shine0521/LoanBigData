<template>
  <div class="page-container">
    <!-- 工具栏 -->
    <TableToolbar>
      <template #left>
        <span class="page-title">用户信息管理</span>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon> 新增用户
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon> 批量导入
        </el-button>
      </template>
      <template #right>
        <el-input v-model="searchForm.keyword" placeholder="姓名/手机号" clearable style="width: 160px" @keyup.enter="handleSearch" />
        <el-select v-model="searchForm.riskLevel" placeholder="风险等级" clearable style="width: 120px">
          <el-option label="全部" :value="undefined" />
          <el-option label="低风险" :value="1" />
          <el-option label="中风险" :value="2" />
          <el-option label="高风险" :value="3" />
        </el-select>
      </template>
    </TableToolbar>

    <!-- 表格 -->
    <div class="card-container">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="customerNo" label="客户编号" width="140" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="idCard" label="身份证" width="180">
          <template #default="{ row }">
            <MaskText :text="row.idCard" type="idCard" />
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140">
          <template #default="{ row }">
            <MaskText :text="row.phone" type="phone" />
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="风险等级" width="100" align="center">
          <template #default="{ row }">
            <RiskTag :level="row.riskLevel" />
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="80">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.source }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="fetchData"
          @size-change="fetchData"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" maxlength="64" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" maxlength="18" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthday">
          <el-date-picker v-model="formData.birthday" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="选填" maxlength="255" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 导入弹窗（占位） -->
    <el-dialog v-model="importDialogVisible" title="批量导入" width="480px">
      <div class="import-tip">
        <el-alert type="info" :closable="false">
          请下载导入模板，按格式填写后上传。支持 .xlsx 文件。
        </el-alert>
        <el-button type="primary" style="margin-top: 16px" @click="downloadTemplate">下载模板</el-button>
      </div>
      <el-upload
        ref="uploadRef"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
        style="margin-top: 16px"
      >
        <el-icon><UploadFilled /></el-icon>
        <span>将文件拖到此处，或<em>点击上传</em></span>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { Plus, Upload, UploadFilled } from '@element-plus/icons-vue'
import { customerApi } from '@/api'
import TableToolbar from '@/components/TableToolbar.vue'
import MaskText from '@/components/MaskText.vue'
import RiskTag from '@/components/RiskTag.vue'
import { formatDate } from '@/utils/format'
import type { Customer } from '@/types'

// 表格数据
const tableData = ref<Customer[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

// 搜索
const searchForm = reactive({ keyword: '', riskLevel: undefined as number | undefined })

// 新增/编辑弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const currentEditId = ref<number | null>(null)
const formData = reactive({
  name: '',
  idCard: '',
  phone: '',
  gender: 0,
  birthday: '',
  remark: '',
})
const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}

// 导入
const importDialogVisible = ref(false)
const importLoading = ref(false)
const uploadRef = ref()
const uploadFile = ref<UploadFile | null>(null)

async function fetchData() {
  loading.value = true
  try {
    const res = await customerApi.getCustomers({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      riskLevel: searchForm.riskLevel,
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function openAddDialog() {
  isEdit.value = false
  currentEditId.value = null
  Object.assign(formData, { name: '', idCard: '', phone: '', gender: 0, birthday: '', remark: '' })
  dialogVisible.value = true
}

function openEditDialog(row: Customer) {
  isEdit.value = true
  currentEditId.value = row.id
  Object.assign(formData, {
    name: row.name,
    idCard: row.idCard,
    phone: row.phone,
    gender: row.gender,
    birthday: row.birthday || '',
    remark: row.remark || '',
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }

  submitLoading.value = true
  try {
    if (isEdit.value && currentEditId.value) {
      await customerApi.updateCustomer(currentEditId.value, { ...formData })
      ElMessage.success('修改成功')
    } else {
      await customerApi.createCustomer({ ...formData })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row: Customer) {
  try {
    await ElMessageBox.confirm(`确定删除用户「${row.name}」吗？`, '提示', { type: 'warning' })
    await customerApi.deleteCustomer(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* 用户取消 */ }
}

function handleImport() {
  uploadFile.value = null
  importDialogVisible.value = true
}

function downloadTemplate() {
  ElMessage.info('模板下载功能（占位）')
}

function handleFileChange(file: UploadFile) {
  uploadFile.value = file
}

async function handleImportSubmit() {
  if (!uploadFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  importLoading.value = true
  try {
    // 占位：实际用 FormData 上传
    ElMessage.info('批量导入功能（占位）')
    importDialogVisible.value = false
  } finally {
    importLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.page-container {
  .page-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-right: 16px;
  }
}

.card-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.import-tip {
  text-align: center;
}
</style>
