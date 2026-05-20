import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import type {
  Announcement,
  AuthResponse,
  BlobResponse,
  CoinRule,
  CommunityInteraction,
  SystemConfig,
  Transaction,
  UserAudit
} from '../types/api';

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // 启用withCredentials以支持跨域请求
  withCredentials: false,
});

// 请求拦截器 - 添加调试信息
api.interceptors.request.use(
  (config) => {
    console.log('API请求:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      baseURL: config.baseURL,
      data: config.data,
      params: config.params,
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('添加token:', token.substring(0, 10) + '...');
    }
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API响应:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API错误:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          ElMessage.error('登录已过期，请重新登录');
          break;
        case 403:
          ElMessage.error('权限不足');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        default:
          ElMessage.error(error.response.data.message || '请求失败');
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败');
    } else {
      ElMessage.error('请求配置错误');
    }
    return Promise.reject(error);
  }
);

// API请求封装
export const request = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    api.get<T>(url, config).then(res => res.data),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.post<T>(url, data, config).then(res => res.data),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.put<T>(url, data, config).then(res => res.data),
    
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    api.delete<T>(url, config).then(res => res.data),
    
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.patch<T>(url, data, config).then(res => res.data),
};

// 认证相关API
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    request.post<AuthResponse>('/auth/login', credentials),
    
  register: (data: { username: string; password: string }) =>
    request.post<AuthResponse>('/auth/register', data),
    
  getInfo: () =>
    request.get<AuthResponse>('/auth/info'),
};

// 文件审核相关API
export const fileReviewApi = {
  // 获取待审核文件列表
  getReviewList: (userId?: string) =>
    request.get<{ list: BlobResponse[]; total: number }>('/user/review', { 
      params: { userId } 
    }),
    
  // 上传文件
  uploadFiles: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return request.post<BlobResponse[]>('/user/review', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
    
  // 下载文件
  downloadFile: (blobId: string) =>
    request.get(`/user/review/${blobId}`, {
      responseType: 'blob',
    }),
    
  // 删除文件
  deleteFile: (blobId: string) =>
    request.delete(`/user/review/${blobId}`),
};

// 用户管理API
export const userManagerApi = {
  // 获取用户列表
  getUsers: (params?: { page?: number; size?: number; role?: string; status?: string }) =>
    request.get<{ list: UserAudit[]; total: number }>('/users', { params }),
    
  // 获取用户详情
  getUserDetail: (userId: string) =>
    request.get<UserAudit>(`/users/${userId}`),
    
  // 更新用户信息
  updateUser: (userId: string, data: any) =>
    request.put(`/users/${userId}`, data),
    
  // 删除用户
  deleteUser: (userId: string) =>
    request.delete(`/users/${userId}`),
    
  // 批量操作用户
  batchUpdateUsers: (userIds: string[], action: string) =>
    request.post('/users/batch', { userIds, action }),
    
  // 审核用户
  approveUser: (userId: string) =>
    request.post(`/users/${userId}/approve`),
    
  // 拒绝用户
  rejectUser: (userId: string, reason?: string) =>
    request.post(`/users/${userId}/reject`, { reason }),
};

// 绿币管理API
export const coinApi = {
  // 获取绿币规则列表
  getCoinRules: (params?: { page?: number; size?: number }) =>
    request.get<{ list: CoinRule[]; total: number }>('/coins/rules', { params }),
    
  // 创建绿币规则
  createCoinRule: (data: any) =>
    request.post('/coins/rules', data),
    
  // 更新绿币规则
  updateCoinRule: (ruleId: string, data: any) =>
    request.put(`/coins/rules/${ruleId}`, data),
    
  // 删除绿币规则
  deleteCoinRule: (ruleId: string) =>
    request.delete(`/coins/rules/${ruleId}`),
    
  // 获取交易记录
  getTransactions: (params?: { 
    userId?: string; 
    type?: string; 
    startDate?: string; 
    endDate?: string; 
    page?: number; 
    size?: number 
  }) =>
    request.get<{ list: Transaction[]; total: number }>('/coins/transactions', { params }),
    
  // 创建交易记录
  createTransaction: (data: any) =>
    request.post('/coins/transactions', data),
};

// 社区互助API
export const communityApi = {
  // 获取互助记录
  getInteractions: (params?: { type?: string; status?: string; page?: number; size?: number }) =>
    request.get<{ list: CommunityInteraction[]; total: number }>('/community/interactions', { params }),
    
  // 创建互助记录
  createInteraction: (data: any) =>
    request.post('/community/interactions', data),
    
  // 更新互助记录
  updateInteraction: (interactionId: string, data: any) =>
    request.put(`/community/interactions/${interactionId}`, data),
    
  // 删除互助记录
  deleteInteraction: (interactionId: string) =>
    request.delete(`/community/interactions/${interactionId}`),
    
  // 获取紧急求助
  getEmergencies: (params?: { status?: string; page?: number; size?: number }) =>
    request.get<{ list: any[]; total: number }>('/community/emergencies', { params }),
    
  // 响应紧急求助
  respondToEmergency: (emergencyId: string, response: any) =>
    request.post(`/community/emergencies/${emergencyId}/respond`, response),
};

// 公告管理API
export const announcementApi = {
  // 获取公告列表
  getAnnouncements: (params?: { type?: string; status?: string; page?: number; size?: number }) =>
    request.get<{ list: Announcement[]; total: number }>('/announcements', { params }),
    
  // 创建公告
  createAnnouncement: (data: any) =>
    request.post('/announcements', data),
    
  // 更新公告
  updateAnnouncement: (announcementId: string, data: any) =>
    request.put(`/announcements/${announcementId}`, data),
    
  // 删除公告
  deleteAnnouncement: (announcementId: string) =>
    request.delete(`/announcements/${announcementId}`),
    
  // 发布公告
  publishAnnouncement: (announcementId: string) =>
    request.post(`/announcements/${announcementId}/publish`),
    
  // 撤销公告
  unpublishAnnouncement: (announcementId: string) =>
    request.post(`/announcements/${announcementId}/unpublish`),
};

// 系统配置API
export const systemApi = {
  // 健康检查
  ping: () =>
    request.get('/ping'),
    
  // 获取系统配置
  getConfig: () =>
    request.get<SystemConfig>('/system/config'),
    
  // 更新系统配置
  updateConfig: (data: any) =>
    request.put('/system/config', data),
    
  // 获取统计数据
  getStatistics: (params?: { startDate?: string; endDate?: string }) =>
    request.get('/system/statistics', { params }),
};

// 文件上传API
export const fileApi = {
  // 通用文件上传
  upload: (file: File, type?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (type) {
      formData.append('type', type);
    }
    return request.post<{ url: string; filename: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;