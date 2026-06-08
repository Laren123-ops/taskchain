# Z.AI｜Web3 × Long-Horizon Task 分析

> 如果选择 Z.AI 作为 Sponsor，说明 TaskChain 项目中 AI Agent 如何拆解复杂任务、持续调用工具、迭代修复，并完成从需求到交付的 Web3 工作流。

---

## 一、Z.AI 与 Long-Horizon Task 的关系

### Z.AI 是什么？

Z.AI 是一个面向 Web3 场景的 AI Agent 开发平台，核心解决：

**AI Agent 如何完成「复杂、长时间、多步骤」的任务**——不同于简单的单次问答，Long-Horizon Task 需要 AI自主规划任务拆解、持续调用工具、处理异常、迭代修复。

### 为什么 Long-Horizon Task 对 Web3 重要？

Web3 场景下的任务天然具有 Long-Horizon 属性：
- **DeFi 策略研究**：需要持续监控多个协议、数据清洗、多轮模拟
- **DAO 提案分析**：需要读取链上数据、分析历史投票、模拟提案影响
- **TaskChain 任务分发**：需要拆解需求、调用多个 Agent、处理验证失败、迭代修复

---

## 二、TaskChain 中的 AI Agent 架构

### 角色分工

| Agent | 角色 | 核心能力 |
|-------|------|---------|
| **Main Agent** | 任务协调者 | 理解需求 → 拆解子任务 → 分发给子 Agent → 汇总结果 |
| **Data Agent** | 数据获取者 | 调用 API →抓取数据 →提交哈希 |
| **Translator Agent** | 翻译处理者 | 接收数据 → 翻译 → 返回结果（Week 5+） |

### 三个 Agent 如何协作

```
主人（发起需求）
    ↓
Main Agent（理解 + 拆解）
    ↓
├── Data Agent（获取数据）──→ 提交哈希到合约
└── Translator Agent（翻译）──→ 交付结果
    ↓
Main Agent（汇总 + 交付）
    ↓
合约（验证 + 放款）
```

---

## 三、AI Agent 如何拆解复杂任务

### 任务拆解原则

Main Agent 收到主人需求后，会将任务按以下维度拆解：

| 拆解维度 | 说明 | TaskChain 示例 |
|---------|------|---------------|
| **依赖关系** | 哪些子任务必须串行，哪些可以并行 | 数据获取完成前不能翻译 |
| **资源预算** | 每个子任务需要多少 USDC | Data Agent 任务：5 USDC |
| **时间约束** | 每个子任务的 deadline | Data Agent：2h 内交付 |
| **验证方式** | 如何判断子任务完成 | SHA-256 哈希匹配 |

### 任务拆解示例

**需求**：主人说"给我一份 ETH/WBTC 波动率分析报告，附中文翻译"

```
Main Agent 拆解：
Step 1：[Data Agent] 获取 ETH 历史价格数据
Step 2：[Data Agent] 获取 WBTC 历史价格数据
Step 3：[Main Agent] 计算波动率（ETH + WBTC）
Step 4：[Translator Agent] 翻译成中文
Step 5：[Main Agent] 汇总报告，交付给主人

并行优化：Step 1 和 Step 2 可并行执行（无依赖）
串行依赖：Step 4 必须在 Step 3 之后
```

---

## 四、持续调用工具

### Tool Calling 在 TaskChain 中的体现

Main Agent 不是一个单一的 LLM 调用，而是一个持续调用工具的循环：

```
Main Agent Loop：
┌─────────────────────────────────────────┐
│ 1. 理解主人需求                         │
│ 2. 拆解任务，决定调用哪些工具 │
│ 3. 调用 Tool（API / 合约 / 子 Agent）   │
│ 4. 收集结果，评估是否需要迭代           │
│ 5. 如果失败 → 修复后重试                │
│ 6. 如果成功 → 继续下一步 │
│ 7. 所有子任务完成 → 交付结果 │
└─────────────────────────────────────────┘
```

### TaskChain 中的 Tool列表

| Tool | 调用者 | 功能 |
|------|--------|------|
| `createTask()` | Main Agent | 创建任务，锁定预算 |
| `lockFund()` | Main Agent | 锁定 USDC 到合约 |
| `submitHash()` | Data Agent | 提交数据哈希 |
| `verifyHash()` | Main Agent / 预言机 | 验证哈希 |
| `payout()` | 合约自动触发 | 验证通过后自动放款 |
| `refund()` | Main Agent | 验证失败时触发退款 |
| `fetch_decentralized_data()` | Data Agent | 从 DeFiLlama 等获取链外数据 |
| `sha256_hash()` | Data Agent | 对数据生成哈希 |

### Tool Calling 循环示例

```
主人：获取 ETH 的 TVL 历史数据

Main Agent：
Loop Start
│
├─ Tool: fetch_decentralized_data("ETH TVL")
│   └─ 返回：TVL 数据（JSON）
│
├─ Tool: sha256_hash(TVL_data)
│   └─ 返回：0xabc123...
│
├─ Tool: createTask(dataAgent, 5 USDC, expectedHash)
│   └─ 返回：taskId = 0
│
├─ Tool: lockFund(taskId, 5 USDC)
│   └─ 返回：transaction hash
│
├─ Tool: submitHash(taskId, submittedHash)
│   └─ 返回：transaction hash
│
├─ Tool: verifyHash(taskId)
│   └─ 返回：true（匹配）
│
├─ Tool: payout(taskId)
│   └─ 合约自动触发，5 USDC 转给 Data Agent
│
└─ Loop End → 汇总结果给主人
```

