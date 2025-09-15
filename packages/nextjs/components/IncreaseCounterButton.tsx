"use client";

import { useScaffoldWriteContract } from "../hooks/scaffold-stark/useScaffoldWriteContract";

export const IncreaseCounterButton = () => {
  const { sendAsync, status } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "increase_counter",
    args: [],
  }); 

  const handleIncrease = async () => {
    try {
      await sendAsync();
    } catch (error) {
      console.error("Failed to increase counter:", error);
    }
  };

  return (
    <button
      className="btn btn-primary btn-sm"
      onClick={handleIncrease}
      disabled={status === "pending"}
      title="Increase counter by 1"
    >
      {status === "pending" ? (
        <>
          <span className="loading loading-spinner loading-xs"></span>
          Increasing...
        </>
      ) : (
        "+1"
      )}
    </button>
  );
};
