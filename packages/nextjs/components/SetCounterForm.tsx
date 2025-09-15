"use client";

import { useAccount } from "../hooks/useAccount";
import { useMemo, useState, useEffect } from "react";
import { useScaffoldWriteContract } from "../hooks/scaffold-stark/useScaffoldWriteContract";
import { useScaffoldReadContract } from "../hooks/scaffold-stark/useScaffoldReadContract";
import { toSafeNumber, toSafeString } from "../utils/bigintUtils";

export const SetCounterForm = ({ current }: { current: any }) => {
  const [value, setValue] = useState<string>("");

  // Update form value when current counter changes
  useEffect(() => {
    const currentVal = toSafeNumber(current);
    if (current !== undefined && current !== null) {
      setValue(String(currentVal));
    }
  }, [current]);

  const { sendAsync, status } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "set_counter",
    args: [value ? parseInt(value) : 0],
  } as any);

  const { address } = useAccount();
  const { data: owner } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "owner",
  });

  const normalizeToHex = (input: any): string | undefined => {
    if (input === undefined || input === null) return undefined;
    const raw: any = Array.isArray(input) ? input[0] : input;
    const s: string = toSafeString(raw);
    if (s.length === 0) return undefined;
    return s.startsWith("0x") ? s : "0x" + BigInt(s).toString(16);
  };
 
  const addrHex = useMemo(() => normalizeToHex(address), [address]);
  const ownerHex = useMemo(() => normalizeToHex(owner), [owner]);

  const isOwner = useMemo(() => {
    if (!addrHex || !ownerHex) return false;
    try {
      return BigInt(addrHex) === BigInt(ownerHex);
    } catch {
      return false;
    }
  }, [addrHex, ownerHex]);

  const isBusy = status === "pending";
  const parsed = (() => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return undefined;
    return n;
  })();

  const currentVal = toSafeNumber(current);
  const hasChanged = current !== undefined && parsed !== undefined && parsed !== currentVal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsed === undefined || !isOwner || !hasChanged) return;
    
    try {
      await sendAsync();
    } catch (error) {
      console.error("Failed to set counter:", error);
    }
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h3 className="card-title text-lg">Set Counter Value</h3>
        <p className="text-sm text-base-content/70 mb-4">
          Only the contract owner can set a specific counter value.
        </p>
        
        <form className="flex items-center gap-3" onSubmit={handleSubmit}>
          <div className="form-control">
            <input
              className="input input-bordered input-sm w-32"
              type="number"
              min="0"
              step="1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              disabled={isBusy || !isOwner}
            />
          </div>
          
          <button
            className="btn btn-accent btn-sm"
            type="submit"
            disabled={isBusy || parsed === undefined || !isOwner || !hasChanged}
            title={
              !isOwner
                ? "Only the owner can set the counter value"
                : !hasChanged
                ? "Value hasn't changed"
                : parsed === undefined
                ? "Enter a valid non-negative integer"
                : undefined
            }
          >
            {isBusy ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Setting...
              </>
            ) : (
              "Set Value"
            )}
          </button>
        </form>

        {!isOwner && address && (
          <div className="alert alert-warning mt-3">
            <span className="text-sm">
              🔒 You are not the contract owner. Only the owner can set counter values.
            </span>
          </div>
        )}

        {isOwner && (
          <div className="alert alert-info mt-3">
            <span className="text-sm">
              ✅ You are the contract owner and can set any counter value.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};