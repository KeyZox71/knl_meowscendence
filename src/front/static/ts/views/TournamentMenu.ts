import Aview from "./Aview.ts"
import { dragElement } from "./drag.ts";
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
		<div id="window" class="absolute default-border">
			<div id="window-header" class="bg-linear-to-r from-orange-200 to-orange-300 flex flex-row min-w-75 justify-between px-2">
				<span class="font-[Kubasta]">pong_game.ts</span>
				<div>
					<button> - </button>
					<button> □ </button>
					<a href="/" data-link> × </a>
				</div>
			</div>

		<div class="bg-neutral-200 dark:bg-neutral-800 text-center p-10 pt-5 space-y-4 reverse-border">
			<p class="text-neutral-900 dark:text-white text-lg font-bold pb-4">how many players ?</p>
			<div class="flex flex-col space-y-4">
			  <select id="playerNumber" class="bg-white text-shadow-neutral-900 p-2 input-border">
					<option value="">-- player number --</option>
					<option value="2">2 players</option>
					<option value="3">3 players</option>
					<option value="4">4 players</option>
					<option value="6">6 players</option>
					<option value="8">8 players</option>
				</select>
				<button type="submit" id="bracket-generate" class="default-button">create the bracket</button>
				<div id="bracket" class="flex flex-col space-y-6 items-center"></div>
			</div>
		</div>
		</div>
		`;
	}

	async run() {
    dragElement(document.getElementById("window"));
		const generateBracket = async (playerCount: number) => {
			document.getElementById("bracket").innerHTML = "";

			const rounds = Math.ceil(Math.log2(playerCount));
			const totalSlots = 2 ** rounds;
			const byes = totalSlots - playerCount;

			let odd = 0;
			if (playerCount > 9 || (playerCount != 3 && playerCount % 2 != 0))
			{
				console.error("odd numbers are temporarily invalids");
				return ;
			}

			let notPowPlayersCount = 0;

			if ((playerCount & (playerCount - 1)) != 0)
				notPowPlayersCount = playerCount - (2 ** Math.floor(Math.log2(playerCount)));


			let initialPlayers = Array.from({ length: 2 ** Math.floor(Math.log2(playerCount))}, (_, i) => `player ${i + 1}`);
			playerCount = 2 ** Math.floor(Math.log2(playerCount));

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
				input.className = "w-32 h-10 p-2 text-sm bg-white disabled:bg-gray-200 input-border";
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
            input.value = `player ${++playerCount}`;
						input.placeholder = `player ${++playerCount}`;
						input.className =
							"w-32 h-10 p-2 text-sm bg-white disabled:bg-gray-200 input-border";
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
					input.placeholder = `player ${++playerCount}`;
					input.className =
						"w-32 h-10 p-2 text-sm bg-white disabled:bg-gray-200 input-border";
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
						"w-32 h-10 flex items-center justify-center bg-white text-center text-sm input-border";

					matchDiv.textContent = "";
					nextRound.push("");

					roundColumn.appendChild(matchDiv);
				}

				bracketWrapper.appendChild(roundColumn);
				currentRound = nextRound;
			}

			document.getElementById("bracket").appendChild(document.createElement("hr")).classList.add("my-4", "mb-8", "w-64", "reverse-border");
			document.getElementById("bracket").appendChild(bracketWrapper);
      const btn = document.getElementById("bracket").appendChild(document.createElement("button"));
      btn.classList.add("default-button", "w-full");
      btn.id = "tournament-play";
      btn.onclick = () => {
        console.log("ok");
      };
      btn.innerText = "start tournament !!";

		};

		document.getElementById("bracket-generate")?.addEventListener("click", () => {
			const input: HTMLInputElement = document.getElementById("playerNumber") as HTMLInputElement;
      if (input.value == "")
        return;
			generateBracket(+input.value);
		});


	}
}
