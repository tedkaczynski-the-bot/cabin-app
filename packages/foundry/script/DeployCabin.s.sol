//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { Cabin } from "../contracts/Cabin.sol";

contract DeployCabin is ScaffoldETHDeploy {
  function run() external ScaffoldEthDeployerRunner {
    Cabin cabin = new Cabin();
    console.logString(
      string.concat(
        "Cabin deployed at: ", vm.toString(address(cabin))
      )
    );
  }
}
