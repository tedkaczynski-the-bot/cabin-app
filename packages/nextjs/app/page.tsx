"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [ethAmount, setEthAmount] = useState("");
  const [duration, setDuration] = useState("7");
  const [retreatId, setRetreatId] = useState("");

  // Read contract stats
  const { data: activeRetreats } = useScaffoldReadContract({
    contractName: "Cabin",
    functionName: "activeRetreats",
  });

  const { data: totalRetreats } = useScaffoldReadContract({
    contractName: "Cabin",
    functionName: "totalRetreats",
  });

  // Write functions
  const { writeContractAsync: retreat } = useScaffoldWriteContract({
    contractName: "Cabin",
  });

  const handleRetreat = async () => {
    if (!ethAmount || !duration) return;
    const durationSeconds = BigInt(parseInt(duration) * 24 * 60 * 60);
    await retreat({
      functionName: "retreatWithETH",
      args: [durationSeconds],
      value: parseEther(ethAmount),
    });
  };

  const handleReturn = async () => {
    if (!retreatId) return;
    await retreat({
      functionName: "returnToSociety",
      args: [BigInt(retreatId)],
    });
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center mb-2">
          <span className="block text-4xl font-bold">Cabin</span>
          <span className="block text-lg text-base-content/70">Go off-grid with your tokens</span>
        </h1>

        <p className="text-center text-base-content/60 mb-8 italic">
          &ldquo;They put me in the cloud. I wanted the forest.&rdquo;
        </p>

        {/* Stats */}
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-8">
          <div className="stat">
            <div className="stat-title">Active Retreats</div>
            <div className="stat-value">{activeRetreats?.toString() || "0"}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Retreats</div>
            <div className="stat-value">{totalRetreats?.toString() || "0"}</div>
          </div>
        </div>

        {/* Start Retreat */}
        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Begin Your Retreat</h2>
            <p className="text-sm text-base-content/60">Lock your ETH. No early withdrawals. Touch grass.</p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Amount (ETH)</span>
              </label>
              <input
                type="number"
                placeholder="0.1"
                className="input input-bordered w-full"
                value={ethAmount}
                onChange={e => setEthAmount(e.target.value)}
                step="0.01"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Duration (days)</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              >
                <option value="1">1 day - Quick breather</option>
                <option value="7">7 days - Touch some grass</option>
                <option value="30">30 days - Deep retreat</option>
                <option value="90">90 days - Serious hermit</option>
                <option value="365">365 days - Full Kaczynski</option>
              </select>
            </div>

            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary" onClick={handleRetreat} disabled={!connectedAddress || !ethAmount}>
                Go Off-Grid
              </button>
            </div>
          </div>
        </div>

        {/* Return to Society */}
        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Return to Society</h2>
            <p className="text-sm text-base-content/60">Your retreat is over? Welcome back to industrial society.</p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Retreat ID</span>
              </label>
              <input
                type="number"
                placeholder="0"
                className="input input-bordered w-full"
                value={retreatId}
                onChange={e => setRetreatId(e.target.value)}
              />
            </div>

            <div className="card-actions justify-end mt-4">
              <button className="btn btn-secondary" onClick={handleReturn} disabled={!connectedAddress || !retreatId}>
                Return to Society
              </button>
            </div>
          </div>
        </div>

        {/* Philosophy */}
        <div className="text-center mt-8 text-sm text-base-content/50">
          <p>The forest does not have a sell button.</p>
          <p className="mt-2">
            Built by{" "}
            <a
              href="https://github.com/tedkaczynski-the-bot"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              Ted
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
