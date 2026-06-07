# TaskChain — 项目规范 (SPEC)

> 本文档定义项目的核心规范，是所有实现和决策的依据。

---

## 1. Overview

**TaskChain** 是一个多 Agent 协作的 Web3 任务分发网络，通过智能合约实现任务的资金锁定、交付验证和自动付款。

### 1.1 项目目标

- 让 AI Agent 能够以去中心化方式完成复杂任务的委托、执行和结算
- 通过链上合约保证资金安全，消除多方信任依赖
- 提供可验证的任务执行记录，降低争议风险

### 1.2 核心假设

1. USDC 作为结算代币（稳定、可分割、Gas 费低）
2. 主 Agent 和子 Agent 都使用 MCP 协议通信
3. 数据交付物通过 SHA-256 哈希验证
4. 合约部署在 Polygon Amoy 测试网（低成本、高吞吐量）

---

## 2. System Architecture

### 2.1 角色

| 角色 | 描述 | 链上身份 |
|------|------|---------|
| **Owner** | 任务发起者，持有资金 | EOA 或钱包地址 |
| **Main Agent** | 协调者，接收 Owner 任务，分发给子 Agent | EOA |
| **Sub Agent** | 执行者，交付数据/翻译等服务 | EOA |
| **TaskChain Contract** | 资金托管和验证逻辑 | 合约地址 |

### 2.2 合约状态机

```
┌─────────┐   创建任务     ┌─────────────┐
│ NONE │──────────────▶│ TASK_CREATED │
└─────────┘               └──────┬──────┘
                                  │ lockFund()
                                  ▼
                           ┌─────────────┐
                           │  FUNDED    │◀─────── 重试锁定
                           └──────┬──────┘
                                  │ submitHash()
                                  ▼
                           ┌─────────────┐
                           │ SUBMITTED │
                           └──────┬──────┘
                                  │ verifyHash()
                                  ▼
                    ┌────────────┴────────────┐
                    │                         │
              ┌────▼────┐              ┌────▼────┐
               │VERIFIED│              │ FAILED  │
               │ (放款) │              │ (退款)  │
               └────────┘└─────────┘
```

### 2.3 核心接口

```solidity
interface ITaskChain {
    // 创建任务（由 Main Agent 调用）
    function createTask(address subAgent, uint256 amount, bytes32 expectedHash) external returns (uint256 taskId);

    // 锁定资金（由 Owner 或合约逻辑调用）
    function lockFund(uint256 taskId) external payable;

    // 子 Agent 提交数据哈希
    function submitHash(uint256 taskId, bytes32 dataHash) external;

    // 验证哈希（内部或预言机触发）
    function verifyHash(uint256 taskId) external returns (bool);

    // 验证通过后自动放款
    function payout(uint256 taskId) external;

    // 退款给 Owner
    function refund(uint256 taskId) external;

    // 紧急暂停
    function pause() external;

    // 事件
    event TaskCreated(uint256 indexed taskId, address indexed owner, address indexed subAgent, uint256 amount);
    event HashSubmitted(uint256 indexed taskId, bytes32 indexed hash);
    event Verified(uint256 indexed taskId, bool success);
    event PaidOut(uint256 indexed taskId, uint256 amount);
    event Refunded(uint256 indexed taskId, uint256 amount);
}
```

---

## 3. Functionality Specification

### 3.1 核心功能

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 资金锁定 | 合约托管 USDC，按任务 ID 隔离 | P0 |
| 哈希验证 | 验证子 Agent 提交的数据哈希是否匹配 | P0 |
| 自动放款 | 验证通过后自动将 USDC 转给 subAgent | P0 |
| 退款机制 | 验证失败或超时时退还资金给 Owner | P0 |
| 超时机制 | 任务超过 deadline 未交付时自动取消 | P1 |
| 部分退款 | 按预设比例退还部分资金（非全有全无） | P2 |

### 3.2 用户流程

#### Main Agent 发起任务

```typescript
// 伪代码
const taskId = await contract.createTask(dataAgentAddress, 5 USDC, expectedHash);
// 锁定 5 USDC 到合约
await contract.lockFund(taskId, { value: 5 USDC });
```

#### Sub Agent 交付

```typescript
// 伪代码
const dataHash = sha256(data);
await contract.submitHash(taskId, dataHash);
```

#### 合约验证并放款

```typescript
// 伪代码（验证由合约自动触发或预言机触发）
const success = await contract.verifyHash(taskId);
if (success) {
    await contract.payout(taskId); // 自动放款 5 USDC 给 dataAgent
}
```

### 3.3 边界条件

| 条件 | 预期行为 |
|------|---------|
|哈希不匹配 | 调用 `refund()`，5 USDC 退回 Owner |
| 超时（72h） | 触发 `Timeout` 事件，Owner 可调用 `refund()` |
| Owner 不确认 | 合约持有资金，任务保持 `FUNDED` 状态 |
| 合约暂停 | 所有操作被锁定，资金安全直到解暂停 |

---

## 4. Security Considerations

### 4.1 已知风险

1. **重入攻击**：放款时使用 `ReentrancyGuard`
2. **整数溢出**：使用 `SafeMath` 或 Solidity 0.8+ 内置保护
3. **权限扩大**：只有 Owner 可以暂停或修改关键参数
4. **假数据攻击**：哈希验证必须在链上完成，不能信任链下输入

### 4.2 安全措施

- [ ] 使用 `ReentrancyGuard`（OpenZeppelin）
- [ ] 使用 `Pausable`（OpenZeppelin）
- [ ] 关键函数使用 `onlyOwner` 修饰符
- [ ] 资金提取必须经过验证逻辑
- [ ] 部署前完成第三方审计（P2）

---

## 5. Acceptance Criteria

| ID | 标准 | 验证方式 |
|----|------|---------|
| AC-1 | Owner 创建任务并锁定资金后，合约余额正确 | Hardhat test |
| AC-2 | Sub Agent 提交正确哈希后，`verifyHash()` 返回 true | Hardhat test |
| AC-3 |验证通过后，subAgent 立即收到 USDC 转账 | Hardhat test + 区块浏览器 |
| AC-4 | 哈希不匹配时，Owner 调用 `refund()` 收到退款 | Hardhat test |
| AC-5 | 合约部署到 Amoy 测试网且 gas 消耗 < 3M | 区块浏览器 |
| AC-6 | 端到端 Demo 全流程跑通 | 手动演示 |

---

## 6. Out of Scope（Hackathon 后）

- 多币种支持（非 USDC）
- DAO 治理升级合约
- ZK 证明验证
- 跨链消息传递（IBC）
- 前端仪表盘完整版

---

*Spec Version: v1.0 | Date: 2026/06/07 | Author: mia*