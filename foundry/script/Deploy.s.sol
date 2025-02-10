// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {StealthV4LimitOrder} from "../src/StealthV4LimitOrder.sol";
import {StealthV4LimitOrderStub} from "../src/StealthV4LimitOrderStub.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {HookMiner} from "../test/utils/HookMiner.sol";

interface Create2Deployer {
    function create2(
        bytes32 salt,
        bytes memory initCode
    ) external returns (address deployed);
}

contract Deploy is Script {
    address constant POOL_MANAGER = 0x5e73354CfDd6745c338B50BCfDFA3aa6fA034080;
    address constant CREATE2_DEPLOYER =
        0x0000000000FFe8B47B3e2130213B802212439497;

    function run() public {
        // Hardcode the hook address with the required flags
        StealthV4LimitOrder hook = StealthV4LimitOrder(
            address(uint160(Hooks.AFTER_SWAP_FLAG))
        );

        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        // Deploy the stub contract
        StealthV4LimitOrderStub stub = new StealthV4LimitOrderStub(
            IPoolManager(POOL_MANAGER),
            hook
        );

        // Use Foundry cheatcodes to overwrite the storage
        (, bytes32[] memory writes) = vm.accesses(address(stub));
        vm.etch(address(hook), address(stub).code);

        unchecked {
            for (uint256 i = 0; i < writes.length; i++) {
                bytes32 slot = writes[i];
                vm.store(address(hook), slot, vm.load(address(stub), slot));
            }
        }

        console.log("Hook deployed and storage overwritten at:", address(hook));

        vm.stopBroadcast();
    }
}
