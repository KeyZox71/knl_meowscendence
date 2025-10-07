import Aview from "./Aview.ts"

export default class extends Aview {

	constructor()
	{
		super();
		this.setTitle("knl is trans(cendence)");
	}

	async getHTML() {
		// <div class="text-center p-10 bg-white dark:bg-neutral-800 rounded-xl shadow space-y-4"-->
		return `
		<div class="default-border">
			<div class="bg-linear-to-r from-orange-200 to-orange-300 flex flex-row min-w-75 justify-between px-2">
				<span class="font-[Kubasta]">knl_meowscendence</span>
				<div>
					<button> - </button>
					<button> □ </button>
					<a href="/" data-link> × </a>
				</div>
			</div>
			<div class="bg-neutral-200 dark:bg-neutral-800 text-center p-10 space-y-4 reverse-border">
				<p class="text-gray-900 dark:text-white text-lg pb-4">i like pong</p>
				<a class="default-button" href="/pong" data-link>
					Pong
				</a>
			</div>
		</div>
		`;
	}
}
