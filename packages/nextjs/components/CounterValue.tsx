"use client";

type Props = { 
  value: any; 
  isLoading?: boolean; 
  error?: any 
};

export const CounterValue = ({ value, isLoading, error }: Props) => {
  // Debug logging only in development
  if (process.env.NODE_ENV === 'development') {
    console.log("CounterValue received:", { 
      value, 
      isLoading: isLoading || false, 
      error: error || null, 
      valueType: typeof value 
    });
  }
  
  if (error) {
    console.error("Counter value error:", error);
    return <span className="text-error text-2xl">Failed to load counter</span>;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Enhanced value extraction
  const getDisplayValue = (val: any): string => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Processing value:", val, "Type:", typeof val);
    }
    
    if (val === undefined || val === null) {
      return "0";
    }
    
    // Handle array responses
    if (Array.isArray(val)) {
      return getDisplayValue(val[0]);
    }
    
    // Handle BigInt
    if (typeof val === 'bigint') {
      return val.toString();
    }
    
    // Handle string numbers
    if (typeof val === 'string') {
      const num = Number(val);
      if (!isNaN(num)) {
        return val;
      }
    }
    
    // Handle direct numbers
    if (typeof val === 'number') {
      return val.toString();
    }
    
    // Handle objects (StarkNet often returns complex objects)
    if (typeof val === 'object' && val !== null) {
      const keys = Object.keys(val);
      
      // Try common StarkNet response patterns
      if (val.result !== undefined) {
        return getDisplayValue(val.result);
      }
      
      if (val.value !== undefined) {
        return getDisplayValue(val.value);
      }
      
      if (val.data !== undefined) {
        return getDisplayValue(val.data);
      }
      
      // If single key object, try to extract value
      if (keys.length === 1) {
        return getDisplayValue(val[keys[0]]);
      }
      
      // Try to find any numeric value in the object
      for (const key of keys) {
        const propValue = val[key];
        if (typeof propValue === 'number' || typeof propValue === 'bigint' || 
            (typeof propValue === 'string' && !isNaN(Number(propValue)))) {
          return getDisplayValue(propValue);
        }
      }
    }
    
    // Final fallback - try to convert to string and parse as number
    const str = String(val);
    const num = Number(str);
    if (!isNaN(num)) {
      return str;
    }
    
    return "0";
  };

  const displayValue = getDisplayValue(value);
  
  return (
    <div className="flex items-center justify-center py-4">
      <span 
        className="font-mono text-8xl font-black text-white drop-shadow-lg"
        style={{
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
          color: '#ffffff'
        }}
      >
        {displayValue}
      </span>
    </div>
  );
};
