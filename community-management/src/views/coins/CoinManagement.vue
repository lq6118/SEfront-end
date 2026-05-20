<template>
  <div class="coin-management">
    <el-tabs v-model="activeTab" class="coin-tabs">
      <el-tab-pane label="抵扣规则" name="rules">
        <div class="rules-section">
          <div class="section-header">
            <h3>绿币抵扣规则</h3>
            <el-button type="primary" @click="showRuleDialog">
              <el-icon><Plus /></el-icon>
              新增规则
            </el-button>
          </div>
          
          <el-card class="rules-table" shadow="never">
            <el-table
              :data="coinRules"
              v-loading="loading"
              style="width: 100%"
            >
              <el-table-column prop="name" label="规则名称" width="150" />
              <el-table-column prop="description" label="描述" min-width="200" />
              <el-table-column label="所需绿币" width="120">
                <template #default="{ row }">
                  {{ row.coinAmount }}
                </template>
              </el-table-column>
              <el-table-column label="折扣率" width="120">
                <template #default="{ row }">
                  {{ (row.discountRate * 100).toFixed(1) }}%
                </template>
              </el-table-column>
              <el-table-column label="最大抵扣" width="120">
                <template #default="{ row }">
                  ¥{{ row.maxDiscount }}
                </template>
              </el-table-column>
              <el-table-column label="最低消费" width="120">
                <template #default="{ row }">
                  ¥{{ row.minFee }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.isActive"
                    @change="toggleRule(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="editRule(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteRule(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="交易记录" name="transactions">
        <div class="transactions-section">
          <div class="section-header">
            <h3>交易记录</h3>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索用户名或规则名称"
                style="width: 200px"
                clearable
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </div>
          </div>
          
          <el-card class="transactions-table" shadow="never">
            <el-table
              :data="transactions"
              v-loading="loading"
              style="width: 100%"
            >
              <el-table-column prop="userName" label="用户" width="120" />
              <el-table-column prop="ruleName" label="规则" width="150" />
              <el-table-column label="原金额" width="120">
                <template #default="{ row }">
                  ¥{{ row.originalFee }}
                </template>
              </el-table-column>
              <el-table-column label="抵扣金额" width="120">
                <template #default="{ row }">
                  <span class="discount-amount">-¥{{ row.discountAmount }}</span>
                </template>
              </el-table-column>
              <el-table-column label="实付金额" width="120">
                <template #default="{ row }">
                  <span class="final-amount">¥{{ row.finalAmount }}</span>
                </template>
              </el-table-column>
              <el-table-column label="使用绿币" width="100">
                <template #default="{ row }">
                  <el-tag type="success">{{ row.coinsUsed }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="transactionDate" label="交易时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.transactionDate) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getTransactionStatusType(row.status)">
                    {{ getTransactionStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 规则编辑弹窗 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="editingRule ? '编辑规则' : '新增规则'"
      width="500px"
      @close="resetRuleForm"
    >
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="ruleRules"
        label-width="100px"
      >
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入规则描述"
          />
        </el-form-item>
        <el-form-item label="所需绿币" prop="coinAmount">
          <el-input-number
            v-model="ruleForm.coinAmount"
            :min="1"
            :max="10000"
            placeholder="请输入所需绿币数量"
          />
        </el-form-item>
        <el-form-item label="折扣率" prop="discountRate">
          <el-slider
            v-model="ruleForm.discountRate"
            :min="0"
            :max="1"
            :step="0.01"
            show-input
            :format-tooltip="(value: number) => `${(value * 100).toFixed(1)}%`"
          />
        </el-form-item>
        <el-form-item label="最大抵扣" prop="maxDiscount">
          <el-input-number
            v-model="ruleForm.maxDiscount"
            :min="0"
            :max="10000"
            :precision="2"
            placeholder="请输入最大抵扣金额"
          />
        </el-form-item>
        <el-form-item label="最低消费" prop="minFee">
          <el-input-number
            v-model="ruleForm.minFee"
            :min="0"
            :max="10000"
            :precision="2"
            placeholder="请输入最低消费金额"
          />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="ruleForm.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule" :loading="ruleLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import { coinApi } from '../../utils/api';
import type { CoinRule, CoinTransaction } from '../../types/api';

// 响应式数据
const activeTab = ref('rules');
const loading = ref(false);
const ruleLoading = ref(false);
const ruleDialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchKeyword = ref('');

// 规则数据
const coinRules = ref<CoinRule[]>([]);
const transactions = ref<CoinTransaction[]>([]);
const editingRule = ref<CoinRule | null>(null);

// 规则表单
const ruleForm = reactive({
  name: '',
  description: '',
  coinAmount: 100,
  discountRate: 0.1,
  maxDiscount: 100,
  minFee: 50,
  isActive: true,
});

// 规则验证规则
const ruleRules: FormRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 2, max: 50, message: '规则名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入规则描述', trigger: 'blur' },
    { min: 10, max: 200, message: '规则描述长度在 10 到 200 个字符', trigger: 'blur' },
  ],
  coinAmount: [
    { required: true, message: '请输入所需绿币数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '绿币数量必须大于0', trigger: 'blur' },
  ],
  discountRate: [
    { required: true, message: '请设置折扣率', trigger: 'blur' },
    { type: 'number', min: 0, max: 1, message: '折扣率必须在0-1之间', trigger: 'blur' },
  ],
  maxDiscount: [
    { required: true, message: '请输入最大抵扣金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '最大抵扣金额不能为负数', trigger: 'blur' },
  ],
  minFee: [
    { required: true, message: '请输入最低消费金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '最低消费金额不能为负数', trigger: 'blur' },
  ],
};

// 方法
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
};

const getTransactionStatusType = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'info';
  }
};

const getTransactionStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'pending':
      return '处理中';
    case 'failed':
      return '失败';
    default:
      return status;
  }
};

const fetchCoinRules = async () => {
  loading.value = true;
  try {
    // 调用API获取规则列表
    const response = await coinApi.getCoinRules();
    coinRules.value = response;
    
    console.log('规则列表数据:', response);
  } catch (error) {
    console.error('获取规则列表失败:', error);
    ElMessage.error('获取规则列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchTransactions = async () => {
  loading.value = true;
  try {
    // 调用API获取交易记录
    const response = await coinApi.getCoinTransactions({
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKeyword.value,
    });
    transactions.value = response.list;
    total.value = response.total;
    
    console.log('交易记录数据:', response);
  } catch (error) {
    console.error('获取交易记录失败:', error);
    ElMessage.error('获取交易记录失败');
  } finally {
    loading.value = false;
  }
};

const toggleRule = async (rule: CoinRule) => {
  try {
    // 调用API切换规则状态
    await coinApi.updateCoinRule(rule.id, {
      isActive: rule.isActive,
    });
    
    ElMessage.success(`规则已${rule.isActive ? '启用' : '禁用'}`);
  } catch (error) {
    rule.isActive = !rule.isActive;
    console.error('切换规则状态失败:', error);
    ElMessage.error('切换规则状态失败');
  }
};

const showRuleDialog = () => {
  editingRule.value = null;
  resetRuleForm();
  ruleDialogVisible.value = true;
};

const editRule = (rule: any) => {
  editingRule.value = rule;
  Object.assign(ruleForm, rule);
  ruleDialogVisible.value = true;
};

const deleteRule = async (rule: CoinRule) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除规则"${rule.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 调用API删除规则
    await coinApi.deleteCoinRule(rule.id);
    
    ElMessage.success('删除成功');
    fetchCoinRules();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除规则失败:', error);
      ElMessage.error('删除规则失败');
    }
  }
};

