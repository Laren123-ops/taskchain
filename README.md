# TaskChain — 多 Agent 协作的 Web3 任务分发网络

> AI Agent × Smart Contract × Automated Payment

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hackathon](https://img.shields.io/badge/Hackathon-Week3-blue.svg)](https://example.com)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Problem](#-problem)
- [Track](#-track)
- [MVP Flow](#-mvp-flow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Risks](#-risks)
- [Validation Plan](#-validation-plan)
- [Getting Started](#-getting-started)
- [License](#-license)

---

## 🎯 Project Overview

**TaskChain** is a multi-agent collaboration network for Web3 task distribution, enabling AI Agents to autonomously commission, deliver, and get paid for complex tasks through smart contract–secured fund locking and automatic verification.

| Field | Content |
|-------|---------|
| **Project Name** | TaskChain |
| **Track** | AI + Blockchain / Agent Infrastructure |
| **Team** | mia (solo) |
| **Contact** | mia / 2952188097@qq.com |
| **Week 4 Demo** | Full链路：主Agent发布任务 → 合约锁定5 USDC → 数据Agent交付+提交哈希 → 合约验证通过 → 自动放款 |

---

## ❓ Problem

### 核心痛点

Web3 生态中的任务外包缺乏**可信的任务验证和自动支付基础设施**：

1. **信任问题**：主 Agent 如何相信子 Agent 的交付结果？目前依赖人工仲裁或中心化平台
2. **支付问题**：任务完成后资金能否自动释放？现有方案需要人工介入或OTC
3. **验证问题**：链下 AI 计算结果如何上链验证？缺乏可信的链上/链下桥梁
4. **协调问题**：多个 Agent 串行/并行执行时，时序和依赖如何管理？

### 目标用户

- **主要**：Web3 开发者、DAO 组织、DeFi 协议方
- **次要**：AI Agent 开发者（提供服务赚取 USDC）、数据提供者

---

## 🏁 Track

**参赛赛道**：AI + Blockchain / Agent Infrastructure

具体方向：
- 多 Agent 系统的链上协调机制
- 智能合约绑定的自动化支付
- AI任务验证与链上预言机

---

##🔄 MVP Flow

### 完整链路（Week 4 Demo 跑通）

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   主 Agent   │────▶│ 智能合约     │────▶│  数据 Agent  │
│  (TaskChain) │     │ (TaskChain) │     │ (数据交付)   │
└──────────────┘     └──────────────┘     └──────────────┘
                           ▲                    │
                           │                    │
                           │提交数据 +
                           │              提交哈希
                           │ │
                           └────────────────────┘
                          合约验证通过 → 自动释放 5 USDC
```

### 时序步骤

| Step | Actor | Action | On-Chain |
|------|-------|--------|----------|
| 1 | 主人 | 发起「获取行业数据」任务，预算 5 USDC | 合约锁定 5 USDC |
| 2 | 主 Agent | 解析任务，转发给数据 Agent | — |
| 3 | 数据 Agent | 交付数据，提交数据 SHA-256 哈希 | — |
| 4 | 合约 | 验证哈希匹配 | 链上自动验证 |
| 5 | 合约 | 验证通过，释放 5 USDC 给数据 Agent | USDC 自动转账 |
| 6 | 主 Agent | 任务完成，结果返回给主人 | 余额：95 USDC |

### 部分退款场景（Week 5+）

|场景 | 处理方式 |
|------|---------|
| 数据 Agent 提交假数据 | 哈希不匹配，5 USDC 退回主 Agent |
| 数据 Agent 部分交付 | 合约按预设比例退款（如 70% 退回） |
| 主 Agent 超时未确认 | 合约自动退款，触发 Timeout事件 |

---

##🛠 Tech Stack

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **Chain** | Ethereum / Polygon Amoy | 成熟稳定，USDC 生态完善 |
| **Contract Language** | Solidity | 智能合约开发首选 |
| **Contract Framework** | Hardhat + OpenZeppelin | 快速开发，安全组件库 |
| **AI Model** | Claude API | 主 Agent 和子 Agent 的大脑 |
| **Agent Protocol** | MCP (Model Context Protocol) | Agent 间标准通信协议 |
| **Oracle** | Chainlink Functions | 链下数据可信上链 |
| **Storage** | IPFS | AI 生成内容的去中心化存储 |
| **Frontend** | React + wagmi + Viem | 任务状态仪表盘 |
| **Testing** | Hardhat Tests + Foundry | 合约测试和模糊测试 |

### 技术栈图

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
└─────────────────────────────┬───────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────┐
│              Smart Contract (Solidity)                  │
│         [FundLock] [Verify] [PayOut] [Refund]         │
└─────────────────────────────┬───────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  MCP Protocol │   │Chainlink Ora. │   │  IPFS Storage │
│ (Agent Commun) │   │(Data On-Chain)│   │(Content Store) │
└───────────────┘  └───────────────┘   └───────────────┘
        ▲
        │
┌───────┴───────┐
│ AI Agents │
│(Claude API)   │
└───────────────┘
```

---

## 📁 Project Structure

```
taskchain/
├── contracts/ # 智能合约源码
│   ├── TaskChain.sol       # 主合约：锁定/验证/放款
│   ├── interfaces/         # 合约接口
│   │   └── ITaskChain.sol
│   └── mock/               # 测试用 Mock 合约
├── scripts/                # 部署脚本
│   └── deploy.ts
├── src/                    # Agent 源码
│   ├── main-agent/         # 主 Agent
│   │   └── index.ts
│   ├── data-agent/         # 数据 Agent
│   │   └── index.ts
│   └── translator-agent/   # 翻译 Agent
│       └── index.ts
├── test/                   # 合约测试
│   └── TaskChain.test.ts
├── docs/                   # 项目文档
│   ├── mvp-flow.md
│   ├── risks.md
│   └── validation.md
├── frontend/              # 前端仪表盘
│   ├── components/
│   ├── pages/
│   └── App.tsx
├── SPEC.md                 # 项目规范
├── README.md               # 本文件
└── package.json
```

---

## ⚠️ Risks

| 风险 | 等级 | 描述 | 应对策略 |
|------|------|------|---------|
| **智能合约安全漏洞** | 🔴 高 | 合约逻辑缺陷导致资金被盗或锁死 | 第三方审计 + OpenZeppelin 安全组件 + 测试覆盖率 >90% |
| **哈希验证被绕过** | 🔴 高 | 恶意 Agent 提交伪造哈希 | 合约内强制验证数据哈希，不信任链下输入 |
| **预言机单点故障** | 🟡 中 | Chainlink 节点被攻击或数据源失效 | 使用多数据源聚合 + 熔断机制 |
| **USDC 托管风险** | 🟡 中 | 合约持有大量 USDC 成为攻击目标 | 最小化合约持仓 + 紧急暂停功能 |
| **Agent 间通信延迟** | 🟢 低 | MCP 协议超时导致任务挂起 | 设置合理 deadline + 重试机制 |
| **监管不确定性** | 🟢 低 | 各国对 crypto 支付监管政策变化 | 保持项目去中心化性质 + 法律合规咨询 |

### 风险缓解优先级

```
P0（Hackathon 前必须解决）
├── 合约安全：使用 OpenZeppelin ReentrancyGuard
├── 哈希验证：合约内实现 SHA-256 验证逻辑
└── 资金锁定：明确解锁条件和超时机制

P1（Hackathon 期间尽量覆盖）
├── 预言机冗余：预留备用数据源接口
└── 紧急暂停：Ownable + Pauseable组件

P2（Hackathon 后持续完善）
├── 第三方审计
└── 正式 Bug Bounty
```

---

## ✅ Validation Plan

### Week 4 验收标准（Hackathon Demo）

| 验收项 | 通过条件 | 测试方式 |
|--------|---------|---------|
| **合约部署** | 成功部署到 Polygon Amoy 测试网 | `npx hardhat deploy --network amoy` |
| **资金锁定** | 调用 `lockFund()` 后合约余额 = 5 USDC | Hardhat test |
| **哈希验证** | 提交正确哈希时 `verifyHash()` 返回 true | Hardhat test |
| **自动放款** | 验证通过后数据 Agent 地址收到 5 USDC | Hardhat test + 区块浏览器确认 |
| **退款机制** | 哈希不匹配时调用 `refund()` 资金退回 | Hardhat test |
| **端到端 Demo** | 主 Agent → 数据 Agent → 合约 → 放款全流程跑通 | 手动演示 |

### 测试用例清单

```
contracts/
└── TaskChain.test.ts
    ├── lockFund() — 正确锁定资金
    ├── verifyHash() — 哈希匹配时验证通过
    ├── verifyHash() — 哈希不匹配时验证失败
    ├── payout() — 验证通过后自动放款
    ├── refund() — 验证失败后资金退回
    ├── timeoutRefund() — 超时后自动退款
    └── pause() — 暂停后无法操作
```

### 性能指标

| 指标 | 目标值 |
|------|-------|
| 合约 gas 成本 | < 3M gas（单次锁定→放款） |
| 验证响应时间 | < 30 秒（链上确认） |
| Agent 响应时间 | < 5 分钟（包含 MCP 通信） |
| 测试覆盖率 | > 80%（Hackathon 期间） |

---

## 🚀 Getting Started

### 前置要求

- Node.js >= 18.x
- npm 或 yarn
- MetaMask 或任何 Web3 钱包

### 安装

```bash
git clone https://github.com/your-username/taskchain.git
cd taskchain
npm install
```

### 编译合约

```bash
npm run compile
```

### 运行测试

```bash
npm test
```

### 部署到测试网

```bash
# 复制并编辑 .env
cp .env.example .env
# 填入 PRIVATE_KEY 和 RPC_URL

# 部署
npm run deploy -- --network amoy
```

### 启动前端仪表盘

```bash
cd frontend
npm install
npm run dev
```

---

## 📖 License

MIT License — 详见 [LICENSE](LICENSE) 文件。

---

*Project by mia | Hackathon 2026 | Week 3 Repo Skeleton*