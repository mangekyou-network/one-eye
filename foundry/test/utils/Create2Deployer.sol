// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract Create2Deployer {
    function create2(
        bytes32 salt,
        bytes memory initCode
    ) external returns (address deployed) {
        assembly {
            deployed := create2(0, add(initCode, 0x20), mload(initCode), salt)
        }
        require(deployed != address(0), "Create2: Failed on deploy");
    }
}
