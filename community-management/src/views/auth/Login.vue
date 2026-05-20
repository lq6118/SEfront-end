<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <img src="/src/assets/vite.svg" alt="Logo" class="logo" />
        <h1>邻里绿链管理系统</h1>
        <p>物业管理后台登录</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="login-content"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="info"
            size="small"
            @click="testLogin"
          >
            测试登录 (admin/123456)
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>© 2024 邻里绿链系统</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();

// 响应式数据
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
});

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
};

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    // 验证表单
    await loginFormRef.value.validate();
    
    loading.value = true;
    
    // 调用登录API
    const success = await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
    });
    
    if (success) {
      // 登录成功，跳转到首页
      router.push('/');
    }
  } catch (error: any) {
    console.error('登录失败:', error);
    ElMessage.error(error.message || '登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};

// 页面加载时聚焦用户名输入框
const focusUsernameInput = () => {
  const usernameInput = document.querySelector('input[placeholder="请输入用户名"]');
  if (usernameInput) {
    (usernameInput as HTMLInputElement).focus();
  }
};

// 测试登录方法
const testLogin = async () => {
  loginForm.username = 'admin';
  loginForm.password = '123456';
  
  console.log('测试登录:', loginForm);
  await handleLogin();
};

// 页面加载完成后聚焦输入框
onMounted(() => {
  focusUsernameInput();
});
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  animation: slideIn 0.3s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  
  .logo {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
  }
  
  h1 {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}

.login-content {
  .login-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;
    margin-top: 10px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  
  p {
    font-size: 12px;
    color: #999;
    margin: 0;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-form {
    padding: 30px 20px;
    margin: 0 10px;
  }
  
  .login-header {
    h1 {
      font-size: 20px;
    }
  }
}
</style>