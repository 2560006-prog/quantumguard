require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env.local" });

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
  },
};