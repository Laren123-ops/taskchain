import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TaskChain contract...");

  const TaskChain = await ethers.getContractFactory("TaskChain");
  const contract = await TaskChain.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`TaskChain deployed to: ${address}`);
  console.log(`Transaction: ${contract.deploymentTransaction()?.hash}`);

  // Verify contract on PolygonScan (if API key is set)
  try {
    await contract.deploymentTransaction()?.wait(5);
    const { default: dotenv } = await import("dotenv");
    dotenv.config();
    if (process.env.POLYGONSCAN_API_KEY) {
      await run("hardhat verify --network amoy " + address);
    }
  } catch (e) {
    console.log("Verification skipped (no API key or network issue)");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});