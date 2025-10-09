import Aview from "./Aview.ts"
import { isLogged } from "../main.js"
import { dragElement } from "./drag.js"
import { setOnekoState, setBallPos, setOnekoOffset } from "../oneko.ts"

export default class extends Aview {
	
	running: boolean;

	constructor()
	{
		super();
		this.setTitle("pong (local match)");
		this.running = true;
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

				
			<div id="main-div" class="bg-neutral-200 dark:bg-neutral-800 text-center p-10 space-y-4 reverse-border">
				<div id="player-inputs" class="flex flex-col space-y-4">
					<div class="flex flex-row">
						<span class="reverse-border w-full ml-2"><input type="text" id="player1" placeholder="Player 1" class="bg-white text-neutral-900 px-4 py-2 input-border" required></input></span>
						<span class="reverse-border w-full ml-2"><input type="text" id="player2" placeholder="Player 2" class="bg-white text-neutral-900 px-4 py-2 w-full input-border" required></input></span>
					</div>
					<button id="game-start" class="default-button">play</button>
				</div>
				<div id="game-buttons" class="hidden flex mt-4">
					<button id="game-retry" class="default-button w-full mx-4 py-2">play again</button>
					<a id="game-back" class="default-button w-full mx-4 py-2" href="/pong" data-link>back</a>
			</div>
		</div>
		`;
	}

	async run() {
		dragElement(document.getElementById("window"));

		let start: number = 0;
		let elapsed: number;

		let game_playing: boolean = false;
		let match_over: boolean = false;
		let p1_score: number = 0;
		let p2_score: number = 0;
		let p1_name: string;
		let p2_name: string;

		let countdown: number = 3;
		let countdownTimer: number = 0;

		let canvas;
		let ctx;

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

		function getBounceVelocity(paddleY) {
			const speed = ballSpeed;
			const paddleCenterY = paddleY + paddleHeight / 2;

			let n = (ballY - paddleCenterY) / (paddleHeight / 2);
			n = Math.max(-1, Math.min(1, n));
			let theta = n * ((75 * Math.PI) / 180);
			ballSpeedY = ballSpeed * Math.sin(theta);
		}

		function moveBall() {
			let length = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY);
			let scale = ballSpeed / length;
			ballX += (ballSpeedX * scale) * elapsed;
			ballY += (ballSpeedY * scale) * elapsed;

			if (ballY <= 0 || ballY >= canvas.height - ballSize)
				ballSpeedY *= -1;

			if (ballX <= paddleWidth + paddleOffset && ballX >= paddleOffset &&
				ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight)
			{
				ballSpeedX *= -1;
				ballX = paddleWidth + paddleOffset;
				getBounceVelocity(leftPaddleY);
				ballSpeed += 10;
			}

			if (ballX >= canvas.width - paddleWidth - ballSize - paddleOffset && ballX <= canvas.width - ballSize - paddleOffset &&
				ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight)
			{
				ballSpeedX *= -1;
				ballX = canvas.width - paddleWidth - ballSize - paddleOffset;
				getBounceVelocity(rightPaddleY);
				ballSpeed += 10;
			}

			// scoring
			if (ballX < 0 || ballX > canvas.width - ballSize)
			{
				setOnekoState("default");
				game_playing = false;
				if (ballX < 0)
					p2_score++;
				else
					p1_score++;

				if (p1_score === 3 || p2_score === 3)
				{
					// ------------------------------------------------------------------------------------------------------------------------------------------
					//
					// insert the fetch to the ScoreStore api here
					//
					// ------------------------------------------------------------------------------------------------------------------------------------------
					match_over = true;
				}
				else
				{
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
			ctx.fillText(p1_name, canvas.width / 4 - (ctx.measureText(p1_name).width / 2), 45);
			ctx.fillText(p2_name, (canvas.width / 4 * 3) - (ctx.measureText(p2_name).width / 2), 45);

			if (match_over)
			{
				ctx.font = "32px Kubasta";
				const winner = `${p1_score > p2_score ? p1_name : p2_name} won :D`;
				ctx.fillText(winner, canvas.width / 2 - (ctx.measureText(winner).width / 2), canvas.height / 2 + 16);
				document.getElementById("game-buttons").classList.remove("hidden");
			}
		}

		function startCountdown()
	{
			const now = performance.now();
			if (countdown > 0)
			{
				if (now - countdownTimer >= 500)
				{
					countdown--;
					countdownTimer = now;
				}
				ctx.font = "48px Kubasta";
				ctx.fillText(countdown.toString(), canvas.width / 2 - 10, canvas.height / 2 + 24);
			}
			else if (countdown === 0)
			{
				ctx.font = "48px Kubasta";
				ctx.fillText("Go!", canvas.width / 2 - 30, canvas.height / 2 + 24);
				setTimeout(() => {
					game_playing = true;
					countdown = -1;
				}, 500);
			}
		}

		const gameLoop = (timestamp: number) => {
			elapsed = (timestamp - start) / 1000;
			start = timestamp;
			if (game_playing)
			{
				movePaddles();
				moveBall();
			}
			draw();
			if (!game_playing)
				startCountdown();
			if (this.running)
				requestAnimationFrame(gameLoop);
		};


		document.getElementById("game-retry")?.addEventListener("click", () => {
			setOnekoState("pong");
			document.getElementById("game-buttons").classList.add("hidden");
			game_playing = false;
			match_over = false;
			p1_score = 0;
			p2_score = 0;

			countdown = 3;
			countdownTimer = performance.now();
		});
		let p1_input = document.getElementById("player1");
		let p2_input = document.getElementById("player2");

		p2_input.value = "Player 2";
		if (await isLogged())
			p1_input.value = document.cookie.match(new RegExp('(^| )' + "uuid" + '=([^;]+)'))[2];
		else
			p1_input.value = "Player 1";

		document.getElementById("game-start")?.addEventListener("click", () => {
			p1_name = p1_input.value;
			p2_name = p2_input.value;
			document.getElementById("player-inputs").remove();

			canvas = document.createElement("canvas");
			canvas.id = "gameCanvas";
			canvas.classList.add("reverse-border");

			document.getElementById("main-div").prepend(canvas);

			ctx = canvas.getContext("2d");
			ctx.canvas.width  = 600;
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
}
