"use client";

import { useScaffoldWriteContract } from "../hooks/scaffold-stark/useScaffoldWriteContract";
import { toSafeNumber } from "../utils/bigintUtils";

export const DecreaseCounterButton = ({ counter }: { counter: any }) => {
  const { sendAsync, status } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "decrease_counter",
    args: [],
  });

  const valueNum = toSafeNumber(counter);
  const isBusy = status === "pending";
  const isDisabled = isBusy || counter === undefined || valueNum <= 0;

  const handleDecrease = async () => {
    if (isDisabled) return;
    
    try {
      await sendAsync();
    } catch (error) {
      console.error("Failed to decrease counter:", error);
    }
  };

  return (
    <button
      className="btn btn-primary btn-sm"
      onClick={handleDecrease}
      disabled={isDisabled}
      title={valueNum <= 0 ? "Counter is already 0" : "Decrease counter by 1"}
    >
      {isBusy ? (
        <>
          <span className="loading loading-spinner loading-xs"></span>
          Decreasing...
        </>
      ) : (
        "-1"
      )}
    </button>
  );
};