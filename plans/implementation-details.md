# 邻里绿链系统 Web 前端实现细节

## 界面实现计划

### 1. 管理后台登录门户 (Admin Login Portal)

**功能描述**：
- 物业管理人员的统一登录入口
- 严格的账号身份验证

**界面组件**：
```vue
<template>
  <div class="login-container">
    <div class="login-form">
      <h1>物业管理后台</h1>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
```

**API集成**：
- `POST /api/auth/login` - 登录验证
- `GET /api/auth/profile` - 获取用户信息

### 2. 控制台首页 (Dashboard)

**功能描述**：
- 综合数据驾驶舱
- 关键指标展示
- 功能模块导航

**数据展示**：
```typescript
interface DashboardData {
  totalUsers: number;          // 总住户数
  pendingUsers: number;         // 待审住户数
  activeInteractions: number;   // 活跃互助数
  emergencyCount: number;       // 紧急求助数
  coinBalance: number;         // 绿币余额
  revenue: number;             // 物业收入
}
```

**界面布局**：
```vue
<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="stat in statistics" :key="stat.title">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快速入口 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="6" v-for="action in quickActions" :key="action.name">
        <el-card class="action-card" @click="navigateTo(action.path)">
          <div class="action-icon">{{ action.icon }}</div>
          <div class="action-title">{{ action.title }}</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 实时数据图表 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card title="互助趋势">
          <chart-component :data="interactionTrend" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card title="紧急求助状态">
          <map-component :emergencies="emergencyData" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
```

### 3. 住户审核管理界面 (User Audit Management UI)

**功能描述**：
- 采用数据表格展示待审列表
- 执行审核住户实名认证信息

**数据结构**：
```typescript
interface UserAudit {
  id: string;
  username: string;
  realName: string;
  idCard: string;
  propertyInfo: {
    building: string;
    unit: string;
    room: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    propertyCard: string;
    idCardFront: string;
    idCardBack: string;
    facePhoto: string;
  };
}
```

**界面实现**：
```vue
<template>
  <div class="user-audit">
    <div class="header">
      <h2>住户审核管理</h2>
      <el-button type="primary" @click="batchApprove">批量审核通过</el-button>
    </div>
    
    <el-table :data="userList" v-loading="loading">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="realName" label="真实姓名" />
      <el-table-column prop="propertyInfo" label="房产信息">
        <template #default="{ row }">
          {{ row.propertyInfo.building }}-{{ row.propertyInfo.unit }}-{{ row.propertyInfo.room }}
        </template>
      </el-table-column>
      <el-table-column prop="submittedAt" label="提交时间" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetails(row)">查看详情</el-button>
          <el-button size="small" type="success" @click="approveUser(row)">通过</el-button>
          <el-button size="small" type="danger" @click="rejectUser(row)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" 
                   :total="total" @current-change="handlePageChange" />
  </div>
</template>
```

### 4. 绿币与物业费抵扣管理界面 (Coin & Fee Management UI)

**功能描述**：
- 配置绿币抵扣规则
- 处理费用抵扣及账单管理

**数据模型**：
```typescript
interface CoinRule {
  id: string;
  name: string;
  description: string;
  coinAmount: number;
  discountRate: number;
  maxDiscount: number;
  minFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  ruleId: string;
  ruleName: string;
  originalFee: number;
  discountAmount: number;
  finalAmount: number;
  coinsUsed: number;
  transactionDate: string;
  status: 'completed' | 'pending' | 'failed';
}
```

**界面实现**：
```vue
<template>
  <div class="coin-management">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="抵扣规则" name="rules">
        <div class="rules-section">
          <div class="header">
            <h3>绿币抵扣规则</h3>
            <el-button type="primary" @click="showRuleDialog">新增规则</el-button>
          </div>
          
          <el-table :data="coinRules" v-loading="loading">
            <el-table-column prop="name" label="规则名称" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="coinAmount" label="所需绿币" />
            <el-table-column prop="discountRate" label="折扣率">
              <template #default="{ row }">{{ row.discountRate * 100 }}%</template>
            </el-table-column>
            <el-table-column prop="maxDiscount" label="最大抵扣" />
            <el-table-column prop="isActive" label="状态">
              <template #default="{ row }">
                <el-switch v-model="row.isActive" @change="toggleRule(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button size="small" @click="editRule(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteRule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="交易记录" name="transactions">
        <div class="transactions-section">
          <el-table :data="transactions" v-loading="loading">
            <el-table-column prop="userName" label="用户" />
            <el-table-column prop="ruleName" label="规则" />
            <el-table-column prop="originalFee" label="原金额" />
            <el-table-column prop="discountAmount" label="抵扣金额" />
            <el-table-column prop="finalAmount" label="实付金额" />
            <el-table-column prop="coinsUsed" label="使用绿币" />
            <el-table-column prop="transactionDate" label="交易时间" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getTransactionStatusType(row.status)">
                  {{ getTransactionStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
```

