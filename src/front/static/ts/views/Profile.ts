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
		const uuid = document.cookie.match(new RegExp('(^| )' + "uuid" + '=([^;]+)'))[2];
		const userdata_req = await fetch(`http://localhost:3002/users/${uuid}`, {
			method: "GET",
			credentials: "include",
		});

		if (userdata_req.status == 404)
		{
			console.error("invalid user");
			return ;
		}

		let userdata = await userdata_req.json();

		console.log(userdata_req);

		const main = document.getElementById("main-window");
		const nametag = main.appendChild(document.createElement("span"));

		nametag.innerHTML = `Hiiiiii ${userdata.displayName} ! :D`;
		nametag.classList.add("text-neutral-900", "dark:text-white");

		const winrate = main.appendChild(document.createElement("div"));

		winrate.innerHTML = `wins: ${userdata.wins} | losses: ${userdata.losses} | winrate: ${userdata.wins / (userdata.wins + userdata.losses)}`;
		winrate.classList.add("text-neutral-900", "dark:text-white");
	}
}
