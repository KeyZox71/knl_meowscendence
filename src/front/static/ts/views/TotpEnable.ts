import { navigationManager } from "../main.ts";
import { dragElement } from "./drag.ts";

async function totpVerify() {
	const code = (document.getElementById("totpPin") as HTMLInputElement).value;
	const data_req = await fetch('http://localhost:3001/2fa/verify', {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			token: code
		})
	})

	if (data_req.status === 200) {
		navigationManager("/settings");
	} else if (data_req.status === 401 || data_req.status === 400) {
		const popup_content = document.getElementById("2fa-enable-content");

		if (!document.getElementById("error-totp")) {
			const error = document.createElement("p");
			error.id = "error-totp";
			error.classList.add("text-red-700", "dark:text-red-500");
			error.innerHTML = (await data_req.json()).error;

			popup_content?.appendChild(error)
		} else {
			const error = document.getElementById("error-totp") as HTMLParagraphElement;
			error.innerHTML = (await data_req.json()).error;
		}
	} else {
		console.log("Unexpected error")
	}
}

export async function totpEnablePopup(username: String, secret: String, url: String) {
	const popup: HTMLDivElement = document.createElement("div");
	popup.id = "2fa-enable-popup";
	popup.classList.add("z-10", "absolute", "default-border");
	const header = popup.appendChild(document.createElement("div"));;
	header.classList.add("bg-linear-to-r", "from-orange-200", "to-orange-300", "flex", "flex-row", "min-w-35", "justify-between", "px-2");
	header.id = "2fa-enable-popup-header";
	header.appendChild(document.createElement("span")).innerText = "2fa_enable.ts";
	const btn = header.appendChild(document.createElement("button"));
	btn.innerText = " × ";
	btn.onclick = () => { document.getElementById("2fa-enable-popup")?.remove(); };

	const popup_content: HTMLSpanElement = popup.appendChild(document.createElement("div"));
	popup_content.id = "2fa-enable-content";
	popup_content.classList.add("flex", "flex-col", "bg-neutral-200", "dark:bg-neutral-800", "p-6", "pt-4", "text-neutral-900", "dark:text-white", "space-y-4");

	const qrDivTOTP = document.createElement("div");
	qrDivTOTP.classList.add("flex", "justify-center");

	const qrCodeTOTP = document.createElement("img");
	qrCodeTOTP.id = "qrCodeTOTP";
	qrCodeTOTP.src = `https://api.qrserver.com/v1/create-qr-code/?margin=10&size=512x512&data=${url}`;
	qrCodeTOTP.classList.add("w-60");
	qrDivTOTP.appendChild(qrCodeTOTP);

	const secretText = document.createElement("p");
	secretText.innerHTML = `key: <div class="select-all">${secret}</div>`;
	secretText.classList.add("text-center")

	const tokenInput = document.createElement("input");
	tokenInput.type = "tel";
	tokenInput.id = "totpPin";
	tokenInput.name = "totpPin";
	tokenInput.placeholder = "TOTP code";
	tokenInput.required = true;
	tokenInput.autocomplete = "off";
	tokenInput.pattern = "[0-9]*";
	tokenInput.setAttribute("inputmode", "numeric");
	tokenInput.classList.add("bg-white", "text-neutral-900", "w-full", "px-4", "py-2", "input-border");

	const tokenSubmit = document.createElement("button");
	tokenSubmit.type = "submit";
	tokenSubmit.classList.add("default-button", "w-full");
	tokenSubmit.id = "totp-submit";
	tokenSubmit.innerHTML = "submit";

	const hr = document.createElement("hr");
	hr.classList.add("my-2", "w-full", "reverse-border");

	const t = document.createElement("h2");
	t.innerHTML = "hey " + username +
		` you are trying to add 2fa</br>
		just add the following to your app and enter the code bellow ↓
	`;
	t.classList.add("text-center")

	document.getElementById("app")?.appendChild(popup);

	const form = document.createElement("form");
	form.method = "dialog";
	form.classList.add("space-y-4");
	form.appendChild(tokenInput);
	form.appendChild(tokenSubmit);

	popup_content.appendChild(t)
	popup_content.appendChild(qrDivTOTP);
	popup_content.appendChild(secretText);
	popup_content.appendChild(hr)
	popup_content.appendChild(form);
	dragElement(document.getElementById("2fa-enable-popup"));

	document.getElementById("totp-submit")?.addEventListener("click", totpVerify)
}
