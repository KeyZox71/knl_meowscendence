import Aview from "./Aview.ts"
import { dragElement } from "./drag.ts";
import { setOnekoState } from "../oneko.ts"
import { isLogged, navigationManager } from "../main.ts"

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

			<div class="bg-neutral-200 dark:bg-neutral-800 text-center pb-10 pt-5 px-10 reverse-border flex flex-col items-center">
		    <form method="dialog" class="space-y-4">
				  <h1 class="text-gray-900 dark:text-white text-lg pt-0 pb-4">welcome ! please register.</h1>
			    <div class="flex flex-row justify-between space-x-4">
							<input type="text" id="username" placeholder="username" class="bg-white text-neutral-900 px-4 py-2 input-border" required></input>
							<input type="password" id="password" placeholder="password" class="bg-white text-neutral-900 px-4 py-2 input-border" required></input>
					</div>
					<button id="register-button" type="submit" class="default-button w-full">register</button>
				</form>

				<p id="login-error-message" class="hidden text-red-700 dark:text-red-500 pt-4"></p>

				<hr class="my-4 w-64 reverse-border">

			  <div class="flex flex-col space-y-4 w-full">
			    <a target="_blank" href="http://localhost:3001/register/google" class="default-button inline-flex items-center justify-center w-full">
					  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" height=20 width=20 class="mr-2 justify-self-start" />
					  register with John Google
					</a>
				  <a target="_blank" href="https://rusty.42angouleme.fr/issues/all" class="default-button inline-flex items-center justify-center w-full">
		        <img src="https://rusty.42angouleme.fr/assets/favicon-bb06adc80c8495db.ico" height=20 width=20 class="mr-2 justify-self-start" />
						register with Rusty
					</a>
				</div>
			</div>

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
