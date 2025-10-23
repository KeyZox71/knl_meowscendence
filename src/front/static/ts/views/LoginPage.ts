import Aview from "./Aview.ts"
import { dragElement } from "./drag.ts"
import { setOnekoState } from "../oneko.ts"
import { isLogged, navigationManager } from "../main.ts"

export default class extends Aview {

	constructor()
	{
		super();
		this.setTitle("login");
		setOnekoState("default");
	}

	async getHTML() {
		return `
		<div id="window" class="absolute default-border">
			<div id="window-header" class="bg-linear-to-r from-orange-200 to-orange-300 flex flex-row min-w-75 justify-between px-2">
				<span class="font-[Kubasta]">login.ts</span>
				<div>
					<button> - </button>
					<button> □ </button>
					<a href="/" data-link> × </a>
				</div>
			</div>

		  <div class="bg-neutral-200 dark:bg-neutral-800 text-center pb-10 pt-5 px-10 reverse-border flex flex-col items-center">
				<form method="dialog" class="space-y-4">
				  <h1 class="text-gray-900 dark:text-white text-lg pt-0 pb-4">welcome back ! please login.</h1>
					<input type="text" id="username" placeholder="username" class="bg-white text-neutral-900 px-4 py-2 input-border" required></input>
					<input type="password" id="password" placeholder="password" class="bg-white text-neutral-900 px-4 py-2 input-border" required></input>
					<button id="login-button" type="submit" class="default-button w-full">login</button>
				</form>

				<p id="login-error-message" class="hidden text-red-700 dark:text-red-500"></p>

				<hr class="my-4 w-64 reverse-border">

				<div class="flex flex-col space-y-4 w-full">
				  <a target="_blank" href="http://localhost:3001/login/google" class="default-button inline-flex items-center justify-center w-full">
						<img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" height=20 width=20 class="mr-2 justify-self-start" />
						login with John Google
					</a>
					<a target="_blank" href="http://localhost:3001/login/google" class="default-button inline-flex items-center justify-center w-full">
					  <img src="https://rusty.42angouleme.fr/assets/favicon-bb06adc80c8495db.ico" height=20 width=20 class="mr-2 justify-self-start" />
						login with Rusty
					</a>
				</div>
			</div>

		</div>
		`;
	}

	async run() {
		dragElement(document.getElementById("window"));

		const totpVerify = async () => {
			const username = (document.getElementById("username") as HTMLInputElement).value;
			const password = (document.getElementById("password") as HTMLInputElement).value;
			const totpPin = (document.getElementById('totpPin') as HTMLInputElement).value;
			const idWindow = (document.getElementById('2fa-popup-content') as HTMLInputElement);
			try {
				const data_req = await fetch("http://localhost:3001/login", {
					method: "POST",
					headers: { "Content-Type": "application/json", },
					credentials: "include",
					body: JSON.stringify({ user: username, password: password, token: totpPin }),
				});
				if (data_req.status === 200) {
					isLogged();
					navigationManager("/");
				} else if (data_req.status === 401) {
					const data = await data_req.json();

					const error = document.createElement("p");
					error.innerHTML = data.error;
					error.classList.add("text-red-700", "dark:text-red-500");

					idWindow.appendChild(error);
				} else {
					console.log(data_req.status)
					console.log(await data_req.json())
					// throw new Error("invalid response");
				}
			} catch (error) {
				console.error(error);
			}
		}

		const login = async () => {
			const username = (document.getElementById("username") as HTMLInputElement).value;
			const password = (document.getElementById("password") as HTMLInputElement).value;

			try {
				const data_req = await fetch("http://localhost:3001/login", {
					method: "POST",
					headers: { "Content-Type": "application/json", },
					credentials: "include",
					body: JSON.stringify({ user: username, password: password }),
				});

				if (data_req.status === 200)
				{
					isLogged();
					navigationManager("/");
				}
				else if (data_req.status === 402) {
					const popup: HTMLDivElement = document.createElement("div");
					popup.id = "2fa-popup";
					popup.classList.add("z-10", "absolute", "default-border");
					const header = popup.appendChild(document.createElement("div"));;
					header.classList.add("bg-linear-to-r", "from-orange-200", "to-orange-300", "flex", "flex-row", "min-w-35", "justify-between", "px-2");
					header.id = "2fa-header";
					header.appendChild(document.createElement("span")).innerText = "2fa.ts";
					const btn = header.appendChild(document.createElement("button"));
					btn.innerText = " × ";
					btn.onclick = () => { document.getElementById("2fa-popup").remove();  };

					const popup_content: HTMLSpanElement = popup.appendChild(document.createElement("div"));
					popup_content.id = "2fa-popup-content";
					popup_content.classList.add("flex", "flex-col", "bg-neutral-200", "dark:bg-neutral-800", "p-6", "pt-4", "text-neutral-900", "dark:text-white", "space-y-4");

					const tokenInput = document.createElement("input");
					tokenInput.type = "tel";
					tokenInput.id = "totpPin";
					tokenInput.name = "totpPin";
					tokenInput.placeholder = "TOTP code";
					tokenInput.required = true;
					tokenInput.autocomplete = "off";
					tokenInput.pattern = "[0-9]*";
					tokenInput.setAttribute("inputmode", "numeric");
					tokenInput.classList.add("bg-white", "text-neutral-900","w-full", "px-4", "py-2", "input-border");

					const tokenSubmit = document.createElement("button");
					tokenSubmit.type = "submit";
					tokenSubmit.classList.add("default-button", "w-full");
					tokenSubmit.id = "totp-submit";
					tokenSubmit.innerHTML = "submit";

					const tokenTitle = document.createElement("h1");
					tokenTitle.innerHTML = `hey ${username}, please submit your 2fa code below :`;
					tokenTitle.classList.add("text-gray-900", "dark_text-white", "text-lg", "pt-0", "pb-4", "justify-center");

					const form = document.createElement("form");
					form.method = "dialog";
					form.classList.add("space-y-4");
					form.appendChild(tokenTitle);
					form.appendChild(tokenInput);
					form.appendChild(tokenSubmit);

					popup_content.appendChild(form);

					const uu = document.getElementById("username") as HTMLInputElement;
					const pass = document.getElementById("password") as HTMLInputElement;

					uu.disabled = true;
					pass.disabled = true;

					document.getElementById("app")?.appendChild(popup); 
					tokenInput.focus();
					dragElement(document.getElementById("2fa-popup")); 

					document.getElementById("totp-submit")?.addEventListener("click", totpVerify);
				}
				else if (data_req.status === 400)
				{
				  const data = await data_req.json();
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

		document.getElementById("login-button")?.addEventListener("click", login);
	}
}
