// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { BaseGuard } from "@safe-global/safe-contracts/contracts/base/GuardManager.sol";
import { Enum } from "@safe-global/safe-contracts/contracts/common/Enum.sol";

/**
 * @title NoDelegatecallGuard
 * @dev This contract implements a custom guard that prevents DelegateCall operations and ensures that certain transactions
 * require a minimum number of signatures.
 */
contract NoDelegatecallGuard is BaseGuard {
    
    /**
     * @dev Error to indicate that delegatecall is not allowed.
     */
    error DelegatecallNotAllowed();

    /**
     * @dev Error to indicate that insufficient signatures are provided for the transaction.
     * @param required The number of signatures required for the transaction to proceed.
     */
    error InsufficientSignatures(uint256 required);

    /**
     * @dev This function checks the validity of a transaction before execution.
     * @param to The address the transaction is sent to.
     * @param value The value (in wei) sent with the transaction.
     * @param data The transaction data (encoded function call).
     * @param operation The type of operation (Call, DelegateCall, etc.).
     * @param safeTxGas The gas to be used for the transaction.
     * @param baseGas The base gas cost for the transaction.
     * @param gasPrice The gas price for the transaction.
     * @param gasToken The token to be used to pay for gas.
     * @param refundReceiver The address to receive any refund.
     * @param signatures The list of signatures for the transaction.
     * @param msgSender The address of the message sender initiating the transaction.
     *
     * @notice Reverts the transaction if the operation is a DelegateCall.
     * @notice Also checks if the number of signatures is sufficient for specific calls (e.g., `addOwnerWithThreshold`).
     */
    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures,
        address msgSender
    ) external override {
        // Revert if the operation is DelegateCall
        if(operation == Enum.Operation.DelegateCall) {
            revert DelegatecallNotAllowed();
        }

        // If it's a fund transfer call, no additional checks are required
        if (to != address(this) && data.length == 0 && value > 0) {
            return;
        } else {
            bytes4 selector;

            assembly {
                selector := mload(add(data, 0x20)) // Extract the function selector (first 4 bytes)
            }

            // Check for `addOwnerWithThreshold` function call
            if (selector == bytes4(keccak256("addOwnerWithThreshold(address,uint256)"))) {
                // Check if the number of signatures is below the required threshold (5 signatures)
                if (signatures.length / 65 < 5) {
                    revert InsufficientSignatures(5);
                }
            }
        }
    }

    /**
     * @dev This function is invoked after the transaction execution to handle any post-execution logic.
     * @param txHash The hash of the transaction.
     * @param success Boolean indicating if the transaction was successful or not.
     *
     * @notice This function is not used in this implementation, but it is kept for consistency with the base contract.
     */
    function checkAfterExecution(bytes32 txHash, bool success) external override {
        // Implement any logic needed after execution (if any)
    }
}
