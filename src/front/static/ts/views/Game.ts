import Aview from "./Aview.ts"

export default class extends Aview {
	
	running: boolean;

	constructor()
	{
		super();
		this.setTitle("pong (local match)");
		this.running = true;
	}

	async getHTML() {
		return `
			<script type="module" src="static/ts/pong-logic.ts"></script>
			<div class="text-center p-5 bg-white rounded-xl shadow space-y-4">
				<canvas id="gameCanvas" class="rounded-md" width="400" height="400"></canvas>
				<div id="game-buttons" class="hidden flex">
					<button id="game-retry" class="bg-blue-600 text-white hover:bg-blue-500 w-full mx-4 py-2 rounded-md transition-colors">play again</button>
					<a id="game-back" class="bg-gray-600 text-white hover:bg-gray-500 w-full mx-4 py-2 rounded-md transition-colors" href="/pong" data-link>back</a>
				</div>
			</div>
		`;
	}

	async run() {
		let start: number = 0;
		let elapsed: number;

		let game_playing: boolean = false;
		let match_over: boolean = false;
		let p1_score: number = 0;
		let p2_score: number = 0;

		let countdown: number = 3;
		let countdownTimer: number = 0;

		const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
		const ctx = canvas.getContext("2d");

		const paddleOffset: number = 15;
		const paddleHeight: number = 100;
		const paddleWidth: number = 10;
		const ballSize: number = 10;

		let leftPaddleY: number = canvas.height / 2 - paddleHeight / 2;
		let rightPaddleY: number = canvas.height / 2 - paddleHeight / 2;
		let paddleSpeed: number = 727 * 0.69;
		let ballX: number = canvas.width / 2;
		let ballY: number = canvas.height / 2;
		let ballSpeed: number = 200;
		let ballSpeedX: number = 300;
		let ballSpeedY: number = 10;

		const keys: Record<string, boolean> = {};

		document.addEventListener("keydown", e => { keys[e.key] = true; });
		document.addEventListener("keyup", e => { keys[e.key] = false; });

		function movePaddles() {
			if (keys["w"] && leftPaddleY > 0)
				leftPaddleY -= paddleSpeed * elapsed;
			if (keys["s"] && leftPaddleY < canvas.height - paddleHeight)
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
				game_playing = false;
				if (ballX < 0)
					p2_score++;
				else
					p1_score++;

				if (p1_score === 3 || p2_score === 3)
					match_over = true;
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
		}

		function draw() {
			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "white";
			ctx.fillRect(paddleOffset, leftPaddleY, paddleWidth, paddleHeight);
			ctx.fillRect(canvas.width - paddleWidth - paddleOffset, rightPaddleY, paddleWidth, paddleHeight);

			ctx.fillStyle = "white";
			if (game_playing)
				ctx.fillRect(ballX, ballY, ballSize, ballSize);

			ctx.font = "24px sans-serif";
			ctx.fillText(`${p1_score} - ${p2_score}`, canvas.width / 2 - 20, 30);

			if (match_over)
			{
				ctx.font = "48px sans-serif";
				const winner = p1_score > p2_score ? "Player 1" : "Player 2";
				ctx.fillText(`${winner} won :D`, canvas.width / 2 - 150, canvas.height / 2 + 22);
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
				ctx.font = "48px sans-serif";
				ctx.fillText(countdown.toString(), canvas.width / 2 - 10, canvas.height / 2 + 24);
			}
			else if (countdown === 0)
			{
				ctx.font = "48px sans-serif";
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
			console.log(game_playing);
			if (!game_playing)
				startCountdown();
			if (this.running)
				requestAnimationFrame(gameLoop);
		};


		document.getElementById("game-retry")?.addEventListener("click", () => {
			document.getElementById("game-buttons").classList.add("hidden");
			game_playing = false;
			match_over = false;
			p1_score = 0;
			p2_score = 0;

			countdown = 3;
			countdownTimer = performance.now();
		});

		requestAnimationFrame(gameLoop);
	}
}
