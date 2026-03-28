const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying FarmerIdentity contract to Sepolia...");

  const FarmerIdentity = await hre.ethers.getContractFactory("FarmerIdentity");
  const contract = await FarmerIdentity.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contract deployed at:", address);
  console.log("Add this to your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);

  // Save ABI to src/lib/ so Next.js can import it
  const artifact = await hre.artifacts.readArtifact("FarmerIdentity");
  const abiPath = path.join(__dirname, "../../src/lib/FarmerIdentityABI.json");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log("✅ ABI saved to src/lib/FarmerIdentityABI.json");
}

main().catch((err) => { console.error(err); process.exit(1); });