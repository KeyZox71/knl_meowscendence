import Aview from "./Aview.ts";
import { isLogged, user_api, auth_api } from "../main.js";
import { dragElement } from "./drag.js";
import { setOnekoState, setBallPos, setOnekoOffset } from "../oneko.ts";

export default class extends Aview {
  running: boolean;

  constructor() {
    super();
    this.setTitle("tetris (local match)");
    setOnekoState("tetris");
    this.running = true;
  }

  async getHTML() {
    return `
		<div id="window" class="absolute default-border">
			<div id="window-header" class="bg-linear-to-r from-orange-200 to-orange-300 flex flex-row min-w-75 justify-between px-2">
				<span class="font-[Kubasta]">tetris_game.ts</span>
				<div>
					<button> - </button>
					<button> □ </button>
					<a href="/" data-link> × </a>
				</div>
			</div>


			<div id="main-div" class="bg-neutral-200 dark:bg-neutral-800 text-center p-5 pt-2 space-y-4 reverse-border">
			<div id="player-inputs" class="flex flex-col space-y-4">
	      <h1 class="text-lg text-neutral-900 dark:text-white font-bold mt-2">enter the users ids/names</h1>
				<div class="flex flex-row">
					<span class="reverse-border w-full ml-2"><input type="text" id="player1" placeholder="Player 1" class="bg-white text-neutral-900 px-4 py-2 input-border" required></input></span>
					<span class="reverse-border w-full ml-2"><input type="text" id="player2" placeholder="Player 2" class="bg-white text-neutral-900 px-4 py-2 w-full input-border" required></input></span>
				</div>
				<button id="game-start" class="default-button">play</button>
			</div>
				<div id="game-boards" class="hidden flex flex-row justify-center items-start space-x-4">
					<canvas id="board1-hold" class="reverse-border" width="140" height="100"></canvas>
					<canvas id="board1-board" class="reverse-border" width="300" height="600"></canvas>
					<canvas id="board1-queue" class="reverse-border" width="140" height="420"></canvas>
					<canvas id="board2-hold" class="reverse-border" width="140" height="100"></canvas>
					<canvas id="board2-board" class="reverse-border" width="300" height="600"></canvas>
					<canvas id="board2-queue" class="reverse-border" width="140" height="420"></canvas>
				</div>
				<div id="game-buttons" class="hidden flex mt-4">
					<button id="game-retry" class="default-button w-full mx-4 py-2">play again</button>
					<a id="game-back" class="default-button w-full mx-4 py-2" href="/tetris" data-link>back</a>
				</div>
			</div>
		</div>
		`;
  }

