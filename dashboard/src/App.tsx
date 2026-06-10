import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, ethers, parseEther, formatEther } from "ethers";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const TASK_STATUS_NAMES = ["NONE", "CREATED", "FUNDED", "SUBMITTED", "VERIFIED", "FAILED", "REFUNDED"];
const STATUS_COLORS = ["#666", "#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e", "#ef4444", "#06b6d4"];

const TASK_ABI = [
  "function createTask(address _subAgent, uint256 _amount, bytes32 _expectedHash, uint256 _deadline) returns (uint256 taskId)",
  "function lockFund(uint256 _taskId) external payable",
  "function submitHash(uint256 _taskId, bytes32 _dataHash) external",
  "function verifyHash(uint256 _taskId) external returns (bool success)",
  "function refund(uint256 _taskId) external",
  "function timeoutRefund(uint256 _taskId) external",
  "function pause() external",
  "function unpause() external",
  "function owner() external view returns (address)",
  "function taskCount() external view returns (uint256)",
  "function tasks(uint256 _taskId) external view returns (address owner, address subAgent, uint256 amount, bytes32 expectedHash, bytes32 submittedHash, uint8 status, uint256 deadline)",
];

interface TaskInfo {
  owner: string;
  subAgent: string;
  amount: bigint;
  expectedHash: string;
  submittedHash: string;
  status: number;
  deadline: bigint;
}

