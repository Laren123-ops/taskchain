# Week 3｜Sponsor SDK / API Integration Plan

> TaskChain 项目 Sponsor SDK / API 接入计划 | 2026/06/08

---

## 一、接什么

### SDK / API 接入清单

| SDK / API | Sponsor | 用途 | Week 4 优先级 |
|-----------|---------|------|-------------|
| **Polygon Amoy RPC** | Polygon | 合约部署 + 测试网交互 | P0（必须） |
| **Hardhat** | Polygon（内置） | 合约编译 + 部署 + 测试 | P0（必须） |
| **Chainlink Functions** | Chainlink | AI 数据可信上链（Week 5+） | P1（延后） |
| **Cobo Agentic Wallet** | Cobo | AI Agent 钱包管理（Week 5+） | P2（延后） |
| **Z.AI Agent SDK** | Z.AI | 多 Agent 协作编排（Week 5+） | P2（延后） |
| **MCP SDK** | Anthropic | Agent 间通信 | P0（必须） |

---

## 二、怎么接

### 2.1 Polygon Amoy RPC + Hardhat（P0 — 必须接入）

**接法**：

```bash
# 1. 安装依赖
npm install --save-dev hardhat @nomicfoundation/hardhat-ethers

# 2. 配置 hardhat.config.ts
# 在 networks.amoy 中配置 Polygon Amoy RPC
# RPC URL: https://rpc-amoy.polygon.technology
# Chain ID: 80002

# 3. 部署合约
npx hardhat run scripts/deploy.ts --network amoy

# 4. 验证合约
npx hardhat verify --network amoy <contract_address>
```

**关键配置**（hardhat.config.ts）：

```typescript
networks: {
  amoy: {
    url: process.env.RPC_URL,  // https://rpc-amoy.polygon.technology
    chainId: 80002,
    accounts: [process.env.PRIVATE_KEY],
  },
},
```

**使用场景**：
- Day 1：部署 TaskChain.sol 到 Amoy
- Day 3：调用 createTask()、lockFund()、verifyHash()、payout()
- 日常：查询合约状态、监听事件

---

### 2.2 MCP SDK（P0 — 必须接入）

**接法**：

```bash
# 1. 安装 MCP SDK
npm install @modelcontextprotocol/sdk

# 2. 搭建 Main Agent
import { Client } from '@modelcontextprotocol/sdk/client';

const mainAgent = new Client({
  name: 'taskchain-main-agent',
  version: '1.0.0',
});

await mainAgent.connect({
  transport: 'stdio',
  url: 'http://localhost:3001',  // Data Agent 地址
});

// 3. 定义 TaskChain 工具
const tools = [
  {
    name: 'createTask',
    description: '创建新任务并锁定 USDC',
    inputSchema: {
      type: 'object',
      properties: {
        subAgent: { type: 'string' },
        amount: { type: 'number' },
        expectedHash: { type: 'string' },
      },
    },
  },
  // ... 其他工具
];

await mainAgent.registerTools(tools);

// 4. 发送任务请求
const result = await mainAgent.callTool({
  name: 'createTask',
  arguments: { subAgent: dataAgentAddress, amount: 5, expectedHash: hash },
});
```

**使用场景**：
- Day 2：Main Agent → Data Agent 发送任务请求
- Data Agent 返回数据 +哈希
- Main Agent 汇总结果

---

### 2.3 Chainlink Functions（P1 — Week 5+ 接入）

**接法**：

```typescript
// 安装 Chainlink Functions
npm install @chainlink/contracts

// 在合约中引入
import { Functions } from '@chainlink/contracts/src/v0.8/functionsrugs.sol';

// 未来方向（Week 5）：
// Data Agent 将数据发送到 Chainlink Functions
// DON 网络执行验证，返回结果给合约
// 合约自动触发 payout()
```

**为什么 Week 4 不接**：
- Chainlink Functions 配置复杂，需要 DON节点配置和 LINK 代币
- Hackathon 期间用手动哈希提交已足够演示核心链路
-优先保核心链路（合约 + MCP），不冒技术风险

---

### 2.4 Cobo Agentic Wallet（P2 — Week 5+ 接入）

**接法**：

```typescript
// Cobo Agentic Wallet API接入
// 参考 Cobo 文档，调用其 Agent Wallet API

// 主人设置 Agent 预算
POST /api/v1/agent-wallets
{
  "budget": "10 USDC",
  "allowedContracts": ["0xTaskChainContract"],
  "allowedReceivers": ["0xDataAgentAddress"],
}

// Agent 查询余额
GET /api/v1/agent-wallets/{walletId}/balance

// Agent 执行交易
POST /api/v1/agent-wallets/{walletId}/send-transaction
{
  "to": "0xTaskChainContract",
  "data": "0x..."
}
```

