"use client";

import { useScaffoldWriteContract } from "../hooks/scaffold-stark/useScaffoldWriteContract";

export const ResetCounterButton = () => {
  const { sendAsync, status } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "reset_counter",
    args: [],
  } as any);

  const isBusy = status === "pending";

  return (
    <button
      className="btn btn-warning btn-sm"
      onClick={() => sendAsync()}
      disabled={isBusy}
      title="Pays STRK and resets the counter"
    >
      {isBusy ? "Resetting..." : "Reset"}
    </button>
  );
};