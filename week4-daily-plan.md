# Week 4｜每日计划 — TaskChain Hackathon 冲刺

> Hackathon 时间线：2026/06/08 – 2026/06/14

---

##冲刺目标（Hackathon 结束前）

**核心目标**：Demo 全链路跑通 — 主 Agent 发布任务 → 合约锁定 → 数据交付 → 哈希验证 → 自动放款

---

## Day by Day 计划

---

### Day 1｜2026/06/08（周一）

**主题**：环境搭建 + 合约调试

**目标**：让合约在测试网上跑起来

| 任务 | 类型 | 说明 |
|------|------|------|
| 部署合约到 Polygon Amoy 测试网 | ✅ 真实实现 | `npx hardhat deploy --network amoy`，获取合约地址 |
| 配置 .env（RPC_URL、PRIVATE_KEY） | ✅ 真实实现 | 填入真实测试网私钥（非真钱） |
| 验证合约是否可读写（调用 createTask） | ✅ 真实实现 | 通过 Hardhat 或区块浏览器确认 |
|确认 USDC 测试币充值到位（ faucet） | ✅ 真实实现 | 测试网水龙头领 USDC |

**交付物**：合约地址 + 测试网验证截图

---

### Day 2｜2026/06/09（周二）

**主题**：MCP 协议 + Agent 骨架

**目标**：两个 Agent 能通过 MCP 协议通信

| 任务 | 类型 | 说明 |
|------|------|------|
| 搭建 Main Agent（Node.js + MCP SDK） | ✅ 真实实现 | 用 @modelcontextprotocol/sdk |
| 搭建 Data Agent（模拟数据交付） | ✅ 真实实现 | 独立进程，监听 MCP 消息 |
| 实现「任务转发」：Main → Data Agent | ✅ 真实实现 | MCP 协议真实走 TCP |
| MCP 通信异常时的 fallback（超时重试） | 🟡 Mock/Fallback | 打印日志 + 预设响应，不阻塞主流程 |

**交付物**：两个 Agent 进程可交互的消息日志截图

---

### Day 3｜2026/06/10（周三）

**主题**：链上验证 + 支付闭环

**目标**：完成 MVP 最核心的「锁定→验证→放款」闭环

| 任务 | 类型 | 说明 |
|------|------|------|
| Main Agent 调用 contract.createTask() | ✅ 真实实现 | 真实上链 |
| Main Agent 调用 contract.lockFund() | ✅ 真实实现 | 锁定 USDC |
| Data Agent 提交哈希 contract.submitHash() | ✅ 真实实现 | 真实上链 |
| 触发 contract.verifyHash() 验证 | ✅ 真实实现 | 真实上链，自动放款 |
| 确认 subAgent 收到 USDC（区块浏览器） | ✅ 真实实现 | 验证真实转账 |

**交付物**：全流程上链的 transaction hash + 区块浏览器截图

---

### Day 4｜2026/06/11（周四）

**主题**：容错 + 退款场景

**目标**：覆盖异常路径，Demo 更健壮

| 任务 | 类型 | 说明 |
|------|------|------|
| 测试「哈希不匹配」→ 触发 refund | ✅ 真实实现 | 真实上链，确认退款到账 |
| 测试「超时」→ 调用 timeoutRefund | ✅ 真实实现 | 设置短 deadline，验证自动取消 |
| 测试「暂停合约」→ pause/unpause | ✅ 真实实现 | 验证资金锁定不受影响 |
| 异常场景的 Agent 端容错（try/catch） | 🟡 Mock/Fallback | Agent 端捕获异常不崩溃 |

**交付物**：各异常场景的 transaction log

---

### Day 5｜2026/06/12（周五）

**主题**：前端仪表盘（可选，Hackathon 核心）

**目标**：可视化展示任务状态

| 任务 | 类型 | 说明 |
|------|------|------|
| 搭建 React + wagmi 基础页面 | ✅ 真实实现 | 连接 MetaMask + 合约 |
| 显示任务列表（taskId / status / amount） | ✅ 真实实现 | 真实从链上读取 |
| 显示「锁定/验证/放款」状态变化 | 🟡 Mock/Fallback | 用事件模拟实时更新（真实监听 may 超时） |
| 发起新任务的表单 |🟡 Mock/Fallback | 表单可用，但模拟 Agent响应 |

**交付物**：前端截图（展示任务状态仪表盘）

---

### Day 6｜2026/06/13（周六）

**主题**：集成测试 + Demo准备

**目标**：全流程彩排，准备路演材料

| 任务 | 类型 | 说明 |
|------|------|------|
| 端到端彩排（Main Agent → 合约 → Data Agent →放款） | ✅ 真实实现 | 完整跑一次，记录 transaction hash |
| 录制 Demo 视频（2–3 分钟） | ✅ 真实实现 | 屏幕录制 + 解说 |
| 整理 README（补充 Week 4 实现状态） | ✅ 真实实现 | 更新 README 中的 validation plan |
| 准备路演 PPT / 口述稿 | ✅ 真实实现 | 3 分钟陈述 |

**交付物**：Demo 视频链接 / 路演稿

---

### Day 7｜2026/06/14（周日）

**主题**：收尾 + 提交

**目标**：Hackathon 提交截止

| 任务 | 类型 | 说明 |
|------|------|------|
| 最终 Repo 整理（代码注释、文档） | ✅ 真实实现 | 确保评委可复现 |
| 更新 SPEC.md（反映真实实现 vs Mock） | ✅ 真实实现 | 标注哪些是 Mock |
| 提交 Hackathon 最终作品 | ✅ 真实实现 | 提交 repo链接 + Demo 视频 |
| 预留 buffer（处理突发问题） | 🟡 Mock/Fallback | 不做新功能，只修 bug |

**交付物**：Hackathon 提交

---

## Mock / Fallback 说明

| 场景 | 替代方案 |
|------|---------|
| **MCP 通信异常** | Agent 超时后返回预设 JSON，流程继续，不阻塞 |
| **前端实时监听** | 用 setInterval 轮询任务状态，不用 WebSocket |
| **翻译 Agent** | Hackathon 期间暂不接，仅演示数据 Agent 链路 |
| **部分退款比例** | 合约写死100% 退款，不实现动态比例（Week 5+） |
| **预言机喂价** | Hackathon 期间不用 Chainlink，手动提交哈希 |

---

## 优先级排序（P0 / P1 / P2）

```
P0（Hackathon 核心，必须完成）
├── Day 1：合约部署到 Amoy
├── Day 3：锁定→验证→放款全链路跑通
└── Day 6：Demo 录制

P1（Hackathon 期间尽量完成）
├── Day 2：MCP 协议两个 Agent 通信
├── Day 4：容错场景测试
└── Day 5：前端仪表盘基础版

P2（Hackathon 后完善）
├── 翻译 Agent
├── 动态退款比例
├── Chainlink 预言机
└── 第三方合约审计
```

---

## 每日自检（每天结束前回答）

1. 今天完成了什么？（截图 / transaction hash）
2. 遇到了什么问题？
3. 明天优先处理什么？

---

*文档版本：v1.0 | 日期：2026/06/07 | Hackathon Week 4 冲刺计划*