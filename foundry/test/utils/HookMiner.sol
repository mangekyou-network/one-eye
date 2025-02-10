// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Hooks} from "v4-core/libraries/Hooks.sol";
import {IHooks} from "v4-core/interfaces/IHooks.sol";

library HookMiner {
    // Returns the address and salt for a hook deployment that will result in a hook address with the correct flags
    function find(
        address deployer,
        Hooks.Permissions memory permissions,
        bytes memory creationCode,
        bytes memory constructorArgs,
        uint256 startSalt
    ) external pure returns (address hookAddress, bytes32 salt) {
        require(startSalt < type(uint256).max, "Salt too high");

        bytes memory initCode = abi.encodePacked(creationCode, constructorArgs);
        bool found = false;
        uint256 currentSalt = startSalt;

        while (!found) {
            salt = bytes32(currentSalt);
            hookAddress = _getAddress(deployer, salt, initCode);

            if (_hasCorrectHookFlags(hookAddress, permissions)) {
                found = true;
            } else {
                currentSalt++;
                require(currentSalt < type(uint256).max, "Salt too high");
            }
        }
    }

    // Returns the address a contract will be deployed to using CREATE2 with the given parameters
    function _getAddress(
        address deployer,
        bytes32 salt,
        bytes memory initCode
    ) internal pure returns (address) {
        return
            address(
                uint160(
                    uint256(
                        keccak256(
                            abi.encodePacked(
                                bytes1(0xFF),
                                deployer,
                                salt,
                                keccak256(initCode)
                            )
                        )
                    )
                )
            );
    }

    // Returns true if the address has the correct flags for the given permissions
    function _hasCorrectHookFlags(
        address hookAddress,
        Hooks.Permissions memory permissions
    ) internal pure returns (bool) {
        uint160 flags = uint160(hookAddress);
        if (
            permissions.beforeInitialize &&
            flags & Hooks.BEFORE_INITIALIZE_FLAG == 0
        ) return false;
        if (
            permissions.afterInitialize &&
            flags & Hooks.AFTER_INITIALIZE_FLAG == 0
        ) return false;
        if (
            permissions.beforeAddLiquidity &&
            flags & Hooks.BEFORE_ADD_LIQUIDITY_FLAG == 0
        ) return false;
        if (
            permissions.afterAddLiquidity &&
            flags & Hooks.AFTER_ADD_LIQUIDITY_FLAG == 0
        ) return false;
        if (
            permissions.beforeRemoveLiquidity &&
            flags & Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG == 0
        ) return false;
        if (
            permissions.afterRemoveLiquidity &&
            flags & Hooks.AFTER_REMOVE_LIQUIDITY_FLAG == 0
        ) return false;
        if (permissions.beforeSwap && flags & Hooks.BEFORE_SWAP_FLAG == 0)
            return false;
        if (permissions.afterSwap && flags & Hooks.AFTER_SWAP_FLAG == 0)
            return false;
        if (permissions.beforeDonate && flags & Hooks.BEFORE_DONATE_FLAG == 0)
            return false;
        if (permissions.afterDonate && flags & Hooks.AFTER_DONATE_FLAG == 0)
            return false;
        if (
            permissions.beforeSwapReturnDelta &&
            flags & Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG == 0
        ) return false;
        if (
            permissions.afterSwapReturnDelta &&
            flags & Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG == 0
        ) return false;
        if (
            permissions.afterAddLiquidityReturnDelta &&
            flags & Hooks.AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG == 0
        ) return false;
        if (
            permissions.afterRemoveLiquidityReturnDelta &&
            flags & Hooks.AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG == 0
        ) return false;
        return true;
    }
}
