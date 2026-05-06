# useWorkflow Hook 测试文档

## 测试覆盖率

- **语句覆盖率**: 98.61%
- **分支覆盖率**: 80%
- **函数覆盖率**: 100%
- **行覆盖率**: 98.33%

## 测试用例概览

### 初始状态测试 (3 个测试)
- ✅ 验证初始状态的正确性
- ✅ 验证派生状态标志 (isRunning, isPaused, isCompleted, hasError)
- ✅ 验证当前步骤和进度的初始值

### start - 启动工作流 (4 个测试)
- ✅ 启动工作流并设置 projectId
- ✅ 测试 onStepChange 回调调用
- ✅ 测试 autoAnalyze 配置
- ✅ 测试 autoGenerateScript 和 preferredTemplate 配置

### analyze - 分析视频 (2 个测试)
- ✅ 更新步骤到 analyze 并设置进度
- ✅ 测试 onStepChange 回调调用

### selectTemplate - 选择模板 (2 个测试)
- ✅ 更新步骤到 template-select
- ✅ 测试 onStepChange 回调调用

### generateScript - 生成脚本 (2 个测试)
- ✅ 更新步骤到 script-generate 并设置进度
- ✅ 测试 onStepChange 回调调用

### dedupScript - 脚本去重 (2 个测试)
- ✅ 更新步骤到 script-dedup 并设置进度
- ✅ 测试 onStepChange 回调调用

### ensureUniqueness - 检查唯一性 (2 个测试)
- ✅ 返回唯一性检查结果
- ✅ 接受任意字符串内容

### editScript - 编辑脚本 (2 个测试)
- ✅ 更新步骤到 script-edit 并保存脚本内容
- ✅ 测试 onStepChange 回调调用

### editTimeline - 编辑时间线 (2 个测试)
- ✅ 更新步骤到 timeline-edit 并保存时间线数据
- ✅ 测试 onStepChange 回调调用

### preview - 预览 (2 个测试)
- ✅ 更新步骤到 preview 并设置进度
- ✅ 测试 onStepChange 回调调用

### export - 导出 (3 个测试)
- ✅ 更新步骤到 export 并设置状态为 completed
- ✅ 测试 onComplete 回调调用
- ✅ 测试 onStepChange 回调调用

### pause/resume - 暂停和恢复 (2 个测试)
- ✅ 暂停工作流
- ✅ 恢复工作流

### cancel - 取消 (2 个测试)
- ✅ 取消工作流并重置进度
- ✅ 取消后保留当前步骤和数据

### reset - 重置 (2 个测试)
- ✅ 重置工作流到初始状态
- ✅ 重置后所有派生状态为初始值

### jumpToStep - 跳转步骤 (3 个测试)
- ✅ 跳转到指定步骤
- ✅ 测试 onStepChange 回调调用
- ✅ 跳转到所有有效步骤

### 错误处理 (2 个测试)
- ✅ 验证 hasError 标志
- ✅ 验证 onError 回调存在性

### 完整的工作流程 (1 个测试)
- ✅ 完整执行所有工作流步骤

### 返回值的完整性 (1 个测试)
- ✅ 验证所有必需的属性和方法存在

### 回调函数的稳定性 (2 个测试)
- ✅ 多次调用 onStepChange
- ✅ 没有提供回调时不报错

### 数据持久化 (3 个测试)
- ✅ 步骤变化时保留已有数据
- ✅ 编辑脚本时保留其他信息
- ✅ 编辑时间线时保留其他信息

## 总测试数
**44 个测试用例全部通过** ✅

## 未覆盖的代码
- 第 109 行：`callbacks?.onError?.(error)` - 这是错误状态下的回调调用，由于 hook 不公开设置错误状态的方法，此行无法直接测试

## 测试工具和依赖
- `@testing-library/react` - React Hook 测试
- `jest` - 测试框架
- 模拟了 `uuid` 模块

## 辅助函数
- `createMockTemplate()` - 创建模拟的 ScriptTemplate
- `createMockModel()` - 创建模拟的 AIModel
- `createMockFile()` - 创建模拟的 File 对象

## 运行测试

```bash
# 运行 useWorkflow 测试
npm test -- src/__tests__/core/hooks/useWorkflow.test.tsx

# 运行测试并查看覆盖率
npm test -- src/__tests__/core/hooks/useWorkflow.test.tsx --coverage

# 运行所有 hooks 测试
npm test -- src/__tests__/core/hooks/
```
