# Week 3｜加分挑战｜TaskChain 项目流程图

> 最小闭环：用户输入 → AI Agent 处理 → Web3 机制 → 链上/SDK调用 → 输出结果 → 验证材料

---

## 一、完整流程图（ASCII）

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TaskChain 最小闭环 │
└─────────────────────────────────────────────────────────────────────────────┘

                       ╔═══════════════════════════════╗
                        ║          用户输入层 ║
                        ║  （主人发起任务请求）           ║
                        ╚═════════════╦═════════════════╝
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AI Agent 处理层（Main Agent）                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. 理解意图（LLM 解析自然语言）                                        │   │
│  │ 2. 拆解任务（并行/串行依赖）                                           │   │
│  │ 3. 分配子 Agent（Data Agent / Translator Agent）                      │   │
│  │ 4. 协调时序（等待、催促、超时处理）                                    │   │
│  │ 5. 汇总结果（整合子 Agent 输出） │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                   ┌─────────────────────────┼─────────────────────────┐
                   │                         │                         │
                   ▼                         ▼                         ▼
┌───────────────────────┐  ┌─────────────────────────────────┐  ┌───────────────┐
│   Web3 机制层          │  │  链上调用层 │  │  SDK/工具层  │
│                        │  │                                 │  │              │
│ • 资金托管 │  │  TaskChain.sol                  │  │ • MCP SDK    │
│ • 哈希验证             │  │                                 │  │ • Hardhat    │
│ • 自动放款             │  │  createTask()                   │  │ • MetaMask   │
│ • 不可篡改日志 │  │      ↓ │  │ • RPC │
│                        │  │  lockFund()                     │  │              │
│                        │  │      ↓                          │  │              │
│                        │  │  submitHash()                   │  │              │
│                        │  │      ↓                          │  │              │
│                        │  │  verifyHash() ──→ payout()      │  │              │
│                        │  │      ↓ ↓           │  │              │
│                        │  │  refund()         5 USDC 转账   │  │              │
│                        │  │                                 │  │              │
│                        │  └──────────────┬──────────────────┘  │              │
└────────────────────────┘ │                       └──────────────┘
                                          │
                                          ▼
                        ┌─────────────────────────────────┐
                        │ Polygon Amoy 测试网       │
                        │  （Transaction Hash 可追溯）    │
                        └─────────────────────────────────┘
                                          │
                                          ▼
                        ┌─────────────────────────────────┐
                        │           输出结果层 │
                        │  • 任务结果数据 │
                        │  • Transaction Hash列表 │
                        │  • USDC 转账凭证 │
                        └─────────────────────────────────┘
                                          │
                                          ▼
                        ┌─────────────────────────────────┐
                        │          验证材料层 │
                        │  • 区块浏览器截图（tx hash） │
                        │  • Hardhat test 通过截图 │
                        │  • MCP 通信日志                  │
                        │  • Demo 视频 │
                        └─────────────────────────────────┘
```

---

## 二、核心闭环详解（Step by Step）

```
Step 1：用户输入
─────────────────────────────────────────────
主人（自然语言） 「获取 ETH 的 TVL 历史走势，预算 5 USDC」
         │
         ▼
         │
Step 2：Main Agent 理解 + 拆解
─────────────────────────────────────────────
Main Agent（LLM 解析）
         │意图理解：用户需要 ETH TVL 数据
         │  任务拆解：
         │    • 子任务 1：获取 ETH TVL 数据（Data Agent）
         │    • 依赖关系：无（可并行）
         │    • 预算：5 USDC
         │    •验证方式：SHA-256 哈希匹配
         ▼
Step 3：Web3 机制 — 资金锁定
─────────────────────────────────────────────
Main Agent → TaskChain.sol
         │  调用：createTask(dataAgent, 5 USDC, expectedHash)
         │  调用：lockFund(taskId, { value: 5 USDC })
         │
         ▼  链上状态：FUNDED
         │  合约持有 5 USDC（托管）
         ▼
Step 4：SDK/工具层 — Agent通信
─────────────────────────────────────────────
Main Agent ──MCP──→ Data Agent
         │  发送任务请求（TVL 数据获取）
         │
         ▼
