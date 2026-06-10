# Cobo 赛道 Hackathon 提交包

> 项目：TaskChain | 赛道：Agentic Economy × Cobo Agentic Wallet | Solo 参赛

---

## 一、项目名称与一句话简介

**项目名称**：TaskChain — 多 Agent 协作的 Web3 任务分发网络

**一句话简介**：AI Agent 通过智能合约自主锁定资金、验证交付物并自动结算，让"雇 Agent做事"像付款一样简单可信。

---

## 二、GitHub Repo

**仓库地址**：https://github.com/Laren123-ops/taskchain

**README 核心内容**：

```
README.md          — 项目说明（problem/track/MVP flow/tech stack/risks/validation）
SPEC.md            — 完整技术规范（合约接口/状态机/验收标准 AC-1~AC-6）
contracts/
  TaskChain.sol    — 主合约（资金锁定/哈希验证/自动放款）
scripts/
  deploy.ts        — 部署脚本
test/
  TaskChain.test.ts — 5 个核心测试用例
proposal.md        — 1 页 Proposal（问题/用户/场景/功能/验证/风险/赛道）
assumptions-and-risks.md — 前提假设/失败点/ fallback plan
sdk-integration-plan.md — SDK接入计划（含 Cobo CAW 接入方案）
cobo-agentic-wallet-analysis.md — Cobo Agentic Wallet 深度分析
out-of-scope.md — 砍掉功能声明
flow-diagram.md   — 完整闭环流程图
tech-verification-plan.md — Week 4 技术验证计划
week4-daily-plan.md — Hackathon 每日计划
week2-weekly-reflection.md — Week 2 学习反思
ai-web3-deep-note.md — AI×Web3 深度笔记
ai-web3-second-note.md — AI×Web3 第二篇深度笔记
```

**核心文件直链**：

- README：https://github.com/Laren123-ops/taskchain/blob/main/README.md
- SPEC：https://github.com/Laren123-ops/taskchain/blob/main/SPEC.md
- Proposal：https://github.com/Laren123-ops/taskchain/blob/main/proposal.md
- Cobo 分析：https://github.com/Laren123-ops/taskchain/blob/main/cobo-agentic-wallet-analysis.md
- SDK 接入计划：https://github.com/Laren123-ops/taskchain/blob/main/sdk-integration-plan.md

---

## 三、技术架构

### 整体架构

```
主人（充值 USDC）
    ↓
主 Agent（通过 Cobo Agentic Wallet 持有预算）
    ↓  MCP 协议
数据 Agent（交付数据 + 哈希）
    ↓ 链上调用
TaskChain.sol（Polygon Amoy）
    ├── createTask()      锁定预算
    ├── lockFund()         托管 USDC
    ├── submitHash()       提交 SHA-256 哈希
    ├── verifyHash()       验证哈希
    └── payout()         验证通过自动放款
    ↓
数据 Agent 收到 USDC（通过 Cobo Agentic Wallet 接收）
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| AI 模型 | Claude API | 主 Agent 和子 Agent 的大脑 |
| Agent协议 | MCP SDK | Main Agent ↔ Data Agent 通信 |
| 链 | Polygon Amoy | 测试网，低 Gas |
| 合约语言 | Solidity ^0.8.20 | 智能合约开发 |
| 合约框架 | Hardhat + OpenZeppelin | 编译/部署/测试 |
| Agent 钱包 | Cobo Agentic Wallet | AI Agent 持有和管理资金 |
| 预言机 | 手动哈希验证（Week 5+ Chainlink） | 数据验证 |

### Cobo Agentic Wallet 在项目中的角色

| 功能 | Cobo 实现 |
|------|---------|
| **预算管理** | 主人给主 Agent 设置 maxTaskBudget（10 USDC） |
| **权限控制** | allowedContracts 白名单（只能和 TaskChain 合约交互） |
| **安全隔离** | Agent 钱包由 Cobo MPC 托管，主人可随时冻结 |
| **审计日志** | Cobo 记录所有操作（tx hash / 时间戳 / 金额） |
| **资金接收** | Data Agent 通过自己的 Cobo 钱包接收 payout |

---

## 四、核心流程 Demo 说明（3~5 分钟演示）

### 演示步骤

```
Step 1（0:00-0:30）：展示 Cobo 后台
  → 主 Agent 钱包预算设置（10 USDC / 次任务）
  → 合约白名单配置（TaskChain 合约地址）

Step 2（0:30-1:00）：主 Agent 发起任务
  → 调用 createTask() + lockFund()
  → 合约锁定 5 USDC
  → 展示 Polygon Scan transaction hash

Step 3（1:00-2:00）：数据 Agent 交付
  → MCP 通信日志（Main Agent → Data Agent）
  → Data Agent 提交 SHA-256 哈希

Step 4（2:00-3:00）：合约验证 + 自动放款
  → verifyHash() 通过
  → payout() 自动触发
  → 展示 Polygon Scan payout transaction

Step 5（3:00-4:00）：Cobo 审计日志
  → 展示 Cobo 后台操作记录
  → lockFund / submitHash / payout 全记录

