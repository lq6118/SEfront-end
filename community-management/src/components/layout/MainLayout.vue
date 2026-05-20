<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
      <div class="logo">
        <img src="/src/assets/vite.svg" alt="Logo" class="logo-img" />
        <span v-if="!isCollapsed" class="logo-text">邻里绿链</span>
      </div>
      
      <el-menu
        :default-active="activeRoute"
        :collapse="isCollapsed"
        :collapse-transition="false"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Monitor /></el-icon>
          <template #title>控制台</template>
        </el-menu-item>
        
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>住户审核</template>
        </el-menu-item>
        
        <el-menu-item index="/coins">
          <el-icon><Coin /></el-icon>
          <template #title>绿币管理</template>
        </el-menu-item>
        
        <el-menu-item index="/community">
          <el-icon><Location /></el-icon>
          <template #title>社区互助</template>
        </el-menu-item>
        
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </div>
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <div class="nav-left">
          <el-button 
            type="text" 
            @click="toggleSidebar"
            class="collapse-btn"
          >
            <el-icon><Fold v-if="!isCollapsed" /><Expand v-else /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="nav-right">
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="32" :src="userAvatar">
                {{ user?.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="username">{{ user?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showProfile">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { ElMessageBox } from 'element-plus';
import {
  Monitor,
  User,
  Coin,
  Location,
  Setting,
  Fold,
  Expand,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 响应式状态
const isCollapsed = ref(false);
const user = computed(() => authStore.user);
const userAvatar = ref('/vite.svg'); // 可以替换为实际的用户头像URL

// 当前激活的路由
const activeRoute = computed(() => route.path);

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title);
  return matched.map(item => ({
    path: item.path,
    title: item.meta?.title as string,
  }));
});

// 方法
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const showProfile = () => {
  // 显示用户信息弹窗
  console.log('显示用户信息');
};

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    // 用户取消操作
  }
};

// 监听路由变化，重置折叠状态
watch(
  () => route.path,
  () => {
    // 可以在这里添加路由变化的处理逻辑
  }
);
</script>

<style scoped lang="scss">
.main-layout {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 260px;
  background-color: #001529;
  color: white;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &.sidebar-collapsed {
    width: 64px;
  }
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    background-color: #002140;
    
    .logo-img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }
    
    .logo-text {
      font-size: 18px;
      font-weight: bold;
      color: white;
    }
  }
  
  .sidebar-menu {
    flex: 1;
    border: none;
    
    :deep(.el-menu-item) {
      &:hover {
        background-color: #1890ff;
      }
      
      &.is-active {
        background-color: #1890ff;
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .top-nav {
    height: 60px;
    background-color: white;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    
    .nav-left {
      display: flex;
      align-items: center;
      
      .collapse-btn {
        margin-right: 16px;
        font-size: 18px;
      }
      
      .el-breadcrumb {
        font-size: 14px;
      }
    }
    
    .nav-right {
      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 4px;
        
        &:hover {
          background-color: #f0f0f0;
        }
        
        .username {
          margin: 0 8px;
          font-size: 14px;
        }
      }
    }
  }
  
  .page-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #f5f5f5;
  }
}
</style>