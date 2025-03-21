import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-dependency-compiler";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28", // Adjust the version as needed
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Adjust the number of optimization runs as needed
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
  },
  dependencyCompiler: {
    paths: [
      "@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol",
      "@safe-global/safe-contracts/contracts/Safe.sol",
    ],
  },
};

export default config;
