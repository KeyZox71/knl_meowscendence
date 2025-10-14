import Aview from "./Aview.ts"
import { isLogged, navigationManager } from "../main.ts"

export default class extends Aview {

	constructor()
	{
		super();
		this.setTitle("profile");
	}

	async getHTML() {
		return `
		<div id="main-window" class="default-border shadow-2x1 bg-neutral-200 dark:bg-neutral-800">
		  <div class="flex flex-row items-stretch">
				<div class="inline-block bg-linear-to-b from-orange-200 to-orange-300 min-h-84 w-6 relative">
				  <!--div class="absolute bottom-1 left-full whitespace-nowrap origin-bottom-left -rotate-90 font-bold">knl_meowscendence</div-->
				  <div class="absolute bottom-1 left-full whitespace-nowrap origin-bottom-left -rotate-90 font-bold">girls kissing :3</div>
				</div>

				<div class="flex flex-col items-center">
				  <div id="profile-items" class="flex flex-col items-center">
					</div>
				  <div id="menu-bottom-div" class="hidden mt-auto flex flex-col items-center">
						<hr class="my-2 w-32 reverse-border">
						<button id="menu-logout" class="menu-default-button">logout</button>
					</div>
				</div>
			</div>
		</div>
		`;
	}

	open: boolean = false;

	async run() {
	  let uuid: String;
    if (this.open)
    {
      this.open = false;
      document.getElementById("taskbar-menu").innerHTML = "";
      return ;
    }
    this.open = true;
    document.getElementById("taskbar-menu").innerHTML = await this.getHTML();

    async function getMainHTML() {
      if (!(await isLogged()))
      {
        document.getElementById("menu-bottom-div").classList.add("hidden");
        return `
     			<a class="menu-default-button inline-flex items-center justify-center" href="/login" data-link>login</a>
     			<a class="menu-default-button inline-flex items-center justify-center" href="/register" data-link>register</a>
          `;
      }
      document.getElementById("menu-bottom-div").classList.remove("hidden");

      uuid = document.cookie.match(new RegExp('(^| )' + "uuid" + '=([^;]+)'))[2];
      return `
        <span class="menu-default-label inline-flex items-center justify-center">hi, ${uuid} !</span>
				<hr class="my-2 w-32 reverse-border">
				<button class="menu-default-button">profile</button>
				<button class="menu-default-button">settings</button>
      `;
    }


    document.getElementById("profile-items").innerHTML = await getMainHTML();

		/*const userdata_req = await fetch(`http://localhost:3002/users/${uuid}`, {
			method: "GET",
			credentials: "include",
		});
		if (userdata_req.status == 404)
		{
			console.error("invalid user");
			return ;
		}
		let userdata = await userdata_req.json();

		console.log(userdata_req);*/

		/*const main = document.getElementById("profile-profile");
		const nametag = main.appendChild(document.createElement("span"));

		nametag.innerHTML = `Hiiiiii ${userdata.displayName} ! :D`;
		nametag.classList.add("text-neutral-900", "dark:text-white");

		const winrate = main.appendChild(document.createElement("div"));

		winrate.innerHTML = `wins: ${userdata.wins} | losses: ${userdata.losses} | winrate: ${userdata.wins / (userdata.wins + userdata.losses)}`;
		winrate.classList.add("text-neutral-900", "dark:text-white");*/
    //console.log(document.getElementById("menu-logout"));
    document.getElementById("menu-logout").addEventListener("click", async () => {
      let req = await fetch("http://localhost:3001/logout", {
        method: "GET",
        credentials: "include",
      });
      if (req.status === 200)
        this.run();
      else
        console.error("logout failed");
    });
	}
}
