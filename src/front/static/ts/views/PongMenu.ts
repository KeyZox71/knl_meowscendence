import Aview from "./Aview.ts"
import { dragElement } from "./drag.js"
import { setOnekoState } from "../oneko.ts"

export default class extends Aview {

	constructor()
	{
		super();
		this.setTitle("knl is trans(cendence)");
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
			<div class="bg-neutral-200 dark:bg-neutral-800 text-center pb-10 pt-5 px-10 space-y-4 reverse-border">
				<p class="text-gray-900 dark:text-white text-lg pt-0 pb-4">welcome to pong!! Oo</p>
				<div class="flex flex-col space-y-4">
					<a class="default-button" href="/pong/local" data-link>
						local match
					</a>
					<a class="default-button" href="/pong/tournament" data-link>
						local tournament
					</a>
				</div>
			</div>
		</div>
		`;
	}
	async run() {
		dragElement(document.getElementById("window"));
	}
}
