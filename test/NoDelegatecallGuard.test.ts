import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer, ZeroAddress } from "ethers";
import { Safe, Safe__factory, SafeProxyFactory } from "../typechain-types";
import { execTransaction } from "./utils/utils";
import { NoDelegatecallGuard } from "../typechain-types/contracts/NoDelegatecallGuard";

describe("NoDelegatecallGuard", async function () {
  let deployer: Signer;
  let alice: Signer;
  let bob: Signer;
  let owner2: Signer;
  let owner3: Signer;
  let owner4: Signer;
  let owner5: Signer;

  let masterCopy: Safe;
  let proxyFactory: SafeProxyFactory;
  let safeFactory: Safe__factory;
  let safe: Safe;
  let exampleGuard: NoDelegatecallGuard;
  let threshold = 1;

  // Setup signers and deploy contracts before running tests
  beforeEach(async () => {
    [deployer, alice, owner2, owner3, owner4, owner5, bob] = await ethers.getSigners();

    safeFactory = await ethers.getContractFactory("Safe", deployer);
    masterCopy = await safeFactory.deploy();

    proxyFactory = await (
      await ethers.getContractFactory("SafeProxyFactory", deployer)
    ).deploy();

    const ownerAddresses = [await alice.getAddress(), await owner2.getAddress(), await owner3.getAddress(), await owner4.getAddress(), await owner5.getAddress()];

    // now threshold is 1
    const safeData = masterCopy.interface.encodeFunctionData("setup", [
      ownerAddresses,
      threshold,
      ZeroAddress,
      "0x",
      ZeroAddress,
      ZeroAddress,
      0,
      ZeroAddress,
    ]);

    // Read the safe address by executing the static call to createProxyWithNonce function
    const safeAddress = await proxyFactory.createProxyWithNonce.staticCall(
      await masterCopy.getAddress(),
      safeData,
      0n
    );

    // Create the proxy with nonce
    await proxyFactory.createProxyWithNonce(
      await masterCopy.getAddress(),
      safeData,
      0n
    );

    if (safeAddress === ZeroAddress) {
      throw new Error("Safe address not found");
    }

    // Deploy the NoDelegatecallGuard contract
    exampleGuard = await (
      await ethers.getContractFactory("NoDelegatecallGuard", deployer)
    ).deploy();

    safe = await ethers.getContractAt("Safe", safeAddress);

    // Set the guard in the safe
    const setGuardData = masterCopy.interface.encodeFunctionData("setGuard", [
      exampleGuard.target,
    ]);

    // Execute the transaction to set the Guard
    await execTransaction([alice], safe, safe.target, 0, setGuardData, 0);


    // First, let's fund the Safe with some Ether
    const transferAmount = ethers.parseEther("1.0");

    // Transfer 1 Ether to the safe
    await deployer.sendTransaction({
      to: safe.target,
      value: transferAmount,
    });

      // Check if the balance is updated
    const newBalance = await ethers.provider.getBalance(safe.target);
    expect(newBalance).to.equal(transferAmount);


    // Now update the threshold to 3
    let newThreshold = 3;  // Set threshold to 3

    // Prepare the data for the changeThreshold function
    const changeThresholdData = masterCopy.interface.encodeFunctionData("changeThreshold", [
      newThreshold,  // New threshold value
    ]);

    // Execute the transaction to update the threshold
    await execTransaction([alice], safe, safe.target, 0, changeThresholdData, 0);

    const currentThreshold = await safe.getThreshold();
    expect(currentThreshold).to.equal(newThreshold);

  });

  it("addOwnerWithThreshold should have atleast 5 signers - control transactions ", async function () {
    const wallets = [alice, owner3, owner5];

    const addOwnerWithThresholdData = masterCopy.interface.encodeFunctionData("addOwnerWithThreshold", [
      bob.address,  // Replace with the actual new owner address
      3,     // New threshold value
    ]);

    await expect(
      execTransaction(wallets, safe, ZeroAddress, 0, addOwnerWithThresholdData, 0)
    ).to.be.revertedWithCustomError(exampleGuard, "InsufficientSignatures");

  });

  it("Should not allow delegatecall", async function () {
    const wallets = [alice, owner3, owner5];

    await expect(
      execTransaction(wallets, safe, ZeroAddress, 0, "0x", 1)
    ).to.be.revertedWithCustomError(exampleGuard, "DelegatecallNotAllowed");
  });


  it("Should allow call", async function () {
    const wallets = [alice, owner2, owner5];

    expect(await execTransaction(wallets, safe, ZeroAddress, 0, "0x", 0));
  });

  it("Should require 3 signatures for fund transfer", async function () {
    // Set up the fund transfer amount (ETH)
    const transferAmount = ethers.parseEther("1");

     // Fetch the current nonce for the safe
    const nonce = await safe.nonce();

    // Prepare data for the fund transfer
    const recipient = await alice.getAddress();
  
    const operation = 0; // Regular Call (0 for standard Ether transfer, 1 for delegate call)

     // Encoding the transaction parameters for the fund transfer
    const transferData = safe.interface.encodeFunctionData("execTransaction", [
      recipient, // To address (alice)
      transferAmount, // Amount (1 ETH)
      "0x", // No data (empty calldata)
      operation, // Operation type (0 for call)
      1000000, // Gas limit
      0, // Base gas
      0, // Gas price
      ZeroAddress, // Gas token (using native ETH)
      ZeroAddress, // Refund receiver
      "0x" // Signatures (assuming the contract handles multi-sig internally)
    ]);

    let x = await expect(
      execTransaction([alice, owner2, owner3], safe, ZeroAddress, 0, transferData, 1)
    )});

});
