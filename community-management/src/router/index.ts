import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hideForAuth: true,
    },
  },
  {
    path: '/',
    component: () => import('../components/layout/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/Dashboard.vue'),
        meta: {
          title: '控制台',
          requiresAuth: true,
        },
      },
      {
        path: 'users',
        name: 'UserAudit',
        component: () => import('../views/users/UserAudit.vue'),
        meta: {
          title: '住户审核',
          requiresAuth: true,
        },
      },
      {
        path: 'coins',
        name: 'CoinManagement',
        component: () => import('../views/coins/CoinManagement.vue'),
        meta: {
          title: '绿币管理',
          requiresAuth: true,
        },
      },
      {
        path: 'community',
        name: 'CommunityMonitor',
        component: () => import('../views/community/CommunityMonitor.vue'),
        meta: {
          title: '社区互助',
          requiresAuth: true,
        },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/settings/Settings.vue'),
        meta: {
          title: '系统设置',
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/common/NotFound.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 邻里绿链管理系统`;
  }
  
  // 只有在没有token且不是登录页时才初始化认证状态
  if (!authStore.token && to.path !== '/login' && !to.meta.requiresAuth) {
    try {
      await authStore.initAuth();
    } catch (error) {
      console.error('初始化认证状态失败:', error);
    }
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('需要认证但未登录，跳转到登录页');
    next('/login');
    return;
  }
  
  // 如果已登录但访问登录页，重定向到首页
  if (authStore.isAuthenticated && to.meta.hideForAuth) {
    console.log('已登录但访问登录页，重定向到首页');
    next('/');
    return;
  }
  
  // 处理重定向
  if (to.path === '/') {
    next('/dashboard');
    return;
  }
  
  next();
});

export default router;