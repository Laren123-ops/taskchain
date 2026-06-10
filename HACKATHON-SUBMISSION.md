# TaskChain — Hackathon 完整提交包

> Cobo 赛道 | Agentic Economy × Cobo Agentic Wallet | Solo 参赛：mia

---

## 一、项目名称与一句话简介

**项目名称**：TaskChain — 多 Agent 协作的 Web3 任务分发网络

**一句话简介**：AI Agent 通过智能合约自主锁定资金、验证交付物并自动结算，让"雇 Agent 做事"像付款一样简单可信。

---

## 二、GitHub Repo

**仓库地址**：https://github.com/Laren123-ops/taskchain

###快速启动

```bash
git clone https://github.com/Laren123-ops/taskchain.git
cd taskchain
npm install
npx hardhat compile # 编译合约
npx hardhat test # 运行测试（4 passing）
npx hardhat node # 启动本地节点
npx hardhat run scripts/full-demo.ts  # 运行全链路 Demo
```

###核心文件

```
contracts/TaskChain.sol     — 主合约（资金锁定/哈希验证/自动放款）
test/TaskChain.test.ts      — 4 个测试用例（全部通过）
scripts/full-demo.ts        — 全链路演示脚本
scripts/deploy.ts          — 部署脚本
SPEC.md                    — 完整技术规范
proposal.md                — 1页 Proposal
cobo-agentic-wallet-analysis.md — Cobo 深度分析
```

---

## 三、技术架构

```
主人（充值 USDC）
    ↓
主 Agent（通过 Cobo Agentic Wallet 持有预算）
    ↓  MCP 协议
数据 Agent（交付数据 + 哈希）
    ↓ 链上调用
TaskChain.sol
    ├── createTask()      创建任务，锁定预算
    ├── lockFund() 托管 USDC
    ├── submitHash()      提交 SHA-256 哈希
    ├── verifyHash()       验证哈希
    └── payout()         验证通过自动放款
    ↓
数据 Agent 收到 USDC（通过 Cobo Agentic Wallet 接收）
```

### 技术栈

| 层级 | 技术 |
|------|------|
| AI 模型 | Claude API |
| Agent 协议 | MCP SDK |
| 链 | Hardhat Local（chainId: 31337）|
| 合约语言 | Solidity ^0.8.20 |
| 合约框架 | Hardhat + OpenZeppelin |
| Agent 钱包 | Cobo Agentic Wallet（设计阶段）|

---

## 四、全链路 Demo 运行结果

**合约地址**：0x5FbDB2315678afecb367f032d93F642f64180aa3

### 成功场景（Task 0）

```
Step 1: createTask()
  Tx: 0xace47416480b9fc0e1a1aba1a20cc220f4d3f23e3026b746b560326b960993f6
  Status: CREATED

Step 2: lockFund(5 USDC)
  Tx: 0x8f3a60926c89ea2fe5a7423022726a98e04f0673e01f2f5ed1583f21e81b3cd3
  Status: FUNDED

Step 3: submitHash()
  Tx: 0x64e960f20c334b1fbc074b5a67af8ddf37d03b4e541278374046222181888c6a
  Status: SUBMITTED

Step 4: verifyHash() → payout()
  Tx: 0x47df8bfb714153e1b9d71a72b22aed4a6cd13753df6a8f35ff86112b510c382a
  Status: VERIFIED → SubAgent 收到 5 USDC
```

### 失败场景（Task 1，验证哈希不匹配）

```
createTask → lockFund → submitHash(错误哈希) → verifyHash() → FAILED → refund() → REFUNDED
```

### 测试结果

```bash
$ npx hardhat test
  4 passing (384ms)
  ✔ should create a task
  ✔ should lock funds and update status to FUNDED
  ✔ should verify hash and payout to subAgent
  ✔ should refund when hash does not match
```

---

## 五、当前完成度与后续计划

### 当前完成度

| 模块 | 状态 |
|------|------|
| 合约代码 | ✅ 完成并部署 |
| 合约测试 | ✅ 4 个测试用例全部通过 |
| 全链路 Demo | ✅ 成功场景 + 失败场景跑通 |
| Cobo 集成方案 | ✅ 设计完成，待 Week 5+ 实施 |
| MCP Agent 通信 | 🔧 设计完成，待实现 |
| 测试网部署 | ⚠️ 待 Amoy 水龙头修复后部署 |

### 后续计划

| 时间 | 任务 |
|------|------|
| Week 5 |接入 Cobo Agentic Wallet |
| Week 5 | MCP协议两个 Agent 通信 |
| Week 6 | 测试网部署 + 前端仪表盘 |

---

## 六、团队信息

| 角色 | 姓名 | 联系方式 |
|------|------|---------|
| 负责人 | mia | 2952188097@qq.com |

---

## 七、安全边界与合规说明

### 安全边界

| 边界类型 | 设置 |
|---------|------|
| 资金边界 | 单次任务最多 10 USDC（由主人设置） |
| 合约边界 | Agent 只能和 TaskChain 合约交互（白名单） |
| 时间边界 | 72h 超时自动触发 timeoutRefund() |
| 暂停边界 | Owner 可随时 pause() 暂停所有操作 |
| 失败处理 | 哈希不匹配 → refund() 全额退款 |

### 合规说明

- **网络环境**：Hardhat 本地节点（测试环境，非主网）
- **资产**：使用本地模拟 ETH，无真实资产
- **第三方工具**：Hardhat / OpenZeppelin / ethers.js / Claude API / MCP SDK
- **数据安全**：私钥仅用于本地测试，从未离开本地环境

---

## 八、为什么选 Cobo 赛道

TaskChain 的核心是"AI Agent 管钱、花钱、赚钱"——通过智能合约锁定资金、验证后自动放款给 Data Agent。这正是 **Agentic Commerce** 的典型场景。

Cobo Agentic Wallet 为这种场景提供了：
- Agent 独立持有和管理资金
- 主人设置预算边界（单次最大支付限额）
- 所有操作带审计日志，可追溯

---

*by mia | 2026/06/11 | Hackathon Week 4*