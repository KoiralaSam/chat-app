const socket = io();
//elements
const $messageForm = document.querySelector("#message-form");
const $messageInput = $messageForm.querySelector("input");
const $messgageButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message,
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

const locationTemplate = document.querySelector("#location-template").innerHTML;
socket.on("locationMessage", (url) => {
  const geolocation = Mustache.render(locationTemplate, {
    url,
  });
  $messages.insertAdjacentHTML("beforeend", geolocation);
  //console.log(url);
});

$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  $messgageButton.setAttribute("disabled", "disabled");

  const message = event.target.elements.messageBox.value;

  socket.emit("returnMessage", message, (error) => {
    $messgageButton.removeAttribute("disabled");

    $messageInput.value = "";
    $messageInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("The message was delivered");
  });
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $locationButton.removeAttribute("disabled");
        console.log("Location Shared!");
      }
    );
  });
});