Data Agent
         │  调用工具：fetch_decentralized_data("ETH TVL")
         │  返回：TVL 数据（JSON）
         │  调用工具：sha256_hash(TVL_data)
         │  返回：submittedHash = 0xabc123...
         │
         ▼
         │
Step 5：链上调用 — 哈希提交 + 验证
─────────────────────────────────────────────
Data Agent ──链上──→ TaskChain.sol
         │  调用：submitHash(taskId, submittedHash)
         │
         ▼
Main Agent / 预言机
         │  调用：verifyHash(taskId)
         │
         ▼  合约内验证
         │  expectedHash == submittedHash ?
         │
         ├─→ 【匹配】→ 触发：payout() → 5 USDC → Data Agent
         │
         └─→ 【不匹配】→ 触发：refund() → 5 USDC → 主人
         │
Step 6：输出结果
─────────────────────────────────────────────
Main Agent → 主人
         │  返回：TVL 数据 + transaction hash
         │  主人账户余额：95 USDC（-5 USDC）
         │
         ▼
         │
Step 7：验证材料
─────────────────────────────────────────────
• Polygon Scan 截图：lockFund transaction（锁定 5 USDC）
• Polygon Scan 截图：payout transaction（转出 5 USDC）
• Hardhat test 截图：verifyHash() 通过
• MCP 通信日志：Main Agent ↔ Data Agent 消息记录
• Demo 视频：全流程跑通
```

---

## 三、验证材料清单

| 验证材料 | 来源 | 证明什么 |
|---------|------|---------|
| **lockFund tx hash** | Polygon Scan | 合约持有 5 USDC |
| **submitHash tx hash** | Polygon Scan | Data Agent 提交了哈希 |
| **payout tx hash** | Polygon Scan | 验证通过，5 USDC 已转出 |
| **Hardhat test 结果** | 本地测试 | 合约逻辑正确 |
| **MCP 通信日志** | Main Agent 控制台 | Agent 间通信正常 |
| **Demo 视频** | 屏幕录制 | 端到端全流程跑通 |

---

## 四、闭环的关键节点

```
【输入】自然语言需求
    ↓
【Agent拆解】意图理解 + 任务规划
    ↓
【链上锁定】createTask() + lockFund() — 资金安全托管
    ↓
【Agent协作】MCP 通信 +工具调用 — 任务执行
    ↓
【链上验证】submitHash() + verifyHash() — 结果验证
    ↓
【自动放款】payout() — 验证通过自动释放资金
    ↓
【输出】任务结果 + transaction hash
    ↓
【验证材料】区块浏览器截图 + 测试日志 + Demo视频
    ↓
    【闭环】← 用户看到结果，闭环完成
```

---

## 五、MVP 闭环 vs 完整闭环

### MVP 闭环（Week 4 Hackathon）

```
用户输入 → Main Agent →合约锁定 → Data Agent 交付 → 合约验证 → 自动放款 → 结果返回
（自然语言）  （拆解任务）  （5 USDC）   （哈希）      （SHA-256）   （USDC 转账）
```

**验证材料**：transaction hash + 区块浏览器截图

### 完整闭环（Week 5+）

```
用户输入 → Main Agent → 合约锁定 → Data Agent 交付 → Chainlink Functions验证 → 自动放款 → 结果返回
（自然语言）  （拆解任务）  （5 USDC）   （数据）    （DON 多节点聚合）  （USDC 转账）
```

**额外验证材料**：Chainlink Functions 执行日志 + DON节点签名

---

## 六、闭环的风险控制节点

```
异常场景1：哈希不匹配
Main Agent ──refund()──→合约 ──5 USDC 退回──→ 主人
         │  5 USDC 未丢失，返回给主人
         ▼

异常场景 2：Data Agent 超时
Main Agent ──timeoutRefund()──→ 合约 ──5 USDC 退回──→ 主人
         │  72h 内未交付，超时自动退款
         ▼

异常场景 3：Main Agent 崩溃
Cobo Agentic Wallet ──自动冻结──→ 主人可接管
         │  Agent 钱包可被主人冻结
         ▼

异常场景 4：合约暂停
Ownable.pause() ──所有操作锁定──→ 资金安全直到解暂停
         │  紧急情况下主人可暂停合约
         ▼
```

---

*文档版本：v1.0 | 日期：2026/06/08 | TaskChain 最小闭环流程图*