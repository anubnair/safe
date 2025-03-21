require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const deployerWallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    const deployerAddress = await deployerWallet.getAddress();

    const owner2Wallet = new ethers.Wallet(process.env.OWNER2_PRIVATE_KEY, provider);
    const owner2WalletAddress = await owner2Wallet.getAddress();

    console.log("Deployer Address:", deployerAddress);
    console.log("owner2WalletAddress Address:", owner2WalletAddress);

    const owners = [
        process.env.OWNER1,
        process.env.OWNER2,
        process.env.OWNER3,
        process.env.OWNER4,
        process.env.OWNER5,
    ].filter(owner => owner && owner.trim() !== ""); // Remove undefined and empty string values

    console.log("owners:", owners);

    if (owners.length < 5) {
        throw new Error("Ensure all 5 owner addresses are set in the .env file.");
    }

    const threshold = 1; // Initial threshold for Safe

    console.log(`Deploying contracts with deployer address: ${deployerAddress}`);

    // Deploy Safe Master Copy
    const Safe = await ethers.getContractFactory("Safe", deployerWallet);
    const masterCopy = await Safe.deploy();
    await masterCopy.waitForDeployment();
    console.log(`Safe Master Copy deployed at: ${masterCopy.target}`);

    // Deploy Safe Proxy Factory
    const SafeProxyFactory = await ethers.getContractFactory("SafeProxyFactory", deployerWallet);
    const proxyFactory = await SafeProxyFactory.deploy();
    await proxyFactory.waitForDeployment();
    console.log(`Safe Proxy Factory deployed at: ${proxyFactory.target}`);

    // Use existing Safe Master Copy and Safe Proxy Factory
    // const masterCopy = await ethers.getContractAt("Safe", "0x29F829c5be4135B9Cd022f2fB5D38fDCef10519F", deployerWallet);
    // const proxyFactory = await ethers.getContractAt("SafeProxyFactory", "0x25fb96726227dE60C430bee448b181d936E94412", deployerWallet);

    // Encode setup function call
    const setupData = masterCopy.interface.encodeFunctionData("setup", [
        owners,
        threshold,
        ethers.ZeroAddress,
        "0x",
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        0,
        ethers.ZeroAddress,
    ]);

    console.log("Master Copy address:", await masterCopy.getAddress());

    // Static call to read the Safe address
    const safeAddress = await proxyFactory.createProxyWithNonce.staticCall(
        await masterCopy.getAddress(),
        setupData,
        0n
    );


    if (safeAddress === ethers.ZeroAddress) {
        throw new Error("Safe address not found");
    }

    console.log(`Safe address from static call: ${safeAddress}`);

    // Estimate Gas for creating the proxy
    const gasEstimate = await provider.estimateGas({
        to: "0x25fb96726227dE60C430bee448b181d936E94412",
        data: setupData,
      });
    
    console.log('Estimated Gas:', gasEstimate.toString());

    // Create the proxy with nonce
    const txn = await proxyFactory.createProxyWithNonce(
        await masterCopy.getAddress(),
        setupData,
        0n,
        { gasLimit: 2000000 } // Add a buffer to the gas limit
    );
    const receipt = await txn.wait();

    // const safeAddress = "0xB7ac68c378DCd6312d3A3DA7D5D3D6Ef71dd19Bc";

    // Deploy NoDelegatecallGuard
    const NoDelegatecallGuard = await ethers.getContractFactory("NoDelegatecallGuard", deployerWallet);
    const exampleGuard = await NoDelegatecallGuard.deploy();
    await exampleGuard.waitForDeployment();
    console.log(`NoDelegatecallGuard deployed at: ${exampleGuard.target}`);

    // Attach Safe contract
    const safe = await ethers.getContractAt("Safe", safeAddress, deployerWallet);

    // Set Guard for Safe
    const setGuardData = masterCopy.interface.encodeFunctionData("setGuard", [
        exampleGuard.target,
    ]);

    // // Use execTransaction utility function to send the transaction
    const execTransaction = require("../test/utils/utils").execTransaction;
    // const tx = await execTransaction([owner2Wallet], safe, safe.target, 0, setGuardData, 0);
    // console.log("Guard set successfully!");
    // console.log("Transaction hash:", tx);  // tx.hash will contain the transaction hash


    // // // Fund the Safe
    // // const transferAmount = ethers.parseEther("1.0");
    // // await deployerWallet.sendTransaction({ to: safe.target, value: transferAmount });

    // // console.log(`Safe funded with ${transferAmount} ETH`);

    // Set threshold to 3
    const newThreshold = 3;
    const changeThresholdData = masterCopy.interface.encodeFunctionData("changeThreshold", [newThreshold]);

    const tx = await execTransaction([owner2Wallet], safe, safe.target, 0, changeThresholdData, 0);
    console.log("Threshold updated to 3!", tx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
