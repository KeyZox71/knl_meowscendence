import Aview from "./Aview.ts"

export default class extends Aview {

	constructor()
	{
		super();
		this.setTitle("register");
	}

	async getHTML() {
		return `
		<div class="text-center p-10 bg-white dark:bg-neutral-800 rounded-xl shadow space-y-4 flex flex-col">
			<h1 class="text-4xl font-bold text-blue-600">register</h1>

			<input type="text" id="username" placeholder="username" class="bg-white text-neutral-900 border rounded-md w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></input>
			<input type="password" id="password" placeholder="password" class="bg-white text-neutral-900 border w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></input>

			<button type="submit" class="bg-blue-600 text-white hover:bg-blue-500 w-full py-2 rounded-md transition-colors">register</button>

			<a class="text-gray-400 dark:text-gray-600 underline" href="/login" data-link>
				i already have an account
			</a>
		</div>
		`;
	}
}
