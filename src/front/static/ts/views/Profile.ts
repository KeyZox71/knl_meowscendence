import Aview from "./Aview.ts"
import { isLogged, navigationManager } from "../main.ts"

export default class extends Aview {

	constructor()
	{
		super();
		if (!isLogged())
			navigationManager("/login");
		this.setTitle("profile");
	}

	async getHTML() {
		return `
		<div id="main-window" class="text-center p-10 bg-white dark:bg-neutral-800 rounded-xl shadow space-y-4">
		</div>
		`;
	}

	async run() {
		const main = document.getElementById("main-window");
	}
}
