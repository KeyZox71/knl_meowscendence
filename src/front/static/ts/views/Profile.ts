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
					<div class="flex flex-row space-x-4 w-full min-w-175">
					  <ul id="profile-pong-scorelist" class="reverse-border bg-neutral-300 dark:bg-neutral-900 h-48 w-full overflow-scroll no-scrollbar">
						</ul>
				    <ul id="profile-tetris-scorelist" class="reverse-border bg-neutral-300 dark:bg-neutral-900 h-48 w-full overflow-scroll no-scrollbar">
						</ul>
					</div>
				</div>
			</div>
		</div>
		`;
	}

  async run() {
    if (!await isLogged())
      navigationManager("/");

    let pc: number = 0;
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

    let matchCount_req = await fetch(`http://localhost:3002/users/${uuid}/matchHistory/count?game=pong`, {
      method: "GET",
      credentials: "include",
    });
    let matchCount = await matchCount_req.json();
    pc += matchCount.n_matches;

    let matches_req = await fetch(`http://localhost:3002/users/${uuid}/matchHistory?game=pong&iStart=0&iEnd=${matchCount.n_matches}`, {
      method: "GET",
      credentials: "include",
    });
    let matches = await matches_req.json();

    let main = document.getElementById("profile-pong-scorelist");
    if (!main)
      return console.error("what");

    if (matches.matchHistory) {
      for (let match of matches.matchHistory) {
        const p2_req = await fetch(`http://localhost:3002/users/${match.score.p2}`, {
          method: "GET",
          credentials: "include",
        });
        match.score.p1 = userdata.displayName;
        match.score.p2 = (await p2_req.json()).displayName;
        const newEntry = document.createElement("li");
        newEntry.classList.add("m-1", "default-button", "bg-neutral-200", "dark:bg-neutral-800", "text-neutral-900", "dark:text-white");
        newEntry.innerHTML = match.score.p1Score > match.score.p2Score ? `${match.score.p1} - winner` : `${match.score.p2} - winner`;
        main.insertBefore(newEntry, main.firstChild);

        const popup: HTMLDivElement = document.createElement("div");
        const id: number = Math.floor(Math.random() * 100000000000);
        popup.id = `${id}`;
        popup.classList.add("z-10", "absolute", "default-border");
        const header = popup.appendChild(document.createElement("div"));
        header.classList.add("bg-linear-to-r", "from-orange-200", "to-orange-300", "flex", "flex-row", "min-w-35", "justify-between", "px-2");
        header.id = `${id}-header`;
        const title = header.appendChild(document.createElement("span"));
        title.classList.add("font-[Kubasta]");
        title.innerText = "score-pong.ts";
        const btn = header.appendChild(document.createElement("button"));
        btn.innerText = " × ";
        btn.onclick = () => { document.getElementById(`${id}`).remove();  };

        const popup_content: HTMLSpanElement = popup.appendChild(document.createElement("div"));
        popup_content.classList.add("flex", "flex-col", "bg-neutral-200", "dark:bg-neutral-800", "p-6", "pt-4", "text-neutral-900", "dark:text-white", "space-y-4");
        const date = new Date(match.score.date);
        popup_content.appendChild(document.createElement("span")).innerText = `${date.toDateString()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        const score = popup_content.appendChild(document.createElement("span"));
        score.classList.add();
        score.innerText = `${match.score.p1} : ${match.score.p1Score} - ${match.score.p2Score} : ${match.score.p2}`;
        const tx = popup_content.appendChild(document.createElement("a"));
        tx.href = `https://testnet.snowscan.xyz/tx/${match.tx}`;
        tx.innerText = "transaction proof";
        tx.target = "_blank";
        tx.classList.add("default-button", "items-center", "justify-center", "text-center");

        newEntry.onclick = () => { document.getElementById("app")?.appendChild(popup); dragElement(document.getElementById(`${id}`)); };
        console.log(match.tx);
      }
    }

    matchCount_req = await fetch(`http://localhost:3002/users/${uuid}/matchHistory/count?game=tetris`, {
      method: "GET",
      credentials: "include",
    });
    matchCount = await matchCount_req.json();
    pc += matchCount.n_matches;

    matches_req = await fetch(`http://localhost:3002/users/${uuid}/matchHistory?game=tetris&iStart=0&iEnd=${matchCount.n_matches}`, {
      method: "GET",
      credentials: "include",
    });
    matches = await matches_req.json();

    main = document.getElementById("profile-tetris-scorelist");
    if (!main)
      return console.error("what");

  // don't read this shit for you mental health
    if (matches.matchHistory) {
      for (let match of matches.matchHistory) {
        if (match.score.p2 != undefined)
        {
          const p2_req = await fetch(`http://localhost:3002/users/${match.score.p2}`, {
            method: "GET",
            credentials: "include",
          });
          match.score.p2 = (await p2_req.json()).displayName;
        }
        match.score.p1 = userdata.displayName;
        const newEntry = document.createElement("li");
        newEntry.classList.add("m-1", "default-button", "bg-neutral-200", "dark:bg-neutral-800", "text-neutral-900", "dark:text-white");
        newEntry.innerHTML = match.score.p2 != undefined ?
          (match.score.p1Score > match.score.p2Score ? `${match.score.p1} - winner` : `${match.score.p2} - winner`)
        :
          (`solo game - ${match.score.p1Score}`)
        ;
        main.insertBefore(newEntry, main.firstChild);

        const popup: HTMLDivElement = document.createElement("div");
        const id: number = Math.floor(Math.random() * 100000000000);
        popup.id = `${id}`;
        popup.classList.add("z-10", "absolute", "default-border");
        const header = popup.appendChild(document.createElement("div"));
        header.classList.add("bg-linear-to-r", "from-orange-200", "to-orange-300", "flex", "flex-row", "min-w-35", "justify-between", "px-2");
        header.id = `${id}-header`;
        const title = header.appendChild(document.createElement("span"));
        title.classList.add("font-[Kubasta]");
        title.innerText = "score-tetris.ts";
        const btn = header.appendChild(document.createElement("button"));
        btn.innerText = " × ";
        btn.onclick = () => { document.getElementById(`${id}`).remove();  };

        const popup_content: HTMLSpanElement = popup.appendChild(document.createElement("div"));
        popup_content.classList.add("flex", "flex-col", "bg-neutral-200", "dark:bg-neutral-800", "p-6", "pt-4", "text-neutral-900", "dark:text-white", "space-y-4");
        const date = new Date(match.score.date);
        popup_content.appendChild(document.createElement("span")).innerText = `${date.toDateString()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        const score = popup_content.appendChild(document.createElement("span"));
        score.classList.add();
        score.innerText = match.score.p2 != undefined ?
          (`${match.score.p1} : ${match.score.p1Score} - ${match.score.p2Score} : ${match.score.p2}`)
        :
          (`${match.score.p1} : ${match.score.p1Score}`)
        ;
        const tx = popup_content.appendChild(document.createElement("a"));
        tx.href = `https://testnet.snowscan.xyz/tx/${match.tx}`;
        tx.innerText = "transaction proof";
        tx.target = "_blank";
        tx.classList.add("default-button", "items-center", "justify-center", "text-center");

        newEntry.onclick = () => { document.getElementById("app")?.appendChild(popup); dragElement(document.getElementById(`${id}`)); };
        console.log(match.tx);
      }
    }

    const profile = document.getElementById("profile-profile");
    if (!profile) return;

    const picture = profile.appendChild(document.createElement("img"));
    const a = await fetch(`http://localhost:3002/users/${uuid}/avatar`, {
      method: "GET",
      credentials: "include",
    });
	picture.src = a.status === 200
		? `http://localhost:3002/users/${uuid}/avatar?t=${Date.now()}`
		: "https://api.kanel.ovh/pp";
    picture.classList.add("text-neutral-900", "dark:text-white", "center", "h-18", "w-18", "mx-3", "reverse-border");

    const nametag = profile.appendChild(document.createElement("div"));
    nametag.innerHTML = `
		  <div class="text-lg">Hi ${userdata.displayName} ! :D</div>
			<div class="italic">${uuid}<div>
		`;
    nametag.classList.add("text-neutral-900", "dark:text-white");

    const winrate = profile.appendChild(document.createElement("div"));
    winrate.innerHTML = `
		  <div> total playcount: ${pc} </div>
			<div> pong winrate: ${ (userdata.pong.wins == 0 && userdata.pong.losses == 0) ? "-" : Math.round(userdata.pong.wins / (userdata.pong.wins + userdata.pong.losses) * 100) + " %" } </div>
			<div> tetris winrate: ${ (userdata.tetris.wins == 0 && userdata.tetris.losses == 0) ? "-" : Math.round(userdata.tetris.wins / (userdata.tetris.wins + userdata.tetris.losses) * 100) + " %" } </div>
		`;
    winrate.classList.add("text-neutral-900", "dark:text-white", "grow", "content-center");
  }
}