**为什么 Week 4 不接**：
- 需要申请 Cobo 开发者账号和 API 权限
- 接入流程可能需要额外时间
- Hackathon 期间用普通 MetaMask 钱包替代

---

### 2.5 Z.AI Agent SDK（P2 — Week 5+ 接入）

**接法**：

```typescript
// Z.AI Agent SDK
// 用于多 Agent 长任务编排

import { ZAIAgent } from '@zai/agent-sdk';

const agent = new ZAIAgent({
  name: 'taskchain-main-agent',
  longHorizonTask: true,  // 启用长任务模式
});

await agent.defineTaskFlow([
  { name: 'fetch_data', tool: 'fetch_decentralized_data' },
  { name: 'hash_data', tool: 'sha256_hash' },
  { name: 'create_task', tool: 'createTask' },
  { name: 'lock_fund', tool: 'lockFund' },
  { name: 'verify', tool: 'verifyHash' },
]);

await agent.execute('获取 ETH TVL 数据');
```

**为什么 Week 4 不接**：
- Z.AI SDK 可能有学习曲线
- MCP 已覆盖 Agent 通信需求
- Week 4聚焦合约和基本 Agent 通信，不扩展

---

## 三、Week 4 是否能做完

| SDK / API | Week 4 能完成？ | 说明 |
|-----------|---------------|------|
| **Polygon Amoy + Hardhat** | ✅ 能完成 | 基础设旌，Day 1 必须搞定 |
| **MCP SDK** | ✅ 能完成 | Day 2 接入，Demo 前必须跑通 |
| **Chainlink Functions** | ❌延后 | Week 5+ 再接，Hackathon 用手动哈希替代 |
| **Cobo Agentic Wallet** | ❌ 延后 | Week 5+ 再接，Hackathon 用 MetaMask 替代 |
| **Z.AI Agent SDK** | ❌ 延后 | Week 5+ 再接，MCP 已覆盖 |

**Week 4 技术栈（最终确定）**：
```
链层：Polygon Amoy
合约：Solidity + Hardhat + OpenZeppelin
Agent通信：MCP SDK
AI 模型：Claude API（通过 MCP）
存储：IPFS（后续）
预言机：手动哈希（Week 5+ 升级 Chainlink）
钱包：MetaMask（Week 5+ 升级 Cobo）
```

---

## 四、如果接不通的 Fallback

### Fallback 1：Polygon Amoy 接不通

**触发**：RPC 连接超时 / 部署脚本报错

**Fallback**：
1. 先在 Hardhat 本地网络（localhost）完成全链路测试
2. 使用 Sepolia 测试网替代（需要调整 RPC 和 USDC 水龙头）
3. 录制 Hardhat 本地网络 Demo，备注「测试网环境待配置」

---

### Fallback 2：MCP SDK 接入失败

**触发**：TCP 连接失败 / 消息格式不匹配 / 超时

**Fallback**：
1. 降级为 HTTP REST API：Data Agent 提供简单的 HTTP 接口
2. Main Agent 用 `fetch()` 调用，替代 MCP 协议
3. 代码预留 MCP 升级接口（`// TODO: upgrade to MCP`）

```typescript
// HTTP Fallback 实现
async function callDataAgent(task: Task) {
  const response = await fetch('http://localhost:3001/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId: task.id, data: task.data }),
  });
  return response.json();
}
```

---

### Fallback 3：Chainlink Functions接入失败（Week 5+ 规划）

**触发**：DON节点配置错误 / LINK费用估算错误

**Fallback**：
1. 保持手动哈希提交作为主方案
2. Chainlink Functions 作为增强功能，不影响核心 Demo

---

## 五、SDK / API 接入优先级总览

```
Week 4（Hackathon 期间 — 必须完成）
├── Polygon Amoy RPC + Hardhat ✅
│   └── Day 1 部署合约到测试网
└── MCP SDK ✅
    └── Day 2 两个 Agent 通信

Week 5+（Hackathon 后 — 延后）
├── Chainlink Functions（链下验证自动化）
├── Cobo Agentic Wallet（AI Agent 钱包标准）
└── Z.AI Agent SDK（多 Agent 长任务编排）
```

---

## 六、风险与 Fallback 汇总

| SDK / API | 失败概率 | 影响 | Fallback 方案 |
|-----------|---------|------|--------------|
| Polygon Amoy | 10% | Day 1 部署失败 | 用 Hardhat 本地网络 + Sepolia替代 |
| MCP SDK | 20% | Day 2 Agent 通信失败 |降级为 HTTP REST API |
| Chainlink Functions | — | Week 5+ 才接入 | 手动哈希替代，不影响 Week 4 |
| Cobo / Z.AI | — | Week 5+ 才接入 | MetaMask / MCP 替代，不影响 Week 4 |

---

*文档版本：v1.0 | 日期：2026/06/08 | SDK Integration Plan*