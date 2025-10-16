import Aview from "./Aview.ts"
import { setOnekoState } from "../oneko.ts"
import { isLogged, navigationManager } from "../main.ts"
import { dragElement } from "./drag.ts";

export default class extends Aview {

	constructor()
	{
		super();
		this.setTitle("register");
		setOnekoState("default");
	}

	async getHTML() {
		return `
		<div id="window" class="absolute default-border">
					<div id="window-header" class="bg-linear-to-r from-orange-200 to-orange-300 flex flex-row min-w-75 justify-between px-2">
						<span class="font-[Kubasta]">register.ts</span>
						<div>
							<button> - </button>
							<button> □ </button>
							<a href="/" data-link> × </a>
						</div>
					</div>

		<form method="dialog" class="bg-neutral-200 dark:bg-neutral-800 text-center pb-10 pt-5 px-10 space-y-4 reverse-border">
			  <p class="text-gray-900 dark:text-white text-lg pt-0 pb-4">welcome ! please register.</p>
			  <input type="text" id="username" placeholder="username" class="bg-white text-neutral-900 px-4 py-2 input-border" required></input>
			  <input type="password" id="password" placeholder="password" class="bg-white text-neutral-900 px-4 py-2 input-border" required></input>
			  <p id="login-error-message" class="hidden text-red-700 dark:text-red-500"></p>
			  </br>
				<button id="register-button" type="submit" class="default-button w-full">register</button>
			</form>
		</div>
		`;
	}

	async run() {
    dragElement(document.getElementById("window"));
		const login = async () => {
			const username = (document.getElementById("username") as HTMLInputElement).value;
			const password = (document.getElementById("password") as HTMLInputElement).value;

			try {
				const data_req = await fetch("http://localhost:3001/register", {
					method: "POST",
					headers: { "Content-Type": "application/json", },
					credentials: "include",
					body: JSON.stringify({ user: username, password: password }),
				});
				const data = await data_req.json();

				if (data_req.status === 200)
				{
					let uuid_req = await fetch("http://localhost:3001/me", {
						method: "GET",
						credentials: "include",
					});
					let uuid = await uuid_req.json();
					document.cookie = `uuid=${uuid.user};max-ages=${60*60*24*7}`;
					console.log(document.cookie);
					isLogged();
					navigationManager("/");
				}
				else if (data_req.status === 400)
				{
					document.getElementById("login-error-message").innerHTML = "error: " + data.error;
					document.getElementById("login-error-message").classList.remove("hidden");
				}
				else
				{
					throw new Error("invalid response");
				}

			}
			catch (error)
			{
				console.error(error);
				document.getElementById("login-error-message").innerHTML = "error: server error, try again later...";
				document.getElementById("login-error-message").classList.remove("hidden");
			}
		};

		document.getElementById("register-button")?.addEventListener("click", login);
	}
}
