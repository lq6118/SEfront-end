<template>
  <div class="community-monitor">
    <el-row :gutter="20">
      <!-- 地图区域 -->
      <el-col :span="16">
        <el-card class="map-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>社区互助地图</span>
              <div class="header-actions">
                <el-button @click="refreshMapData">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
                <el-select v-model="mapFilter" placeholder="筛选类型" size="small">
                  <el-option label="全部" value="all" />
                  <el-option label="闲置物品" value="sharing" />
                  <el-option label="物品借用" value="borrowing" />
                  <el-option label="互助求助" value="helping" />
                  <el-option label="紧急求助" value="emergency" />
                </el-select>
              </div>
            </div>
          </template>
          
          <div class="map-container">
            <div class="map-placeholder">
              <el-icon size="48"><Location /></el-icon>
              <p>社区互助地图</p>
              <p class="map-desc">显示社区内的互助活动和紧急求助位置</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧面板 -->
      <el-col :span="8">
        <!-- 实时动态 -->
        <el-card class="activity-card" shadow="never">
          <template #header>
            <span>实时动态</span>
          </template>
          
          <div class="activity-list">
            <div 
              v-for="activity in activities" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-time">{{ activity.time }}</div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-desc">{{ activity.description }}</div>
              </div>
              <div class="activity-type" :class="activity.type">
                {{ activity.typeText }}
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 紧急求助 -->
        <el-card class="emergency-card" shadow="never" style="margin-top: 20px">
          <template #header>
            <span>紧急求助</span>
            <el-tag :type="emergencyStatus.type" size="small">
              {{ emergencyStatus.text }}
            </el-tag>
          </template>
          
          <div v-if="activeEmergencies.length === 0" class="no-emergencies">
            暂无紧急求助
          </div>
          
          <div v-else class="emergency-list">
            <div 
              v-for="emergency in activeEmergencies" 
              :key="emergency.id"
              class="emergency-item"
              :class="emergency.severity"
            >
              <div class="emergency-header">
                <span class="emergency-type">{{ getEmergencyTypeText(emergency.type) }}</span>
                <span class="emergency-severity">{{ getSeverityText(emergency.severity) }}</span>
              </div>
              <div class="emergency-location">
                {{ emergency.location.building }}-{{ emergency.location.unit }}-{{ emergency.location.room }}
              </div>
              <div class="emergency-time">{{ formatDateTime(emergency.createdAt) }}</div>
              <div class="emergency-actions">
                <el-button size="small" type="primary" @click="respondToEmergency(emergency)">
                  响应
                </el-button>
                <el-button size="small" @click="viewEmergencyDetails(emergency)">
                  详情
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 互助列表 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="interactions-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>互助列表</span>
              <div class="header-actions">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索互助内容"
                  style="width: 200px"
                  clearable
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-button @click="handleSearch">搜索</el-button>
              </div>
            </div>
          </template>
          
          <el-table
            :data="interactions"
            v-loading="loading"
            style="width: 100%"
          >
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getInteractionTypeType(row.type)">
                  {{ getInteractionTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="位置" width="150">
              <template #default="{ row }">
                {{ row.location.building }}-{{ row.location.unit }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getInteractionStatusType(row.status)">
                  {{ getInteractionStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="发布时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="参与人数" width="100">
              <template #default="{ row }">
                <el-tag type="info">{{ row.participants.length }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="viewInteractionDetails(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          
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
      </el-col>
    </el-row>
    
    <!-- 互助详情弹窗 -->
    <el-dialog
      v-model="interactionDialogVisible"
      title="互助详情"
      width="600px"
    >
      <div v-if="currentInteraction">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题">{{ currentInteraction.title }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getInteractionTypeType(currentInteraction.type)">
              {{ getInteractionTypeText(currentInteraction.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getInteractionStatusType(currentInteraction.status)">
              {{ getInteractionStatusText(currentInteraction.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="位置">
            {{ currentInteraction.location.building }}-{{ currentInteraction.location.unit }}-{{ currentInteraction.location.room }}
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ formatDateTime(currentInteraction.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDateTime(currentInteraction.updatedAt) }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="interaction-description">
          <h4>描述</h4>
          <p>{{ currentInteraction.description }}</p>
        </div>
        
        <div class="interaction-participants">
          <h4>参与人员</h4>
          <div class="participants-list">
            <div 
              v-for="participant in currentInteraction.participants" 
              :key="participant.userId"
              class="participant-item"
            >
              <el-avatar :size="32">
                {{ participant.userName.charAt(0) }}
              </el-avatar>
              <div class="participant-info">
                <div class="participant-name">{{ participant.userName }}</div>
                <div class="participant-role">{{ participant.role === 'provider' ? '提供者' : '接收者' }}</div>
              </div>
              <div class="participant-time">{{ formatDateTime(participant.joinedAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 紧急求助详情弹窗 -->
    <el-dialog
      v-model="emergencyDialogVisible"
      title="紧急求助详情"
      width="600px"
    >
      <div v-if="currentEmergency">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="类型">
            <el-tag :type="getEmergencyTypeColor(currentEmergency.type)">
              {{ getEmergencyTypeText(currentEmergency.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getEmergencySeverityColor(currentEmergency.severity)">
              {{ getSeverityText(currentEmergency.severity) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getEmergencyStatusColor(currentEmergency.status)">
              {{ getEmergencyStatusText(currentEmergency.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="位置">
            {{ currentEmergency.location.building }}-{{ currentEmergency.location.unit }}-{{ currentEmergency.location.room }}
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ formatDateTime(currentEmergency.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ currentEmergency.reporter.contact }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="emergency-description">
          <h4>求助描述</h4>
          <p>{{ currentEmergency.description }}</p>
        </div>
        
        <div class="emergency-responders">
          <h4>响应人员</h4>
          <div v-if="currentEmergency.responders.length > 0" class="responders-list">
            <div 
              v-for="responder in currentEmergency.responders" 
              :key="responder.userId"
              class="responder-item"
            >
              <el-avatar :size="32">
                {{ responder.userName.charAt(0) }}
              </el-avatar>
              <div class="responder-info">
                <div class="responder-name">{{ responder.userName }}</div>
                <div class="responder-time">到达时间: {{ formatDateTime(responder.arrivedAt) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="no-responders">
            暂无响应人员
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, Location, Search } from '@element-plus/icons-vue';
import { communityApi } from '../../utils/api';
import type { CommunityInteraction, Emergency } from '../../types/api';

// 响应式数据
const loading = ref(false);
const interactionDialogVisible = ref(false);
const emergencyDialogVisible = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchKeyword = ref('');
const mapFilter = ref('all');

// 数据
const activities = ref<any[]>([]);
const activeEmergencies = ref<Emergency[]>([]);
const interactions = ref<CommunityInteraction[]>([]);
const currentInteraction = ref<CommunityInteraction | null>(null);
const currentEmergency = ref<Emergency | null>(null);

// 状态
const emergencyStatus = reactive({
  type: 'danger',
  text: '3个紧急求助',
});

// 方法
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
};

const formatRelativeTime = (dateString: string) => {
  if (!dateString) return '-';
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return '刚刚';
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
  return `${Math.floor(diffInMinutes / 1440)}天前`;
};

const getInteractionTypeType = (type: string) => {
  switch (type) {
    case 'sharing':
      return 'success';
    case 'borrowing':
      return 'warning';
    case 'helping':
      return 'info';
    default:
      return 'info';
  }
};

const getInteractionTypeText = (type: string) => {
  switch (type) {
    case 'sharing':
      return '闲置物品';
    case 'borrowing':
      return '物品借用';
    case 'helping':
      return '互助求助';
    default:
      return type;
  }
};

const getInteractionStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'completed':
      return 'info';
    case 'cancelled':
      return 'danger';
    default:
      return 'info';
  }
};

const getInteractionStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '进行中';
    case 'completed':
      return '已完成';
    case 'cancelled':
      return '已取消';
    default:
      return status;
  }
};

const getEmergencyTypeText = (type: string) => {
  switch (type) {
    case 'medical':
      return '医疗';
    case 'fire':
      return '火灾';
    case 'theft':
      return '盗窃';
    case 'other':
      return '其他';
    default:
      return type;
  }
};

const getEmergencyTypeColor = (type: string) => {
  switch (type) {
    case 'medical':
      return 'danger';
    case 'fire':
      return 'danger';
    case 'theft':
      return 'warning';
    case 'other':
      return 'info';
    default:
      return 'info';
  }
};

const getSeverityText = (severity: string) => {
  switch (severity) {
    case 'low':
      return '低';
    case 'medium':
      return '中';
    case 'high':
      return '高';
    case 'critical':
      return '紧急';
    default:
      return severity;
  }
};

const getEmergencySeverityColor = (severity: string) => {
  switch (severity) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
      return 'danger';
    case 'critical':
      return 'danger';
    default:
      return 'info';
  }
};

const getEmergencyStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '待处理';
    case 'responding':
      return '处理中';
    case 'resolved':
      return '已解决';
    default:
      return status;
  }
};

const getEmergencyStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'responding':
      return 'primary';
    case 'resolved':
      return 'success';
    default:
      return 'info';
  }
};

// 数据获取
const fetchActivities = async () => {
  try {
    // 调用API获取活动数据
    const response = await communityApi.getActivities();
    activities.value = response.map(activity => ({
      ...activity,
      time: formatRelativeTime(activity.createdAt),
    }));
    
    console.log('活动数据:', response);
  } catch (error) {
    console.error('获取活动数据失败:', error);
    ElMessage.error('获取活动数据失败');
  }
};

const fetchEmergencies = async () => {
  try {
    // 调用API获取紧急求助数据
    const response = await communityApi.getEmergencies();
    activeEmergencies.value = response;
    
    // 更新紧急求助状态
    const pendingCount = activeEmergencies.value.filter(e => e.status === 'pending').length;
    if (pendingCount > 0) {
      emergencyStatus.type = 'danger';
      emergencyStatus.text = `${pendingCount}个紧急求助`;
    } else {
      emergencyStatus.type = 'success';
      emergencyStatus.text = '暂无紧急求助';
    }
    
    console.log('紧急求助数据:', response);
  } catch (error) {
    console.error('获取紧急求助数据失败:', error);
    ElMessage.error('获取紧急求助数据失败');
  }
};

const fetchInteractions = async () => {
  loading.value = true;
  try {
    // 调用API获取互助数据
    const response = await communityApi.getInteractions({
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKeyword.value,
    });
    interactions.value = response.list;
    total.value = response.total;
    
    console.log('互助数据:', response);
  } catch (error) {
    console.error('获取互助数据失败:', error);
    ElMessage.error('获取互助数据失败');
  } finally {
    loading.value = false;
  }
};

// 事件处理
const refreshMapData = () => {
  ElMessage.success('地图数据已刷新');
  // 这里可以重新获取地图数据
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchInteractions();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchInteractions();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchInteractions();
};

const viewInteractionDetails = (interaction: any) => {
  currentInteraction.value = interaction;
  interactionDialogVisible.value = true;
};

const viewEmergencyDetails = (emergency: any) => {
  currentEmergency.value = emergency;
  emergencyDialogVisible.value = true;
};

const respondToEmergency = async (emergency: Emergency) => {
  try {
    await ElMessageBox.confirm(
      `确定要响应紧急求助吗？`,
      '确认响应',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 调用API响应紧急求助
    await communityApi.respondToEmergency(emergency.id);
    
    ElMessage.success('已响应紧急求助');
    fetchEmergencies();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('响应紧急求助失败:', error);
      ElMessage.error('响应紧急求助失败');
    }
  }
};

onMounted(() => {
  fetchActivities();
  fetchEmergencies();
  fetchInteractions();
});
</script>

<style scoped lang="scss">
.community-monitor {
  .map-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
    
    .map-container {
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: 8px;
      
      .map-placeholder {
        text-align: center;
        color: #999;
        
        .el-icon {
          margin-bottom: 8px;
        }
        
        .map-desc {
          font-size: 14px;
          color: #666;
          margin-top: 8px;
        }
      }
    }
  }
  
  .activity-card,
  .emergency-card {
    .activity-list,
    .emergency-list {
      .activity-item,
      .emergency-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .activity-time,
        .emergency-time {
          width: 80px;
          font-size: 12px;
          color: #999;
        }
        
        .activity-content,
        .emergency-content {
          flex: 1;
          margin: 0 12px;
          
          .activity-title,
          .emergency-title {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
          }
          
          .activity-desc,
          .emergency-desc {
            font-size: 12px;
            color: #666;
          }
        }
        
        .activity-type,
        .emergency-type {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: white;
          
          &.user {
            background-color: #409eff;
          }
          
          &.emergency {
            background-color: #f56c6c;
          }
          
          &.transaction {
            background-color: #67c23a;
          }
          
          &.sharing {
            background-color: #409eff;
          }
          
          &.borrowing {
            background-color: #e6a23c;
          }
          
          &.helping {
            background-color: #67c23a;
          }
        }
        
        .emergency-item {
          &.critical {
            border-left: 4px solid #f56c6c;
          }
          
          &.high {
            border-left: 4px solid #e6a23c;
          }
          
          &.medium {
            border-left: 4px solid #409eff;
          }
          
          &.low {
            border-left: 4px solid #67c23a;
          }
          
          .emergency-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            
            .emergency-type,
            .emergency-severity {
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
              color: white;
            }
          }
          
          .emergency-location {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          
          .emergency-actions {
            display: flex;
            gap: 8px;
          }
        }
      }
    }
    
    .no-emergencies {
      text-align: center;
      padding: 40px 0;
      color: #999;
    }
  }
  
  .interactions-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
    
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
  
  .interaction-description,
  .emergency-description {
    margin-top: 20px;
    
    h4 {
      margin-bottom: 8px;
      color: #333;
    }
    
    p {
      color: #666;
      line-height: 1.6;
    }
  }
  
  .interaction-participants,
  .emergency-responders {
    margin-top: 20px;
    
    h4 {
      margin-bottom: 12px;
      color: #333;
    }
    
    .participants-list,
    .responders-list {
      .participant-item,
      .responder-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .el-avatar {
          margin-right: 12px;
        }
        
        .participant-info,
        .responder-info {
          flex: 1;
          
          .participant-name,
          .responder-name {
            font-size: 14px;
            font-weight: bold;
            color: #333;
          }
          
          .participant-role,
          .responder-time {
            font-size: 12px;
            color: #666;
          }
        }
        
        .participant-time {
          font-size: 12px;
          color: #999;
        }
      }
    }
    
    .no-responders {
      text-align: center;
      padding: 20px 0;
      color: #999;
    }
  }
}
</style>