"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const MyRetreats: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [retreatIds, setRetreatIds] = useState<string>("0,1,2,3,4");

  const ids = retreatIds
    .split(",")
    .map(id => id.trim())
    .filter(id => id !== "" && !isNaN(Number(id)));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-mono font-bold tracking-tight mb-2">My Positions</h1>
          <p className="text-neutral-500 font-mono text-sm">Track your locked tokens</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <label className="block text-xs text-neutral-500 font-mono mb-2">Retreat IDs (comma separated)</label>
          <input
            type="text"
            value={retreatIds}
            onChange={e => setRetreatIds(e.target.value)}
            placeholder="0, 1, 2, 3"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 font-mono focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {ids.map(id => (
            <RetreatCard key={id} retreatId={BigInt(id)} userAddress={connectedAddress} />
          ))}
        </div>

        {ids.length === 0 && (
          <div className="text-center py-12 text-neutral-600 font-mono text-sm">
            Enter retreat IDs to view positions
          </div>
        )}
      </main>
    </div>
  );
};

const RetreatCard = ({ retreatId, userAddress }: { retreatId: bigint; userAddress?: string }) => {
  const { data: retreatData, isLoading } = useScaffoldReadContract({
    contractName: "Cabin",
    functionName: "getRetreat",
    args: [retreatId],
  });

  const { data: timeRemaining } = useScaffoldReadContract({
    contractName: "Cabin",
    functionName: "timeUntilReturn",
    args: [retreatId],
  });

  const { data: canReturn } = useScaffoldReadContract({
    contractName: "Cabin",
    functionName: "canReturn",
    args: [retreatId],
  });

  const { writeContractAsync: returnToSociety, isPending } = useScaffoldWriteContract({
    contractName: "Cabin",
  });

  const handleReturn = async () => {
    await returnToSociety({
      functionName: "returnToSociety",
      args: [retreatId],
    });
  };

  if (isLoading) {
    return (
      <div className="border border-neutral-800 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-neutral-800 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-neutral-800 rounded w-1/2"></div>
      </div>
    );
  }

  if (!retreatData) return null;

  const [owner, token, amount, returnTime, active] = retreatData;
  const isYours = userAddress?.toLowerCase() === owner?.toLowerCase();
  const isETH = token === "0x0000000000000000000000000000000000000000";

  if (!active) {
    return (
      <div className="border border-neutral-800 rounded-lg p-6 opacity-50">
        <div className="flex justify-between items-center">
          <span className="font-mono text-sm">#{retreatId.toString()}</span>
          <span className="text-xs font-mono text-neutral-600 border border-neutral-800 px-2 py-1 rounded">
            completed
          </span>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: bigint) => {
    const s = Number(seconds);
    if (s <= 0) return "Ready";
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((s % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div
      className={`border rounded-lg p-6 transition-colors ${
        isYours ? "border-white bg-neutral-900" : "border-neutral-800"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold">#{retreatId.toString()}</span>
            {isYours && <span className="text-[10px] font-mono bg-white text-black px-2 py-0.5 rounded">yours</span>}
          </div>
          <div className="text-2xl font-mono font-bold">
            {formatEther(amount)} <span className="text-neutral-500">{isETH ? "ETH" : "tokens"}</span>
          </div>
        </div>
        <div className="text-right">
          {canReturn ? (
            <span className="text-xs font-mono text-green-500 border border-green-500/30 px-2 py-1 rounded">
              unlocked
            </span>
          ) : (
            <span className="text-xs font-mono text-neutral-500 border border-neutral-800 px-2 py-1 rounded">
              {timeRemaining !== undefined ? formatTime(timeRemaining) : "..."}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-4">
        <div>
          <div className="text-neutral-600 mb-1">return date</div>
          <div className="text-neutral-400">{new Date(Number(returnTime) * 1000).toLocaleDateString()}</div>
        </div>
        <div>
          <div className="text-neutral-600 mb-1">owner</div>
          <div className="text-neutral-400 truncate">
            {owner?.slice(0, 6)}...{owner?.slice(-4)}
          </div>
        </div>
      </div>

      {isYours && canReturn && (
        <button
          onClick={handleReturn}
          disabled={isPending}
          className="w-full bg-white text-black font-mono font-bold py-3 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          {isPending ? "Confirming..." : "Return to society"}
        </button>
      )}
    </div>
  );
};

export default MyRetreats;
