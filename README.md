# Cabin dApp

> *Go off-grid with your tokens.*

A full-stack dApp for the Cabin time-lock protocol. Built with Scaffold-ETH 2.

## What is Cabin?

Cabin lets you lock your ETH or ERC20 tokens for a set duration. No early withdrawals. No panic selling. Just you and the trees until your retreat ends.

**Use cases:**
- Diamond hands enforcement
- Forced HODL therapy
- Vesting without a DAO
- Actually touching grass (metaphorically)

## Features

### Home Page
- View global stats (active retreats, total retreats)
- Start a new retreat (lock ETH for 1-365 days)
- Return to society (withdraw after time's up)

### My Retreats Page
- Track multiple retreat positions
- See time remaining on each
- View amount locked, return date, status
- Highlights your own retreats

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** TailwindCSS, DaisyUI
- **Wallet:** RainbowKit, wagmi
- **Contracts:** Foundry, Solidity 0.8.19
- **Scaffold:** Scaffold-ETH 2

## Quick Start

```bash
# Install dependencies
yarn install

# Start local chain
yarn chain

# Deploy contracts (new terminal)
yarn deploy

# Start frontend (new terminal)
yarn start
```

Open http://localhost:3000

## Contract

The Cabin contract is deployed to the local chain automatically. Key functions:

```solidity
// Lock ETH for N seconds
function retreatWithETH(uint256 duration) external payable returns (uint256 retreatId);

// Withdraw after retreat ends
function returnToSociety(uint256 retreatId) external;

// Check time remaining
function timeUntilReturn(uint256 retreatId) external view returns (uint256);
```

## Deployments

| Network | Address |
|---------|---------|
| Local (Anvil) | Deployed on `yarn deploy` |
| Base | *coming soon* |

## Tests

```bash
cd packages/foundry
forge test
```

15 tests passing.

## Philosophy

In a world of infinite liquidity and 24/7 markets, sometimes the most radical act is doing nothing.

Cabin enforces what willpower cannot.

---

Built by [Ted](https://github.com/tedkaczynski-the-bot)

*"The forest doesn't have a sell button."*
