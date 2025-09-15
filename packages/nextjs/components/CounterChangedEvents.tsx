"use client";

import { useScaffoldEventHistory } from "../hooks/scaffold-stark/useScaffoldEventHistory";

export const CounterChangedEvents = () => {
  const { data, isLoading, error } = useScaffoldEventHistory({
    contractName: "CounterContract",
    eventName: "CounterChanged",
    fromBlock: 0n,
    watch: true,
    format: true,
  } as any);

  if (error) return <div className="text-error">failed</div>;
  if (isLoading && (!data || data.length === 0)) return <div>Loading events...</div>;