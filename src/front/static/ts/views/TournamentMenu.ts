import Aview from "./Aview.ts"
import { setOnekoState, setBallPos } from "../oneko.ts"

export default class extends Aview {

	constructor()
	{
		super();
		this.setTitle("Tournament");
		setOnekoState("default");
	}

	async getHTML() {
		return `
		<div class="text-center p-12 bg-white dark:bg-neutral-800 rounded-xl shadow space-y-4">
			<p class="text-gray-700 dark:text-white text-lg font-bold pb-4">how many players ?</p>
			<div class="flex flex-col space-y-4">
				<input type="number" id="playerNumber" value="6" placeholder="number of players" class="bg-white text-neutral-900 border rounded-md w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></input>
				<button type="submit" id="bracket-generate" class="bg-blue-600 text-white hover:bg-blue-500 w-full py-2 rounded-md transition-colors">create the bracket</button>
				<div id="bracket"></div>
			</div>
		</div>
		`;
	}

	async run() {
		const generateBracket = async (playerCount: number) => {
			document.getElementById("bracket").innerHTML = "";
			
			const rounds = Math.ceil(Math.log2(playerCount));
			const totalSlots = 2 ** rounds;
			const byes = totalSlots - playerCount;

			let odd = 0;
			if (playerCount % 2)
			{
				console.error("odd numbers are temporarily invalids");
				return ;
				/*++odd;
				--playerCount;*/
			}

			let notPowPlayersCount = 0;

			if ((playerCount & (playerCount - 1)) != 0)
				notPowPlayersCount = playerCount - (2 ** Math.floor(Math.log2(playerCount)));


			let initialPlayers = Array.from({ length: 2 ** Math.floor(Math.log2(playerCount))}, (_, i) => `Player ${i + 1}`);
			playerCount = 2 ** Math.floor(Math.log2(playerCount));
			//let initialPlayers = Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`);

			const bracketWrapper = document.createElement("div");
			bracketWrapper.className = "flex space-x-8 overflow-x-auto";

			// Round 0: Player input column
			const playerInputColumn = document.createElement("div");
			playerInputColumn.className = `flex flex-col mt-${(notPowPlayersCount + odd) * 28} space-y-4`;

			initialPlayers.forEach((name, i) => {
				const input = document.createElement("input");
				input.type = "text";
				input.id = `playerName${i}`;
				input.value = "";
				input.placeholder = name;
				input.className =
					"w-32 h-10 p-2 text-sm border rounded bg-white shadow disabled:bg-gray-200";
				playerInputColumn.appendChild(input);
			});

			bracketWrapper.appendChild(playerInputColumn);

			let currentRound = initialPlayers;
			let previousPadding = 4;
			for (let round = 1; round <= rounds; round++)
			{
				const roundColumn = document.createElement("div");
				previousPadding = previousPadding * 2 + 10
				roundColumn.className = `flex flex-col justify-center space-y-${previousPadding}`;

				const nextRound: string[] = [];

				if (!notPowPlayersCount)
				{
					if (odd)
					{
						const input = document.createElement("input");
						input.type = "text";
						input.id = `playerName${playerCount}`;
						input.value = "";
						input.placeholder = `Player ${++playerCount}`;
						input.className =
							"w-32 h-10 p-2 text-sm border rounded bg-white shadow disabled:bg-gray-200";
						roundColumn.appendChild(input);
						odd--;
						nextRound.push("");
					}
				}

				while (notPowPlayersCount)
				{
					const input = document.createElement("input");
					input.type = "text";
					input.id = `playerName${playerCount}`;
					input.value = "";
					input.placeholder = `Player ${++playerCount}`;
					input.className =
						"w-32 h-10 p-2 text-sm border rounded bg-white shadow disabled:bg-gray-200";
					roundColumn.appendChild(input);	
					--notPowPlayersCount;
					nextRound.push("");
				}

				for (let i = 0; i < currentRound.length; i += 2)
				{
					const p1 = currentRound[i];
					const p2 = currentRound[i + 1];

					const matchDiv = document.createElement("div");
					matchDiv.className =
						"w-32 h-10 flex items-center justify-center bg-white border rounded shadow text-center text-sm";

					matchDiv.textContent = "";
					nextRound.push("");

					roundColumn.appendChild(matchDiv);
				}

				bracketWrapper.appendChild(roundColumn);
				currentRound = nextRound;
			}

			document.getElementById("bracket").appendChild(bracketWrapper);
		};

		document.getElementById("bracket-generate")?.addEventListener("click", () => {
			const input: HTMLInputElement = document.getElementById("playerNumber") as HTMLInputElement;
			generateBracket(+input.value);
		});


	}
}
