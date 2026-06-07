import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("TaskChain", function () {
  async function deployFixture() {
    const [owner, subAgent, other] = await ethers.getSigners();

    const TaskChain = await ethers.getContractFactory("TaskChain");
    const contract = await TaskChain.deploy();

    return { contract, owner, subAgent, other };
  }

  it("should create a task", async function () {
    const { contract, owner, subAgent } = await loadFixture(deployFixture);

    const expectedHash = ethers.keccak256(ethers.toUtf8Bytes("test data"));
    const deadline = 72 * 3600; // 72 hours

    const tx = await contract.createTask(subAgent.address, ethers.parseEther("5"), expectedHash, deadline);
    const receipt = await tx.wait();

    const taskCreatedEvent = receipt?.logs.find((l: any) => l.fragment?.name === "TaskCreated");
    expect(taskCreatedEvent).to.not.be.undefined;
  });

  it("should lock funds and update status to FUNDED", async function () {
    const { contract, owner, subAgent } = await loadFixture(deployFixture);

    const expectedHash = ethers.keccak256(ethers.toUtf8Bytes("test data"));
    const deadline = 72 * 3600;

    await contract.createTask(subAgent.address, ethers.parseEther("5"), expectedHash, deadline);
    await contract.lockFund(0, { value: ethers.parseEther("5") });

    const task = await contract.tasks(0);
    expect(task.status).to.equal(1); // TaskStatus.FUNDED = 1
  });

  it("should verify hash and payout to subAgent", async function () {
    const { contract, owner, subAgent } = await loadFixture(deployFixture);

    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("real data"));
    const deadline = 72 * 3600;

    await contract.createTask(subAgent.address, ethers.parseEther("5"), dataHash, deadline);
    await contract.lockFund(0, { value: ethers.parseEther("5") });

    // subAgent submits correct hash
    await contract.connect(subAgent).submitHash(0, dataHash);
    const verified = await contract.verifyHash(0);

    expect(verified).to.equal(true);
    const task = await contract.tasks(0);
    expect(task.status).to.equal(3); // TaskStatus.VERIFIED = 3
  });

  it("should refund when hash does not match", async function () {
    const { contract, owner, subAgent } = await loadFixture(deployFixture);

    const expectedHash = ethers.keccak256(ethers.toUtf8Bytes("expected"));
    const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong data"));
    const deadline = 72 * 3600;

    await contract.createTask(subAgent.address, ethers.parseEther("5"), expectedHash, deadline);
    await contract.lockFund(0, { value: ethers.parseEther("5") });
    await contract.connect(subAgent).submitHash(0, wrongHash);

    const success = await contract.verifyHash(0);
    expect(success).to.equal(false);

    // Owner can refund
    const taskBefore = await ethers.provider.getBalance(owner.address);
    await contract.refund(0);
    const taskAfter = await ethers.provider.getBalance(owner.address);
    expect(taskAfter > taskBefore).to.be.true;
  });
});