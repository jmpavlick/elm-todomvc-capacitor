import { Elm } from "./src/Main.elm";
import { Device } from "@capacitor/device";
import { SafeArea } from 'capacitor-plugin-safe-area';

const getSafeAreaTopInPx = SafeArea.getSafeAreaInsets().then(({ insets }) => insets.top );


try {
  Promise.all([Device.getInfo(), getSafeAreaTopInPx]).then(([{ isVirtual }, maybeSafeAreaTopInPx]) => {

    console.log("maybeSafeAreaTopInPx: " + maybeSafeAreaTopInPx);

    var storedState = localStorage.getItem("elm-todo-save");
    var startingState = storedState ? JSON.parse(storedState) : null;

    var app = Elm.Main.init({
      flags: {
        maybeModel: startingState,
        isVirtual: isVirtual,
        maybeSafeAreaTopInPx: maybeSafeAreaTopInPx ? maybeSafeAreaTopInPx : null
      },
    });

    app.ports.setStorage.subscribe(function (state) {
      localStorage.setItem("elm-todo-save", JSON.stringify(state));
    });
  });
} catch (e) {
  console.log(e);
}
