import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AuthResponse } from '../types/api';
import { authApi } from '../utils/api';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<AuthResponse | null>(null);
  const loading = ref(false);

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN' || user.value?.role === 'SUPERADMIN');
  const isSuperAdmin = computed(() => user.value?.role === 'SUPERADMIN');

  // 方法
  const login = async (credentials: { username: string; password: string }) => {
    loading.value = true;
    try {
      console.log('尝试登录:', credentials);
      const response = await authApi.login(credentials);
      console.log('登录响应:', response);
      
      token.value = response.id; // 假设返回的id就是token
      user.value = response;
      
      // 存储到localStorage
      localStorage.setItem('token', token.value);
      localStorage.setItem('user', JSON.stringify(user.value));
      
      ElMessage.success('登录成功');
      return true;
    } catch (error: any) {
      console.error('登录失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '登录失败，请检查用户名和密码';
      ElMessage.error(errorMessage);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authApi.register({ username: '', password: '' }); // 调用登出API（如果有的话）
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      // 清除本地存储
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      ElMessage.success('已退出登录');
    }
  };

  const getUserInfo = async () => {
    if (!token.value) return;
    
    try {
      const response = await authApi.getInfo();
      user.value = response;
      localStorage.setItem('user', JSON.stringify(user.value));
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 如果获取用户信息失败，可能是token过期，清除登录状态
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const initAuth = async () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
      
      // 验证token是否有效
      try {
        await getUserInfo();
      } catch (error) {
        // token无效，清除登录状态
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  };

  return {
    // 状态
    token,
    user,
    loading,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    
    // 方法
    login,
    logout,
    getUserInfo,
    initAuth,
  };
});