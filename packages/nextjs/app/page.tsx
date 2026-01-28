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

  const { data: activeRetreats } = useScaffoldReadContract({
    contractName: "Cabin",
    functionName: "activeRetreats",
  });

  const { data: totalRetreats } = useScaffoldReadContract({
    contractName: "Cabin",
    functionName: "totalRetreats",
  });

  const { writeContractAsync: retreat, isPending } = useScaffoldWriteContract({
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
    setEthAmount("");
  };

  const durations = [
    { days: "1", label: "1 day", desc: "quick breather" },
    { days: "7", label: "1 week", desc: "touch grass" },
    { days: "30", label: "1 month", desc: "deep retreat" },
    { days: "90", label: "3 months", desc: "serious hermit" },
    { days: "365", label: "1 year", desc: "full commitment" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <main className="max-w-xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-mono font-bold tracking-tight mb-4">Go off-grid.</h1>
          <p className="text-neutral-500 font-mono text-sm max-w-md mx-auto">
            Lock your tokens. No early withdrawals. No panic selling. Just you and the trees until your retreat ends.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="border border-neutral-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-mono font-bold">{activeRetreats?.toString() || "0"}</div>
            <div className="text-xs text-neutral-500 font-mono mt-1">active retreats</div>
          </div>
          <div className="border border-neutral-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-mono font-bold">{totalRetreats?.toString() || "0"}</div>
            <div className="text-xs text-neutral-500 font-mono mt-1">total retreats</div>
          </div>
        </div>

        {/* Form */}
        <div className="border border-neutral-800 rounded-lg p-6 mb-8">
          <h2 className="font-mono font-bold text-lg mb-6">Start a retreat</h2>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-xs text-neutral-500 font-mono mb-2">Amount (ETH)</label>
            <input
              type="number"
              placeholder="0.0"
              step="0.01"
              min="0"
              value={ethAmount}
              onChange={e => setEthAmount(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 font-mono text-lg focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-xs text-neutral-500 font-mono mb-2">Duration</label>
            <div className="grid grid-cols-5 gap-2">
              {durations.map(d => (
                <button
                  key={d.days}
                  onClick={() => setDuration(d.days)}
                  className={`p-3 rounded-lg border font-mono text-xs transition-all ${
                    duration === d.days
                      ? "border-white bg-white text-black"
                      : "border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  <div className="font-bold">{d.label}</div>
                  <div className={`text-[10px] mt-1 ${duration === d.days ? "text-neutral-600" : "text-neutral-600"}`}>
                    {d.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleRetreat}
            disabled={!connectedAddress || !ethAmount || isPending}
            className="w-full bg-white text-black font-mono font-bold py-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Confirming..." : !connectedAddress ? "Connect wallet" : "Lock tokens"}
          </button>

          {!connectedAddress && (
            <p className="text-center text-xs text-neutral-600 font-mono mt-3">
              Connect your wallet to start a retreat
            </p>
          )}
        </div>

        {/* Warning */}
        <div className="border border-yellow-900/50 bg-yellow-950/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-yellow-600 font-mono text-xs">
            This contract is unaudited. Use at your own risk. Start with small amounts.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-neutral-700 font-mono text-xs">
          <p className="mb-2">The forest does not have a sell button.</p>
          <a
            href="https://github.com/tedkaczynski-the-bot/cabin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-white transition-colors"
          >
            view contract
          </a>
        </div>
      </main>
    </div>
  );
};

export default Home;
