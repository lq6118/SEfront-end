<template>
  <div class="user-audit">
    <div class="page-header">
      <h2>住户审核管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="batchApprove" :disabled="selectedUsers.length === 0">
          批量审核通过
        </el-button>
        <el-button @click="refreshList">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
    
    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="filterForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" value="PENDING_REVIEW" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item label="提交时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="userList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column label="房产信息" width="150">
          <template #default="{ row }">
            <div v-if="row.propertyInfo">
              {{ row.propertyInfo.building }}-{{ row.propertyInfo.unit }}-{{ row.propertyInfo.room }}
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="submittedAt" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.submittedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetails(row)">查看详情</el-button>
            <el-button 
              size="small" 
              type="success" 
              @click="approveUser(row)"
              v-if="row.status === 'PENDING_REVIEW'"
            >
              通过
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="rejectUser(row)"
              v-if="row.status === 'PENDING_REVIEW'"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 审核详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="用户审核详情"
      width="600px"
      :before-close="handleDialogClose"
    >
      <div v-if="currentUser">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ currentUser.realName }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ currentUser.role }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentUser.status)">
              {{ getStatusText(currentUser.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDateTime(currentUser.submittedAt) }}</el-descriptions-item>
          <el-descriptions-item label="房产信息">
            <div v-if="currentUser.propertyInfo">
              {{ currentUser.propertyInfo.building }}-{{ currentUser.propertyInfo.unit }}-{{ currentUser.propertyInfo.room }}
            </div>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="documents-section" v-if="currentUser.documents && currentUser.documents.length > 0">
          <h4>提交文件</h4>
          <div class="document-list">
            <div 
              v-for="doc in currentUser.documents" 
              :key="doc.blobId"
              class="document-item"
            >
              <el-icon><Document /></el-icon>
              <span>{{ doc.mimeType }}</span>
              <el-button size="small" @click="downloadDocument(doc)">下载</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 审核结果弹窗 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="审核确认"
      width="400px"
    >
      <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef" label-width="80px">
        <el-form-item label="审核结果" prop="action">
          <el-radio-group v-model="auditForm.action">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="reason" v-if="auditForm.action === 'reject'">
          <el-input
            v-model="auditForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit" :loading="auditLoading">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Refresh, Document } from '@element-plus/icons-vue';
import { userManagerApi, fileReviewApi } from '../../utils/api';
import type { UserAudit, BlobResponse } from '../../types/api';

// 响应式数据
const loading = ref(false);
const dialogVisible = ref(false);
const auditDialogVisible = ref(false);
const auditLoading = ref(false);
const selectedUsers = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const userList = ref<any[]>([]);
const currentUser = ref<any>(null);
const auditFormRef = ref<FormInstance>();

// 筛选表单
const filterForm = reactive({
  username: '',
  status: '',
  dateRange: [] as string[],
});

// 审核表单
const auditForm = reactive({
  action: 'approve',
  reason: '',
});

// 审核规则
const auditRules: FormRules = {
  reason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 10, message: '拒绝原因至少10个字符', trigger: 'blur' },
  ],
};

// 方法
const getStatusType = (status: string) => {
  switch (status) {
    case 'PENDING_REVIEW':
      return 'warning';
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    default:
      return 'info';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING_REVIEW':
      return '待审核';
    case 'APPROVED':
      return '已通过';
    case 'REJECTED':
      return '已拒绝';
    default:
      return status;
  }
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
};

const fetchUserList = async () => {
  loading.value = true;
  try {
    // 构建查询参数
    const params: any = {
      page: currentPage.value,
      size: pageSize.value,
    };
    
    // 添加筛选条件
    if (filterForm.username) {
      params.username = filterForm.username;
    }
    if (filterForm.status) {
      params.status = filterForm.status;
    }
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = filterForm.dateRange[0];
      params.endDate = filterForm.dateRange[1];
    }
    
    // 调用API获取用户列表
    const response = await userManagerApi.getUsers(params);
    userList.value = response.list;
    total.value = response.total;
    
    console.log('用户列表数据:', response);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection;
};

