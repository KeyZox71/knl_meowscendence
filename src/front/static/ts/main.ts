import { oneko } from "./oneko.ts";
import ProfileMenu from "./views/ProfileMenu.ts";
let profile_view = new ProfileMenu;

export async function isLogged(): Promise<boolean> {
	let uuid_req = await fetch("http://localhost:3001/me", {
		method: "GET",
		credentials: "include",
	});
	if (uuid_req.status === 200) {
		let uuid = await uuid_req.json();
		document.cookie = `uuid=${uuid.user};max-age=${60 * 60 * 24 * 7}`;
		return true;
	}
	else // 401
	{
		document.cookie = `uuid=;max-age=0`;
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
	{ path: "/pong/local", view: () => import("./views/Game.ts") },
	{ path: "/pong/tournament", view: () => import("./views/TournamentMenu.ts") },

	{ path: "/tetris", view: () => import("./views/TetrisMenu.ts") },
	{ path: "/tetris/solo", view: () => import("./views/Tetris.ts") },
	{ path: "/tetris/versus", view: () => import("./views/Tetris.ts") },

	{ path: "/login", view: () => import("./views/LoginPage.ts") },
	{ path: "/register", view: () => import("./views/RegisterPage.ts") },

	{ path: "/friends", view: () => import("./views/Friends.ts") },
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

oneko();

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

setInterval(updateClock, 5000);
updateClock();

oneko();
