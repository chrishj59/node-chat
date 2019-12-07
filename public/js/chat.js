const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $imageForm = document.querySelector("#image-form");
const $imageInput = document.querySelector("#fileUploadInput");
const $imageModal = document.querySelector("#fileUploadModalCenter");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
//const messageTemplate = document.querySelector("#message-template").innerHTML;
const messageTemplateLeft = document.querySelector("#message-template__left")
	.innerHTML;
const messageTemplateRight = document.querySelector("#message-template__right")
	.innerHTML;
const locationMessageTemplate = document.querySelector(
	"#location-message-template"
).innerHTML;
const locationMessageTemplateLeft = document.querySelector(
	"#location-message-template-left"
).innerHTML;
const locationMessageTemplateRight = document.querySelector(
	"#location-message-template-right"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
const roomHeaderTemplate = document.querySelector("#room__header-template")
	.innerHTML;
const imageMessageTemplateLeft = document.querySelector(
	"#image-message-template-left"
).innerHTML;
const imageMessageTemplateRight = document.querySelector(
	"#image-message-template-right"
).innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
});

// Variable
let ownUserName = "";

const autoscroll = () => {
	// New message element
	const $newMessage = $messages.lastElementChild;

	// Height of the new message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	// Visible height
	const visibleHeight = $messages.offsetHeight;

	// Height of messages container
	const containerHeight = $messages.scrollHeight;

	// How far have I scrolled?
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

socket.on("imageMessage", message => {
	console.log("client receive images");
	console.log(message.contents.length);
	if (message.username === ownUserName) {
		const html = Mustache.render(imageMessageTemplateRight, {
			username: message.username,
			createdAt: moment(message.createdAt).format("h:mm a"),
			content: message.contents
		});
		$messages.insertAdjacentHTML("beforeend", html);
	} else {
		const html = Mustache.render(imageMessageTemplateLeft, {
			username: message.username,
			createdAt: moment(message.createdAt).format("h:mm a"),
			content: message.contents
		});
		$messages.insertAdjacentHTML("beforeend", html);
	}
});
socket.on("message", message => {
	console.log(message);
	console.log(ownUserName);

	if (message.username === ownUserName) {
		const html = Mustache.render(messageTemplateRight, {
			username: message.username,
			message: message.text,
			createdAt: moment(message.createdAt).format("h:mm a")
		});
		$messages.insertAdjacentHTML("beforeend", html);
	} else {
		const html = Mustache.render(messageTemplateLeft, {
			username: message.username,
			message: message.text,
			createdAt: moment(message.createdAt).format("h:mm a")
		});
		$messages.insertAdjacentHTML("beforeend", html);
	}
	autoscroll();
});

socket.on("locationMessage", message => {
	console.log(message);

	if (message.username === ownUserName) {
		const html = Mustache.render(locationMessageTemplateRight, {
			username: message.username,
			url: message.url,
			createdAt: moment(message.createdAt).format("h:mm a")
		});
		$messages.insertAdjacentHTML("beforeend", html);
	} else {
		const html = Mustache.render(locationMessageTemplateLeft, {
			username: message.username,
			url: message.url,
			createdAt: moment(message.createdAt).format("h:mm a")
		});
		$messages.insertAdjacentHTML("beforeend", html);
	}
	// const html = Mustache.render(locationMessageTemplate, {
	// 	username: message.username,
	// 	url: message.url,
	// 	createdAt: moment(message.createdAt).format("h:mm a")
	// });
	// $messages.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

socket.on("roomData", ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	});
	document.querySelector("#sidebar").innerHTML = html;

	const htmlHdr = Mustache.render(roomHeaderTemplate, { room });
	document.querySelector("#roomHeader").innerHTML = htmlHdr;
});

// for uploading an image
$imageForm.addEventListener("submit", e => {
	e.preventDefault();
	const selectedFile = e.target.elements.fileUploadInput.files[0];
	console.log(selectedFile);
	let dataURL = "";
	const reader = new FileReader();
	reader.onload = function() {
		dataURL = reader.result;
		console.log("onLoad completed");
		console.log(selectedFile.name);
		console.log(selectedFile.type);
		const { name, type } = selectedFile;
		//console.log(dataURL);
		socket.emit(
			"sendImage",
			{ name: name, type: type, payload: dataURL },
			error => {
				console.log("in send image");
				if (error) {
					console.log(error);
				}
			}
		);
	};
	reader.readAsDataURL(selectedFile);
	/*console.log(dataURL);
	socket.emit("sendImage", "selectedFile", error => {
		console.log("in send image");
		if (error) {
			console.log(error);
		}
	});*/
});

$messageForm.addEventListener("submit", e => {
	e.preventDefault();

	$messageFormButton.setAttribute("disabled", "disabled");

	const message = e.target.elements.message.value;

	socket.emit("sendMessage", message, error => {
		$messageFormButton.removeAttribute("disabled");
		$messageFormInput.value = "";
		$messageFormInput.focus();

		if (error) {
			return console.log(error);
		}

		console.log("Message delivered!");
	});
});

$sendLocationButton.addEventListener("click", () => {
	if (!navigator.geolocation) {
		return alert("Geolocation is not supported by your browser.");
	}

	$sendLocationButton.setAttribute("disabled", "disabled");

	navigator.geolocation.getCurrentPosition(position => {
		socket.emit(
			"sendLocation",
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			},
			() => {
				$sendLocationButton.removeAttribute("disabled");
				console.log("Location shared!");
			}
		);
	});
});

socket.emit("join", { username, room }, error => {
	if (error) {
		alert(error);
		location.href = "/";
	}
	ownUserName = username.toLowerCase();
});
