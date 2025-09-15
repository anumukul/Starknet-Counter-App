"use client";

import { useScaffoldWriteContract } from "../hooks/scaffold-stark/useScaffoldWriteContract";

export const IncreaseCounterButton = () => {
  const { sendAsync, status } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "increase_counter",
    args: [],
  }); 

  return (
    <button
      className="btn btn-primary btn-sm"
      onClick={() => sendAsync()}
      disabled={status === "pending"}
    >
      {status === "pending" ? "Increasing..." : "+1"}
    </button>
  );
};