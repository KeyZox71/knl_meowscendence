import Aview from "./Aview.ts"

export default class extends Aview {

	constructor()
	{
		super();
		this.setTitle("ponging ur mom");
	}

	async getHTML() {
		return `
		<div class="text-center p-10 bg-white dark:bg-neutral-800 rounded-xl shadow space-y-4">
			<p class="text-gray-700 dark:text-white text-3xl font-bold pb-4">pong is funny yay</p>
			<a class="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded" href="/pong/solo" data-link>
				solo
			</a>
		</div>
		`;
	}
}
