# Week 3｜Sponsor Workshop 笔记

> 选课 sponsor workshop 相关笔记 | 2026/06/08

---

## Workshop 1：Polygon — AI Agent 与链互操作

### Sponsor 背景

Polygon 是以太坊扩展基础设施提供商，提供 Polygon PoS、Polygon zkEVM、Polygon Matic Waterfall 测试网水龙头等服务。其开发工具（Hardhat 配置、RPC节点、合约部署文档）成熟，是 AI × Web3 项目常用的链层选择。

### 解决什么问题

- **链上 Gas 费用高**：Polygon PoS 提供低 Gas、转账快的环境，适合需要频繁交互的 AI Agent 场景
- **测试网环境**：Polygon Amoy（测试网）提供免费 USDC 水龙头，降低 Hackathon 期间的演示成本
- **多链部署**：一套合约可以部署到 Polygon PoS + zkEVM，方便未来跨链扩展

### 提供什么工具

| 工具 | 用途 |
|------|------|
| **Polygon Amoy 测试网** | 免费测试网，USDC 水龙头，合约部署和调试 |
| **Polygon RPC** | 连接 MetaMask 或 Hardhat 的节点 endpoint |
| **Polygon Scan (Amoy)** | 区块浏览器，查看 transaction、合约事件 |
| **SuperteETH Faucet** | 领取测试网 MATIC 用于支付 Gas |
| **Polygon Devrel文档** | Hardhat + Polygon集成指南 |

### 适合哪个赛道

- **AI + Blockchain / Agent Infrastructure**（直接相关）
- **DeFi / Payments**（USDC 转账场景）
- **Infrastructure / Tooling**（开发工具链）

### 可以做什么 Demo

**Demo：TaskChain 合约部署到 Polygon Amoy**

```
1. 将 TaskChain.sol 部署到 Polygon Amoy
2. 通过 Hardhat 脚本调用 createTask() + lockFund()
3. 在 Polygon Scan 上验证 transaction hash 和合约事件
4. 连接 MetaMask 展示 USDC 余额变化
```

这个 Demo 可以直接作为 Hackathon 的核心演示片段。

---

## Workshop 2：Chainlink — 链上数据喂价与去中心化预言机

### Sponsor 背景

Chainlink 是去中心化预言机网络，提供 Chainlink Data Feeds、Chainlink Functions、CCIP（跨链消息）等服务。是连接链下 AI 计算结果和链上合约的核心桥梁。

### 解决什么问题

- **链下数据上链**：AI Agent 的计算结果如何可信地写入链上？Chainlink Functions提供了「链下计算 → 链上验证」的通道
- **数据源去中心化**：避免单点预言机故障，Chainlink 通过多个节点聚合数据
- **自动化触发**：Chainlink Automation 可以触发合约函数（如验证超时自动退款）

### 提供什么工具

| 工具 | 用途 |
|------|------|
| **Chainlink Functions** | 在链下运行任意代码，将结果提交到链上（适合 AI 数据喂价） |
| **Chainlink Data Feeds** | 预置的价格/数据源（适合 DeFi 场景） |
| **Chainlink Automation** | 链上条件触发器（适合超时退款等场景） |
| ** DON (Decentralized Oracle Network)** | 去中心化节点网络，保证数据可信性 |

### 适合哪个赛道

- **AI + Blockchain / Agent Infrastructure**（预言机是 Agent 数据上链的关键）
- **DeFi / Payments**（价格喂价、自动清算）
- **Data / Analytics**（链下数据聚合到链上）

### 可以做什么 Demo

**Demo：Chainlink Functions 实现 AI 数据喂价**

```
现状（Hackathon 用）：
Data Agent 手动提交 SHA-256 哈希到合约

升级方向（Week 5+）：
使用 Chainlink Functions：
1. Data Agent 将数据发送到 Chainlink Functions
2. DON 网络验证数据完整性
3. Functions 自动调用合约 verifyHash()
4. 合约触发 payout()

优势：
- 不需要手动提交哈希
- 数据验证逻辑去中心化
- 可信度更高
```

---

## Workshop 笔记总结

| Workshop | 解决的核心问题 | 对 TaskChain 的价值 |
|----------|---------------|-------------------|
| **Polygon** | 低成本链上部署和测试 | 提供测试网基础设施，Day 1 部署合约 |
| **Chainlink** | 链下 AI 数据可信上链 | 未来升级方向，Week 5+ 替代手动哈希提交 |

### 与 TaskChain 的关联度

**Polygon**：⭐⭐⭐ 直接相关 — Hackathon 全程使用 Amoy 测试网部署和演示
**Chainlink**：⭐⭐ 中期相关 — Week 4 用手动提交哈希，Week 5+ 接入 Chainlink Functions 实现自动化

---

*文档版本：v1.0 | 日期：2026/06/08 | Workshop 笔记*