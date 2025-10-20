import Aview from "./Aview.ts"
import { setOnekoState } from "../oneko.ts"
import { dragElement } from "./drag.ts";
import { isLogged, navigationManager } from "../main.ts"

export default class extends Aview {

	open: Boolean = false;

	constructor() {
		super();
		this.setTitle("friends list");
		setOnekoState("default");
	}

	async getHTML() {
		return `
		<div class="relative b-0 default-border bg-neutral-200">
			<div class="bg-linear-to-r from-orange-200 to-orange-300 flex flex-row min-w-40 justify-between px-2">
				<span class="font-[Kubasta]">friends.ts</span>
			</div>

			<div class="bg-neutral-200 pb-5 dark:bg-neutral-800 justify-center text-center reverse-border">
			  <form method="dialog" class="justify-center bg-neutral-200 dark:bg-neutral-800 space-y-4 space-x-2 px-4 pt-4">
				<input type="text" id="new-friend" placeholder="new friend" class="bg-white text-neutral-900 input-border" required></input>
				<button id="add-friends-button" type="submit" class="default-button text-center mx-0 my-0">add friend</button>
				<p id="add-friend-err" class="hidden text-red-700 dark:text-red-500"></p>
				<p id="add-friend-msg" class="hidden text-gray-900 dark:text-white text-lg"></p>
			  </form>
			  <p id="friends-error-message" class="hidden text-red-700 dark:text-red-500"></p>
			  <p id="friend-msg" class="hidden text-gray-900 dark:text-white text-lg"></p>
			  <div class="flex flex-row space-x-4 w-full min-w-60 px-4 py-2">
				<ul id="friends_list" class="bg-neutral-300 dark:bg-neutral-900 reverse-border space-y-2 hidden text-gray-900 dark:text-white overflow-scroll h-48 w-full">
				</ul>
		      </div>
			</div>
		</div>
		`;
	}

	async run() {
		if (!await isLogged())
			navigationManager("/");

		if (this.open === true) {
			document.getElementById("friends-menu").innerHTML = await this.getHTML();
		} else {
			document.getElementById("friends-menu").innerHTML = "";
			return;
		}

		let uuid: String;
		uuid = document.cookie.match(new RegExp('(^| )' + "uuid" + '=([^;]+)'))[2];
		const friends_error_message = (document.getElementById("friends-error-message") as HTMLParagraphElement);
		const friends_list = (document.getElementById("friends_list") as HTMLUListElement);
		const new_friend = (document.getElementById("new-friend") as HTMLInputElement);
		const add_friend_err = (document.getElementById("add-friend-err") as HTMLParagraphElement);
		const add_friend_msg = (document.getElementById("add-friend-msg") as HTMLParagraphElement);

		async function removeFriend(name: String) {
			const data_req = await fetch("http://localhost:3002/users/" + uuid + "/friends/" + name, {
				method: "DELETE",
				credentials: "include",
			});
			if (data_req.status === 200) {
				console.log("friends removed successfully");
			} else {
				console.log("could not remove friend");
			}
			list_friends();
			list_friends();
			list_friends();
			list_friends();
			list_friends();
			list_friends();
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
			while (friends_list.firstChild) {
				friends_list.removeChild(friends_list.firstChild);
			}

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
						but.classList.add("px-0", "py-0", "taskbar-button");
						but.onclick = function() {
							removeFriend(list[i].friendName);
						};

						new_friends.appendChild(activitySpan);
						new_friends.appendChild(span);
						new_friends.appendChild(but);
						friends_list.appendChild(new_friends);
					}
				} else {
					friends_error_message.innerHTML = (await list_req.json()).error;
					friends_error_message.classList.remove("hidden");
				}
			} else {
				friends_list.classList.add("hidden")
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
				// let data = await data_req.json();
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
