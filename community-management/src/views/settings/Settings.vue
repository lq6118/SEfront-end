<template>
  <div class="settings-management">
    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="公告管理" name="announcements">
        <div class="announcements-section">
          <div class="section-header">
            <h3>社区公告</h3>
            <el-button type="primary" @click="showAnnouncementDialog">
              <el-icon><Plus /></el-icon>
              发布公告
            </el-button>
          </div>
          
          <el-card class="announcements-table" shadow="never">
            <el-table
              :data="announcements"
              v-loading="loading"
              style="width: 100%"
            >
              <el-table-column prop="title" label="标题" min-width="200" />
              <el-table-column label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getAnnouncementTypeColor(row.type)">
                    {{ getAnnouncementTypeText(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="优先级" width="100">
                <template #default="{ row }">
                  <el-tag :type="getPriorityColor(row.priority)">
                    {{ getPriorityText(row.priority) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="publishedAt" label="发布时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.publishedAt) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusColor(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="目标受众" width="100">
                <template #default="{ row }">
                  {{ getTargetAudienceText(row.targetAudience) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="editAnnouncement(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteAnnouncement(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="系统设置" name="settings">
        <div class="settings-section">
          <!-- 维护模式 -->
          <el-card class="maintenance-card" shadow="never">
            <template #header>
              <span>维护模式</span>
            </template>
            
            <el-form :model="maintenanceForm" label-width="120px">
              <el-form-item label="维护状态">
                <el-switch v-model="maintenanceForm.mode" />
              </el-form-item>
              <el-form-item label="维护信息" v-if="maintenanceForm.mode">
                <el-input
                  v-model="maintenanceForm.message"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入维护信息"
                />
              </el-form-item>
              <el-form-item label="预计维护时间" v-if="maintenanceForm.mode">
                <el-input
                  v-model="maintenanceForm.estimatedDuration"
                  placeholder="请输入预计维护时间"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveMaintenanceSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
          
          <!-- 功能开关 -->
          <el-card class="features-card" shadow="never" style="margin-top: 20px">
            <template #header>
              <span>功能开关</span>
            </template>
            
            <el-form :model="featuresForm" label-width="120px">
              <el-form-item label="闲置物品交易">
                <el-switch v-model="featuresForm.marketplace" />
              </el-form-item>
              <el-form-item label="紧急求助">
                <el-switch v-model="featuresForm.emergency" />
              </el-form-item>
              <el-form-item label="绿币系统">
                <el-switch v-model="featuresForm.coinSystem" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveFeaturesSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
          
          <!-- 通知设置 -->
          <el-card class="notifications-card" shadow="never" style="margin-top: 20px">
            <template #header>
              <span>通知设置</span>
            </template>
            
            <el-form :model="notificationsForm" label-width="120px">
              <el-form-item label="邮件通知">
                <el-switch v-model="notificationsForm.email" />
              </el-form-item>
              <el-form-item label="短信通知">
                <el-switch v-model="notificationsForm.sms" />
              </el-form-item>
              <el-form-item label="推送通知">
                <el-switch v-model="notificationsForm.push" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveNotificationsSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="用户管理" name="users">
        <div class="users-section">
          <div class="section-header">
            <h3>用户管理</h3>
            <el-button type="primary" @click="showUserDialog">
              <el-icon><Plus /></el-icon>
              添加用户
            </el-button>
          </div>
          
          <el-card class="users-table" shadow="never">
            <el-table
              :data="users"
              v-loading="loading"
              style="width: 100%"
            >
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="realName" label="真实姓名" width="120" />
              <el-table-column label="角色" width="100">
                <template #default="{ row }">
                  <el-tag :type="getRoleColor(row.role)">
                    {{ getRoleText(row.role) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getUserStatusColor(row.status)">
                    {{ getUserStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="editUser(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteUser(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 公告编辑弹窗 -->
    <el-dialog
      v-model="announcementDialogVisible"
      :title="editingAnnouncement ? '编辑公告' : '发布公告'"
      width="600px"
      @close="resetAnnouncementForm"
    >
      <el-form
        ref="announcementFormRef"
        :model="announcementForm"
        :rules="announcementRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="announcementForm.type" placeholder="请选择公告类型">
            <el-option label="通知" value="notice" />
            <el-option label="维护" value="maintenance" />
            <el-option label="活动" value="event" />
            <el-option label="紧急" value="emergency" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="announcementForm.priority" placeholder="请选择优先级">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标受众" prop="targetAudience">
          <el-select v-model="announcementForm.targetAudience" placeholder="请选择目标受众">
            <el-option label="全部" value="all" />
            <el-option label="住户" value="residents" />
            <el-option label="员工" value="staff" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="announcementForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="过期时间" prop="expiresAt">
          <el-date-picker
            v-model="announcementForm.expiresAt"
            type="datetime"
            placeholder="选择过期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="announcementDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAnnouncement" :loading="announcementLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 用户编辑弹窗 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="editingUser ? '编辑用户' : '添加用户'"
      width="500px"
      @close="resetUserForm"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="超级管理员" value="SUPERADMIN" />
            <el-option label="管理员" value="ADMIN" />
            <el-option label="用户" value="USER" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" placeholder="请选择状态">
            <el-option label="激活" value="ACTIVE" />
            <el-option label="禁用" value="DISABLED" />
            <el-option label="待审核" value="PENDING_REVIEW" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!editingUser">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser" :loading="userLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { announcementApi, systemApi, userManagerApi } from '../../utils/api';
import type { Announcement, SystemConfig, User } from '../../types/api';

// 响应式数据
const activeTab = ref('announcements');
const loading = ref(false);
const announcementLoading = ref(false);
const userLoading = ref(false);
const announcementDialogVisible = ref(false);
const userDialogVisible = ref(false);
const announcementFormRef = ref<FormInstance>();
const userFormRef = ref<FormInstance>();

// 数据
const announcements = ref<Announcement[]>([]);
const users = ref<User[]>([]);
const editingAnnouncement = ref<Announcement | null>(null);
const editingUser = ref<User | null>(null);

// 表单
const announcementForm = reactive({
  title: '',
  type: 'notice',
  content: '',
  priority: 'medium',
  targetAudience: 'all',
  expiresAt: '',
});

const userForm = reactive({
  username: '',
  realName: '',
  role: 'USER',
  status: 'ACTIVE',
  password: '',
});

// 系统设置表单
const maintenanceForm = reactive({
  mode: false,
  message: '',
  estimatedDuration: '',
});

const featuresForm = reactive({
  marketplace: true,
  emergency: true,
  coinSystem: true,
});

const notificationsForm = reactive({
  email: true,
  sms: false,
  push: true,
});

// 验证规则
const announcementRules: FormRules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择公告类型', trigger: 'change' },
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' },
  ],
  targetAudience: [
    { required: true, message: '请选择目标受众', trigger: 'change' },
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 10, max: 1000, message: '内容长度在 10 到 1000 个字符', trigger: 'blur' },
  ],
};

const userRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '真实姓名长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
};

// 方法
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
};

const getAnnouncementTypeText = (type: string) => {
  switch (type) {
    case 'notice':
      return '通知';
    case 'maintenance':
      return '维护';
    case 'event':
      return '活动';
    case 'emergency':
      return '紧急';
    default:
      return type;
  }
};

const getAnnouncementTypeColor = (type: string) => {
  switch (type) {
    case 'notice':
      return 'info';
    case 'maintenance':
      return 'warning';
    case 'event':
      return 'success';
    case 'emergency':
      return 'danger';
    default:
      return 'info';
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'low':
      return '低';
    case 'medium':
      return '中';
    case 'high':
      return '高';
    default:
      return priority;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'info';
    case 'medium':
      return 'warning';
    case 'high':
      return 'danger';
    default:
      return 'info';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'draft':
      return '草稿';
    case 'published':
      return '已发布';
    case 'archived':
      return '已归档';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'info';
    case 'published':
      return 'success';
    case 'archived':
      return 'warning';
    default:
      return 'info';
  }
};

const getTargetAudienceText = (audience: string) => {
  switch (audience) {
    case 'all':
      return '全部';
    case 'residents':
      return '住户';
    case 'staff':
      return '员工';
    default:
      return audience;
  }
};

const getRoleText = (role: string) => {
  switch (role) {
    case 'SUPERADMIN':
      return '超级管理员';
    case 'ADMIN':
      return '管理员';
    case 'USER':
      return '用户';
    default:
      return role;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'SUPERADMIN':
      return 'danger';
    case 'ADMIN':
      return 'warning';
    case 'USER':
      return 'success';
    default:
      return 'info';
  }
};

const getUserStatusText = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return '激活';
    case 'DISABLED':
      return '禁用';
    case 'PENDING_REVIEW':
      return '待审核';
    default:
      return status;
  }
};

const getUserStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'DISABLED':
      return 'danger';
    case 'PENDING_REVIEW':
      return 'warning';
    default:
      return 'info';
  }
};

// 数据获取
const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    // 调用API获取公告列表
    const response = await announcementApi.getAnnouncements();
    announcements.value = response;
    
    console.log('公告列表数据:', response);
  } catch (error) {
    console.error('获取公告列表失败:', error);
    ElMessage.error('获取公告列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    // 调用API获取用户列表
    const response = await userManagerApi.getUsers();
    users.value = response;
    
    console.log('用户列表数据:', response);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchSystemSettings = async () => {
  try {
    // 调用API获取系统设置
    const response = await systemApi.getSystemConfig();
    
    if (response.maintenance) {
      Object.assign(maintenanceForm, response.maintenance);
    }
    if (response.features) {
      Object.assign(featuresForm, response.features);
    }
    if (response.notifications) {
      Object.assign(notificationsForm, response.notifications);
    }
    
    console.log('系统设置数据:', response);
  } catch (error) {
    console.error('获取系统设置失败:', error);
    ElMessage.error('获取系统设置失败');
  }
};

// 公告管理
const showAnnouncementDialog = () => {
  editingAnnouncement.value = null;
  resetAnnouncementForm();
  announcementDialogVisible.value = true;
};

const editAnnouncement = (announcement: any) => {
  editingAnnouncement.value = announcement;
  Object.assign(announcementForm, announcement);
  announcementDialogVisible.value = true;
};

const deleteAnnouncement = async (announcement: Announcement) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除公告"${announcement.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 调用API删除公告
    await announcementApi.deleteAnnouncement(announcement.id);
    
    ElMessage.success('删除成功');
    fetchAnnouncements();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除公告失败:', error);
      ElMessage.error('删除公告失败');
    }
  }
};

