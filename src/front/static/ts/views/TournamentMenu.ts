import Aview from "./Aview.ts"
import { isLogged } from "../main.js"
import { dragElement } from "./drag.ts";
import { setOnekoState, setBallPos, setOnekoOffset } from "../oneko.ts"

export default class extends Aview {
  running: boolean;

	constructor()
	{
		super();
		this.setTitle("Tournament");
		setOnekoState("default");
    this.running = true;
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

		<div id="main-div" class="bg-neutral-200 dark:bg-neutral-800 text-center p-10 pt-5 space-y-4 reverse-border">
		  <div id="tournament-id">
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
		</div>
		`;
	}

	async runGame(p1_id: number, p2_id: number, players: string[]): Promise<number> {
    return new Promise<number>(async (resolve) => {
      console.log(p1_id, p2_id, players, players[p1_id], players[p2_id]);
      let p1_name = players[p1_id];
      let p2_name = players[p2_id];
      let uuid: string;
      let start: number = 0;
      let elapsed: number;

      let game_playing: boolean = false;
      let match_over: boolean = false;
      let p1_score: number = 0;
      let p2_score: number = 0;

      let p1_displayName: string;
      let p2_displayName: string;

      let countdown: number = 3;
      let countdownTimer: number = 0;

      let canvas: HTMLCanvasElement;
      let ctx: CanvasRenderingContext2D;

      const paddleOffset: number = 15;
      const paddleHeight: number = 100;
      const paddleWidth: number = 10;
      const ballSize: number = 10;

      const paddleSpeed: number = 727 * 0.69;
      let leftPaddleY: number;
      let rightPaddleY: number;
      let ballX: number;
      let ballY: number;
      let ballSpeed: number = 200;
      let ballSpeedX: number = 300;
      let ballSpeedY: number = 10;

      const keys: Record<string, boolean> = {};

      document.addEventListener("keydown", e => { keys[e.key] = true; });
      document.addEventListener("keyup", e => { keys[e.key] = false; });

      function movePaddles() {
        if ((keys["w"] || keys["W"]) && leftPaddleY > 0)
          leftPaddleY -= paddleSpeed * elapsed;
        if ((keys["s"] || keys["S"]) && leftPaddleY < canvas.height - paddleHeight)
          leftPaddleY += paddleSpeed * elapsed;
        if (keys["ArrowUp"] && rightPaddleY > 0)
          rightPaddleY -= paddleSpeed * elapsed;
        if (keys["ArrowDown"] && rightPaddleY < canvas.height - paddleHeight)
          rightPaddleY += paddleSpeed * elapsed;
      }

      function getBounceVelocity(paddleY: number) {
        const paddleCenterY = paddleY + paddleHeight / 2;

        let n = (ballY - paddleCenterY) / (paddleHeight / 2);
        n = Math.max(-1, Math.min(1, n));
        let theta = n * ((75 * Math.PI) / 180);
        ballSpeedY = ballSpeed * Math.sin(theta);
      }

      async function moveBall() {
        let length = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY);
        let scale = ballSpeed / length;
        ballX += (ballSpeedX * scale) * elapsed;
        ballY += (ballSpeedY * scale) * elapsed;

        if (ballY <= 0 || ballY >= canvas.height - ballSize)
          ballSpeedY *= -1;

        if (ballX <= paddleWidth + paddleOffset && ballX >= paddleOffset &&
          ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) {
          ballSpeedX *= -1;
          ballX = paddleWidth + paddleOffset;
          getBounceVelocity(leftPaddleY);
          ballSpeed += 10;
        }

        if (ballX >= canvas.width - paddleWidth - ballSize - paddleOffset && ballX <= canvas.width - ballSize - paddleOffset &&
          ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) {
          ballSpeedX *= -1;
          ballX = canvas.width - paddleWidth - ballSize - paddleOffset;
          getBounceVelocity(rightPaddleY);
          ballSpeed += 10;
        }

        // scoring
        if (ballX < 0 || ballX > canvas.width - ballSize) {
          setOnekoState("default");
          game_playing = false;
          if (ballX < 0)
            p2_score++;
          else
            p1_score++;

          if (p1_score === 3 || p2_score === 3) {
            if (await isLogged()) {
              let uuid = document.cookie.match(new RegExp('(^| )' + "uuid" + '=([^;]+)'))[2];
              fetch(`http://localhost:3002/users/${uuid}/matchHistory?game=pong`, {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                credentials: "include",
                body: JSON.stringify({
                  "game": "pong",
                  "opponent": p2_name,
                  "myScore": p1_score,
                  "opponentScore": p2_score,
                  "date": Date.now(),
                }),
              });
              resolve(p1_score == 3 ? p1_id : p2_id);
            }
            match_over = true;
          }
          else {
            countdown = 3;
            countdownTimer = performance.now();
          }

          ballX = canvas.width / 2;
          ballY = canvas.height / 2;
          ballSpeed = 200;
          ballSpeedX = 300 * ((ballSpeedX > 0) ? 1 : -1);
          ballSpeedY = 10;
          ballSpeedX = -ballSpeedX;
          leftPaddleY = canvas.height / 2 - paddleHeight / 2;
          rightPaddleY = canvas.height / 2 - paddleHeight / 2;
        }
        setBallPos(ballX, ballY);
      }

      function draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.setLineDash([5, 10]);
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.fillRect(paddleOffset, leftPaddleY, paddleWidth, paddleHeight);
        ctx.fillRect(canvas.width - paddleWidth - paddleOffset, rightPaddleY, paddleWidth, paddleHeight);

        ctx.fillStyle = "white";
        if (game_playing)
          ctx.fillRect(ballX, ballY, ballSize, ballSize);

        ctx.font = "24px Kubasta";
        let text_score = `${p1_score} - ${p2_score}`;
        ctx.fillText(text_score, canvas.width / 2 - (ctx.measureText(text_score).width / 2), 25);
        ctx.fillText(p1_displayName, canvas.width / 4 - (ctx.measureText(p1_name).width / 2), 45);
        ctx.fillText(p2_displayName, (canvas.width / 4 * 3) - (ctx.measureText(p2_name).width / 2), 45);

        if (match_over) {
          ctx.font = "32px Kubasta";
          const winner = `${p1_score > p2_score ? p1_name : p2_name} won :D`;
          ctx.fillText(winner, canvas.width / 2 - (ctx.measureText(winner).width / 2), canvas.height / 2 + 16);
          document.getElementById("game-buttons")?.classList.remove("hidden");
        }
      }

      function startCountdown() {
        const now = performance.now();
        if (countdown > 0) {
          if (now - countdownTimer >= 500) {
            countdown--;
            countdownTimer = now;
          }
          ctx.font = "48px Kubasta";
          ctx.fillText(countdown.toString(), canvas.width / 2 - 10, canvas.height / 2 + 24);
        }
        else if (countdown === 0) {
          ctx.font = "48px Kubasta";
          ctx.fillText("Go!", canvas.width / 2 - 30, canvas.height / 2 + 24);
          setTimeout(() => {
            game_playing = true;
            countdown = -1;
          }, 500);
        }
      }

      const gameLoop = async (timestamp: number) => {
        elapsed = (timestamp - start) / 1000;
        start = timestamp;
        if (game_playing) {
          movePaddles();
          await moveBall();
        }
        draw();
        if (!game_playing)
          startCountdown();
        if (this.running)
          requestAnimationFrame(gameLoop);
      };


      document.getElementById("game-retry")?.addEventListener("click", () => {
        setOnekoState("pong");
        document.getElementById("game-buttons")?.classList.add("hidden");
        game_playing = false;
        match_over = false;
        p1_score = 0;
        p2_score = 0;

        countdown = 3;
        countdownTimer = performance.now();
      });

      let p1_isvalid = true;
      let p2_isvalid = true;
      if (await isLogged()) {
        const p1_req = await fetch(`http://localhost:3002/users/${p1_name}`, {
          method: "GET",
          credentials: "include",
        });
        const p2_req = await fetch(`http://localhost:3002/users/${p2_name}`, {
          method: "GET",
          credentials: "include",
        });

        if (p1_req.status != 200)
          p1_displayName = p1_name;
        else
          p1_displayName = (await p1_req.json()).displayName;

        if (p2_req.status != 200)
          p2_displayName = p2_name;
        else
          p2_displayName = (await p2_req.json()).displayName;
      }

      p1_displayName = p1_displayName.length > 16 ? p1_displayName.substring(0, 16) + "." : p1_displayName;
      p2_displayName = p2_displayName.length > 16 ? p2_displayName.substring(0, 16) + "." : p2_displayName;
      p1_name = p1_name.length > 16 ? p1_name.substring(0, 16) + "." : p1_name;
      p2_name = p2_name.length > 16 ? p2_name.substring(0, 16) + "." : p2_name;
      document.getElementById("tournament-ui")?.classList.add("hidden");

      canvas = document.createElement("canvas");
      canvas.id = "gameCanvas";
      canvas.classList.add("reverse-border");

      document.getElementById("main-div")?.prepend(canvas);

      ctx = canvas.getContext("2d", { alpha: false }) as CanvasRenderingContext2D;
      ctx.canvas.width = 600;
      ctx.canvas.height = 600;

      leftPaddleY = canvas.height / 2 - paddleHeight / 2;
      rightPaddleY = canvas.height / 2 - paddleHeight / 2;
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;

      setOnekoState("pong");
      setOnekoOffset();
      requestAnimationFrame(gameLoop);
    });
  }

	async run() {
    dragElement(document.getElementById("window"));
		const generateBracket = async (playerCount: number) => {
      let initPlayerCount = playerCount;
			document.getElementById("bracket").innerHTML = "";

			const rounds: number = Math.ceil(Math.log2(playerCount));
			const totalSlots: number = 2 ** rounds;
			let odd: number = 0;
			let notPowPlayersCount: number = 0;
      let tournament: number[][] = [];

			if ((playerCount & (playerCount - 1)) != 0)
				notPowPlayersCount = playerCount - (2 ** Math.floor(Math.log2(playerCount)));


			let initialPlayers = Array.from({ length: 2 ** Math.floor(Math.log2(playerCount))}, (_, i) => `player ${i + 1}`);
			playerCount = 2 ** Math.floor(Math.log2(playerCount));

			const bracketWrapper = document.createElement("div");
			bracketWrapper.className = "flex space-x-8 overflow-x-auto";

			// Round 0: Player input column
			const playerInputColumn = document.createElement("div");
			playerInputColumn.className = `flex flex-col mt-${(notPowPlayersCount + odd) * 28} space-y-4`;

      tournament.push([]);
			initialPlayers.forEach((name, i) => {
				const input = document.createElement("input");
				input.type = "text";
				input.id = `playerName${i}`;
				input.value = name;
				input.placeholder = name;
				if (i == 0)
				{
          isLogged().then((value) => {
            if (value) {
              let uuid = document.cookie.match(new RegExp('(^| )' + "uuid" + '=([^;]+)'))[2];
              input.value = uuid;
              input.readOnly = true;
            }
          });
				}
				input.className = "w-32 h-10 p-2 text-sm bg-white disabled:bg-gray-200 input-border";
				playerInputColumn.appendChild(input);
        tournament[0].push(i);
			});

			bracketWrapper.appendChild(playerInputColumn);

			let currentRound = initialPlayers;
			let previousPadding = 4;
			tournament.push([]);
			for (let round = 1; round <= rounds; round++)
			{
				const roundColumn = document.createElement("div");
				previousPadding = previousPadding * 2 + 10
				roundColumn.className = `flex flex-col justify-center space-y-${previousPadding}`;

				const nextRound: string[] = [];

        while (notPowPlayersCount) {
          tournament[1].push(playerCount);
          const input = document.createElement("input");
          input.type = "text";
          input.id = `playerName${playerCount}`;
          input.value = `player ${playerCount + 1}`;
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

			document.getElementById("bracket")?.appendChild(document.createElement("hr")).classList.add("my-4", "mb-8", "w-64", "reverse-border");
			document.getElementById("bracket")?.appendChild(bracketWrapper);
      const btn = document.getElementById("bracket")?.appendChild(document.createElement("button"));
      if (!btn) return;
      btn.classList.add("default-button", "w-full");
      btn.id = "tournament-play";
      btn.onclick = async () => {

        let players: string[] = [];
        for (let i of Array(initPlayerCount).keys()) {
          players.push((document.getElementById(`playerName${i}`) as HTMLInputElement).value);
        }

        while (tournament[0].length > 1)
        {
          while(tournament[0].length > 0)
          {
            console.log(tournament[0]);
            const p1 = tournament[0].shift() as number;
            const p2 = tournament[0].shift() as number;

            document.getElementById("tournament-id")?.classList.add("hidden");
            const result = await this.runGame(p1, p2, players);
            document.getElementById("gameCanvas").remove();
            document.getElementById("tournament-id")?.classList.remove("hidden");
            tournament[1].push(result);
          }
          tournament[0] = tournament[1];
          tournament[1] = [];
        }
        console.log(`winner: ${tournament[0][0]}`);
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
