# TaskChain — 前提假设、失败点与 Fallback Plan

> Hackathon Week 4 风险管理文档 |2026/06/08

---

## 一、项目成立依赖的前提

### 1. 技术前提

| 前提 | 说明 | 如果不成立会怎样 |
|------|------|----------------|
| **Polygon Amoy 测试网稳定** | 合约部署和测试网水龙头正常工作 | 无法演示，需要临时换链（Seopolia 等） |
| **USDC 测试币充足** | 水龙头能领到足够的 USDC 测试币 | Demo 资金量受限，只能演示小额定额 |
| **Hardhat + OpenZeppelin 兼容** | 本地开发环境和测试网兼容 |部署脚本报错，需要修配置 |
| **MCP 协议可本地运行** | @modelcontextprotocol/sdk 在 Node.js 18 下正常工作 | Agent 通信层换成 HTTP API Mock |
| **MetaMask 可连接 Amoy** | 钱包能切换到 Amoy 测试网并签名交易 | 前端仪表盘 Demo 无法展示 |

### 2. 商业前提

| 前提 | 说明 | 如果不成立会怎样 |
|------|------|------|----------------|
| **USDC 是结算媒介** | USDC 在 Polygon 上转账快、Gas 低、稳定 | 换成 MATIC 或 ETH（波动大，演示效果差） |
| **AI Agent 愿意作为 subAgent 参与** | 有可用的 AI Agent 响应 Main Agent 的任务请求 | 只能演示「手动模拟 subAgent」，Demo说服力下降 |
| **数据交付物可以用哈希验证** | 数据内容可以生成稳定的 SHA-256 哈希 | 需要换成「链下哈希 + 预言机上链」方案 |
| **用户接受「全有或全无」退款** | 验证失败时全额退款，不支持部分退款 | 可以在 Week 5 扩展，但 Week 4 MVP 会感觉功能弱 |

### 3. 团队前提

| 前提 | 说明 | 如果不成立会怎样 |
|------|------|----------------|
| **单人参赛时间充足** | 每天 3-4 小时投入 Hackathon | Scope进一步收缩到只做合约 + 单 Agent |
| **不需要外部依赖** | 不依赖队友、不依赖外部 API、不依赖第三方 Agent 服务 | 如果某个依赖断裂，有 fallback 方案 |

---

## 二、最可能失败的地方（按概率排序）

### 🔴 失败点 1：Day 3 全链路无法在测试网跑通

**概率**：高（估计 40%）

**原因**：
- 合约部署到 Amoy 后 `lockFund()` 的 msg.value 传值问题（Solidity 单位换算）
- 测试网 USDC 转账需要 Approve，流程比预期复杂
- `verifyHash()` 的调用权限问题（谁有权限触发验证？）

**影响**：无法展示「锁定→验证→放款」闭环，Hackathon 核心 Demo 失败

---

### 🔴 失败点 2：MCP 协议两个 Agent 通信失败

**概率**：中高（估计 30%）

**原因**：
- MCP SDK 的 TCP 连接在某些网络环境下被阻断
- Main Agent 和 Data Agent 的消息格式不匹配（schema差异）
- Data Agent 进程在 Windows 环境下的稳定性问题

**影响**：只能展示单 Agent +合约交互，无法展示多 Agent 协作

---

### 🟡 失败点 3：前端仪表盘开发占用太多时间

**概率**：中（估计 20%）

**原因**：
- wagmi + React + MetaMask 的连接配置比预期复杂
- 事件监听（event listen）需要额外的合约 ABI 配置
- 前端界面美化占用时间，但不影响核心 Demo

**影响**：Day 5 时间被前端吃掉，影响 Day 6 Demo 录制

---

### 🟡 失败点 4：测试网水龙头 USDC 耗尽

**概率**：低（估计 10%）

**原因**：
- Polygon Amoy 水龙头每日领取限额
- 多人同时使用导致水龙头服务不稳定

**影响**：无法演示多轮任务，只能做单笔交易演示

---

## 三、Week 4 Fallback Plan

### Fallback 1：全链路 fallback（针对失败点 1）

**触发条件**：Day 3 合约无法在 Amoy 跑通，尝试3 次后仍失败

**方案**：
1. **先在 Hardhat 本地网络跑通全链路**（`npx hardhat test`）
2. 录制本地测试网络的 Demo（Hardhat node 本地网络）
3. 合约代码完整保留，备注「测试网部署待完成」
4. Hackathon 提交时说明：合约逻辑已验证，只是测试网环境临时问题

**不影响**：核心合约逻辑正确性，测试用例可通过

---

### Fallback 2：MCP fallback（针对失败点 2）

**触发条件**：两个 Agent 无法通过 MCP 协议通信，30 分钟内无法解决

**方案**：
1. **降级为 HTTP API Mock**：Data Agent 用一个简单的 HTTP server 替代，响应预设 JSON
2. Main Agent 通过 `fetch()` 调用 Mock API，不走 MCP 协议
3. 代码里预留 MCP 升级接口（注释标注 `// TODO: upgrade to MCP`）
4. Demo 演示时说明：「未来版本将升级为 MCP 协议，当前用 HTTP API Mock」

**不影响**：任务分发流程的逻辑完整性，只是协议层降级

---

### Fallback 3：前端 fallback（针对失败点 3）

**触发条件**：Day 5 结束时前端界面仍未完成

**方案**：
1. **直接用 Hardhat test 输出作为 Demo 展示**（合约测试结果截图）
2. 或用「区块浏览器截图」代替前端界面（展示 transaction hash 和状态变化）
3. 前端仪表盘标注为 P2，Week 5 再完成

**不影响**：核心链路（合约 + Agent）正常演示

---

### Fallback 4：测试币 fallback（针对失败点 4）

**触发条件**：USDC 水龙头无法领取

**方案**：
1. **使用 ETH代替 USDC**（ETH 转账不需要 Approve，流程更简单）
2. 将合约的 `amount` 参数单位改为 ETH（而非 USDC）
3. Demo 演示时将「5 USDC」替换为「0.01 ETH」
4. 备注：「主网部署时会使用 USDC，测试网用 ETH 替代」

---

## 四、Fallback 决策原则

```
如果全链路（合约）失败 → 保测试用例，放弃测试网 Demo
如果 MCP 失败 → 降级为 HTTP Mock，保任务分发逻辑
如果前端失败 → 用 Hardhat 输出或区块浏览器截图替代
如果测试币耗尽 → 换成 ETH 作为演示货币

核心原则：
1. 任何 single point of failure 都不能毁掉整个 Demo
2. 合约逻辑和 Agent 协作是核心，UI 和协议层是次优
3. Fallback 方案应在 Day 1 开始就准备，不是 Day 6 临时找
```

---

## 五、每周自检问题（防止盲目乐观）

每个晚上问自己：

1. **今天哪个假设被动摇了？**（技术 / 商业 / 团队）
2. **如果明天最大的风险发生，我有什么 plan B？**
3. **我的时间还够吗？**（如果不够，应该砍哪个功能？）

---

*文档版本：v1.0 | 日期：2026/06/08 | 风险管理文档*