const resetAnnouncementForm = () => {
  Object.assign(announcementForm, {
    title: '',
    type: 'notice',
    content: '',
    priority: 'medium',
    targetAudience: 'all',
    expiresAt: '',
  });
  announcementFormRef.value?.clearValidate();
};

const saveAnnouncement = async () => {
  if (!announcementFormRef.value) return;
  
  try {
    await announcementFormRef.value.validate();
    
    announcementLoading.value = true;
    
    if (editingAnnouncement.value) {
      // 调用API更新公告
      await announcementApi.updateAnnouncement(editingAnnouncement.value.id, announcementForm);
      ElMessage.success('更新成功');
    } else {
      // 调用API创建公告
      await announcementApi.createAnnouncement(announcementForm);
      ElMessage.success('创建成功');
    }
    
    announcementDialogVisible.value = false;
    fetchAnnouncements();
  } catch (error) {
    console.error('保存公告失败:', error);
    ElMessage.error('保存公告失败');
  } finally {
    announcementLoading.value = false;
  }
};

// 用户管理
const showUserDialog = () => {
  editingUser.value = null;
  resetUserForm();
  userDialogVisible.value = true;
};

const editUser = (user: any) => {
  editingUser.value = user;
  Object.assign(userForm, user);
  ;(userForm as any).password = undefined; // 编辑时不显示密码字段
  userDialogVisible.value = true;
};

const deleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${user.username}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 调用API删除用户
    await userManagerApi.deleteUser(user.id);
    
    ElMessage.success('删除成功');
    fetchUsers();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error);
      ElMessage.error('删除用户失败');
    }
  }
};

const resetUserForm = () => {
  Object.assign(userForm, {
    username: '',
    realName: '',
    role: 'USER',
    status: 'ACTIVE',
    password: '',
  });
  userFormRef.value?.clearValidate();
};

const saveUser = async () => {
  if (!userFormRef.value) return;
  
  try {
    await userFormRef.value.validate();
    
    userLoading.value = true;
    
    if (editingUser.value) {
      // 调用API更新用户
      await userManagerApi.updateUser(editingUser.value.id, userForm);
      ElMessage.success('更新成功');
    } else {
      // 调用API创建用户
      await userManagerApi.createUser(userForm);
      ElMessage.success('创建成功');
    }
    
    userDialogVisible.value = false;
    fetchUsers();
  } catch (error) {
    console.error('保存用户失败:', error);
    ElMessage.error('保存用户失败');
  } finally {
    userLoading.value = false;
  }
};

// 系统设置保存
const saveMaintenanceSettings = async () => {
  try {
    // 调用API保存维护设置
    await systemApi.updateSystemConfig({
      maintenance: maintenanceForm,
    });
    ElMessage.success('维护设置已保存');
  } catch (error) {
    console.error('保存维护设置失败:', error);
    ElMessage.error('保存维护设置失败');
  }
};

const saveFeaturesSettings = async () => {
  try {
    // 调用API保存功能设置
    await systemApi.updateSystemConfig({
      features: featuresForm,
    });
    ElMessage.success('功能设置已保存');
  } catch (error) {
    console.error('保存功能设置失败:', error);
    ElMessage.error('保存功能设置失败');
  }
};

const saveNotificationsSettings = async () => {
  try {
    // 调用API保存通知设置
    await systemApi.updateSystemConfig({
      notifications: notificationsForm,
    });
    ElMessage.success('通知设置已保存');
  } catch (error) {
    console.error('保存通知设置失败:', error);
    ElMessage.error('保存通知设置失败');
  }
};

onMounted(() => {
  fetchAnnouncements();
  fetchUsers();
  fetchSystemSettings();
});
</script>

<style scoped lang="scss">
.settings-management {
  .settings-tabs {
    :deep(.el-tabs__content) {
      padding-top: 20px;
    }
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
  }
  
  .announcements-table,
  .users-table {
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
  
  .maintenance-card,
  .features-card,
  .notifications-card {
    :deep(.el-card__body) {
      padding: 20px;
    }
  }
}
</style>