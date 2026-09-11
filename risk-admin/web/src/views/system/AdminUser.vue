<template>
  <div class="page-container">
    <div class="page-header">
      <span class="title">管理员账号</span>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon> 新增管理员
      </el-button>
    </div>

    <div class="card-container">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="账号" width="140" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.role === 'super_admin'" size="small" type="danger">超级管理员</el-tag>
            <el-tag v-else-if="row.role === 'operator'" size="small" type="warning">运营</el-tag>
            <el-tag v-else size="small" type="info">只读</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" size="small" type="success">启用</el-tag>
            <el-tag v-else size="small" type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" min-width="170">
          <template #default="{ row }">
            {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 新增/编辑弹窗（占位表单） -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑管理员' : '新增管理员'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="formData" label-width="80px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="formData.username" placeholder="登录账号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" style="width: 100%">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="运营" value="operator" />
            <el-option label="只读" value="viewer" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { systemApi } from '@/api'
import { formatDate } from '@/utils/format'
import type { AdminUser } from '@/types'

const tableData = ref<AdminUser[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentEditId = ref<number | null>(null)
const formData = reactive({ username: '', realName: '', phone: '', email: '', role: 'operator' })

async function fetchData() {
  loading.value = true
  try {
    const res = await systemApi.getAdminUsers({ page: pagination.page, pageSize: pagination.pageSize })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  isEdit.value = false
  currentEditId.value = null
  Object.assign(formData, { username: '', realName: '', phone: '', email: '', role: 'operator' })
  dialogVisible.value = true
}

function openEditDialog(row: AdminUser) {
  isEdit.value = true
  currentEditId.value = row.id
  Object.assign(formData, {
    username: row.username,
    realName: row.realName || '',
    phone: row.phone || '',
    email: row.email || '',
    role: row.role,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  ElMessage.info('管理员账号管理功能（占位）')
  dialogVisible.value = false
}

async function handleDelete(row: AdminUser) {
  try {
    await ElMessageBox.confirm(`确定删除管理员「${row.username}」吗？`, '提示', { type: 'warning' })
    await systemApi.deleteAdminUser(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* 用户取消 */ }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.page-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
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
</style>
