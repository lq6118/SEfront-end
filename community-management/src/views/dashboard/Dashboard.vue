<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="stat in statistics" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-trend" v-if="stat.trend">
                <span :class="stat.trend > 0 ? 'trend-up' : 'trend-down'">
                  <el-icon><ArrowUp v-if="stat.trend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(stat.trend) }}%
                </span>
                较昨日
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>互助趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">
              <el-icon size="48"><DataLine /></el-icon>
              <p>互助数据图表</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>紧急求助状态</span>
              <el-tag :type="emergencyStatus.type" size="small">
                {{ emergencyStatus.text }}
              </el-tag>
            </div>
          </template>
          <div class="chart-container">
            <div class="emergency-stats">
              <div class="emergency-item critical">
                <div class="number">{{ emergencyStats.critical }}</div>
                <div class="label">紧急</div>
              </div>
              <div class="emergency-item high">
                <div class="number">{{ emergencyStats.high }}</div>
                <div class="label">高</div>
              </div>
              <div class="emergency-item medium">
                <div class="number">{{ emergencyStats.medium }}</div>
                <div class="label">中</div>
              </div>
              <div class="emergency-item low">
                <div class="number">{{ emergencyStats.low }}</div>
                <div class="label">低</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快速操作 -->
    <el-row :gutter="20" class="actions-row">
      <el-col :span="24">
        <el-card class="actions-card" shadow="hover">
          <template #header>
            <span>快速操作</span>
          </template>
          <div class="quick-actions">
            <div 
              v-for="action in quickActions" 
              :key="action.name"
              class="action-item"
              @click="handleAction(action)"
            >
              <div class="action-icon" :style="{ backgroundColor: action.color }">
                <el-icon :size="24"><component :is="action.icon" /></el-icon>
              </div>
              <div class="action-title">{{ action.title }}</div>
              <div class="action-desc">{{ action.description }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最近活动 -->
    <el-row :gutter="20" class="activities-row">
      <el-col :span="12">
        <el-card class="activities-card" shadow="hover">
          <template #header>
            <span>最近活动</span>
          </template>
          <div class="activity-list">
            <div 
              v-for="activity in recentActivities" 
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
      </el-col>
      
      <el-col :span="12">
        <el-card class="activities-card" shadow="hover">
          <template #header>
            <span>待处理事项</span>
          </template>
          <div class="todo-list">
            <div 
              v-for="todo in pendingTodos" 
              :key="todo.id"
              class="todo-item"
            >
              <div class="todo-priority" :class="todo.priority">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="todo-content">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-desc">{{ todo.description }}</div>
                <div class="todo-time">{{ todo.time }}</div>
              </div>
              <el-button 
                size="small" 
                type="primary"
                @click="handleTodo(todo)"
              >
                处理
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  DataLine,
  ArrowUp,
  ArrowDown,
  Bell
} from '@element-plus/icons-vue';

const router = useRouter();

// 响应式数据
const timeRange = ref('week');
const emergencyStatus = reactive({
  type: 'danger',
  text: '3个紧急求助',
});

const emergencyStats = reactive({
  critical: 2,
  high: 1,
  medium: 0,
  low: 0,
});

// 统计数据
const statistics = reactive([
  {
    title: '总住户数',
    value: '1,234',
    icon: 'User',
    color: '#409eff',
    trend: 5.2,
  },
  {
    title: '待审核用户',
    value: '23',
    icon: 'DocumentChecked',
    color: '#e6a23c',
    trend: -12.5,
  },
  {
    title: '绿币余额',
    value: '¥45,678',
    icon: 'Money',
    color: '#67c23a',
    trend: 8.3,
  },
  {
    title: '互助次数',
    value: '892',
    icon: 'ChatDotRound',
    color: '#f56c6c',
    trend: 15.7,
  },
]);

// 快速操作
const quickActions = reactive([
  {
    name: 'user-audit',
    title: '住户审核',
    description: '审核新用户提交的实名认证',
    icon: 'DocumentChecked',
    color: '#409eff',
    path: '/users',
  },
  {
    name: 'coin-management',
    title: '绿币管理',
    description: '配置绿币抵扣规则和账单管理',
    icon: 'Coin',
    color: '#67c23a',
    path: '/coins',
  },
  {
    name: 'community-monitor',
    title: '社区互助',
    description: '监视互助交易和紧急求助状态',
    icon: 'Location',
    color: '#f56c6c',
    path: '/community',
  },
  {
    name: 'system-settings',
    title: '系统设置',
    description: '配置系统参数和发布公告',
    icon: 'Setting',
    color: '#909399',
    path: '/settings',
  },
]);

