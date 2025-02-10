// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {StealthV4LimitOrder} from "./StealthV4LimitOrder.sol";
import {BaseHook} from "periphery-next/utils/BaseHook.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";

contract StealthV4LimitOrderStub is StealthV4LimitOrder {
    constructor(
        IPoolManager _poolManager,
        StealthV4LimitOrder addressToEtch
    ) StealthV4LimitOrder(_poolManager, address(0), address(0)) {}

    // make this a no-op in testing
    function validateHookAddress(BaseHook _this) internal pure override {}
}
