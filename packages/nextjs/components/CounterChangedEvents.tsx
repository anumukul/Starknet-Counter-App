// packages/nextjs/components/CounterChangedEvents.tsx
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

  if (error) {
    console.error("Events error:", error);
    return <div className="text-error">Failed to load events</div>;
  }
  
  if (isLoading && (!data || data.length === 0)) {
    return <div>Loading events...</div>;
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

  const getReasonIcon = (reason: any) => {
    // Handle case where reason might be an object with variant
    let reasonStr = reason;
    if (typeof reason === 'object' && reason !== null) {
      if (reason.variant) {
        reasonStr = Object.keys(reason.variant)[0] || "Unknown";
      } else {
        reasonStr = String(reason);
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
    let reasonStr = reason;
    if (typeof reason === 'object' && reason !== null) {
      if (reason.variant) {
        reasonStr = Object.keys(reason.variant)[0] || "Unknown";
      } else {
        reasonStr = String(reason);
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
    let reasonStr = reason;
    if (typeof reason === 'object' && reason !== null) {
      if (reason.variant) {
        reasonStr = Object.keys(reason.variant)[0] || "Unknown";
      } else {
        reasonStr = String(reason);
      }
    }
    return reasonStr;
  };

  // Debug log to see the data structure
  console.log("Events data:", data);

  return (
    <div className="card bg-base-100 shadow-md max-w-4xl">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Recent Counter Changes</h3>
        <div className="space-y-3">
          {data.slice(0, 10).map((event: any, index: number) => {
            // Safely extract event data
            const args = event.args || event.parsedArgs || {};
            const reason = args.reason;
            const oldValue = args.old_value || args.oldValue;
            const newValue = args.new_value || args.newValue;
            const caller = args.caller;
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getReasonIcon(reason)}</span>
                  <div>
                    <p className={`font-medium ${getReasonColor(reason)}`}>
                      {getReasonText(reason)} Counter
                    </p>
                    <p className="text-sm text-base-content/70">
                      {String(oldValue || "?")} → {String(newValue || "?")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-base-content/70">
                    Block: {event.log?.block_number || event.blockNumber || "?"}
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