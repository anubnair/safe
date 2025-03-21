## Safe Guard Customized

### 📖 Overview
This project demonstrates how to deploy a Gnosis Safe with a custom guard/module to prevent/restrict control operations, specifically delegateCalls, and ensure that only the designated owners can perform fund transfers and control operations.

### 🚀 Features

- Deploy a Gnosis Safe with a custom guard or module.
- Restrict delegateCalls (control transactions) to require signatures from all 5 owners.
- Allow fund transfers (ETH and tokens) with a threshold of 3 out of 5 signatures.
- Deployer address has the privilege to deploy and attach the guard/module without requiring signatures from the owners.

### ⚙️ Getting Started

#### Prerequisites

Node.js: Version >= 18.x.x

Hardhat: For Ethereum development and testing.

#### Installation

Clone the repository:

```
git clone git@github.com:anubnair/safe.git
cd safe
```
Install dependencies/configure env:

```
npm install --save-dev hardhat

cp .env.example .env
```

```
npx hardhat compile
npx hardhat test --show-stack-traces
```

### 📞 Contact
For any questions or suggestions, feel free to reach out at anubnair90@gmail.com

### Safe Contract Deployment (Sepolia Testnet)

Safe Contract Deployment (Sepolia Testnet)

This document provides an overview of the deployed smart contracts and key transactions related to the Safe (Gnosis Safe) deployment on the Sepolia testnet.

Deployed Contracts

1. Mastercopy

Contract Address: 0x29F829c5be4135B9Cd022f2fB5D38fDCef10519F

Deployment Transaction: https://sepolia.etherscan.io/tx/0xa0e4028d7120041e089d0f3f49d6e7825023b5ed1b583e9d45003483a8f1cc75

2. Safe Proxy Factory

Contract Address: 0x25fb96726227dE60C430bee448b181d936E94412

Deployment Transaction: https://sepolia.etherscan.io/tx/0xd243a9e48dddec784a8dae4df8fa56bd33d3f9b0582861d25ca7359d7c675ab8

Key Transactions

3. Create Proxy With Nonce

Transaction: https://sepolia.etherscan.io/tx/0xc4a1405b1f34d6024d6c3fb7765ec9c86c325a4efbc5f004c40a44a4e4781383

Derived Safe Address: 0xB7ac68c378DCd6312d3A3DA7D5D3D6Ef71dd19Bc

4. NoDelegatecallGuard Deployment

Contract Address: 0x05583de0a1ae20dbabbfb9f98235320bfef1a7ad

Deployment Transaction: https://sepolia.etherscan.io/tx/0xc8a85fce28c27e9d7ddeef1a43b0e243474594460316f2d2fc232cc3508dc1df

5. Set NoDelegatecallGuard

Transaction: https://sepolia.etherscan.io/tx/0xe95901738498b63c6edba04bfb25154187df238672412efe3f0951c67e5a33a5

Note: This transaction was executed by one of the initially set owners, not the deployer.

6. Change Threshold to 3

Transaction: https://sepolia.etherscan.io/tx/0x61429ed4d960b7c88de94b787a7254957c4e6e5f1e0ab00923c03bd3e314a95d
