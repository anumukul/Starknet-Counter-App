"use client";

import { ConnectedAddress } from "../components/ConnectedAddress";
import { CounterValue } from "../components/CounterValue";
import { IncreaseCounterButton } from "../components/IncreaseCounterButton";
import { DecreaseCounterButton } from "../components/DecreaseCounterButton";
import { useScaffoldReadContract } from "../hooks/scaffold-stark/useScaffoldReadContract";
import { SetCounterForm } from "../components/SetCounterForm";
import { CounterChangedEvents } from "../components/CounterChangedEvents";
import { ResetCounterButton } from "../components/ResetCounterButton";
import { useAccount } from "../hooks/useAccount";
import { useDeployedContractInfo } from "../hooks/scaffold-stark/useDeployedContractInfo";

const Home = () => {
  const accountData = useAccount();
  const { isConnected = false } = accountData || {};
  
  // Check if counter contract is deployed
  const { data: contractInfo, isLoading: contractLoading } = useDeployedContractInfo("CounterContract");

  console.log("Debug - Contract lookup:", {
  contractInfo,
  contractLoading,
  // Add this to see what deployedContracts contains
  allContracts: require('../contracts/deployedContracts').default
});
  
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
    enabled: !!contractInfo,
  } as any);

  // Debug logging only in development
  if (process.env.NODE_ENV === 'development') {
    console.log("Main page state:", { 
      data, 
      isLoading: isLoading || false, 
      error: error || null, 
      contractInfo: contractInfo || null,
      dataType: typeof data,
      isConnected: isConnected || false
    });
  }

  return (
    <div className="flex items-center flex-col grow pt-10 px-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-white">StarkNet Counter DApp</h1>
        <p className="text-lg text-base-content/70">
          A simple counter contract with ownership controls and STRK payments
        </p>
      </div>

      {/* Connected Address */}
      <div className="mb-8">
        <ConnectedAddress />
      </div>

      {/* Contract Status */}
      {contractLoading && (
        <div className="alert alert-info mb-8 max-w-md">
          <span className="loading loading-spinner loading-sm"></span>
          <span>Checking contract deployment...</span>
        </div>
      )}

      {!contractLoading && !contractInfo && (
        <div className="alert alert-error mb-8 max-w-md">
          <span>⚠️ Counter contract not deployed. Please run deployment first.</span>
        </div>
      )}

      {/* Connection Warning */}
      {!isConnected && (
        <div className="alert alert-warning mb-8 max-w-md">
          <span>Please connect your wallet to interact with the counter</span>
        </div>
      )}

      {/* Debug Info (Development Only) - Hidden in Production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-base-200 rounded-lg text-xs max-w-4xl w-full">
          <details>
            <summary className="cursor-pointer font-mono">🔍 Debug Info (Development Only)</summary>
            <div className="mt-2 space-y-2 font-mono">
              <div className="border-b pb-2">
                <p><strong>Contract Info:</strong></p>
                <p>Address: {contractInfo?.address || 'Not deployed'}</p>
                <p>ABI Length: {contractInfo?.abi?.length || 'N/A'}</p>
              </div>
              <div className="border-b pb-2">
                <p><strong>Counter Data:</strong></p>
                <p>Raw Data: {data ? JSON.stringify(data, (k, v) => typeof v === 'bigint' ? v.toString() + 'n' : v) : 'undefined'}</p>
                <p>Data Type: {typeof data}</p>
                <p>Is Array: {String(Array.isArray(data))}</p>
                <p>Loading: {String(isLoading || false)}</p>
                <p>Error: {error?.message || 'None'}</p>
              </div>
              <div>
                <p><strong>Connection:</strong></p>
                <p>Connected: {String(isConnected || false)}</p>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Main Counter Display */}
      {contractInfo && (
        <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 shadow-2xl mb-8 border border-primary/30">
          <div className="card-body text-center">
            <h2 className="card-title justify-center text-3xl mb-6 text-white">Current Counter</h2>
            
            {/* Enhanced Counter Display */}
            <div className="bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl p-8 mb-6 border border-primary/50">
              <CounterValue value={data} isLoading={isLoading} error={error} />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
              <IncreaseCounterButton />
              <DecreaseCounterButton counter={data} />
              <ResetCounterButton />
            </div>

            {/* Refresh Button */}
            <div className="mt-4">
              <button 
                className="btn btn-ghost btn-sm text-white hover:bg-white/20"
                onClick={() => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log("Manual refetch triggered");
                  }
                  refetch?.();
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Refreshing...
                  </>
                ) : (
                  "🔄 Refresh"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Counter Form */}
      {contractInfo && (
        <div className="mb-8 w-full max-w-md">
          <SetCounterForm current={data} />
        </div>
      )}

      {/* Events Section */}
      {contractInfo && (
        <div className="w-full max-w-4xl">
          <CounterChangedEvents />
        </div>
      )}
    </div>
  ); 
};

export default Home;