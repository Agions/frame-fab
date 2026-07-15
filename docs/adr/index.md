# Architecture Decision Records

> v3.0 重构中的关键架构决策

## ADR-001: 用 ProjectEditContext 替换 53-prop Drilling

**Status**: ✅ Accepted (v3.0)

**Context**: ProjectEditPage 曾通过 StepContentSwitcher 向 9 个步骤组件钻取 53 个 props。

**Decision**: 引入 React Context + useReducer，每个步骤通过 selector 订阅自己的数据切片。

**Consequences**:

- Prop 数量: 53 → 1
- 重渲染级联消除
- 学习成本: selector 模式需适应

---

## ADR-002: 收敛重复类型到 shared/types/

**Status**: ✅ Accepted (v3.0)

**Context**: 核心层与特征层存在大量重复类型定义。

**Decision**: 将所有类型统一收敛到 `shared/types/`，通过 barrels 导出。

---

## ADR-003: 移除无用构建/测试配置

**Status**: ✅ Accepted (v3.0)

**Context**: 历史遗留的构建/test配置占据大量文件。

**Decision**: 清理死配置，减少构建时间。

---

## ADR-004: 拒绝 TauriService SRP 拆分

**Status**: ❌ Rejected (v3.0)

**Context**: 有人提议将 TauriService 按职责拆分。

**Decision**: 现有单文件门面已足够清晰，过度拆分会增加复杂度。

---

## ADR-005: 拒绝 PropertyPanel 受控输入迁移

**Status**: ❌ Rejected (v3.0)

**Context**: 有人提议将 PropertyPanel 的输入改为受控组件。

**Decision**: 现有非受控模式配合 Form 库已满足需求，迁移成本 > 收益。
