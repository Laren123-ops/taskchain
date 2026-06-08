# Cobo｜Agentic Economy × TaskChain 集成分析

> 如果选择 Cobo 作为 Sponsor，分析 AI Agent 如何在可控边界内持有钱包、管理预算、执行支付/交易/资源采购，并如何记录风险边界。

---

## 一、Cobo Agentic Wallet 是什么？

### 产品定位

Cobo Agentic Wallet 是面向 AI Agent 的链上钱包基础设施，核心解决：

**AI Agent 持有和使用数字资产的问题**——AI Agent 可以：
- 持有钱包（而不是人类持有）
- 在预设边界内执行转账、支付、资源采购
- 所有操作被记录、审计、可追踪

### 与 TaskChain 的关系

TaskChain 的主 Agent 需要持有 USDC 钱包、对外支付给 Data Agent。Cobo Agentic Wallet 为这种场景提供了**合规且可审计**的解决方案。

---

## 二、AI Agent 在 TaskChain 中如何持有钱包

### 当前设计（无 Cobo）

```
主人 MetaMask → 充值100 USDC
    ↓
主 Agent 操作主人的钱包（需要主人签名每次操作）
```

问题：主 Agent 无法自主持有资产，每次操作都需要人类授权。

### 使用 Cobo Agentic Wallet 后的设计

```
主人 Cobo Agentic Wallet（持有 100 USDC）
    ↓
给主 Agent 分配子钱包（预算：10 USDC / 次任务）
    ↓
主 Agent 自主执行：锁定5 USDC → 放款给 Data Agent
    ↓
所有操作记录在 Cobo 审计日志中
```

**优势**：
- 主 Agent 有独立钱包，不需要人类每次签名
- 主人可以设置预算边界（单次最大支付限额）
- 操作可审计，不可否认

---

## 三、在可控边界内管理预算

### Cobo 的边界控制机制（推测）

| 边界类型 | 说明 | TaskChain 场景 |
|---------|------|---------------|
| **预算上限** | Agent 钱包只能花设定金额 | 主 Agent 每次任务最多锁定 10 USDC |
| **交易白名单** | 只允许和特定合约交互 | 只能和 TaskChain 合约交互，不能转给未知地址 |
| **时间窗口** | 操作只能在特定时间执行 | 任务有效期内（72h）可操作，超时自动冻结 |
| **操作审计** | 所有操作记录上链或 Cobo 云端 | 每次 lockFund / payout / refund都有日志 |

### TaskChain 的预算边界设计

```
主人给主 Agent 的预算设置：
├── 单次任务最大预算：10 USDC
├── 单日最大任务数：10 次
├── 允许交互的合约：TaskChain 合约地址（白名单）
├── 允许接收的地址：已注册的 Data Agent 地址（白名单）
└── 超时自动退款：任务创建后 72h 未完成，自动触发 refund
```

---

## 四、执行支付 / 交易 / 资源采购

### 支付场景

**场景1：锁定资金给 Data Agent**

```
正常流程：
Main Agent（通过 Cobo Agentic Wallet）
    → 调用 TaskChain 合约 lockFund()
    → 合约从主 Agent 钱包转出 5 USDC
    → 合约持有该 USDC，直到验证通过
    → 验证通过后，合约将 5 USDC 转给 Data Agent
```

**Cobo 的价值**：
- 主人不需要每次都手动签名
- Agent 在边界内自主执行，效率提升
- 每次 lockFund 都被 Cobo 记录（时间、金额、目标合约）

**场景 2：资源采购（支付 Data Agent 服务费）**

```
Main Agent → Cobo Agentic Wallet
    → 调用 TaskChain 合约 submitHash() + verifyHash()
    → 验证通过后合约自动 payout5 USDC 给 Data Agent
    → 主 Agent 无需手动转币，合约自动执行
```

**Cobo 的价值**：
- 资源采购的每一步都被 Cobo 记录
- 主人可以随时查看 Agent 花了多少钱、买了什么服务
- 如果发现异常，可以立即冻结 Agent 钱包

---

## 五、记录风险边界

### Cobo Agentic Wallet 的风险边界机制

| 风险类型 | Cobo 的防护 | TaskChain 中的体现 |
|---------|------------|-----------------|
| **Agent 越权操作** | 交易白名单限制 | Agent只能和 TaskChain 合约交互，不能转给其他地址 |
| **超出预算** | 单次/单日预算上限 | Agent 每次任务最多花 10 USDC，超出则拒绝 |
| **长时无活动** | 时间窗口限制 | 任务创建后 72h 未完成，钱包自动冻结 |
| **合约漏洞被利用** | 白名单 + 预算 | Agent 钱包只能和已验证的合约交互，减小攻击面 |
| **私钥泄露** | Cobo MPC 托管 | Agent 钱包私钥由 Cobo MPC 管理，不暴露在代码里 |