const resetRuleForm = () => {
  Object.assign(ruleForm, {
    name: '',
    description: '',
    coinAmount: 100,
    discountRate: 0.1,
    maxDiscount: 100,
    minFee: 50,
    isActive: true,
  });
  ruleFormRef.value?.clearValidate();
};

const saveRule = async () => {
  if (!ruleFormRef.value) return;
  
  try {
    await ruleFormRef.value.validate();
    
    ruleLoading.value = true;
    
    if (editingRule.value) {
      // 调用API更新规则
      await coinApi.updateCoinRule(editingRule.value.id, ruleForm);
      ElMessage.success('更新成功');
    } else {
      // 调用API创建规则
      await coinApi.createCoinRule(ruleForm);
      ElMessage.success('创建成功');
    }
    
    ruleDialogVisible.value = false;
    fetchCoinRules();
  } catch (error) {
    console.error('保存规则失败:', error);
    ElMessage.error('保存规则失败');
  } finally {
    ruleLoading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchTransactions();
};

const resetSearch = () => {
  searchKeyword.value = '';
  handleSearch();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchTransactions();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchTransactions();
};


onMounted(() => {
  fetchCoinRules();
});
</script>

<style scoped lang="scss">
.coin-management {
  .coin-tabs {
    :deep(.el-tabs__content) {
      padding-top: 20px;
    }
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
  
  .rules-table,
  .transactions-table {
    .discount-amount {
      color: #67c23a;
      font-weight: bold;
    }
    
    .final-amount {
      color: #409eff;
      font-weight: bold;
    }
    
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>