### 5. 社区互助监视界面 (Community Interaction Monitor UI)

**功能描述**：
- 实时监视社区互助交易情况
- 监视紧急求助状态

**数据模型**：
```typescript
interface CommunityInteraction {
  id: string;
  type: 'sharing' | 'borrowing' | 'helping';
  title: string;
  description: string;
  location: {
    building: string;
    unit: string;
    room: string;
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    userId: string;
    userName: string;
    role: 'provider' | 'receiver';
    joinedAt: string;
  }>;
}

interface Emergency {
  id: string;
  type: 'medical' | 'fire' | 'theft' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    building: string;
    unit: string;
    room: string;
    latitude: number;
    longitude: number;
  };
  description: string;
  reporter: {
    userId: string;
    userName: string;
    contact: string;
  };
  status: 'pending' | 'responding' | 'resolved';
  createdAt: string;
  responders: Array<{
    userId: string;
    userName: string;
    arrivedAt: string;
  }>;
}
```

**界面实现**：
```vue
<template>
  <div class="community-monitor">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card title="社区互助地图">
          <div class="map-container">
            <map-component 
              :interactions="activeInteractions" 
              :emergencies="activeEmergencies"
              @interaction-click="handleInteractionClick"
              @emergency-click="handleEmergencyClick"
            />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card title="实时动态">
          <div class="activity-feed">
            <div v-for="activity in activities" :key="activity.id" class="activity-item">
              <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
              <div class="activity-content">{{ activity.content }}</div>
              <div class="activity-type">{{ activity.type }}</div>
            </div>
          </div>
        </el-card>
        
        <el-card title="紧急求助" class="emergency-card">
          <div v-if="activeEmergencies.length === 0" class="no-emergencies">
            暂无紧急求助
          </div>
          <div v-else>
            <div v-for="emergency in activeEmergencies" :key="emergency.id" 
                 class="emergency-item" :class="emergency.severity">
              <div class="emergency-header">
                <span class="emergency-type">{{ getEmergencyType(emergency.type) }}</span>
                <span class="emergency-severity">{{ getSeverityText(emergency.severity) }}</span>
              </div>
              <div class="emergency-location">{{ emergency.location.building }}-{{ emergency.location.unit }}-{{ emergency.location.room }}</div>
              <div class="emergency-time">{{ formatTime(emergency.createdAt) }}</div>
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
  </div>
</template>
```

### 6. 系统设置与公告发布界面 (Settings & Announcement UI)

**功能描述**：
- 配置底层系统参数
- 管理人员权限
- 发布社区公告

**数据模型**：
```typescript
interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'notice' | 'maintenance' | 'event' | 'emergency';
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'residents' | 'staff';
  publishedAt: string;
  expiresAt?: string;
  author: {
    userId: string;
    userName: string;
  };
  status: 'draft' | 'published' | 'archived';
}

interface SystemSettings {
  maintenance: {
    mode: boolean;
    message: string;
    estimatedDuration: string;
  };
  features: {
    marketplace: boolean;
    emergency: boolean;
    coinSystem: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}
```

**界面实现**：
```vue
<template>
  <div class="settings-management">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="公告管理" name="announcements">
        <div class="announcements-section">
          <div class="header">
            <h3>社区公告</h3>
            <el-button type="primary" @click="showAnnouncementDialog">发布公告</el-button>
          </div>
          
          <el-table :data="announcements" v-loading="loading">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="type" label="类型">
              <template #default="{ row }">
                <el-tag :type="getAnnouncementTypeColor(row.type)">
                  {{ getAnnouncementTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级">
              <template #default="{ row }">
                <el-tag :type="getPriorityColor(row.priority)">
                  {{ getPriorityText(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="publishedAt" label="发布时间" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusColor(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button size="small" @click="editAnnouncement(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteAnnouncement(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="系统设置" name="settings">
        <div class="settings-section">
          <el-card title="维护模式">
            <el-switch v-model="settings.maintenance.mode" />
            <div v-if="settings.maintenance.mode" class="maintenance-message">
              <el-input v-model="settings.maintenance.message" placeholder="维护信息" />
              <el-input v-model="settings.maintenance.estimatedDuration" placeholder="预计维护时间" />
            </div>
          </el-card>
          
          <el-card title="功能开关">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="feature-item">
                  <span>闲置物品交易</span>
                  <el-switch v-model="settings.features.marketplace" />
                </div>
              </el-col>
              <el-col :span="8">
                <div class="feature-item">
                  <span>紧急求助</span>
                  <el-switch v-model="settings.features.emergency" />
                </div>
              </el-col>
              <el-col :span="8">
                <div class="feature-item">
                  <span>绿币系统</span>
                  <el-switch v-model="settings.features.coinSystem" />
                </div>
              </el-col>
            </el-row>
          </el-card>
          
          <el-card title="通知设置">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="notification-item">
                  <span>邮件通知</span>
                  <el-switch v-model="settings.notifications.email" />
                </div>
              </el-col>
              <el-col :span="8">
                <div class="notification-item">
                  <span>短信通知</span>
                  <el-switch v-model="settings.notifications.sms" />
                </div>
              </el-col>
              <el-col :span="8">
                <div class="notification-item">
                  <span>推送通知</span>
                  <el-switch v-model="settings.notifications.push" />
                </div>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="用户管理" name="users">
        <div class="users-section">
          <el-table :data="users" v-loading="loading">
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="realName" label="真实姓名" />
            <el-table-column prop="role" label="角色">
              <template #default="{ row }">
                <el-tag :type="getRoleColor(row.role)">
                  {{ getRoleText(row.role) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getUserStatusColor(row.status)">
                  {{ getUserStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button size="small" @click="editUser(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteUser(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
```

