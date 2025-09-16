"use client";

import { useScaffoldWriteContract } from "../hooks/scaffold-stark/useScaffoldWriteContract";
import { useScaffoldReadContract } from "../hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "../hooks/useAccount";
import useScaffoldStrkBalance from "../hooks/scaffold-stark/useScaffoldStrkBalance";
import { useDeployedContractInfo } from "../hooks/scaffold-stark/useDeployedContractInfo";
import { useState } from "react";
import { notification } from "~~/utils/scaffold-stark";

export const ResetCounterButton = () => {
  const [showApprovalStep, setShowApprovalStep] = useState(false);
  
  const accountData = useAccount();
  const { address } = accountData || {};
  const { formatted: strkBalance } = useScaffoldStrkBalance({ address });
  
  // Get the deployed counter contract info
  const { data: counterContractData } = useDeployedContractInfo("CounterContract");
  
  // Check STRK allowance for the counter contract
  const { data: allowance } = useScaffoldReadContract({
    contractName: "Strk",
    functionName: "allowance",
    args: address && counterContractData?.address ? [address, counterContractData.address] : [undefined, undefined],
  });

  const { sendAsync: approveStrk, status: approveStatus } = useScaffoldWriteContract({
    contractName: "Strk",
    functionName: "approve",
    args: [],
  } as any);

  const { sendAsync: resetCounter, status: resetStatus } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "reset_counter",
    args: [],
  } as any);

  const strkBalanceNum = strkBalance ? parseFloat(strkBalance) : 0;
  const hasEnoughBalance = strkBalanceNum >= 1; // Need at least 1 STRK
  
  // Safe allowance conversion
  const getAllowanceNum = (allowanceValue: any): number => {
    if (!allowanceValue) return 0;
    
    let numValue = allowanceValue;
    if (Array.isArray(allowanceValue)) {
      numValue = allowanceValue[0];
    }
    if (typeof numValue === 'bigint') {
      numValue = Number(numValue);
    }
    if (typeof numValue === 'object' && numValue !== null) {
      const keys = Object.keys(numValue);
      if (keys.length === 1) {
        numValue = numValue[keys[0]];
        if (typeof numValue === 'bigint') {
          numValue = Number(numValue);
        }
      }
    }
    
    const parsed = Number(numValue);
    return isNaN(parsed) ? 0 : parsed / Math.pow(10, 18);
  };

  const allowanceNum = getAllowanceNum(allowance);
  const hasEnoughAllowance = allowanceNum >= 1;

  const isBusy = resetStatus === "pending" || approveStatus === "pending";

  const handleApprove = async () => {
    if (!counterContractData?.address) {
      notification.error("Counter contract not found");
      return;
    }

    try {
      // Approve 1 STRK (convert to wei: 1 * 10^18)
      const oneStrkInWei = "1000000000000000000"; // 1 STRK in wei
      
      await approveStrk({
        args: [counterContractData.address, oneStrkInWei]
      });
      setShowApprovalStep(false);
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleReset = async () => {
    if (!hasEnoughBalance) return;
    
    if (!hasEnoughAllowance) {
      setShowApprovalStep(true);
      return;
    }

    try {
      await resetCounter();
    } catch (error) {
      console.error("Reset failed:", error);
    }
  };

  const getButtonText = () => {
    if (isBusy) {
      if (approveStatus === "pending") return "Approving STRK...";
      if (resetStatus === "pending") return "Resetting...";
    }
    if (!hasEnoughBalance) return "Need 1 STRK";
    if (!hasEnoughAllowance) return "Approve & Reset";
    return "Reset (1 STRK)";
  };

  const isDisabled = isBusy || !hasEnoughBalance || !address || !counterContractData?.address;

  if (showApprovalStep) {
    return (
      <div className="flex flex-col gap-2">
        <div className="alert alert-info">
          <span className="text-sm">
            You need to approve the contract to spend 1 STRK for the reset operation.
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-accent btn-sm"
            onClick={handleApprove}
            disabled={approveStatus === "pending"}
          >
            {approveStatus === "pending" ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Approving...
              </>
            ) : (
              "Approve 1 STRK"
            )}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowApprovalStep(false)}
            disabled={approveStatus === "pending"}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        className="btn btn-warning btn-sm"
        onClick={handleReset}
        disabled={isDisabled}
        title={
          !hasEnoughBalance
            ? "You need at least 1 STRK to reset the counter"
            : !counterContractData?.address
            ? "Counter contract not deployed"
            : "Pays 1 STRK to the contract owner and resets counter to 0"
        }
      >
        {isBusy ? (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            {getButtonText()}
          </>
        ) : (
          getButtonText()
        )}
      </button>
      
      {!hasEnoughBalance && (
        <div className="text-xs text-warning">
          Balance: {strkBalance || '0'} STRK (need 1.0 STRK)
        </div>
      )}
      
      {hasEnoughBalance && !hasEnoughAllowance && (
        <div className="text-xs text-info">
          Will require approval for 1 STRK spend
        </div>
      )}
      
      {hasEnoughBalance && hasEnoughAllowance && (
        <div className="text-xs text-success">
          Ready to reset (approved: {allowanceNum.toFixed(2)} STRK)
        </div>
      )}

      {!counterContractData?.address && (
        <div className="text-xs text-error">
          Counter contract not found
        </div>
      )}
    </div>
  );
};