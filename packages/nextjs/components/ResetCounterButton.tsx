// packages/nextjs/components/ResetCounterButton.tsx
"use client";

import { useScaffoldWriteContract } from "../hooks/scaffold-stark/useScaffoldWriteContract";
import { useScaffoldReadContract } from "../hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "../hooks/useAccount";
import useScaffoldStrkBalance from "../hooks/scaffold-stark/useScaffoldStrkBalance";
import { useState } from "react";

export const ResetCounterButton = () => {
  const [showApprovalStep, setShowApprovalStep] = useState(false);
  
  const { address } = useAccount();
  const { formatted: strkBalance } = useScaffoldStrkBalance({ address });
  
  // Check STRK allowance for the counter contract
  const { data: counterContractAddress } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter", // Just to get the contract address
  });

  const { data: allowance } = useScaffoldReadContract({
    contractName: "Strk", // STRK token contract
    functionName: "allowance",
    args: address && counterContractAddress ? [address, counterContractAddress] : undefined,
  });

  const { sendAsync: approveStrk, status: approveStatus } = useScaffoldWriteContract({
    contractName: "Strk",
    functionName: "approve",
    args: [], // Will be set when calling
  } as any);

  const { sendAsync: resetCounter, status: resetStatus } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "reset_counter",
    args: [],
  } as any);

  const strkBalanceNum = strkBalance ? parseFloat(strkBalance) : 0;
  const hasEnoughBalance = strkBalanceNum >= 1; // Need at least 1 STRK
  
  // Convert allowance to number for comparison (assuming 18 decimals)
  const allowanceNum = allowance ? Number(allowance) / Math.pow(10, 18) : 0;
  const hasEnoughAllowance = allowanceNum >= 1;

  const isBusy = resetStatus === "pending" || approveStatus === "pending";

  const handleApprove = async () => {
    try {
      // Approve 1 STRK (convert to wei: 1 * 10^18)
      const oneStrkInWei = "1000000000000000000"; // 1 STRK in wei
      await approveStrk({
        args: [counterContractAddress, oneStrkInWei]
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

  const isDisabled = isBusy || !hasEnoughBalance || !address;

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
          Balance: {strkBalance} STRK (need 1.0 STRK)
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
    </div>
  );
};