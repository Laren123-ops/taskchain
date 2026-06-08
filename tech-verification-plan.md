# Week 3｜技术验证计划

> Week 4 Hackathon 期间需要验证的关键技术点 | 2026/06/08

---

## 一、技术验证总览

| # | 验证点 | 类型 | 通过标准 | 负责人 |
|---|--------|------|---------|--------|
| 1 | 合约部署到 Amoy | 测试网交易 | transaction确认，合约可读 | mia |
| 2 | lockFund 资金锁定 | 合约交互 | 合约余额 = 5 USDC | mia |
| 3 | verifyHash 哈希匹配 | 合约交互 | 返回 true，触发 payout | mia |
| 4 | verifyHash 哈希不匹配 | 合约交互 | 返回 false，状态变为 FAILED | mia |
| 5 | refund 退款 | 合约交互 | 主人收到 5 USDC | mia |
| 6 | MCP Main↔Data Agent 通信 | SDK 调用 | 消息往返成功 | mia |
| 7 | timeoutRefund 超时退款 | 合约交互 | 72h 后自动退款 | mia |
| 8 | Agent 日志记录 | 日志记录 | 所有操作有 timestamp + tx hash | mia |

---

## 二、逐项验证计划

### 验证1：合约部署到 Amoy

| 字段 | 内容 |
|------|------|
| **验证目标** | TaskChain.sol 成功部署到 Polygon Amoy 测试网 |
| **验证方法** | `npx hardhat deploy --network amoy` → Polygon Scan 验证合约地址 |
| **通过标准** | transaction确认，合约可读写（调用 createTask 成功） |
| **失败处理** | 切换 Sepolia 或 Hardhat 本地网络 |
| **证据** | 截图：部署 transaction hash + 合约地址 |

---

### 验证 2：lockFund 资金锁定

| 字段 | 内容 |
|------|------|
| **验证目标** | 调用 lockFund() 后，合约持有 5 USDC |
| **验证方法** | 调用 lockFund(taskId, { value: parseEther("5") }) |
| **通过标准** | 交易成功，Polygon Scan 显示合约余额增加 5 USDC |
| **失败处理** | 检查 USDC Approve 流程，或降低测试金额 |
| **证据** | 截图：lockFund transaction + 合约余额变化 |

---

### 验证 3：verifyHash 哈希匹配 → 自动放款

| 字段 | 内容 |
|------|------|
| **验证目标** | 提交正确哈希，verifyHash() 返回 true，payout() 自动触发 |
| **验证方法** | submitHash(taskId, correctHash) → verifyHash(taskId) |
| **通过标准** | verifyHash 返回 true，Data Agent 收到 5 USDC 转账 |
| **失败处理** | 检查 expectedHash vs submittedHash 计算是否一致 |
| **证据** | 截图：submitHash tx + verifyHash tx + payout tx + 余额变化 |

---

### 验证 4：verifyHash 哈希不匹配

| 字段 | 内容 |
|------|------|
| **验证目标** | 提交错误哈希，verifyHash() 返回 false，状态变为 FAILED |
| **验证方法** | submitHash(taskId, wrongHash) → verifyHash(taskId) |
| **通过标准** | verifyHash 返回 false，task状态变为 FAILED |
| **失败处理** | 合约逻辑正常，预期行为 |
| **证据** | 截图：verifyHash 返回 false + 状态变化 |

---

### 验证 5：refund 退款

| 字段 | 内容 |
|------|------|
| **验证目标** | 哈希不匹配后，主人调用 refund() 收到退款 |
| **验证方法** | verifyHash() 失败后 → contract.refund(taskId) |
| **通过标准** | 主人地址余额增加5 USDC，task 状态变为 REFUNDED |
| **失败处理** | 检查 msg.sender 是否为任务 owner |
| **证据** | 截图：refund tx + 余额变化 |

---

### 验证 6：MCP Main↔ Data Agent 通信

| 字段 | 内容 |
|------|------|
| **验证目标** | Main Agent 和 Data Agent 通过 MCP 协议成功通信 |
| **验证方法** | Main Agent 发送任务请求 → Data Agent 返回数据 + 哈希 |
| **通过标准** | 控制台显示消息往返成功，无超时 /格式错误 |
| **失败处理** | 降级为 HTTP REST API Mock |
| **证据** | 截图：Main Agent 控制台日志 + Data Agent 控制台日志 |

---

### 验证 7：timeoutRefund 超时退款

| 字段 | 内容 |
|------|------|
| **验证目标** | 任务超过 deadline 后，任何人可调用 timeoutRefund() |
| **验证方法** | 设置短 deadline（1 分钟），等待超时 → 调用 timeoutRefund() |
| **通过标准** | 超时后资金自动退回主人，task 状态变为 REFUNDED |
| **失败处理** | 检查 block.timestamp vs deadline 比较逻辑 |
| **证据** | 截图：timeoutRefund tx + 余额变化 |

---

### 验证 8：Agent 操作日志记录

| 字段 | 内容 |
|------|------|
| **验证目标** | Main Agent 所有操作都有 timestamp + transaction hash记录 |
| **验证方法** | 在 Main Agent 代码中加入 logger，每次链上调用记录 |
| **通过标准** | 日志文件包含：timestamp、tool name、tx hash、结果 |
| **失败处理** | 降级为控制台输出，Week 5+ 接入链下数据库 |
| **证据** | 截图：日志文件内容示例 |

---

## 三、验证时间安排

```
Day 1（6/8）：验证 1 — 合约部署
Day 2（6/9）：验证 6 — MCP 通信
Day 3（6/10）：验证 2, 3, 4, 5 — 全链路（核心）
Day 4（6/11）：验证 7, 8 — 容错 + 日志
Day 5（6/12）：补做未通过项 + 前端
Day 6（6/13）：全流程彩排 +录制 Demo
Day 7（6/14）：收尾 + 提交
```

---

## 四、验证证据清单（Hackathon 提交用）

| 验证项 | 截图 / 文件 |
|--------|-----------|
| 合约部署 | `deployment-{date}.png` |
| lockFund | `lockfund-{taskId}.png` |
| verifyHash（成功） | `verify-success-{taskId}.png` |
| verifyHash（失败） | `verify-fail-{taskId}.png` |
| refund | `refund-{taskId}.png` |
| MCP 通信 | `mcp-log-{date}.png` |
| timeoutRefund | `timeout-{taskId}.png` |
| Agent 日志 | `agent-log-{date}.png` |
| Demo 视频 | `taskchain-demo-{date}.mp4` |

---

*文档版本：v1.0 | 日期：2026/06/08 | Week 4 技术验证计划*