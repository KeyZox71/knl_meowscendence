import Aview from "./Aview.ts"

export default class extends Aview {

	constructor()
	{
		super();
		this.setTitle("knl is trans(cendence)");
	}

	async getHTML() {
		return `
		<div class="text-center p-10 bg-white dark:bg-neutral-800 rounded-xl shadow space-y-4">
			<h1 class="text-4xl font-bold text-blue-800 dark:text-blue-300">knl_meowscendence :D</h1>
			<p class="text-gray-900 dark:text-white text-lg pb-4">i like pong</p>
			<a class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded" href="/pong" data-link>
				Pong
			</a>
		</div>
		`;
	}
}