const viewDetails = async (user: any) => {
  try {
    // 调用API获取完整的用户详情
    const userDetails = await userManagerApi.getUserDetail(user.id);
    currentUser.value = userDetails;
    dialogVisible.value = true;
  } catch (error) {
    console.error('获取用户详情失败:', error);
    ElMessage.error('获取用户详情失败');
  }
};

const downloadDocument = async (doc: BlobResponse) => {
  try {
    // 调用下载API
    const blob = await fileReviewApi.downloadFile(doc.blobId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // 根据MIME类型设置文件名
    const extension = doc.mimeType.split('/')[1] || 'bin';
    a.download = `${doc.blobId}.${extension}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('文件下载成功');
  } catch (error) {
    console.error('下载文件失败:', error);
    ElMessage.error('下载文件失败');
  }
};

const approveUser = async (user: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要通过用户 ${user.username} 的审核吗？`,
      '确认审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 调用审核通过API
    await userManagerApi.updateUser(user.id, {
      status: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin', // 这里可以从store中获取当前用户
    });
    
    ElMessage.success('审核通过成功');
    fetchUserList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核通过失败:', error);
      ElMessage.error('审核通过失败');
    }
  }
};

const rejectUser = (user: any) => {
  currentUser.value = user;
  auditForm.action = 'reject';
  auditForm.reason = '';
  auditDialogVisible.value = true;
};

const batchApprove = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要审核的用户');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要批量通过 ${selectedUsers.value.length} 个用户的审核吗？`,
      '确认批量审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 调用批量审核API
    for (const user of selectedUsers.value) {
      await userManagerApi.updateUser(user.id, {
        status: 'APPROVED',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin', // 这里可以从store中获取当前用户
      });
    }
    
    ElMessage.success('批量审核通过成功');
    selectedUsers.value = [];
    fetchUserList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量审核失败:', error);
      ElMessage.error('批量审核失败');
    }
  }
};

const confirmAudit = async () => {
  if (!auditFormRef.value) return;
  
  try {
    await auditFormRef.value.validate();
    
    auditLoading.value = true;
    
    // 调用审核API
    if (auditForm.action === 'approve') {
      await userManagerApi.updateUser(currentUser.value.id, {
        status: 'APPROVED',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin', // 这里可以从store中获取当前用户
      });
    } else {
      await userManagerApi.updateUser(currentUser.value.id, {
        status: 'REJECTED',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin', // 这里可以从store中获取当前用户
        reviewNotes: auditForm.reason,
      });
    }
    
    ElMessage.success('审核成功');
    auditDialogVisible.value = false;
    dialogVisible.value = false;
    fetchUserList();
  } catch (error) {
    console.error('审核失败:', error);
    ElMessage.error('审核失败');
  } finally {
    auditLoading.value = false;
  }
};

const handleDialogClose = () => {
  dialogVisible.value = false;
  currentUser.value = null;
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchUserList();
};

const resetFilter = () => {
  filterForm.username = '';
  filterForm.status = '';
  filterForm.dateRange = [];
  handleSearch();
};

const refreshList = () => {
  fetchUserList();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchUserList();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchUserList();
};

onMounted(() => {
  fetchUserList();
});
</script>

<style scoped lang="scss">
.user-audit {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .filter-card {
    margin-bottom: 20px;
  }
  
  .table-card {
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
  
  .documents-section {
    margin-top: 20px;
    
    h4 {
      margin-bottom: 12px;
      color: #333;
    }
    
    .document-list {
      .document-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        margin-bottom: 8px;
        
        .el-icon {
          margin-right: 8px;
          color: #409eff;
        }
        
        span {
          flex: 1;
          margin-right: 12px;
        }
      }
    }
  }
}
</style>