  async run() {
    dragElement(document.getElementById("window"));
    const COLS = 10;
    const ROWS = 20;
    const BLOCK = 30; // pixels per block

    let uuid: string;
    let game1: Game;
    let game2: Game;
    let p1_score: number = 0;
		let p2_score: number = 0;
		let p1_name: string;
		let p2_name: string;
		let p1_displayName: string;
		let p2_displayName: string;

    const view = this;

    type Cell = number;

    // Tetromino definitions: each piece is an array of rotations, each rotation is a 2D matrix
    const TETROMINOES: { [key: string]: number[][][] } = {
      I: [
        [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],

        [
          [0, 0, 1, 0],
          [0, 0, 1, 0],
          [0, 0, 1, 0],
          [0, 0, 1, 0],
        ],

        [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
        ],

        [
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
        ],
      ],
      J: [
        [
          [2, 0, 0],
          [2, 2, 2],
          [0, 0, 0],
        ],

        [
          [0, 2, 2],
          [0, 2, 0],
          [0, 2, 0],
        ],

        [
          [0, 0, 0],
          [2, 2, 2],
          [0, 0, 2],
        ],

        [
          [0, 2, 0],
          [0, 2, 0],
          [2, 2, 0],
        ],
      ],
      L: [
        [
          [0, 0, 3],
          [3, 3, 3],
          [0, 0, 0],
        ],

        [
          [0, 3, 0],
          [0, 3, 0],
          [0, 3, 3],
        ],

        [
          [0, 0, 0],
          [3, 3, 3],
          [3, 0, 0],
        ],

        [
          [3, 3, 0],
          [0, 3, 0],
          [0, 3, 0],
        ],
      ],
      O: [
        [
          [4, 4],
          [4, 4],
        ],
      ],
      S: [
        [
          [0, 5, 5],
          [5, 5, 0],
          [0, 0, 0],
        ],

        [
          [0, 5, 0],
          [0, 5, 5],
          [0, 0, 5],
        ],

        [
          [0, 0, 0],
          [0, 5, 5],
          [5, 5, 0],
        ],

        [
          [5, 0, 0],
          [5, 5, 0],
          [0, 5, 0],
        ],
      ],
      T: [
        [
          [0, 6, 0],
          [6, 6, 6],
          [0, 0, 0],
        ],

        [
          [0, 6, 0],
          [0, 6, 6],
          [0, 6, 0],
        ],

        [
          [0, 0, 0],
          [6, 6, 6],
          [0, 6, 0],
        ],

        [
          [0, 6, 0],
          [6, 6, 0],
          [0, 6, 0],
        ],
      ],
      Z: [
        [
          [7, 7, 0],
          [0, 7, 7],
          [0, 0, 0],
        ],

        [
          [0, 0, 7],
          [0, 7, 7],
          [0, 7, 0],
        ],

        [
          [0, 0, 0],
          [7, 7, 0],
          [0, 7, 7],
        ],

        [
          [0, 7, 0],
          [7, 7, 0],
          [7, 0, 0],
        ],
      ],
    };

    const COLORS = [
      [ "#000000", "#000000" ] , // placeholder for 0
      [ "#00d2e1", "#0080a8" ], // I - cyan
      [ "#0092e9", "#001fbf" ], // J - blue
      [ "#e79700", "#c75700" ], // L - orange
      [ "#d8c800", "#8f7700" ], // O - yellow
      [ "#59e000", "#038b00" ], // S - green
      [ "#de1fdf", "#870087" ], // T - purple
      [ "#f06600", "#c10d07" ], // Z - red
      [ "#8c8c84", "#393934" ], // garbage - gray
    ];

    class Piece {
      shape: number[][];
      rotations: number[][][];
      rotationIndex: number;
      x: number;
      y: number;
      colorIndex: number;

      constructor(public type: string) {
        this.rotations = TETROMINOES[type];
        this.rotationIndex = 0;
        this.shape = this.rotations[this.rotationIndex];
        this.colorIndex = this.findColorIndex();

        this.x = Math.floor((COLS - this.shape[0].length) / 2);
        this.y = -2; //start on tiles 21 and 22
      }

      findColorIndex() {
        for (const row of this.shape)
          for (const v of row)
            if (v)
              return v;
        return 1;
      }

      rotateCW() {
        this.rotationIndex = (this.rotationIndex + 1) % this.rotations.length;
        this.shape = this.rotations[this.rotationIndex];
      }

      rotateCCW() {
        this.rotationIndex =
          (this.rotationIndex - 1 + this.rotations.length) %
          this.rotations.length;
        this.shape = this.rotations[this.rotationIndex];
      }

      getCells(): { x: number; y: number; val: number }[] {
        const cells: { x: number; y: number; val: number }[] = [];

        for (let r = 0; r < this.shape.length; r++) {
          for (let c = 0; c < this.shape[r].length; c++) {
            const val = this.shape[r][c];
            if (val) cells.push({ x: this.x + c, y: this.y + r, val });
          }
        }
        return cells;
      }
    }

    class Game {
      board: Cell[][];
      canvas: HTMLCanvasElement | null;
      holdCanvas: HTMLCanvasElement | null;
      queueCanvas: HTMLCanvasElement | null;
      ctx: CanvasRenderingContext2D | null;
      holdCtx: CanvasRenderingContext2D | null;
      queueCtx: CanvasRenderingContext2D | null;
      piece: Piece | null = null;
      holdPiece: Piece | null = null;
      canHold: boolean = true;
      nextQueue: string[] = [];
      score: number = 0;
      level: number = 1;
      lines: number = 0;
      garbage: number = 0;
      dropInterval: number = 1000;
      lastDrop: number = 0;
      isLocking: boolean = false;
      lockRotationCount: number = 0;
      lockLastRotationCount: number = 0;
      isGameOver: boolean = false;
      isPaused: boolean = false;
      id: number;

      constructor(canvasId: string, id: number) {
        this.id = id;
        const el = document.getElementById(
          canvasId + "-board",
        ) as HTMLCanvasElement | null;
        this.canvas = el;
        if (!this.canvas)
          throw console.error("no canvas :c");
        this.canvas.width = COLS * BLOCK;
        this.canvas.height = ROWS * BLOCK;
        const ctx = this.canvas.getContext("2d");
        this.ctx = ctx;
        if (!this.ctx)
          throw console.error("no ctx D:");

        this.holdCanvas = document.getElementById(canvasId + "-hold") as HTMLCanvasElement;
        this.queueCanvas = document.getElementById(canvasId + "-queue") as HTMLCanvasElement;
        if (!this.holdCanvas || !this.queueCanvas)
          throw console.error("no canvas :c");
        this.holdCtx = this.holdCanvas.getContext("2d");
        this.queueCtx = this.queueCanvas.getContext("2d");
        if (!this.holdCtx || !this.queueCtx)
          return;

        this.holdCtx.clearRect(0, 0, 200, 200);
        this.queueCtx.clearRect(0, 0, 500, 500);

        this.board = this.createEmptyBoard();
        if (id == 0)
          this.fillBag();
        else
          this.nextQueue = game1.nextQueue;

        this.spawnPiece();
        if (id != 0)
          this.piece.type = game1.piece.type;
        this.registerListeners();
        requestAnimationFrame(this.loop.bind(this));
      }

      createEmptyBoard(): Cell[][] {
        const b: Cell[][] = [];
        for (let r = 0; r < ROWS; r++) {
          const row: Cell[] = new Array(COLS).fill(0);
          b.push(row);
        }
        return b;
      }

      fillBag() {
        // classic 7-bag randomizer
        const pieces = Object.keys(TETROMINOES);
        const bag = [...pieces];
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        this.nextQueue.push(...bag);
      }

      hold() {
        if (!this.canHold) return;

        [this.piece, this.holdPiece] = [this.holdPiece, this.piece];
        if (!this.piece) this.spawnPiece();
        if (!this.piece) return;

        this.piece.x = Math.floor((COLS - this.piece.shape[0].length) / 2);
        this.piece.y = -2;
        this.piece.rotationIndex = 0;
        this.piece.shape = this.piece.rotations[this.piece.rotationIndex];

        this.canHold = false;
        this.drawHold();
      }

      spawnPiece() {
        this.canHold = true;
        if (this.nextQueue.length < 7) this.fillBag();
        const type = this.nextQueue.shift()!;
        this.piece = new Piece(type);
        if (this.collides(this.piece)) {
          game1.isGameOver = true;
          game2.isGameOver = true;
        }

        this.drawHold();
        this.drawQueue();
      }

      collides(piece: Piece): boolean {
        for (const cell of piece.getCells()) {
          if (cell.y >= ROWS) return true;
          if (cell.x < 0 || cell.x >= COLS) return true;
          if (cell.y >= 0 && this.board[cell.y][cell.x]) return true;
        }
        return false;
      }

      getGhostOffset(piece: Piece): number {
        let y: number = 0;
        while (true) {
          for (const cell of piece.getCells()) {
            if (
              cell.y + y >= ROWS ||
              (cell.y + y >= 0 && this.board[cell.y + y][cell.x])
            )
            return y - 1;
          }

          y++;
        }
      }

      lockPiece() {
        if (!this.piece) return;
        this.isLocking = false;
        let isValid: boolean = false;
        for (const cell of this.piece.getCells()) {
          if (cell.y >= 0 && cell.y < ROWS && cell.x >= 0 && cell.x < COLS)
            this.board[cell.y][cell.x] = cell.val;
          if (cell.y > 0) isValid = true;
        }
        if (!isValid)
        {
          this.id == 0 ? p2_score++ : p1_score++;
          game1.isGameOver = true;
          game2.isGameOver = true;
        }

        if (this.garbage)
        {
          const empty_spot = Math.floor(Math.random() * 10);
          while (this.garbage)
          {
            //if () // if anything else than 0 on top, die >:3
            this.board.shift();
            this.board.push(Array(COLS).fill(8));
            this.board[19][empty_spot] = 0;
            this.garbage--;
          }
        }
        this.clearLines();
        this.spawnPiece();
      }

      addGarbage(lines: number) {
        this.garbage += lines;
      }

      clearLines() {
        let linesCleared = 0;
        outer: for (let r = ROWS - 1; r >= 0; r--) {
          for (let c = 0; c < COLS; c++) if (!this.board[r][c]) continue outer;

          this.board.splice(r, 1);
          this.board.unshift(new Array(COLS).fill(0));
          linesCleared++;
          r++;
        }

        if (linesCleared > 0) {
          this.lines += linesCleared;
          const points = [0, 40, 100, 300, 1200];
          this.score += (points[linesCleared] || 0) * this.level;
          // level up every 10 lines (Fixed Goal System)
          const newLevel = Math.floor(this.lines / 10) + 1;
          if (newLevel > this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 75);
          }

          if (this.garbage)
          {
            while (linesCleared)
            {
              this.garbage--;
              linesCleared--;
              if (!this.garbage)
                break;
            }
          }
          if (this.id == 0 && linesCleared)
            game2.addGarbage(linesCleared < 4 ? linesCleared - 1 : linesCleared);
          else
            game1.addGarbage(linesCleared < 4 ? linesCleared - 1 : linesCleared);
        }
      }

      rotatePiece(dir: "cw" | "ccw") {
        if (!this.piece) return;
        if (this.isLocking && this.lockRotationCount < 15)
          this.lockRotationCount++;
        // Try wall kicks
        const originalIndex = this.piece.rotationIndex;
        if (dir === "cw") this.piece.rotateCW();
        else this.piece.rotateCCW();
        const kicks = [0, -1, 1, -2, 2];
        for (const k of kicks) {
          this.piece.x += k;
          if (!this.collides(this.piece)) return;
          this.piece.x -= k;
        }
        // no kick, revert
        this.piece.rotationIndex = originalIndex;
        this.piece.shape = this.piece.rotations[originalIndex];
      }

      movePiece(dx: number, dy: number) {
        if (!this.piece) return;
        this.piece.x += dx;
        this.piece.y += dy;

        if (this.collides(this.piece)) {
          this.piece.x -= dx;
          this.piece.y -= dy;
          return false;
        }
        return true;
      }

      hardDrop() {
        if (!this.piece) return;
        let dropped = 0;
        while (this.movePiece(0, 1)) dropped++;
        this.score += dropped * 2;
        this.lockPiece();
      }

      softDrop() {
        if (!this.piece) return;
        if (!this.movePiece(0, 1)) return;
        else this.score += 1;
      }

      keys: Record<string, boolean> = {};
      direction: number = 0;
      inputDelay = 200;
      inputTimestamp = Date.now();
      move: boolean = false;

      inputManager() {
        const left = this.id === 0 ? this.keys["KeyA"] : this.keys["Numpad4"]
        const right = this.id === 0 ? this.keys["KeyD"] : this.keys["Numpad6"]
        if (this.move || Date.now() > this.inputTimestamp + this.inputDelay)
        {
          if (left && !right)
            this.movePiece(-1, 0);
          else if (!left && right)
            this.movePiece(1, 0);
          else if (left && right)
            this.movePiece(this.direction, 0);
          this.move = false;
        }

        /*if (this.keys["ArrowDown"])
          this.softDrop();*/
      }

      registerListeners() {
        window.addEventListener("keydown", (e) => {
          this.keys[e.code] = true;

          if (this.isGameOver) return;

          if (e.key === "p" || e.key === "P" || e.key === "Escape")
            this.isPaused = !this.isPaused;

          if (this.isPaused) return;

          if (this.id === 0 ? e.code === "KeyA" : e.code === "Numpad4")
          {
            this.inputTimestamp = Date.now();
            this.direction = -1;//this.movePiece(-1, 0);
            this.move = true;
          }
          else if (this.id === 0 ? e.code === "KeyD" : e.code === "Numpad6")
          {
            this.inputTimestamp = Date.now();
            this.direction = 1;//this.movePiece(1, 0);
            this.move = true;
          }
          else if (this.id === 0 ? e.code === "KeyS" : e.code === "Numpad5") this.softDrop();
          else if (this.id === 0 ? e.code === "Space" : e.code === "Numpad0") {
            //e.preventDefault();
            this.hardDrop();
          } else if (this.id === 0 ? e.code === "ShiftLeft" : e.code === "NumpadEnter") {
            //e.preventDefault();
            this.hold();
          } else if (this.id === 0 ? (e.code === "KeyE" || e.code === "KeyW") : (e.code === "Numpad9" || e.code === "Numpad8")) {
            //e.preventDefault();
            this.rotatePiece("cw");
          }  else if (this.id === 0 ? (e.code === "KeyQ" || e.code === "ControlLeft") : e.code === "Numpad7") {
            //e.preventDefault();
            this.rotatePiece("ccw");
          }
        });

        document.addEventListener("keyup", (e) => {
          this.keys[e.code] = false;
        });
      }

      async loop(timestamp: number) {
        if (!view.running) return;
        if (!this.lastDrop) this.lastDrop = timestamp;
        if (!this.isPaused)
        {
          this.inputManager();
          if (this.isLocking ? timestamp - this.lastDrop > 500 : timestamp - this.lastDrop > this.dropInterval)
          {
            if (this.isLocking && this.lockRotationCount == this.lockLastRotationCount)
              this.lockPiece();
            this.lockLastRotationCount = this.lockRotationCount;
            if (!this.movePiece(0, 1))
            {
              if (!this.isLocking)
              {
                this.lockRotationCount = 0;
                this.lockLastRotationCount = 0;
                this.isLocking = true;
              }
            }
            else if (this.isLocking)
              this.lockRotationCount = 0;
            this.lastDrop = timestamp;
          }
        }
        this.draw();

        if (this.isGameOver)
        {
          if (p1_score != 3 && p2_score != 3)
          {
            if (this.id == 0)
            {
              game1 = new Game("board1", 0);
              game2 = new Game("board2", 1);
            }
            return ;
          }
          if (await isLogged() && this.id == 0)
          {
            let uuid = document.cookie.match(new RegExp('(^| )' + "uuid" + '=([^;]+)'))[2];
            fetch(`${user_api}/users/${uuid}/matchHistory?game=tetris`, {
              method: "POST",
              headers: { "Content-Type": "application/json", },
              credentials: "include",
              body: JSON.stringify({
                "game": "tetris",
                "opponent": p2_name,
                "myScore": p1_score,
                "opponentScore": p2_score,
                "date": Date.now(),
              }),
            });
          }
          document.getElementById("game-buttons")?.classList.remove("hidden");
          return ;
        }
        requestAnimationFrame(this.loop.bind(this));
      }

      drawGrid() {
        const ctx = this.ctx;
        if (!ctx || !this.canvas)
          return;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? "oklch(14.5% 0 0)" : "oklch(55.6% 0 0)";
        for (let r = 0; r <= ROWS; r++) {
          // horizontal lines
          ctx.beginPath();
          ctx.moveTo(0, r * BLOCK);
          ctx.lineTo(COLS * BLOCK, r * BLOCK);
          ctx.stroke();
        }
        for (let c = 0; c <= COLS; c++) {
          ctx.beginPath();
          ctx.moveTo(c * BLOCK, 0);
          ctx.lineTo(c * BLOCK, ROWS * BLOCK);
          ctx.stroke();
        }
      }

      drawBoard() {
        this.drawGrid();
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const val = this.board[r][c];
            if (val) this.fillBlock(c, r, COLORS[val], this.ctx);
            else this.clearBlock(c, r);
          }
        }
      }

      drawPiece() {
        if (!this.piece) return;

        for (const cell of this.piece.getCells())
          if (cell.y >= 0) this.fillBlock(cell.x, cell.y, COLORS[cell.val], this.ctx);

        let offset: number = this.getGhostOffset(this.piece);
        for (const cell of this.piece.getCells())
          if (cell.y + offset >= 0 && offset > 0)
            this.fillGhostBlock(cell.x, cell.y + offset, COLORS[cell.val]);
      }

      drawHold() {
        if (!this.holdCtx || !this.holdCanvas) return;

        this.holdCtx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? "oklch(20.5% 0 0)" : "oklch(70.8% 0 0)";
        this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);

        if (!this.holdPiece) return;
        let y: number = 0;
        for (const row of this.holdPiece.rotations[0]) {
          let x: number = 0;
          for (const val of row) {
            if (val)
              this.fillBlock(x + (4 - this.holdPiece.rotations[0].length)/ 2 + 0.35, y + 0.5, this.canHold ? COLORS[this.holdPiece.findColorIndex()] : COLORS[8], this.holdCtx);
            x++;
          }
          y++;
        }
      }

      drawQueue() {
        if (!this.queueCtx || !this.queueCanvas) return ;

        this.queueCtx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? "oklch(20.5% 0 0)" : "oklch(70.8% 0 0)";
        this.queueCtx.fillRect(0, 0, this.queueCanvas.width, this.queueCanvas.height);
        let placement: number = 0;
        for (const nextPiece of this.nextQueue.slice(0, 5)) {
          let y: number = 0;
          for (const row of TETROMINOES[nextPiece][0]) {
            let x: number = 0;
            for (const val of row) {
              if (val)
                this.fillBlock(x + (4 - TETROMINOES[nextPiece][0].length) / 2 + 0.25, y + 0.5 + placement * 2.69 - (nextPiece ==="I" ? 0.35 : 0), COLORS[["I", "J", "L", "O", "S", "T", "Z"].indexOf(nextPiece) + 1], this.queueCtx);
              x++;
            }
            y++;
          }
          placement++;
        }
      }

      adjustColor(hex: string, amount: number): string {
        let color = hex.startsWith('#') ? hex.slice(1) : hex;
        const num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        r = Math.max(Math.min(255, r), 0);
        g = Math.max(Math.min(255, g), 0);
        b = Math.max(Math.min(255, b), 0);
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
      }

      fillBlock(x: number, y: number, color: string[], ctx: CanvasRenderingContext2D | null) {
        if (!ctx) return;
        const grad = ctx.createLinearGradient(x * BLOCK, y * BLOCK, x * BLOCK, y * BLOCK + BLOCK);
        grad.addColorStop(0, color[0]);
        grad.addColorStop(1, color[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(Math.round(x * BLOCK) + 4, Math.round(y * BLOCK) + 4, BLOCK - 4, BLOCK - 4);
        const X = Math.round(x * BLOCK);
        const Y = Math.round(y * BLOCK);
        const W = BLOCK;
        const H = BLOCK;
        const S = 4;

        ctx.lineWidth = S;
        ctx.beginPath();
        ctx.strokeStyle = color[0];
        ctx.moveTo(X, Y + S / 2);
        ctx.lineTo(X + W, Y + S / 2);
        ctx.moveTo(X + S / 2, Y);
        ctx.lineTo(X + S / 2, Y + H);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = this.adjustColor(color[1], -20);
        ctx.moveTo(X, Y + H - S / 2);
        ctx.lineTo(X + W, Y + H - S / 2);
        ctx.moveTo(X + W - S / 2, Y);
        ctx.lineTo(X + W - S / 2, Y + H);
        ctx.stroke();
      }
      fillGhostBlock(x: number, y: number, color: string[]) {
        if (!this.ctx) return;
        const ctx = this.ctx;

        const X = x * BLOCK;
        const Y = y * BLOCK;
        const W = BLOCK;
        const H = BLOCK;
        const S = 4;

        ctx.lineWidth = S;
        ctx.beginPath();
        ctx.strokeStyle = this.adjustColor(color[0], -40);
        ctx.moveTo(X, Y + S / 2);
        ctx.lineTo(X + W, Y + S / 2);
        ctx.moveTo(X + S / 2, Y);
        ctx.lineTo(X + S / 2, Y + H);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = this.adjustColor(color[1], -60);
        ctx.moveTo(X, Y + H - S / 2);
        ctx.lineTo(X + W, Y + H - S / 2);
        ctx.moveTo(X + W - S / 2, Y);
        ctx.lineTo(X + W - S / 2, Y + H);
        ctx.stroke();
        //ctx.strokeRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2);
      }

      clearBlock(x: number, y: number) {
        if (!this.ctx) return;
        const ctx = this.ctx;
       	ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? "oklch(20.5% 0 0)" : "oklch(70.8% 0 0)";
        ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2);
      }

      drawHUD() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;

        if (this.garbage)
        {
          ctx.fillStyle ="red";
          ctx.fillRect(0, this.canvas.height - BLOCK * this.garbage, 6, BLOCK * this.garbage);
        }

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(4, 4, 120, 60);
        ctx.fillStyle = "#fff";
        ctx.font = "12px Kubasta";
        ctx.fillText(`${this.id == 0 ? p1_displayName : p2_displayName}: ${this.id == 0 ? p1_score : p2_score}`, 8, 20);
        ctx.fillText(`score: ${this.score}`, 8, 36);
        ctx.fillText(`lines: ${this.lines}`, 8, 52);

        if (this.isPaused) {
          ctx.fillStyle = "rgba(0,0,0,0.7)";
          ctx.fillRect(0, this.canvas.height / 2 - 24, this.canvas.width, 48);
          ctx.fillStyle = "#fff";
          ctx.font = "24px Kubasta";
          ctx.textAlign = "center";
          ctx.fillText(
            "paused",
            this.canvas.width / 2,
            this.canvas.height / 2 + 8,
          );
          ctx.textAlign = "start";
        }

        if (this.isGameOver) {
          ctx.fillStyle = "rgba(0,0,0,0.7)";
          ctx.fillRect(0, this.canvas.height / 2 - 36, this.canvas.width, 72);
          ctx.fillStyle = "#fff";
          ctx.font = "28px Kubasta";
          ctx.textAlign = "center";
          ctx.fillText(
            "game over",
            this.canvas.width / 2,
            this.canvas.height / 2 + 8,
          );
          ctx.textAlign = "start";
        }
      }

      draw() {
        if (!this.ctx || !this.canvas) return;
        // clear everything
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = "#111";
        for (let r = 0; r <= ROWS; r++) {
          this.ctx.beginPath();
          this.ctx.moveTo(0, r * BLOCK);
          this.ctx.lineTo(COLS * BLOCK, r * BLOCK);
          this.ctx.stroke();
        }
        for (let c = 0; c <= COLS; c++) {
          this.ctx.beginPath();
          this.ctx.moveTo(c * BLOCK, 0);
          this.ctx.lineTo(c * BLOCK, ROWS * BLOCK);
          this.ctx.stroke();
        }

        this.drawBoard();
        this.drawPiece();
        this.drawHUD();
        this.drawQueue();
      }
    }

    document.getElementById("game-retry")?.addEventListener("click", () => { document.getElementById("game-buttons")?.classList.add("hidden"); game1 = new Game("board1", 0); game2 = new Game("board2", 1); });

    let p1_input: HTMLInputElement = document.getElementById("player1") as HTMLInputElement;
		let p2_input: HTMLInputElement = document.getElementById("player2") as HTMLInputElement;

		p2_input.value = "player 2";
		if (await isLogged())
		{
      uuid = document.cookie.match(new RegExp('(^| )' + "uuid" + '=([^;]+)'))[2];
			p1_input.value = uuid;
      p1_input.readOnly = true;
		}
		else
			p1_input.value = "player 1";

    document.getElementById("game-start")?.addEventListener("click", async () => {
      let p1_isvalid = true;
      let p2_isvalid = true;
      if (await isLogged()) {
        const p1_req = await fetch(`${user_api}/users/${p1_input.value}`, {
          method: "GET",
          credentials: "include",
        });
        const p2_req = await fetch(`${user_api}/users/${p2_input.value}`, {
          method: "GET",
          credentials: "include",
        });
        if (p1_req.status != 200)
          p1_isvalid = false;
        else
        p1_displayName = (await p1_req.json()).displayName;

        if (p2_req.status != 200)
          p2_isvalid = false;
        else
          p2_displayName = (await p2_req.json()).displayName;
      }
      else
        p1_isvalid = p2_isvalid = false;

      p1_name = p1_input.value;
      p2_name = p2_input.value;
      if (!p1_isvalid)
        p1_displayName = p1_name;
      if (!p2_isvalid)
        p2_displayName = p2_name;

      p1_displayName = p1_displayName.length > 16 ? p1_displayName.substring(0, 16) + "." : p1_displayName;
      p2_displayName = p2_displayName.length > 16 ? p2_displayName.substring(0, 16) + "." : p2_displayName;

      document.getElementById("player-inputs").remove();
      document.getElementById("game-boards").classList.remove("hidden");
      game1 = new Game("board1", 0);
      game2 = new Game("board2", 1);
    });

  }
}
