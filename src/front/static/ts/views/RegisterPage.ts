import Aview from "./Aview.ts"
import { isLogged, navigationManager } from "../main.ts"

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
			<p id="login-error-message" class="hidden text-red-700 dark:text-red-500"></p>
			<button id="register-button" type="submit" class="bg-blue-600 text-white hover:bg-blue-500 w-full py-2 rounded-md transition-colors">register</button>

			<a class="text-gray-400 dark:text-gray-600 underline" href="/login" data-link>
				i already have an account
			</a>
		</div>
		`;
	}

	async run() {
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
