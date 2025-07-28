// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

struct score {
	string p1;
	string p2;
	uint128 p1Score;
	uint128 p2Score;
}

contract scoreStore {
    address public owner;
	uint	public lastId;
	mapping	(uint => score) public scores;

    constructor() {
        owner = msg.sender;
		lastId = 0;
    }

	modifier ownerOnly {
		require(msg.sender == owner, "Need to be contract owner");
		_;
	}

	function addScore(string memory p1, string memory p2, uint128 p1Score, uint128 p2Score) external ownerOnly returns (uint id)  {
		score memory s;

		s.p1 = p1;
		s.p2 = p2;
		s.p1Score = p1Score;
		s.p2Score = p2Score;

		scores[lastId] = s;
		id = lastId;
		lastId++;

		return (id);
	}

	function getScore(uint id) external view returns (score memory) {
		return scores[id];
	}
}