Step 6（4:00-5:00）：异常场景
  → 哈希不匹配 → refund() 退款
  → 展示 Polygon Scan refund transaction
```

### Demo 视频链接
（Hackathon 期间录制后填入）

---

## 五、链上 / 测试网证据

### 合约信息

| 字段 | 内容 |
|------|------|
| **合约地址** | （Day 1 部署后填入） |
| **测试网** | Polygon Amoy |
| **合约编译器** | Solidity ^0.8.20 |

### 测试网交易记录

| 交易类型 | Transaction Hash | 状态 |
|---------|----------------|------|
| createTask | （Day 1 填入） | ✅ |
| lockFund | （Day 3 填入） | ✅ |
| submitHash | （Day 3 填入） | ✅ |
| verifyHash + payout | （Day 3 填入） | ✅ |
| refund（异常场景） | （Day 4 填入） | ✅ |

### Agent Wallet 信息

| 字段 | 内容 |
|------|------|
| **主 Agent 钱包地址** | （Cobo 申请后填入） |
| **数据 Agent 钱包地址** | （Cobo 申请后填入） |
| **测试环境** | Polygon Amoy 测试网（非真钱） |

---

## 六、团队信息

| 角色 | 姓名 | 钱包地址 | 联系方式 |
|------|------|---------|---------|
| 负责人 | mia | （MetaMask 地址） | mia / 2952188097@qq.com |

**团队形式**：单人参赛

**分工**：所有模块由本人负责（智能合约 / Agent 通信 / Demo演示 / 文档）

---

## 七、基本合规与安全边界

### 安全边界

| 边界类型 | 设置 |
|---------|------|
| **资金边界** | 单次任务最多 10 USDC（由主人设置） |
| **合约边界** | Agent 只能和 TaskChain 合约交互（白名单） |
| **地址边界** | Agent 只能向已注册的 Data Agent 白名单地址放款 |
| **时间边界** | 任务 72h 超时自动触发 timeoutRefund() |
| **暂停边界** | 合约由 Owner持有，可随时 pause() |

### 失败处理

| 场景 | 处理方式 |
|------|---------|
| 哈希不匹配 | 状态变为 FAILED，主人调用 refund() 全额退款 |
| Agent 超时 | 72h 后任何人可调用 timeoutRefund()，自动退款 |
| 合约异常 | OpenZeppelin Pausable保护，Owner 可暂停所有操作 |
| Cobo 钱包冻结 | 主人可在 Cobo 后台随时冻结 Agent 钱包 |

### 人工介入条件

| 场景 | 是否需要人工介入 |
|------|----------------|
| 正常验证通过放款 | 不需要，合约自动执行 |
| 哈希不匹配退款 | 需要主人调用 refund()（可委托 Agent） |
| 超时退款 | 不需要，任何人可触发 timeoutRefund() |
| 合约暂停 | 需要 Owner 调用 pause() |
| 资金异常 | 主人可随时冻结 Agent 钱包 |

### 测试环境声明

- 所有链上操作在 **Polygon Amoy 测试网**完成
- 测试网 USDC 为水龙头免费领取，非真实资产
- Hackathon 期间不涉及主网资产

### 使用第三方工具说明

| 工具 | 用途 | 说明 |
|------|------|------|
| Claude API | AI Agent 大脑 | Anthropic 官方 API |
| MCP SDK | Agent 间通信协议 | Anthropic 官方 |
| Hardhat | 合约编译部署 | Nomic Foundation |
| OpenZeppelin | 安全组件 | ReentrancyGuard / Pausable |
| Polygon Amoy | 测试网 | Polygon 官方测试网 |
| Cobo Agentic Wallet | Agent 钱包 | Cobo 官方 SDK |

---

## 八、当前完成度与后续计划

### 当前完成度

| 模块 | 状态 | 说明 |
|------|------|------|
| 合约代码 | ✅ 完成 | TaskChain.sol 已编写，含测试用例 |
| README / SPEC | ✅ 完成 | 完整文档 |
| Proposal | ✅ 完成 | 1 页版本 |
| Cobo集成方案 | ✅ 设计 | 接入方案已设计，Week 5+ 实施 |
| MCP Agent 通信 | 🔧 进行中 | Day 2 完成 |
| 测试网部署 | 🔧 进行中 | Day 1 完成 |
|端到端 Demo | 🔧 进行中 | Day 3 目标 |

### 后续计划

| 时间 | 任务 |
|------|------|
| Day 1（今天） | 部署合约到 Amoy，获取合约地址 |
| Day 2 | MCP 协议两个 Agent 通信跑通 |
| Day 3 | 全链路（锁定→验证→放款）真实上链 |
| Day 4 | 容错场景测试 + Cobo 钱包集成方案设计 |
| Day 5 | 前端仪表盘 + Cobo 接入 |
| Day 6 | 全流程彩排 + Demo 录制 |
| Day 7 | 收尾 + 提交 |

---

*提交版本：v1.0 | 日期：2026/06/10 | by mia*