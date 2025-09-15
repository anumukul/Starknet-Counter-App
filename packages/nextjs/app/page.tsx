// packages/nextjs/app/page.tsx
"use client";

import { ConnectedAddress } from "../components/ConnectedAddress";
import { CounterValue } from "../components/CounterValue";
import { IncreaseCounterButton } from "../components/IncreaseCounterButton";
import { DecreaseCounterButton } from "../components/DecreaseCounterButton";
import { useScaffoldReadContract } from "../hooks/scaffold-stark/useScaffoldReadContract";
import { SetCounterForm } from "../components/SetCounterForm";
import { CounterChangedEvents } from "../components/CounterChangedEvents";
import { ResetCounterButton } from "../components/ResetCounterButton";

const Home = () => {
  const { data, isLoading, error } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
  } as any);

  // Debug logging
  console.log("Counter data:", { data, isLoading, error });

  return (
    <div className="flex items-center flex-col grow pt-10 px-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">StarkNet Counter DApp</h1>
        <p className="text-lg text-base-content/70">
          A simple counter contract with ownership controls and STRK payments
        </p>
      </div>

      {/* Connected Address */}
      <div className="mb-8">
        <ConnectedAddress />
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-base-200 rounded-lg text-xs">
          <p>Debug: data={JSON.stringify(data)}, isLoading={String(isLoading)}, error={error?.message}</p>
        </div>
      )}

      {/* Main Counter Display */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body text-center">
          <h2 className="card-title justify-center text-2xl mb-4">Current Counter</h2>
          <div className="text-6xl font-bold mb-6">
            <CounterValue value={data} isLoading={isLoading} error={error} />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <IncreaseCounterButton />
            <DecreaseCounterButton counter={data} />
            <ResetCounterButton />
          </div>
        </div>
      </div>

      {/* Set Counter Form */}
      <div className="mb-8 w-full max-w-md">
        <SetCounterForm current={data} />
      </div>

      {/* Events Section */}
      <div className="w-full max-w-4xl">
        <CounterChangedEvents />
      </div>
    </div>
  ); 
};

export default Home;