import { Elm } from "./src/Main.elm"

var storedState = localStorage.getItem('elm-todo-save');
var startingState = storedState ? JSON.parse(storedState) : null;
var app = Elm.Main.init({ flags: startingState });
app.ports.setStorage.subscribe(function(state) {
    localStorage.setItem('elm-todo-save', JSON.stringify(state));
});