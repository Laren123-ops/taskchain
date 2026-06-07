# TaskChain — 项目 Proposal（1页版）

> 基于 Week 2 方向选定：Dev Tooling / Agent Workflow

---

## 项目概述

**一句话**：TaskChain 是一个多 Agent 协作的 Web3 任务分发网络，通过智能合约实现「任务发布 → 资金锁定 → 自动验证 → 按结果付款」的全流程自动化。

**核心差异**：现有 AI Agent 系统缺乏可信的链上支付保障；现有 Web3 支付系统缺乏 AI 驱动的任务协作能力。TaskChain 将两者结合，实现 Agent 工作流的链上资金绑定。

---

## 目标用户

| 用户类型 | 场景 |
|---------|------|
| **Web3 开发者** | 把重复性链上任务（数据获取、报告生成）外包给 AI Agent |
| **DAO 组织** | 协调多个 Agent 完成提案研究、数据分析等复杂任务 |
| **DeFi 协议** | 可靠地获取链外数据喂价，降低对中心化预言机的依赖 |

---

## 真实场景（Week 4 Demo 用）

**场景**：主人想了解某 DeFi 协议的 TVL 历史走势

```
Step 1：主人 →发起任务（预算 5 USDC）
Step 2：Main Agent → 转发给 Data Agent
Step 3：Data Agent → 抓取 DeFiLlama 数据，提交 SHA-256 哈希
Step 4：合约 → 验证哈希匹配，自动释放 5 USDC 给 Data Agent
Step 5：Main Agent → 把结果返回给主人（账户余额 -5 USDC）
```

**验收**：整个流程 transaction hash 可查，USDC 转账可从区块浏览器验证。

---

## 最小功能（MVP）

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 资金锁定合约 | 合约托管 USDC，按任务 ID 隔离 | P0 |
| 哈希验证 | 子 Agent 交付数据，合约验证 SHA-256 哈希 | P0 |
| 自动放款 | 验证通过后自动将 USDC 转给 subAgent | P0 |
| MCP 协议通信 | Main Agent ↔ Data Agent 真实通信 | P0 |
| 退款机制 | 验证失败或超时时退还资金 | P1 |
| 任务仪表盘 | 展示任务状态（链下，非核心） | P2 |

---

## 验证方式

| 验证项 | 验证方法 |
|--------|---------|
| 合约逻辑正确 | Hardhat test（5 个测试用例覆盖率 >80%） |
| 资金安全 | 部署到 Polygon Amoy，验证锁定/放款/退款真实上链 |
| 全链路跑通 | Day 3 演示：Main Agent → 合约 → Data Agent → USDC 转账 |
| Demo 可展示 | Day 6 录制 2-3 分钟视频，含 transaction hash + 区块浏览器截图 |

---

## 风险边界

| 风险 | 等级 | 边界说明 |
|------|------|---------|
| 合约安全漏洞 | 🔴 高 | Hackathon 前完成 OpenZeppelin 安全组件集成，不上主网 |
| 哈希验证被绕过 | 🔴 高 | 验证逻辑在合约内，不信任任何链下输入 |
| AI 误判数据质量 | 🟡 中 | 哈希验证只保证数据一致性，不保证数据正确性（用户需自行判断） |
| Agent 通信超时 | 🟢 低 | 设置合理 deadline，超时自动触发退款 |
| 监管不确定性 | 🟢 低 | 使用 USDC 稳定币，不触碰证券类代币 |

**不做的事**：
- 不实现 ZK 证明验证（Week 5+）
- 不实现 DAO 治理升级（Week 5+）
- 不上主网（Hackathon 期间只做测试网）
- 不接入真实法币通道

---

## 参赛赛道

| 赛道 | 匹配度 | 说明 |
|------|--------|------|
| **AI + Blockchain / Agent Infrastructure** | ⭐⭐⭐ 高 | 直接对应多 Agent 协作 + 链上基础设施 |
| DeFi / Payments | ⭐⭐ 中 | USDC 自动化支付是核心功能之一 |
| Infrastructure / Tooling | ⭐⭐ 中 | Dev Tooling 属性明确 |

**建议主赛道**：AI + Blockchain / Agent Infrastructure

---

## 技术栈

```
AI 层：Claude API + MCP 协议
合约层：Solidity + Hardhat + OpenZeppelin
链层：Polygon Amoy（测试网）
预言机：Chainlink Functions（后续接入）
存储：IPFS（后续接入）
前端：React + wagmi（仪表盘）
```

---

## Week 4 成功标准

- [ ] 智能合约部署到 Amoy 测试网
- [ ] 锁定 → 验证 → 放款全链路跑通（真实 transaction hash）
- [ ] 两个 Agent 通过 MCP 协议完成一次真实协作
- [ ] Demo 视频录制完成
- [ ] README 和 SPEC.md 更新完毕

---

*Proposal 版本：v1.0 | 日期：2026/06/07 | 作者：mia*