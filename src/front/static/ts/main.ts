/*import MainMenu from "./views/MainMenu.ts";
import PongMenu from "./views/PongMenu.ts";

import LoginPage from "./views/LoginPage.ts";
import RegisterPage from "./views/RegisterPage.ts";

import Game from "./views/Game.ts";*/

const navigationManager = url => {
	history.pushState(null, null, url);
	router();
};

let view;

const routes = [
	/*{ path: "/", view: MainMenu },

	{ path: "/pong", view: PongMenu },
	{ path: "/pong/solo", view: Game },

	{ path: "/login", view: LoginPage },
	{ path: "/register", view: RegisterPage },*/
	{ path: "/", view: () => import("./views/MainMenu.ts") },

	{ path: "/pong", view: () => import("./views/PongMenu.ts") },
	{ path: "/pong/solo", view: () => import("./views/Game.ts") },

	{ path: "/login", view: () => import("./views/LoginPage.ts") },
	{ path: "/register", view: () => import("./views/RegisterPage.ts") },
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
	
	console.log(match);

	const module = await match.route.view();
	view = new module.default();

	document.querySelector("#app").innerHTML = await view.getHTML();
	view.run();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {

	document.body.addEventListener("click", e=> {
		if (e.target.matches("[data-link]"))
		{
			e.preventDefault();
			navigationManager(e.target.href);
		}
	});

	router();
});
