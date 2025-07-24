// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "src/contract/main.sol";
import "forge-std/Test.sol";

contract mainTest is Test, scoreStore {
    function testUp() public {
        up(2);
        assertEq(test, 2);
    }
}
