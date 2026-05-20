<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

// 初始化认证状态
const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initAuth();
});
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* 全局样式 */
.page-container {
  background-color: #f5f5f5;
  min-height: 100%;
}

.content-wrapper {
  padding: 20px;
}

/* Element Plus 样式覆盖 */
.el-card {
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-button {
  border-radius: 6px;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-dialog {
  border-radius: 8px;
}

.el-message-box {
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 10px;
  }
  
  .el-card {
    margin-bottom: 10px;
  }
}
</style>
