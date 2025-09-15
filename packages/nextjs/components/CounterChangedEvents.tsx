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

  // Debug logging
  console.log("Events data:", data);

  if (error) {
    console.error("Events error:", error);
    return <div className="text-error">Failed to load events</div>;
  }
  
  if (isLoading && (!data || data.length === 0)) {
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h3 className="card-title text-lg">Recent Counter Changes</h3>
          <div className="flex items-center justify-center py-8">
            <span className="loading loading-spinner loading-md"></span>
            <span className="ml-2">Loading events...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h3 className="card-title text-lg">Recent Counter Changes</h3>
          <p className="text-base-content/70">No events yet. Make some changes to see them here!</p>
        </div>
      </div>
    );
  }

  // Enhanced value extraction for events
  const extractEventValue = (value: any): string => {
    if (value === undefined || value === null) return "?";
    
    // Handle BigInt
    if (typeof value === 'bigint') {
      return value.toString();
    }
    
    // Handle direct numbers and strings
    if (typeof value === 'number' || typeof value === 'string') {
      return String(value);
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      return extractEventValue(value[0]);
    }
    
    // Handle objects
    if (typeof value === 'object' && value !== null) {
      const keys = Object.keys(value);
      if (keys.length === 1) {
        return extractEventValue(value[keys[0]]);
      }
      // Try common property names
      if (value.value !== undefined) return extractEventValue(value.value);
      if (value.result !== undefined) return extractEventValue(value.result);
    }
    
    return String(value);
  };

  const getReasonIcon = (reason: any) => {
    let reasonStr = extractEventValue(reason);
    if (typeof reason === 'object' && reason !== null) {
      if (reason.variant) {
        const variants = Object.keys(reason.variant);
        reasonStr = variants.length > 0 ? variants[0] : "Unknown";
      }
    }
    
    switch (reasonStr) {
      case "Increase": return "📈";
      case "Decrease": return "📉";
      case "Reset": return "🔄";
      case "Set": return "⚙️";
      default: return "📝";
    }
  };

  const getReasonColor = (reason: any) => {
    let reasonStr = extractEventValue(reason);
    if (typeof reason === 'object' && reason !== null) {
      if (reason.variant) {
        const variants = Object.keys(reason.variant);
        reasonStr = variants.length > 0 ? variants[0] : "Unknown";
      }
    }
    
    switch (reasonStr) {
      case "Increase": return "text-success";
      case "Decrease": return "text-warning";
      case "Reset": return "text-info";
      case "Set": return "text-secondary";
      default: return "text-base-content";
    }
  };

  const getReasonText = (reason: any) => {
    let reasonStr = extractEventValue(reason);
    if (typeof reason === 'object' && reason !== null) {
      if (reason.variant) {
        const variants = Object.keys(reason.variant);
        reasonStr = variants.length > 0 ? variants[0] : "Unknown";
      }
    }
    return reasonStr;
  };

  return (
    <div className="card bg-base-100 shadow-md max-w-4xl">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Recent Counter Changes</h3>
        <div className="space-y-3">
          {data.slice(0, 10).map((event: any, index: number) => {
            // Debug log each event
            console.log(`Event ${index}:`, event);
            
            // Safely extract event data with multiple fallback strategies
            const args = event.args || event.parsedArgs || {};
            console.log(`Event ${index} args:`, args);
            
            const reason = args.reason;
            const oldValue = extractEventValue(args.old_value || args.oldValue || args.prev_value);
            const newValue = extractEventValue(args.new_value || args.newValue || args.value);
            const caller = args.caller;
            
            console.log(`Event ${index} extracted:`, { reason, oldValue, newValue, caller });
            
            return (
              <div key={`${event.log?.transaction_hash || 'unknown'}-${index}`} 
                   className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getReasonIcon(reason)}</span>
                  <div>
                    <p className={`font-medium ${getReasonColor(reason)}`}>
                      {getReasonText(reason)} Counter
                    </p>
                    <p className="text-sm text-base-content/70">
                      {oldValue} → {newValue}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-base-content/70">
                    Block: {extractEventValue(event.log?.block_number || event.blockNumber)}
                  </p>
                  {caller && (
                    <p className="text-xs text-base-content/50 font-mono">
                      {String(caller).slice(0, 6)}...{String(caller).slice(-4)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {data.length > 10 && (
          <div className="text-center mt-4">
            <p className="text-sm text-base-content/70">
              Showing latest 10 events ({data.length} total)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
