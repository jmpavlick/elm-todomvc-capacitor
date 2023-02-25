import { Elm } from "./src/Main.elm";
import { Device } from "@capacitor/device";
import { SafeArea } from 'capacitor-plugin-safe-area';

const getSafeAreaTopInPx = SafeArea.getSafeAreaInsets().then(({ insets }) => [ insets.top, insets.bottom ] );

try {
  Promise.all([Device.getInfo(), getSafeAreaTopInPx]).then(([{ isVirtual }, [ safeAreaTopInPx, safeAreaBottomInPx ] ]) => {

    var storedState = localStorage.getItem("elm-todo-save");
    var startingState = storedState ? JSON.parse(storedState) : null;

    var app = Elm.Main.init({
      flags: {
        maybeModel: startingState,
        isVirtual: isVirtual,
        safeAreaTopInPx: safeAreaTopInPx,
        safeAreaBottomInPx: safeAreaBottomInPx
      },
    });

    app.ports.setStorage.subscribe(function (state) {
      localStorage.setItem("elm-todo-save", JSON.stringify(state));
    });
  });
} catch (e) {
  console.log(e);
}
