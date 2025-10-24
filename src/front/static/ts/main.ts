import { oneko } from "./oneko.ts";
import ProfileMenu from "./views/ProfileMenu.ts";
import FriendsMenu from "./views/Friends.ts";
let profile_view = new ProfileMenu;
let friends_view = new FriendsMenu;

export const user_api = import.meta.env.VITE_USER_API as String;
export const auth_api = import.meta.env.VITE_AUTH_API as String;

export async function isLogged(): Promise<boolean> {
	let uuid_req = await fetch(auth_api + "/me", {
		method: "GET",
		credentials: "include",
	});
	if (uuid_req.status === 200) {
		let uuid = await uuid_req.json();
		document.cookie = `uuid=${uuid.user};max-age=${60 * 60 * 24 * 7}`;
		if (!document.getElementById("friends-btn"))
		{
      const btn: HTMLButtonElement = document.createElement("button") as HTMLButtonElement;
      btn.id = "friends-btn";
      btn?.classList.add("taskbar-button");
      btn.innerText = "friends";
      document.getElementById("taskbar-trail")?.prepend(btn);
		}
		return true;
	}
	else // 401
	{
		document.cookie = `uuid=;max-age=0`;
    const btn = document.getElementById("friends-btn") as HTMLButtonElement;
    if (btn) btn.remove();
		return false;
	}
}

export const navigationManager = url => {
	history.pushState(null, null, url);
	router();
};

let view;

const routes = [
	{ path: "/", view: () => import("./views/MainMenu.ts") },

	{ path: "/pong", view: () => import("./views/PongMenu.ts") },
	{ path: "/pong/local", view: () => import("./views/Pong.ts") },
	{ path: "/pong/tournament", view: () => import("./views/TournamentMenu.ts") },

	{ path: "/tetris", view: () => import("./views/TetrisMenu.ts") },
	{ path: "/tetris/solo", view: () => import("./views/Tetris.ts") },
	{ path: "/tetris/versus", view: () => import("./views/TetrisVersus.ts") },

	{ path: "/login", view: () => import("./views/LoginPage.ts") },
	{ path: "/register", view: () => import("./views/RegisterPage.ts") },

	{ path: "/profile", view: () => import("./views/Profile.ts") },
	{ path: "/settings", view: () => import("./views/Settings.ts") },
];

const router = async () => {

	const routesMap = routes.map(route => {
		return { route: route, isMatch: location.pathname === route.path };
	});

	let match = routesMap.find(routeMap => routeMap.isMatch);

	if (!match)
		match = { route: routes[0], isMatch: true };

	if (view)
		view.running = false;

	//console.log(match);

	const module = await match.route.view();
	view = new module.default();

	document.querySelector("#app").innerHTML = await view.getHTML();
	view.run();
};

document.getElementById("profile-button")?.addEventListener("click", () => { profile_view.run(); });
window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
	isLogged();

	document.body.addEventListener("click", e => {
		if (!e.target.closest("#taskbar-menu") && !e.target.matches("#profile-button")) {
			profile_view.open = false;
			document.getElementById("taskbar-menu").innerHTML = "";
		}
		if (e.target.matches("#friends-btn")) {
			friends_view.open = !friends_view.open;
			friends_view.run();
		}
		if (e.target.matches("[data-link]")) {
			e.preventDefault();
			navigationManager(e.target.href);
		}
		if (e.target.closest("[data-icon]"))
			e.preventDefault();
	});

	document.body.addEventListener("dblclick", e => {
		if (e.target.closest("[data-icon]")) {
			e.preventDefault();
			navigationManager(e.target.closest("[data-icon]").href);
		}
	});

	router();
});

function updateClock()
{
	const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
	const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
	const clock = document.getElementById("taskbar-clock");
	const now = new Date();
	let hours = now.getHours();
	let minutes = now.getMinutes();

	hours = hours < 10 ? "0" + hours : hours;
	minutes = minutes < 10 ? "0" + minutes : minutes;

	clock.innerHTML = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ` + hours + ":" + minutes;
}

async function pingClock() {
	if (await isLogged()) {
		fetch(user_api + "/ping", {
			method: "POST",
		credentials: "include"
		});
	}
}

setInterval(updateClock, 5000);
updateClock();

setInterval(pingClock, 30000);

oneko();

async function startMenuPP() {
	const profileButton = document.getElementById("start-img") as HTMLImageElement;
	try {
		if(document.cookie.match(new RegExp('(^| )' + "token" + '=([^;]+)'))) {
			throw "not today, thank you";
		}
		let uuid: String;
		uuid = document.cookie.match(new RegExp('(^| )' + "uuid" + '=([^;]+)'))[2];


		const a = await fetch(`http://localhost:3002/users/${uuid}/avatar`, {
			method: "GET",
			credentials: "include"
		});

		profileButton.src = a.status === 200
			? `http://localhost:3002/users/${uuid}/avatar?t=${Date.now()}`
			: "https://api.kanel.ovh/pp";
	} catch (err){
		// console.log("not yet logged, going default for start icon...");
		profileButton.src = "https://api.kanel.ovh/id?id=65";
	}
}

setInterval(startMenuPP, 3000);
startMenuPP();
