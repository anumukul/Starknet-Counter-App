"use client";

import { useScaffoldReadContract } from "../hooks/scaffold-stark/useScaffoldReadContract";

type Props = { value: any; isLoading?: boolean; error?: any };

export const CounterValue = () => {
  const { data, isLoading, error } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
  });

export const CounterValue = ({ value, isLoading, error }: Props) => {
  if (error) return <span className="text-error">failed</span>;
  if (isLoading || data === undefined) return <span>...</span>;

  return <span className="font-mono">{String(data)}</span>;
  if (isLoading || value === undefined) return <span>...</span>;
  return <span className="font-mono">{String(value)}</span>;
};