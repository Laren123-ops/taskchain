// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TaskChain — 多 Agent 协作的 Web3 任务分发网络
/// @notice 资金锁定 / 哈希验证 / 自动放款
/// @dev Hackathon MVP — 未经过审计，请勿用于主网

contract TaskChain is ReentrancyGuard, Pausable, Ownable {

    enum TaskStatus {
        NONE,
        CREATED,
        FUNDED,
        SUBMITTED,
        VERIFIED,
        FAILED,
        REFUNDED
    }

    struct Task {
        address payable owner;
        address payable subAgent;
        uint256 amount;
        bytes32 expectedHash;
        bytes32 submittedHash;
        TaskStatus status;
        uint256 deadline;
    }

    // taskId → Task
    mapping(uint256 => Task) public tasks;
    uint256 public taskCount;

    event TaskCreated(uint256 indexed taskId, address indexed owner, address indexed subAgent, uint256 amount);
    event HashSubmitted(uint256 indexed taskId, bytes32 indexed hash);
    event Verified(uint256 indexed taskId, bool success);
    event PaidOut(uint256 indexed taskId, uint256 amount);
    event Refunded(uint256 indexed taskId, uint256 amount);

    /// @notice 创建新任务
    function createTask(
        address _subAgent,
        uint256 _amount,
        bytes32 _expectedHash,
        uint256 _deadline
    ) external returns (uint256 taskId) {
        taskId = taskCount++;
        tasks[taskId] = Task({
            owner: payable(msg.sender),
            subAgent: payable(_subAgent),
            amount: _amount,
            expectedHash: _expectedHash,
            submittedHash: bytes32(0),
            status: TaskStatus.CREATED,
            deadline: block.timestamp + _deadline
        });
        emit TaskCreated(taskId, msg.sender, _subAgent, _amount);
    }

    /// @notice 锁定资金（由 Owner 调用，发送 USDC 或 ETH）
    function lockFund(uint256 _taskId) external payable onlyWhenTask(_taskId, TaskStatus.CREATED) {
        require(msg.value >= tasks[_taskId].amount, "Insufficient funds");
        tasks[_taskId].status = TaskStatus.FUNDED;
    }

    /// @notice 子 Agent 提交数据哈希
    function submitHash(uint256 _taskId, bytes32 _dataHash)
        external
        onlyWhenTask(_taskId, TaskStatus.FUNDED)
    {
        require(msg.sender == tasks[_taskId].subAgent, "Not the assigned agent");
        tasks[_taskId].submittedHash = _dataHash;
        tasks[_taskId].status = TaskStatus.SUBMITTED;
        emit HashSubmitted(_taskId, _dataHash);
    }

    /// @notice 验证哈希（验证 expectedHash == submittedHash）
    function verifyHash(uint256 _taskId)
        external
        nonReentrant
        onlyWhenTask(_taskId, TaskStatus.SUBMITTED)
        returns (bool success)
    {
        success = (tasks[_taskId].expectedHash == tasks[_taskId].submittedHash);
        tasks[_taskId].status = success ? TaskStatus.VERIFIED : TaskStatus.FAILED;
        emit Verified(_taskId, success);

        if (success) {
            _payout(_taskId);
        }
    }

    /// @notice 内部放款逻辑
    function _payout(uint256 _taskId) internal {
        Task storage task = tasks[_taskId];
        task.subAgent.transfer(task.amount);
        emit PaidOut(_taskId, task.amount);
    }

    /// @notice 退款给 Owner
    function refund(uint256 _taskId)
        external
        nonReentrant
        onlyWhenTask(_taskId, TaskStatus.FAILED)
    {
        Task storage task = tasks[_taskId];
        require(msg.sender == task.owner, "Not the task owner");
        task.owner.transfer(task.amount);
        task.status = TaskStatus.REFUNDED;
        emit Refunded(_taskId, task.amount);
    }

    /// @notice 超时退款（任何人可调用）
    function timeoutRefund(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        require(block.timestamp > task.deadline, "Not yet expired");
        require(task.status == TaskStatus.FUNDED || task.status == TaskStatus.SUBMITTED, "Cannot refund");
        task.owner.transfer(task.amount);
        task.status = TaskStatus.REFUNDED;
        emit Refunded(_taskId, task.amount);
    }

    /// @notice 暂停合约（仅 Owner）
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice 恢复合约（仅 Owner）
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Modifiers ============

    modifier onlyWhenTask(uint256 _taskId, TaskStatus _status) {
        require(tasks[_taskId].status == _status, "Invalid task status");
        _;
    }
}