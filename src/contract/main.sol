// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

contract scoreStore {
    uint16 test = 0;

    function up(uint16 plus) public {
        test += plus;
    }
}
