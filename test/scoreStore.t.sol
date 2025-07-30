// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import "src/contract/scoreStore.sol";
import "forge-std/Test.sol";

contract scoreStoreTest is Test {
	scoreStore scoreS;
	address nonOwner = address(1);

	function setUp() public {
        scoreS = new scoreStore();
    }

	function testAddScore() public {
		uint id = scoreS.addScore("omg", "test", 5, 8);

		score memory s = scoreS.getScore(id);
		assertEq(s.p1, "omg");
        assertEq(s.p2, "test");
        assertEq(s.p1Score, 5);
        assertEq(s.p2Score, 8);

		id = scoreS.addScore("ahhhhh", "test", 7, 8);

		s = scoreS.getScore(id);
		assertEq(s.p1, "ahhhhh");
        assertEq(s.p2, "test");
        assertEq(s.p1Score, 7);
        assertEq(s.p2Score, 8);
	}
}
