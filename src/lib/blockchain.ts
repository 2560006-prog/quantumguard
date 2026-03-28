import { ethers } from "ethers";
import ABI from "./FarmerIdentityABI.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const RPC_URL          = process.env.SEPOLIA_RPC_URL!;
const PRIVATE_KEY      = process.env.DEPLOYER_PRIVATE_KEY!;

function getContract() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
}

// Call this after farmer profile is saved to Supabase
export async function registerFarmerOnChain(
  farmerId:    string,
  name:        string,
  mobile:      string,
  aadhaarLast4: string
) {
  try {
    const contract = getContract();
    const tx = await contract.registerFarmer(farmerId, name, mobile, aadhaarLast4);
    const receipt = await tx.wait();
    return {
      success:     true,
      txHash:      receipt.hash,
      blockNumber: receipt.blockNumber.toString(),
    };
  } catch (err: any) {
    console.error("Blockchain registration error:", err.message);
    return { success: false, txHash: null, blockNumber: null };
  }
}

// Call this on the blockchain details page
export async function verifyFarmerOnChain(farmerId: string) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const [exists, identityHash, registeredAt] = await contract.verifyFarmer(farmerId);
    return {
      exists,
      identityHash: identityHash,
      registeredAt: new Date(Number(registeredAt) * 1000).toLocaleDateString("en-IN"),
    };
  } catch (err: any) {
    console.error("Blockchain verify error:", err.message);
    return { exists: false, identityHash: null, registeredAt: null };
  }
}