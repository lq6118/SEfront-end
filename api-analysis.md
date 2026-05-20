# API接口分析报告

## API概览

基于 `http://172.18.198.240:8080/v3/api-docs` 的分析，后端API提供了以下主要功能：

### 认证相关接口
1. **登录接口**
   - 路径: `POST /api/auth/login`
   - 功能: 用户登录验证
   - 请求体: `LoginRequest` (username, password)
   - 响应: `AuthResponse` (id, username, role, status)

2. **注册接口**
   - 路径: `POST /api/auth/register`
   - 功能: 注册新用户
   - 请求体: `RegisterRequest` (username, password)
   - 响应: `AuthResponse`

3. **获取用户信息**
   - 路径: `GET /api/auth/info`
   - 功能: 获取当前用户信息
   - 响应: `AuthResponse`

### 文件审核接口
1. **列出文件**
   - 路径: `GET /api/user/review`
   - 功能: 列出待审核的文件
   - 参数: `userId` (可选)
   - 响应: `BlobResponse[]`

2. **上传文件**
   - 路径: `POST /api/user/review`
   - 功能: 上传文件进行审核
   - 参数: `files` (文件数组)
   - 响应: `BlobResponse[]`

3. **下载文件**
   - 路径: `GET /api/user/review/{blobId}`
   - 功能: 下载指定文件
   - 参数: `blobId` (UUID)
   - 响应: 文件内容

4. **删除文件**
   - 路径: `DELETE /api/user/review/{blobId}`
   - 功能: 删除文件
   - 参数: `blobId` (UUID)
   - 响应: 删除成功响应

### 系统接口
1. **健康检查**
   - 路径: `GET /api/ping`
   - 功能: 检查服务器状态
   - 响应: "pong"

## 数据模型分析

### 用户相关
```typescript
interface AuthResponse {
  id: string;           // 用户UUID
  username: string;     // 用户名
  role: string;         // 角色类型: SUPERADMIN, ADMIN, USER
  status: string;       // 状态: ACTIVE, DISABLED, PENDING_REVIEW
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
}
```

### 文件相关
```typescript
interface BlobResponse {
  blobId: string;       // 文件UUID
  mimeType: string;    // MIME类型
  uploadTime: string;   // 上传时间
  sha512: string;       // SHA-512哈希值
}
```

## 发现的问题

1. **API功能不完整**: 当前API只有基础的认证和文件审核功能，缺少：
   - 绿币管理相关接口
   - 社区互助相关接口
   - 公告管理相关接口
   - 用户管理相关接口

2. **角色权限**: API中定义了三种角色：
   - SUPERADMIN: 超级管理员
   - ADMIN: 管理员
   - USER: 普通用户

3. **用户状态**: 用户有三种状态：
   - ACTIVE: 激活状态
   - DISABLED: 禁用状态
   - PENDING_REVIEW: 待审核状态

## 前端适配建议

### 1. 认证模块
- 基于现有的登录/注册接口
- 实现JWT token管理
- 支持角色权限控制

### 2. 文件审核模块
- 实现文件上传功能
- 实现文件列表展示
- 实现文件预览和下载
- 实现文件删除功能

### 3. 用户管理模块
- 基于用户角色和状态进行界面控制
- 实现用户信息展示
- 实现用户状态管理

### 4. 扩展功能
- 由于缺少完整的API，需要与后端团队确认：
  - 绿币管理接口
  - 社区互助接口
  - 公告管理接口
  - 数据统计接口

## 前端实现策略

### 阶段1: 基础功能实现
1. 实现登录认证功能
2. 实现文件审核管理界面
3. 实现基本的用户信息展示

### 阶段2: 功能扩展
1. 等待后端提供完整API
2. 实现绿币管理功能
3. 实现社区互助功能
4. 实现公告管理功能

### 阶段3: 优化完善
1. 完善用户体验
2. 添加响应式设计
3. 性能优化和测试