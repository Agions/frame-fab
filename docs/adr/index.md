# Architecture Decision Records (ADR)

> 记录 Story Weaver v3.0 重构中的关键架构决策及其理由。

| #                                                          | 标题                                             | 状态        | 日期    |
| ---------------------------------------------------------- | ------------------------------------------------ | ----------- | ------- |
| [001](./001-project-edit-context.md)                       | Replace 53-prop Drilling with ProjectEditContext | ✅ Accepted | 2026-07 |
| [002](./002-type-consolidation-shared-types.md)            | Consolidate Duplicate Types into `shared/types/` | ✅ Accepted | 2026-07 |
| [003](./003-dead-config-removal.md)                        | Remove Dead Build/Test Configuration             | ✅ Accepted | 2026-07 |
| [004](./004-reject-tauri-service-split.md)                 | Reject TauriService SRP Split                    | ❌ Rejected | 2026-07 |
| [005](./005-reject-property-panel-controlled-migration.md) | Reject PropertyPanel Controlled Input Migration  | ❌ Rejected | 2026-07 |

## 用途

每个 ADR 回答一个问题：**为什么这样设计？**

格式遵循 [Michael Nygard 的 ADR 模板](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)：

1. **Status** — Accepted / Rejected / Deferred
2. **Context** — 问题是什么？约束条件？
3. **Decision** — 选择是什么？
4. **Consequences** — 正面和负面影响？
