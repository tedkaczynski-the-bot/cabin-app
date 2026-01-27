//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployCabin } from "./DeployCabin.s.sol";

/**
 * @notice Main deployment script - Cabin Protocol
 * @dev Run with: yarn deploy
 */
contract DeployScript is ScaffoldETHDeploy {
  function run() external {
    DeployCabin deployCabin = new DeployCabin();
    deployCabin.run();
  }
}
