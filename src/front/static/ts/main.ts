export async function isLogged(): boolean {
	let uuid_req = await fetch("http://localhost:3001/me", {
		method: "GET",
		credentials: "include",
	});
	if (uuid_req.status == 200)
	{
		let uuid = await uuid_req.json();
		document.cookie = `uuid=${uuid.user};max-age=${60*60*24*7}`;

		const old_button = document.getElementById("profile-button");
		const logged_dropdown = document.createElement("button");
		logged_dropdown.innerHTML = "logged in, more like locked in ahah i'm gonna kill myself the 12th of October";
		logged_dropdown.classList.add("text-neutral-900", "hover:text-neutral-700", "dark:text-white", "dark:hover:text-neutral-400");
		logged_dropdown.id = "profile-button";

		// add the dropdown button and the dropdown logic

		old_button.replaceWith(logged_dropdown);
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

	{ path: "/login", view: () => import("./views/LoginPage.ts") },
	{ path: "/register", view: () => import("./views/RegisterPage.ts") },

	{ path: "/tetris", view: () => import("./views/Tetris.ts") },
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
	});

	router();
});
