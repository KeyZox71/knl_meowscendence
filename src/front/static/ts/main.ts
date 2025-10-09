import { oneko } from "./oneko.ts";

export async function isLogged(): boolean {
	let uuid_req = await fetch("http://localhost:3001/me", {
		method: "GET",
		credentials: "include",
	});
	if (uuid_req.status === 200)
	{
		let uuid = await uuid_req.json();
		document.cookie = `uuid=${uuid.user};max-age=${60*60*24*7}`;

		const old_button = document.getElementById("profile-button");

		const dropdown = document.createElement("div");
		dropdown.classList.add("relative", "inline-block", "group");
		dropdown.id = "profile-button";
		const button_dropdown = dropdown.appendChild(document.createElement("button"));
		button_dropdown.innerHTML = uuid.user;
		button_dropdown.classList.add("text-neutral-900", "group-hover:text-neutral-700", "dark:text-white", "dark:group-hover:text-neutral-400");

		const menu_div = dropdown.appendChild(document.createElement("div"));
		menu_div.classList.add("float:right", "hidden", "absolute", "left-0", "bottom-full", "dark:bg-neutral-800", "dark:text-white", "min-w-[160px]", "shadow-lg", "z-10", "group-hover:block");

		const profile_a = menu_div.appendChild(document.createElement("a"));
		const settings_a = menu_div.appendChild(document.createElement("a"));
		const logout_button = menu_div.appendChild(document.createElement("button"));

		profile_a.text = "profile";
		profile_a.classList.add("block", "no-underline", "px-4", "py-3");
		profile_a.href = "/profile";
		profile_a.setAttribute("data-link", "");

		settings_a.text = "settings";
		settings_a.classList.add("block", "no-underline", "px-4", "py-3");
		settings_a.href = "/settings";
		settings_a.setAttribute("data-link", "");

		logout_button.innerHTML = "logout";
		logout_button.classList.add("block", "no-underline", "px-4", "py-3");
		logout_button.id = "logout-button";
		//document.getElementById("logout-button")?.addEventListener("click", async () => {
		logout_button.addEventListener("click", async () => {
			let req = await fetch("http://localhost:3001/logout", {
				method: "GET",
				credentials: "include",
			});
			if (req.status === 200)
				isLogged();
			else
				console.error("logout failed");
		});

		old_button.replaceWith(dropdown);
		return true;
	}
	else // 401
	{
		document.cookie = `uuid=;max-age=0`;
		const old_button = document.getElementById("profile-button");
		const login_button = document.createElement("a");
		login_button.id = "profile-button";
		login_button.text = "login";
		login_button.classList.add("text-neutral-900", "hover:text-neutral-700", "dark:text-white", "dark:hover:text-neutral-400");
		login_button.href = "/login";
		login_button.setAttribute("data-link", "");

		old_button.replaceWith(login_button);
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

	{ path: "/profile", view: () => import("./views/Profile.ts") },
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

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
	isLogged();

	document.body.addEventListener("click", e=> {
		if (e.target.matches("[data-link]"))
		{
			e.preventDefault();
			navigationManager(e.target.href);
		}
		if (e.target.closest("[data-icon]"))
			e.preventDefault();
	});

	document.body.addEventListener("dblclick", e=> {
		if (e.target.closest("[data-icon]"))
		{
			e.preventDefault();
			navigationManager(e.target.closest("[data-icon]").href);
		}
	});

	router();
});

oneko();
