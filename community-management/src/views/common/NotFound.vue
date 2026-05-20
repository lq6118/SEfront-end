<template>
  <div class="not-found">
    <div class="content">
      <div class="error-code">404</div>
      <div class="error-message">页面不存在</div>
      <div class="error-desc">抱歉，您访问的页面不存在或已被移除。</div>
      <div class="actions">
        <el-button type="primary" @click="goHome">
          返回首页
        </el-button>
        <el-button @click="goBack">
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .content {
    text-align: center;
    color: white;
    
    .error-code {
      font-size: 120px;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .error-message {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    
    .error-desc {
      font-size: 16px;
      margin-bottom: 32px;
      opacity: 0.9;
    }
    
    .actions {
      .el-button {
        margin: 0 8px;
      }
    }
  }
}
</style>