// 最近活动
const recentActivities = reactive([
  {
    id: 1,
    time: '2分钟前',
    title: '新用户注册',
    description: '张三提交了实名认证申请',
    type: 'user',
    typeText: '用户',
  },
  {
    id: 2,
    time: '15分钟前',
    title: '紧急求助',
    description: '李四发起了医疗紧急求助',
    type: 'emergency',
    typeText: '求助',
  },
  {
    id: 3,
    time: '1小时前',
    title: '互助交易',
    description: '王五完成了闲置物品交易',
    type: 'transaction',
    typeText: '交易',
  },
  {
    id: 4,
    time: '2小时前',
    title: '系统公告',
    description: '发布了停水停电通知',
    type: 'announcement',
    typeText: '公告',
  },
]);

// 待处理事项
const pendingTodos = reactive([
  {
    id: 1,
    title: '审核用户申请',
    description: '有3个用户待审核',
    priority: 'high',
    time: '30分钟前',
  },
  {
    id: 2,
    title: '紧急求助响应',
    description: '1个紧急求助需要处理',
    priority: 'critical',
    time: '1小时前',
  },
  {
    id: 3,
    title: '绿币规则配置',
    description: '需要更新绿币抵扣规则',
    priority: 'medium',
    time: '2小时前',
  },
]);

// 方法
const handleAction = (action: any) => {
  router.push(action.path);
};

const handleTodo = (todo: any) => {
  ElMessage.info(`处理事项: ${todo.title}`);
  // 根据事项类型跳转到相应页面
  if (todo.title.includes('审核')) {
    router.push('/users');
  } else if (todo.title.includes('求助')) {
    router.push('/community');
  } else if (todo.title.includes('绿币')) {
    router.push('/coins');
  }
};

// 页面加载时初始化数据
const initDashboard = async () => {
  try {
    // 这里可以调用API获取实际数据
    console.log('初始化仪表板数据');
  } catch (error) {
    console.error('初始化失败:', error);
    ElMessage.error('数据加载失败');
  }
};

onMounted(() => {
  initDashboard();
});
</script>

<style scoped lang="scss">
.dashboard {
  .stats-row {
    margin-bottom: 20px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          color: white;
        }
        
        .stat-info {
          flex: 1;
          
          .stat-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
          }
          
          .stat-trend {
            font-size: 12px;
            color: #999;
            
            .trend-up {
              color: #67c23a;
            }
            
            .trend-down {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }
  
  .charts-row {
    margin-bottom: 20px;
    
    .chart-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .chart-container {
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .chart-placeholder {
          text-align: center;
          color: #999;
          
          .el-icon {
            margin-bottom: 8px;
          }
        }
        
        .emergency-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          height: 100%;
          
          .emergency-item {
            text-align: center;
            border-radius: 8px;
            padding: 16px;
            color: white;
            
            &.critical {
              background-color: #f56c6c;
            }
            
            &.high {
              background-color: #e6a23c;
            }
            
            &.medium {
              background-color: #409eff;
            }
            
            &.low {
              background-color: #67c23a;
            }
            
            .number {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            
            .label {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
  
  .actions-row {
    margin-bottom: 20px;
    
    .actions-card {
      .quick-actions {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        
        .action-item {
          text-align: center;
          padding: 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e8e8e8;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .action-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
            color: white;
          }
          
          .action-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
          }
          
          .action-desc {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
          }
        }
      }
    }
  }
  
  .activities-row {
    .activities-card {
      .activity-list {
        .activity-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          
          &:last-child {
            border-bottom: none;
          }
          
          .activity-time {
            width: 80px;
            font-size: 12px;
            color: #999;
          }
          
          .activity-content {
            flex: 1;
            margin: 0 12px;
            
            .activity-title {
              font-size: 14px;
              font-weight: bold;
              color: #333;
              margin-bottom: 4px;
            }
            
            .activity-desc {
              font-size: 12px;
              color: #666;
            }
          }
          
          .activity-type {
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
            
            &.announcement {
              background-color: #909399;
            }
          }
        }
      }
      
      .todo-list {
        .todo-item {
          display: flex;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
          
          &:last-child {
            border-bottom: none;
          }
          
          .todo-priority {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            color: white;
            
            &.critical {
              background-color: #f56c6c;
            }
            
            &.high {
              background-color: #e6a23c;
            }
            
            &.medium {
              background-color: #409eff;
            }
            
            &.low {
              background-color: #67c23a;
            }
          }
          
          .todo-content {
            flex: 1;
            
            .todo-title {
              font-size: 14px;
              font-weight: bold;
              color: #333;
              margin-bottom: 4px;
            }
            
            .todo-desc {
              font-size: 12px;
              color: #666;
              margin-bottom: 4px;
            }
            
            .todo-time {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .emergency-stats {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  .quick-actions {
    grid-template-columns: 1fr !important;
  }
}
</style>