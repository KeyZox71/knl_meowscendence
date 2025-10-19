import Aview from "./Aview.ts"
import { setOnekoState } from "../oneko.ts"
import { dragElement } from "./drag.ts";
import { isLogged, navigationManager } from "../main.ts"

export default class extends Aview {

	constructor() {
		super();
		this.setTitle("friends list");
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

			<div class="bg-neutral-200 dark:bg-neutral-800 text-center pb-10 pt-5 px-10 space-y-4 reverse-border">
			  <form method="dialog" class="bg-neutral-200 dark:bg-neutral-800 text-center pb-10 pt-5 px-10 space-y-4 reverse-border">
				<input type="text" id="new-friend" placeholder="new friend" class="bg-white text-neutral-900 px-4 py-2 input-border" required></input>
				<button id="add-friends-button" type="submit" class="default-button w-full">add friend</button>
				<p id="add-friend-err" class="hidden text-red-700 dark:text-red-500"></p>
				<p id="add-friend-msg" class="hidden text-gray-900 dark:text-white text-lg"></p>
			  </form>
			  <p id="friends_n" class="hidden text-gray-900 dark:text-white text-lg"></p>
			  <p id="friends-error-message" class="hidden text-red-700 dark:text-red-500"></p>
			  <p id="friend-msg" class="hidden text-gray-900 dark:text-white text-lg"></p>
			  <div class="flex flex-row space-x-4 w-full min-w-145">
				<ul id="friends_list" class="reverse-border space-y-2 hidden text-gray-900 dark:text-white text-lg overflow-scroll h-48 w-full">
				</ul>
		      </div>
			</div>
		</div>
		`;
	}

	async run() {
		if (!await isLogged())
			navigationManager("/");

		dragElement(document.getElementById("window"));
		let uuid: String;
		uuid = document.cookie.match(new RegExp('(^| )' + "uuid" + '=([^;]+)'))[2];
		const n_friends = (document.getElementById("friends_n") as HTMLParagraphElement);
		const friends_error_message = (document.getElementById("friends-error-message") as HTMLParagraphElement);
		const friends_message = (document.getElementById("friends-msg") as HTMLParagraphElement)
		const friends_list = (document.getElementById("friends_list") as HTMLUListElement);
		const new_friend = (document.getElementById("new-friend") as HTMLInputElement);
		const add_friend_err = (document.getElementById("add-friend-err") as HTMLParagraphElement);
		const add_friend_msg = (document.getElementById("add-friend-msg") as HTMLParagraphElement);

		async function removeFriend(name) {
			const data_req = await fetch("http://localhost:3002/users/" + uuid + "/friends/" + name, {
				method: "DELETE",
				credentials: "include",
			});
			if (data_req.status === 200) {
				console.log("friends removed success fully");
			} else {
				console.log("could not remove friend");
			}
		}

		async function isFriendLogged(name: string): Promise<Boolean> {
			const data_req = await fetch("http://localhost:3002/ping/" + name, {
				method: "GET",
				credentials: "include",
			});

			if (data_req.status === 404)
				return false;

			return (await data_req.json()).isLogged
		}

		const list_friends = async () => {
			const data_req = await fetch("http://localhost:3002/users/" + uuid + "/friends/count", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			if (data_req.status === 404) {
			}
			let data = await data_req.json();

			if (data.n_friends > 0) {
				const list_req = await fetch("http://localhost:3002/users/" + uuid + "/friends?iStart=0&iEnd=2147483647", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				});
				if (list_req.status == 404) {
					friends_list.classList.add("hidden")
					return;
				} else if (list_req.status === 200) {
					while (friends_list.firstChild) {
						friends_list.removeChild(friends_list.firstChild);
					}
					friends_list.classList.remove("hidden")

					let list = (await list_req.json()).friends as JSON;

					for (let i = 0; i < data.n_friends; i++) {
						let new_friends = document.createElement('li');

						const activitySpan = document.createElement('span');
						const isLogged = await isFriendLogged(list[i].friendName)
						activitySpan.textContent = "•";
						if (isLogged == true)
							activitySpan.className = "px-0 text-green-500";
						else 
							activitySpan.className = "px-0 text-red-500";


						const span = document.createElement('span');
						span.className = "px-3";
						span.textContent = list[i].friendName;

						const but = document.createElement('button');
						but.textContent = "-";
						but.className = "bg-red-500 text-white px-2 py-0 rounded hover:bg-red-600";
						but.onclick = function() {
							removeFriend(list[i].friendName);
							list_friends()
						}

						new_friends.appendChild(activitySpan);
						new_friends.appendChild(span);
						new_friends.appendChild(but);
						friends_list.appendChild(new_friends);
					}
				} else {
					n_friends.classList.add("hidden");
					friends_error_message.innerHTML = (await list_req.json()).error;
					friends_error_message.classList.remove("hidden");
				}
			} else {
				friends_message.innerHTML = "you have no friends D:";
				friends_message.classList.remove("hidden");
			}
		}


		const add_friend = async () => {
			const data_req = await fetch("http://localhost:3002/users/" + uuid + "/friends/" + new_friend.value, {
				method: "POST",
				credentials: "include",
			});
			let data = await data_req.json()
			if (data_req.status === 200) {
				add_friend_msg.innerHTML = data.msg;
				add_friend_msg.classList.remove("hidden");
				if (!add_friend_err.classList.contains("hidden"))
					add_friend_err.classList.add("hidden")
			} else {
				add_friend_err.innerHTML = data.error;
				add_friend_err.classList.remove("hidden");
				if (!add_friend_msg.classList.contains("hidden"))
					add_friend_msg.classList.add("hidden")
				list_friends()
				return
			}
			list_friends()
			new_friend.value = '';
		}

		try {
			const data_req = await fetch("http://localhost:3002/users/" + uuid + "/friends/count", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			if (data_req.status === 200) {
				let data = await data_req.json();
				n_friends.innerHTML = ":D friends count : " + data.n_friends;
				n_friends.classList.remove("hidden");

				list_friends()
			}
		} catch (error) {
			friends_error_message.innerHTML = "failed to fetch friends";
			friends_error_message.classList.remove("hidden");
		}
		document.getElementById("add-friends-button")?.addEventListener("click", add_friend);
		setInterval(list_friends, 30000);
	}
}
