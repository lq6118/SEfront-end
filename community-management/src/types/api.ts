// API相关的类型定义

// 用户认证相关
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  username: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'DISABLED' | 'PENDING_REVIEW';
}

// 文件相关
export interface BlobResponse {
  blobId: string;
  mimeType: string;
  uploadTime: string;
  sha512: string;
}

// 用户审核相关
export interface UserAudit {
  id: string;
  username: string;
  realName: string;
  idCard: string;
  phone: string;
  email: string;
  address: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'DISABLED' | 'PENDING_REVIEW';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  documents: BlobResponse[];
}

// 扩展类型（为未来API预留）
export interface CoinRule {
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

export interface Transaction {
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

export interface CommunityInteraction {
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

export interface Emergency {
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

export interface Announcement {
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

export interface SystemSettings {
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

export interface SystemConfig extends SystemSettings {
  id: string;
  version: string;
  lastUpdated: string;
  updatedBy: string;
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}