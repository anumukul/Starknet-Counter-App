// packages/nextjs/components/CounterValue.tsx
"use client";

type Props = { 
  value: any; 
  isLoading?: boolean; 
  error?: any 
};

export const CounterValue = ({ value, isLoading, error }: Props) => {
  if (error) {
    console.error("Counter value error:", error);
    return <span className="text-error">Failed to load counter</span>;
  }
  
  if (isLoading || value === undefined || value === null) {
    return <span className="loading loading-spinner loading-sm"></span>;
  }
  
  // Handle different data formats that might come from the contract
  let displayValue = value;
  
  // Handle array responses (sometimes StarkNet returns arrays)
  if (Array.isArray(value)) {
    displayValue = value[0];
  }
  
  // Handle BigInt values
  if (typeof displayValue === 'bigint') {
    displayValue = displayValue.toString();
  }
  
  // Handle objects (for complex return types)
  if (typeof displayValue === 'object' && displayValue !== null) {
    // If it's an object with a single property, try to extract the value
    const keys = Object.keys(displayValue);
    if (keys.length === 1) {
      displayValue = displayValue[keys[0]];
      // Recursively handle nested types
      if (typeof displayValue === 'bigint') {
        displayValue = displayValue.toString();
      }
    } else {
      displayValue = String(displayValue);
    }
  }
  
  return <span className="font-mono text-2xl font-bold text-primary">{String(displayValue)}</span>;
};