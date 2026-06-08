# AI × Web3 School — Week 2 Weekly Reflection

> by mia | 2026/06/08

---

## 1. Learning Reflections, Blockers, and New Understanding

### 本周最大的认知转变

**从"AI 可以做任何事"到"AI + Web3 有边界"**。

在做 Week 2 问题地图时，我一开始把所有方向都当成 AI 能解决的问题。但当我分析 Wallet / Permission / Safe Execution 方向时，发现 AI 其实**无法替代**密码学签名、链上规则执行这些 Web3 原生能力。同样，Dev Tooling / Agent Workflow 方向里，AI 无法控制合约一旦部署后的行为，也无法提供数学层面的 Formal Verification。

**这让我理解了一个关键点**：AI × Web3 不是 AI赋能一切，而是找到 AI 和 Web3 各自**不可替代**的部分，然后让它们互补。

### Blocker（卡住的地方）

Week 3 开始做 Hackathon Direction Card 时，我在「技术路径」上卡了很久——我不知道 Chainlink Functions到底怎么和智能合约配合工作。MCP 协议和智能合约之间的通信应该如何设计，我也没有把握。

**解决方式**：先跳过细节，把这两块标记为「Mock / Fallback」，先让核心链路跑通。这个决策让我从"追求完美方案"变成了"先跑通再迭代"，这是我在 Hackathon 里学到的第一个心态转变。

---

## 2. A Valuable Discovery This Week

**TaskChain.sol 的合约状态机设计**让我对智能合约开发有了全新的理解。

在写 SPEC.md 的过程中，我发现合约的状态机（NONE → CREATED → FUNDED → SUBMITTED → VERIFIED / FAILED → REFUNDED）其实是整个系统的核心骨架。之前我觉得"写合约"就是写函数，但状态机让我意识到：**合约的核心是状态管理和状态转换的规则**，函数只是触发这些转换的工具。

这个发现帮助我理解了为什么 OpenZeppelin 的 `ReentrancyGuard` 和 `Pausable` 是标准组件——它们都是对**状态转换安全**的保护。

**工具推荐**：Hardhat + OpenZeppelin 的组合让单人开发智能合约成为可能，不需要从零造安全轮子。

---

## 3. Most Impressive Session

**Week 2 Module A 的问题地图工作坊**最让我印象深刻。

原因是：这是我第一次用「地图」的方式思考 AI × Web3 的交叉领域。之前我倾向于线性思考（"AI 能做什么？"），但问题地图强迫我从多个正交方向同时审视问题——Payment、Identity、Wallet、Privacy、Dev Tooling、Governance，每个方向都有自己的核心矛盾和交叉点。

这种思维方式让我意识到：**选方向比选技术更重要**。我选择了 Dev Tooling / Agent Workflow 作为主线，不是因为它最简单，而是因为它和我的项目场景（Week 1 开头的任务分发流程）最匹配，而且业界还没有成熟方案，有足够的研究空间。

---

## 4. Growth & Transformation期望

### 通过 AI × Web3 School，我希望：

**从"学概念"到"做项目"**。

之前我对 AI 和 Web3 的理解停留在概念层面——看过很多文章，知道 Agent、知道智能合约、知道 DeFi，但从来没有把它们真正串起来做一个可用的东西。

**我希望Hackathon 能让我完成这个转变**：从一个"懂一点 AI、懂一点 Web3"的学习者，变成一个"能独立完成一个 AI × Web3 小项目"的实践者。

具体来说：
- 掌握 Solidity 智能合约开发（不只是看懂）
- 理解多 Agent 协作的工程实现（不只是理论上知道）
- 学会用"砍 Scope"的方式管理时间有限的开发项目

---

## 5. Hackathon Idea & Problem to Solve

### 项目名：TaskChain

### 要解决的问题

AI Agent 系统在做任务外包时，缺乏**可信的任务验证和自动支付基础设施**。

具体痛点：
1. **信任问题**：主 Agent 如何相信子 Agent 的交付结果？目前依赖人工仲裁或中心化平台
2. **支付问题**：任务完成后资金能否自动释放？现有方案需要人工介入
3. **验证问题**：链下 AI 计算结果如何上链验证？缺乏可信的链上/链下桥梁

### 我的 Hackathon 解决方案

通过智能合约实现「任务发布 → 资金锁定 → 哈希验证 → 按结果自动放款」的全流程自动化：

```
主人（充值 100 USDC）
    ↓
主 Agent 发布任务（预算 5 USDC）
    ↓
合约锁定 5 USDC
    ↓
数据 Agent 交付数据 + 提交 SHA-256 哈希
    ↓
合约验证哈希 → 通过 → 自动释放 5 USDC 给数据 Agent
    ↓
主人收到结果（账户余额 93 USDC）
```

### 核心差异

| 现有方案 | TaskChain 的差异 |
|---------|----------------|
| 中心化平台（如 Mechanical Turk） | 去中心化，无单点依赖 |
| AI Agent 系统（缺支付层） | 智能合约绑定支付，验证通过自动放款 |
| Web3 原生支付（缺 AI 协作） | AI Agent 驱动任务分发和结果解析 |

### Hackathon 赛道选择

**主赛道**：AI + Blockchain / Agent Infrastructure

验证方式：Day 3 全链路跑通（真实 transaction hash），Day 6 Demo 录制。

---

*Reflection by mia | AI × Web3 School Week 2 | 2026/06/08*