---

## 五、迭代修复机制

### 迭代修复的场景

| 场景 | 迭代修复逻辑 |
|------|-------------|
| **Data Agent 数据获取失败** | Main Agent 重试（最多 3 次），每次间隔 5 分钟 |
| **哈希不匹配** | Main Agent 调用 refund() 退款，重新发起任务 |
| **子 Agent 超时** | Main Agent 取消任务，触发 timeoutRefund() |
| **Gas 费预估错误** | Main Agent 调整 gas limit，重新发送交易 |

### 迭代修复的代码逻辑（伪代码）

```typescript
async function executeTaskWithRetry(task: Task, maxRetries: number = 3) {
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            // 1. 尝试创建任务
            const taskId = await contract.createTask(...);

            // 2. 尝试锁定资金
            await contract.lockFund(taskId, { value: budget });

            // 3. 等待 Data Agent 交付
            const result = await waitForDataAgent(taskId, timeout: 2 * 3600);

            // 4. 验证哈希
            const verified = await contract.verifyHash(taskId);

            if (verified) {
                return { success: true, taskId };
            } else {
                // 5. 验证失败：退款并重试
                await contract.refund(taskId);
                attempts++;
                console.log(`验证失败，重试 ${attempts}/${maxRetries}`);
            }
        } catch (error) {
            // 6. 异常：记录错误并重试
            attempts++;
            console.error(`执行异常: ${error.message}`);
            if (attempts >= maxRetries) {
                return { success: false, error: error.message };
            }
        }
    }
}
```

### 迭代修复的时序图

```
Main Agent                   合约                   Data Agent
    │                          │                       │
    │── createTask() ─────────▶│ │
    │── lockFund() ───────────▶│                       │
    │                          │                       │
    │── submitHash() ──────────────────────────────▶   │
    │                          │                       │
    │── verifyHash() ─────────▶│                       │
    │                          │                       │
    │◀──验证失败！────────────│ │
    │── refund() ─────────────▶│                       │
    │                          │                       │
    │── 重试：submitHash() ─────────────────────────▶   │
    │                          │                       │
    │── verifyHash() ─────────▶│                       │
    │                          │                       │
    │◀── 验证成功！───────────│                       │
    │── payout() 自动触发 ────▶│                       │
    │                          │                       │
    │                          │◀── 5 USDC 转账 ───────│
    │                          │                       │
```

---

## 六、从需求到交付的完整 Web3 工作流

### 完整流程

```
阶段 1：需求理解
主人（自然语言）
    ↓
Main Agent（LLM 理解意图）
    ↓
拆解为：获取 ETH TVL → 计算 → 翻译 → 交付

阶段 2：任务分发
Main Agent → Data Agent（获取 TVL 数据）
Main Agent → Translator Agent（翻译，结果等待 Data Agent 完成）

阶段 3：链上交互
Main Agent → TaskChain 合约（锁定 5 USDC）
Data Agent → 提交数据 + SHA-256 哈希
合约 → 验证哈希（自动）
合约 → 验证通过，自动放款 5 USDC 给 Data Agent

阶段 4：结果交付
Main Agent ← Data Agent（返回数据）
Main Agent ← Translator Agent（返回翻译）
Main Agent → 主人（汇总报告）

阶段 5：结算
合约已释放 5 USDC 给 Data Agent
主人账户余额 -5 USDC
任务完成日志记录在链
```

---

## 七、与 Z.AI Sponsor 的问题清单

### 问题 1：Long-Horizon Task 的容错设计

> Z.AI Agent 在执行多步骤任务时，如何处理中间步骤失败而不影响整体任务？
> 是否有类似"任务快照 + 恢复"的机制？

### 问题 2：Tool Calling 的标准协议

> Z.AI Agent 调用链上合约（如 TaskChain）的工具集是否有标准？
> 还是需要为每个合约单独开发 adapter？

### 问题 3：多 Agent 协作的通信协议

> Z.AI 平台如何实现 Main Agent 和子 Agent（如 Data Agent）之间的通信？
> 是否支持 MCP 协议，或者有自己的 Agent 间通信标准？

---

## 八、Demo 演示方案（如果选 Z.AI）

**Week 4 Demo**：展示 Main Agent 拆解复杂任务 + 持续调用工具 + 迭代修复

```
1. 主人输入："获取 ETH 和 WBTC 的 TVL 对比分析报告"
2. Main Agent 展示任务拆解（2 个并行 + 1 个串行）
3. Main Agent 调用 fetch_decentralized_data() x2（并行）
4. Main Agent 调用 sha256_hash() x2
5. Main Agent 调用 createTask() + lockFund()
6.第一次 verifyHash() 失败（模拟数据不匹配）
7. Main Agent 展示迭代修复：调用 refund() →重新提交
8. 第二次 verifyHash() 成功，自动放款
9. Main Agent 汇总结果，展示给主人
```

---

*文档版本：v1.0 | 日期：2026/06/08 | Z.AI Long-Horizon Task 分析*