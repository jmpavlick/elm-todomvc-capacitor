import { Elm } from "./src/Main.elm";
import { Device } from "@capacitor/device";

try {
  Promise.all([Device.getInfo()]).then(([{ isVirtual }]) => {
    var storedState = localStorage.getItem("elm-todo-save");
    var startingState = storedState ? JSON.parse(storedState) : null;

    var app = Elm.Main.init({
      flags: {
        maybeModel: startingState,
        isVirtual: isVirtual
      },
    });

    app.ports.setStorage.subscribe(function (state) {
      localStorage.setItem("elm-todo-save", JSON.stringify(state));
    });
  });
} catch (e) {
  console.log(e);
}
