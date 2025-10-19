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
				<span class="font-[Kubasta]">settings.ts</span>
				<div>
					<button> - </button>
					<button> □ </button>
					<a href="/" data-link> × </a>
				</div>
			</div>
			<div class="bg-neutral-200 dark:bg-neutral-800 text-center pb-10 pt-5 px-10 space-y-4 reverse-border">
			  <input type="text" id="displayName-input" class="bg-white text-neutral-900 px-4 py-2 input-border" required></input>
				<button id="displayName-button" type="submit" class="default-button w-full">change display name</button>
				<button id="deleteAccount-button" type="submit" class="default-button w-full">delete your account</button>
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

    (document.getElementById("displayName-input") as HTMLInputElement).placeholder = userdata.displayName;
    (document.getElementById("displayName-input") as HTMLInputElement).value = userdata.displayName;

    document.getElementById("displayName-button")?.addEventListener("click", async () => {
      const changeDisplayName_req = await fetch(`http://localhost:3002/users/${uuid}/displayName`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", },
        credentials: "include",
        body: JSON.stringify({ displayName: (document.getElementById("displayName-input") as HTMLInputElement).value })
      });
      if (changeDisplayName_req.status == 200) {
        // idk display success
      }
      else {
        // display error ig, uuuh it's in await changeDisplayName.json().error
      }
    });

    document.getElementById("deleteAccount-button")?.addEventListener("click", async () => {
      const delete_req = await fetch(`http://localhost:3002/users/${uuid}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (delete_req.status == 200)
        navigationManager("/");
      else
        console.error("xd"); // should never happen, wtf
    });
  }
}
