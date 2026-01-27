"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const MyRetreats: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [retreatIds, setRetreatIds] = useState<string>("0,1,2,3,4");

  // Parse retreat IDs
  const ids = retreatIds
    .split(",")
    .map(id => id.trim())
    .filter(id => id !== "");

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">My Retreats</span>
          <span className="block text-lg text-base-content/70">Track your off-grid positions</span>
        </h1>

        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Enter Retreat IDs</h2>
            <p className="text-sm text-base-content/60">Comma-separated list of retreat IDs to check</p>
            <input
              type="text"
              className="input input-bordered w-full"
              value={retreatIds}
              onChange={e => setRetreatIds(e.target.value)}
              placeholder="0, 1, 2, 3"
            />
          </div>
        </div>

        <div className="space-y-4">
          {ids.map(id => (
            <RetreatCard key={id} retreatId={BigInt(id)} userAddress={connectedAddress} />
          ))}
        </div>

        {ids.length === 0 && (
          <div className="text-center text-base-content/50 py-10">Enter retreat IDs above to view their status</div>
        )}
      </div>
    </div>
  );
};

const RetreatCard = ({ retreatId, userAddress }: { retreatId: bigint; userAddress?: string }) => {
  const { data: retreatData } = useScaffoldReadContract({
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

  if (!retreatData) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <span className="loading loading-spinner"></span>
        </div>
      </div>
    );
  }

  const [owner, token, amount, returnTime, active] = retreatData;
  const isYours = userAddress?.toLowerCase() === owner?.toLowerCase();
  const isETH = token === "0x0000000000000000000000000000000000000000";

  if (!active) {
    return (
      <div className="card bg-base-300 shadow-xl opacity-60">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <span className="font-mono">Retreat #{retreatId.toString()}</span>
            <span className="badge badge-ghost">Completed</span>
          </div>
          <p className="text-sm text-base-content/50">This hermit has returned to society.</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: bigint) => {
    const s = Number(seconds);
    if (s <= 0) return "Ready to return";
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${mins}m remaining`;
    return `${mins}m remaining`;
  };

  return (
    <div className={`card shadow-xl ${isYours ? "bg-primary/10 border border-primary" : "bg-base-200"}`}>
      <div className="card-body">
        <div className="flex justify-between items-center">
          <span className="font-mono text-lg">Retreat #{retreatId.toString()}</span>
          <div className="flex gap-2">
            {isYours && <span className="badge badge-primary">Yours</span>}
            {canReturn ? (
              <span className="badge badge-success">Can Return</span>
            ) : (
              <span className="badge badge-warning">Locked</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-base-content/60">Amount</p>
            <p className="font-bold">
              {formatEther(amount)} {isETH ? "ETH" : "tokens"}
            </p>
          </div>
          <div>
            <p className="text-sm text-base-content/60">Time Remaining</p>
            <p className="font-bold">{timeRemaining !== undefined ? formatTime(timeRemaining) : "..."}</p>
          </div>
          <div>
            <p className="text-sm text-base-content/60">Return Time</p>
            <p className="font-mono text-sm">{new Date(Number(returnTime) * 1000).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-base-content/60">Owner</p>
            <p className="font-mono text-sm truncate">{owner}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRetreats;
