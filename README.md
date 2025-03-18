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
npm install
# or
yarn install

cp .env.example .env
```

```
npx hardhat compile
npx hardhat test --show-stack-traces
```

### 📞 Contact
For any questions or suggestions, feel free to reach out at anubnair90@gmail.com
