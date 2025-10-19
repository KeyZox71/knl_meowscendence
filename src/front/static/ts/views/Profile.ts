import Aview from "./Aview.ts"
import { dragElement } from "./drag.ts";
import { setOnekoState } from "../oneko.ts"
import { isLogged, navigationManager } from "../main.ts"


export default class extends Aview {

	constructor()
	{
		super();
		this.setTitle("profile");
		setOnekoState("default");
	}

	async getHTML() {
		return `
		<div id="window" class="absolute default-border">
			<div id="window-header" class="bg-linear-to-r from-orange-200 to-orange-300 flex flex-row min-w-75 justify-between px-2">
				<span class="font-[Kubasta]">profile.ts</span>
				<div>
					<button> - </button>
					<button> □ </button>
					<a href="/" data-link> × </a>
				</div>
			</div>
			<div class="bg-neutral-200 dark:bg-neutral-800 text-center pb-10 pt-5 px-10 space-y-4 reverse-border">
				<div class="flex flex-col space-y-4 w-full">
				  <div id="profile-profile" class="default-border h-24 flex flex-row place-content-stretch content-center items-center space-x-6 pr-4">
					</div>
					<div class="flex flex-row space-x-4 w-full min-w-145">
					  <ul id="profile-scorelist" class="reverse-border bg-neutral-300 dark:bg-neutral-900 h-48 w-full overflow-scroll no-scrollbar">
						</ul>
				    <div id="graph-ig-idk-im-scared" class="reverse-border bg-neutral-300 dark:bg-neutral-900 h-48 w-full">
						</div>
					</div>
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

    const userdata_req = await fetch(`http://localhost:3002/users/${uuid}`, {
      method: "GET",
      credentials: "include",
    });
    if (userdata_req.status == 404) {
      console.error("invalid user");
      return;
    }
    let userdata = await userdata_req.json();

    const matchCount_req = await fetch(`http://localhost:3002/users/${uuid}/matchHistory/count`, {
      method: "GET",
      credentials: "include",
    });
    const matchCount = await matchCount_req.json();

    const matches_req = await fetch(`http://localhost:3002/users/${uuid}/matchHistory?iStart=0&iEnd=${matchCount.n_matches}`, {
      method: "GET",
      credentials: "include",
    });
    const matches = await matches_req.json();

    const main = document.getElementById("profile-scorelist");
    if (!main)
      return console.error("what");

    if (matches.matchHistory) {
      for (let match of matches.matchHistory) {
        const newEntry = document.createElement("li");
        newEntry.classList.add("m-2", "default-button", "bg-neutral-200", "dark:bg-neutral-800", "text-neutral-900", "dark:text-white");
        newEntry.innerHTML = match.score.p1Score > match.score.p2Score ? `${match.score.p1} - winner` : `${match.score.p2} - winner`;
        main.insertBefore(newEntry, main.firstChild);
        // ###########################################################################################################################################
        //
        // ADD TX LINK : https://testnet.snowscan.xyz/tx/${match.tx}
        //
        // ###########################################################################################################################################
        console.log(match.tx);
      }
    }

    const profile = document.getElementById("profile-profile");
    if (!profile) return;

    const picture = profile.appendChild(document.createElement("img"));
    picture.src = "https://api.kanel.ovh/pp";
    picture.classList.add("text-neutral-900", "dark:text-white", "center", "h-18", "w-18", "mx-3");

    const nametag = profile.appendChild(document.createElement("div"));
    nametag.innerHTML = `
		  <div class="text-lg">Hi ${userdata.displayName} ! :D</div>
			<div class="italic">${uuid}<div>
		`;
    nametag.classList.add("text-neutral-900", "dark:text-white");

    const winrate = profile.appendChild(document.createElement("div"));
    winrate.innerHTML = `
		  <div> wins: ${userdata.wins} </div>
			<div> losses: ${userdata.losses} </div>
			<div> winrate: ${ (userdata.wins != 0 && userdata.losses != 0) ? Math.round(userdata.wins / (userdata.wins + userdata.losses) * 100) + " %" : "-" }</div>
		`;
    winrate.classList.add("text-neutral-900", "dark:text-white", "grow", "content-center");
  }
}