function App() {
  const [walletAddr, setWalletAddr] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [chainId, setChainId] = useState<number | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Create task form
  const [subAgent, setSubAgent] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [dataHash, setDataHash] = useState("");
  const [deadline, setDeadline] = useState("72");

  // Submit hash modal
  const [submitTaskId, setSubmitTaskId] = useState<number | null>(null);
  const [submitHash, setSubmitHash] = useState("");

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const loadTasks = useCallback(async () => {
    if (!contract) return;
    try {
      const count = await contract.taskCount();
      const taskList: TaskInfo[] = [];
      for (let i = 0; i < Number(count); i++) {
        const t = await contract.tasks(i);
        taskList.push({
          owner: t[0],
          subAgent: t[1],
          amount: t[2],
          expectedHash: t[3],
          submittedHash: t[4],
          status: Number(t[5]),
          deadline: t[6],
        });
      }
      setTasks(taskList);
    } catch (e) {
      console.error("loadTasks error", e);
    }
  }, [contract]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      notify("Please install MetaMask!");
      return;
    }
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const net = await provider.getNetwork();
      const bal = await provider.getBalance(addr);

      setWalletAddr(addr);
      setBalance(formatEther(bal));
      setChainId(Number(net.chainId));

      const c = new ethers.Contract(CONTRACT_ADDRESS, TASK_ABI, signer);
      setContract(c);
      setChainId(Number(net.chainId));
    } catch (e: any) {
      notify("Connection failed: " + (e.message || "unknown"));
    }
  };

  useEffect(() => {
    if (contract) loadTasks();
  }, [contract, loadTasks]);

  // Listen for account / chain changes
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletAddr(null);
        setContract(null);
      }
    };
    window.ethereum.on("accountsChanged", onAccountsChanged);
    return () => { window.ethereum.removeListener("accountsChanged", onAccountsChanged); };
  }, []);

  const waitTx = async (tx: ethers.TransactionResponse) => {
    const r = await tx.wait();
    setTxHash(r?.hash || null);
    return r;
  };

  const handleCreateTask = async () => {
    if (!contract) return;
    if (!subAgent || !dataHash || Number(amount) <= 0) {
      notify("Please fill all fields correctly"); return;
    }
    setLoading(true);
    try {
      const hash = dataHash.startsWith("0x") ? dataHash : ethers.keccak256(ethers.toUtf8Bytes(dataHash));
      const tx = await contract.createTask(subAgent, parseEther(amount), hash, Number(deadline) * 3600);
      await waitTx(tx);
      notify("Task created! Tx: " + (tx.hash || "").slice(0, 16) + "...");
      await loadTasks();
    } catch (e: any) {
      notify("Error: " + (e.message || "unknown").slice(0, 80));
    } finally { setLoading(false); }
  };

  const handleLockFund = async (taskId: number, ethAmount: string) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.lockFund(taskId, { value: parseEther(ethAmount) });
      await waitTx(tx);
      notify("Funds locked! Tx: " + (tx.hash || "").slice(0, 16) + "...");
      await loadTasks();
    } catch (e: any) {
      notify("Error: " + (e.message || "unknown").slice(0, 80));
    } finally { setLoading(false); }
  };

  const handleSubmitHash = async () => {
    if (!contract || submitTaskId === null || !submitHash) return;
    setLoading(true);
    try {
      const hash = submitHash.startsWith("0x") ? submitHash : ethers.keccak256(ethers.toUtf8Bytes(submitHash));
      const tx = await contract.submitHash(submitTaskId, hash);
      await waitTx(tx);
      notify("Hash submitted! Tx: " + (tx.hash || "").slice(0, 16) + "...");
      setSubmitTaskId(null);
      setSubmitHash("");
      await loadTasks();
    } catch (e: any) {
      notify("Error: " + (e.message || "unknown").slice(0, 80));
    } finally { setLoading(false); }
  };

  const handleVerify = async (taskId: number) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.verifyHash(taskId);
      await waitTx(tx);
      notify("Hash verified! Tx: " + (tx.hash || "").slice(0, 16) + "...");
      await loadTasks();
    } catch (e: any) {
      notify("Error: " + (e.message || "unknown").slice(0, 80));
    } finally { setLoading(false); }
  };

  const handleRefund = async (taskId: number) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.refund(taskId);
      await waitTx(tx);
      notify("Refunded! Tx: " + (tx.hash || "").slice(0, 16) + "...");
      await loadTasks();
    } catch (e: any) {
      notify("Error: " + (e.message || "unknown").slice(0, 80));
    } finally { setLoading(false); }
  };

  const truncate = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";
  const shortHash = (h: string) => h ? `${h.slice(0, 10)}...${h.slice(-6)}` : "—";

  return (
    <div className="app">
      {notification && <div className="toast">{notification}</div>}

      <header className="header">
        <div className="logo">TaskChain</div>
        <div className="header-right">
          {walletAddr ? (
            <div className="wallet-info">
              <span className="chain-badge">Chain {chainId}</span>
              <span className="addr">{truncate(walletAddr)}</span>
              <span className="bal">{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
          ) : (
            <button className="btn-connect" onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </header>

      <main className="main">
        <div className="left">
          <section className="card">
            <h2>Create New Task</h2>
            <div className="form">
              <label>SubAgent Address</label>
              <input value={subAgent} onChange={e => setSubAgent(e.target.value)} placeholder="0x..." />
              <label>Amount (ETH)</label>
              <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.01" type="number" />
              <label>Data Hash / Plain Text</label>
              <input value={dataHash} onChange={e => setDataHash(e.target.value)} placeholder="Text or 0x..." />
              <label>Deadline (hours)</label>
              <input value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="72" type="number" />
              <button className="btn-primary" onClick={handleCreateTask} disabled={loading}>
                {loading ? "Processing..." : "Create Task"}
              </button>
            </div>
          </section>

          <section className="card">
            <h2>Contract Info</h2>
            <div className="info-grid">
              <span className="info-label">Contract</span>
              <span className="info-value mono">{truncate(CONTRACT_ADDRESS)}</span>
              <span className="info-label">Network</span>
              <span className="info-value">Hardhat Local (31337)</span>
              <span className="info-label">Total Tasks</span>
              <span className="info-value">{tasks.length}</span>
            </div>
          </section>
        </div>

        <div className="right">
          <section className="card tasks-card">
            <h2>Task List</h2>
            {!walletAddr && <p className="hint">Connect wallet to interact with tasks</p>}
            {tasks.length === 0 && walletAddr && <p className="hint">No tasks yet. Create one to get started.</p>}
            {tasks.map((task, i) => (
              <div key={i} className="task-item">
                <div className="task-header">
                  <span className="task-id">Task #{i}</span>
                  <span className="status-badge" style={{ background: STATUS_COLORS[task.status] }}>
                    {TASK_STATUS_NAMES[task.status]}
                  </span>
                </div>
                <div className="task-body">
                  <div className="task-row">
                    <span className="task-label">Owner</span>
                    <span className="task-value mono">{truncate(task.owner)}</span>
                  </div>
                  <div className="task-row">
                    <span className="task-label">SubAgent</span>
                    <span className="task-value mono">{truncate(task.subAgent)}</span>
                  </div>
                  <div className="task-row">
                    <span className="task-label">Amount</span>
                    <span className="task-value">{formatEther(task.amount)} ETH</span>
                  </div>
                  <div className="task-row">
                    <span className="task-label">Expected Hash</span>
                    <span className="task-value mono">{shortHash(task.expectedHash)}</span>
                  </div>
                  {task.submittedHash !== "0x0000000000000000000000000000000000000000000000000000000000000000" && (
                    <div className="task-row">
                      <span className="task-label">Submitted Hash</span>
                      <span className="task-value mono">{shortHash(task.submittedHash)}</span>
                    </div>
                  )}
                  <div className="task-row">
                    <span className="task-label">Deadline</span>
                    <span className="task-value">{new Date(Number(task.deadline) * 1000).toLocaleString()}</span>
                  </div>
                </div>
                <div className="task-actions">
                  {task.status === 1 && walletAddr?.toLowerCase() === task.owner.toLowerCase() && (
                    <button className="btn-action" onClick={() => handleLockFund(i, formatEther(task.amount))} disabled={loading}>
                      Lock Fund
                    </button>
                  )}
                  {task.status === 2 && walletAddr?.toLowerCase() === task.subAgent.toLowerCase() && (
                    <button className="btn-action" onClick={() => { setSubmitTaskId(i); setSubmitHash(""); }} disabled={loading}>
                      Submit Hash
                    </button>
                  )}
                  {task.status === 3 && (
                    <button className="btn-action btn-verify" onClick={() => handleVerify(i)} disabled={loading}>
                      Verify Hash
                    </button>
                  )}
                  {task.status === 5 && walletAddr?.toLowerCase() === task.owner.toLowerCase() && (
                    <button className="btn-action btn-refund" onClick={() => handleRefund(i)} disabled={loading}>
                      Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      {submitTaskId !== null && (
        <div className="modal-overlay" onClick={() => setSubmitTaskId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Submit Hash for Task #{submitTaskId}</h3>
            <input
              value={submitHash}
              onChange={e => setSubmitHash(e.target.value)}
              placeholder="Enter data text or 0x hash..."
            />
            <button className="btn-primary" onClick={handleSubmitHash} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button className="btn-cancel" onClick={() => setSubmitTaskId(null)}>Cancel</button>
          </div>
        </div>
      )}

      {txHash && (
        <div className="tx-banner">
          <span>Last TX: </span>
          <a href={"#"} onClick={e => e.preventDefault()}>{shortHash(txHash)}</a>
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window { ethereum: any; }
}

export default App;