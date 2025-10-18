import Aview from "./Aview.ts"
import { setOnekoState } from "../oneko.ts"

export default class extends Aview {

	constructor() {
		super();
		this.setTitle("Friends list");
		setOnekoState("default");
	}

	async getHTML() {
		return `
		<div id="window" class="absolute default-border">
			<div id="window-header" class="bg-linear-to-r from-orange-200 to-orange-300 flex flex-row min-w-75 justify-between px-2">
				<span class="font-[Kubasta]">friends.ts</span>
				<div>
					<button> - </button>
					<button> □ </button>
					<a href="/" data-link> × </a>
				</div>
			</div>

			<div class="bg-neutrbg-neutral-200 dark:bg-neutral-800 text-center pb-10 pt-5 px-10 spcae-y-4 reverse-border">
			  <p class="text-gray-900 dark:text-white text-lg pt-0 pb-4"></p>
			</div>
		</div>
		`;
	}

	async run() {
		let uuid: String;

		uuid = document.cookie.match(new RegExp('(^| )' + "uuid" + '=([^;]+)'))[2];

		const userdata_req = await fetch(`http://localhost:3002/users/${uuid}`, {
			method: "GET",
			credentials: "include",
		});
		if (userdata_req.status == 404) {
			console.error("invalid user");
			return;
		}
	}
}