## API接口集成计划

### 1. 认证模块
```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null as any,
  }),
  actions: {
    async login(credentials: { username: string; password: string }) {
      const response = await api.post('/auth/login', credentials);
      this.token = response.data.token;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
    },
    
    async logout() {
      await api.post('/auth/logout');
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    },
    
    async refresh() {
      const response = await api.post('/auth/refresh');
      this.token = response.data.token;
      localStorage.setItem('token', this.token);
    }
  }
});
```

### 2. 住户管理模块
```typescript
// stores/users.ts
export const useUsersStore = defineStore('users', {
  state: () => ({
    userList: [] as UserAudit[],
    total: 0,
    currentPage: 1,
    pageSize: 10,
  }),
  actions: {
    async fetchUsers() {
      const response = await api.get('/users/pending', {
        params: {
          page: this.currentPage,
          size: this.pageSize
        }
      });
      this.userList = response.data.list;
      this.total = response.data.total;
    },
    
    async approveUser(userId: string) {
      await api.post(`/users/${userId}/approve`);
      await this.fetchUsers();
    },
    
    async rejectUser(userId: string, reason: string) {
      await api.post(`/users/${userId}/reject`, { reason });
      await this.fetchUsers();
    }
  }
});
```

### 3. 绿币管理模块
```typescript
// stores/coins.ts
export const useCoinsStore = defineStore('coins', {
  state: () => ({
    coinRules: [] as CoinRule[],
    transactions: [] as Transaction[],
  }),
  actions: {
    async fetchCoinRules() {
      const response = await api.get('/coins/rules');
      this.coinRules = response.data;
    },
    
    async createCoinRule(rule: Omit<CoinRule, 'id' | 'createdAt' | 'updatedAt'>) {
      await api.post('/coins/rules', rule);
      await this.fetchCoinRules();
    },
    
    async fetchTransactions() {
      const response = await api.get('/coins/transactions');
      this.transactions = response.data;
    }
  }
});
```

### 4. 社区互助模块
```typescript
// stores/community.ts
export const useCommunityStore = defineStore('community', {
  state: () => ({
    interactions: [] as CommunityInteraction[],
    emergencies: [] as Emergency[],
    activities: [] as any[],
  }),
  actions: {
    async fetchInteractions() {
      const response = await api.get('/community/interactions');
      this.interactions = response.data;
    },
    
    async fetchEmergencies() {
      const response = await api.get('/community/emergencies');
      this.emergencies = response.data;
    },
    
    async respondToEmergency(emergencyId: string) {
      await api.post(`/community/emergencies/${emergencyId}/respond`);
      await this.fetchEmergencies();
    }
  }
});
```

### 5. 系统设置模块
```typescript
// stores/settings.ts
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    announcements: [] as Announcement[],
    settings: {} as SystemSettings,
    users: [] as any[],
  }),
  actions: {
    async fetchAnnouncements() {
      const response = await api.get('/settings/announcements');
      this.announcements = response.data;
    },
    
    async createAnnouncement(announcement: Omit<Announcement, 'id' | 'publishedAt' | 'author' | 'status'>) {
      await api.post('/settings/announcements', announcement);
      await this.fetchAnnouncements();
    },
    
    async fetchSettings() {
      const response = await api.get('/settings/system');
      this.settings = response.data;
    },
    
    async updateSettings(settings: Partial<SystemSettings>) {
      await api.put('/settings/system', settings);
      await this.fetchSettings();
    },
    
    async fetchUsers() {
      const response = await api.get('/settings/users');
      this.users = response.data;
    }
  }
});
```

## 路由配置

```typescript
// router/index.ts
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserAudit',
    component: () => import('@/views/users/UserAudit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/coins',
    name: 'CoinManagement',
    component: () => import('@/views/coins/CoinManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/community',
    name: 'CommunityMonitor',
    component: () => import('@/views/community/CommunityMonitor.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/Settings.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login');
  } else if (to.path === '/login' && authStore.token) {
    next('/');
  } else {
    next();
  }
});
```

这个详细的实现计划涵盖了所有界面的具体实现细节，包括组件结构、数据模型、API集成和状态管理。每个界面都遵循Element Plus的设计规范，并与后端API进行完整的集成。