### TaskChain 的风险边界记录

```solidity
// TaskChain 合约中的风险边界设计

struct AgentBudget {
    uint256 maxTaskBudget;      // 单次任务最大预算
    uint256 dailyTaskLimit;     // 单日最大任务数
    uint256 totalSpentToday;     // 今日已花金额
    uint256 lastResetTimestamp; // 上次重置时间戳
    bool isActive;               // 钱包是否活跃
}

// Cobo Agentic Wallet 端的风险边界
// 主人可以在 Cobo 后台设置：
// - maxTaskBudget = 10 USDC（单次任务上限）
// - dailyTaskLimit = 10（每天最多 10 个任务）
// - allowedContracts = [TaskChain 合约地址]
// - allowedReceivers = [已注册的 Data Agent 白名单]
```

---

## 六、Cobo 与 TaskChain 的集成架构

```
┌──────────────────────────────────────────────────────┐
│ Cobo Agentic Wallet               │
│  ┌────────────────────────────────────────────────┐  │
│  │ 主人控制面板 │  │
│  │ ├── 设置 maxTaskBudget: 10 USDC │  │
│  │ ├── 设置 allowedContracts: [TaskChain 合约]    │  │
│  │ ├── 设置 allowedReceivers: [Data Agent 白名单] │  │
│  │ ├── 查看 Agent 操作审计日志                    │  │
│  │ └── 随时冻结 / 解冻 Agent 钱包                 │  │
│  └────────────────────────────────────────────────┘  │
│                        │                              │
│  ┌─────────────────────▼──────────────────────────┐  │
│  │  主 Agent 钱包（由 Cobo MPC 托管）              │  │
│  │  ├── 持有 USDC 余额                           │  │
│  │  ├── 自主调用 TaskChain 合约                  │  │
│  │  ├── 在边界内执行 lockFund / payout           │  │
│  │  └── 所有操作带 Cobo 签名证明 │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│               Polygon Amoy 测试网                    │
│  ┌────────────────────────────────────────────────┐  │
│  │ TaskChain.sol                                 │  │
│  │  ├── createTask() → 锁定 5 USDC              │  │
│  │  ├── submitHash() → Data Agent 交付数据      │  │
│  │  ├── verifyHash() → 验证通过               │  │
│  │  └── payout() → 自动放款给 Data Agent        │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Data Agent 钱包   │
              │ （收到 5 USDC） │
              └──────────────────────┘
```

---

## 七、与 Sponsor 的问题清单（如果选 Cobo）

如果选择 Cobo 作为 Sponsor，建议向 Cobo 团队请教：

### 问题 1：Agent钱包的权限控制粒度

> Cobo Agentic Wallet 支持哪些维度的权限控制？
>能否具体到"单次任务最多 10 USDC" + "只能和 TaskChain 合约交互"这样的细粒度？

### 问题 2：链下审计日志的完整性

> Agent 执行交易后，Cobo 记录哪些字段？
> 能否导出包含 transaction hash、时间戳、金额、目标合约、操作类型的完整日志？

### 问题 3：合约调用时的签名机制

> Agent 调用 TaskChain 合约时，是 Cobo MPC 自动签名，还是需要主人预先授权？
> 如果是自动签名，签名权限如何安全地授予 Agent 而不泄露私钥？

---

## 八、Demo 演示方案（如果选 Cobo）

**Week 4 Demo**：展示主 Agent 通过 Cobo Agentic Wallet 自主完成一次任务支付

```
1. 展示 Cobo 后台：主人设置 Agent 预算（10 USDC / 次任务）
2. 展示 Cobo 后台：主人设置合约白名单（TaskChain 合约地址）
3. 主 Agent 发起任务：调用 createTask() + lockFund()
4. 展示 Cobo 审计日志：记录了 lockFund 的 transaction hash、时间戳、金额
5. Data Agent 交付数据，合约验证通过，自动放款
6. 展示 Cobo 审计日志：记录了 payout 的 transaction hash
7. 主人查看日志，确认所有操作在边界内
```

---

*文档版本：v1.0 | 日期：2026/06/08 | Cobo Agentic Wallet 分析*