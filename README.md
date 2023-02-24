# TodoMVC in Elm, with Ionic Capacitor!

This repo is a minimal port of the classic [evancz/elm-todomvc](https://github.com/evancz/elm-todomvc) application, with the additional infrastructure necessary to run as a native, cross-platform mobile application powered by [Ionic Capacitor](https://capacitorjs.com/docs/).

**All of the application code is in Elm!** To get started quickly, simply fork this repo, then scroll on down to the [Caveats](#caveats) section for a brief overview of what you'll need to change in order to build a native mobile application with Elm + Ionic Capacitor.

But wait - there's more! This repo serves as a tutorial. I've tried to build the different layers of this application as a set of pull requests that are all linked in this document. The comments on the pull request show which changes were made, when, and why - and you can read an overview for each major changeset here in this readme, as well.

If you have questions, feel free to shoot me a DM in [Elm Slack](https://elmlang.slack.com/), or ping me on Twitter - [@lambdapriest](https://twitter.com/lambdapriest).

## Step 1 - Start with an existing Elm application (or make a new one!)

> [Pull Request](https://github.com/jmpavlick/elm-todomvc-capacitor/pull/1)

For this demo application, I've started with an existing app; but you can do whatever you like. There are some limitations, though; you'll have to create a [`Browser.element`](https://package.elm-lang.org/packages/elm/browser/latest/Browser#element) or [`Browser.document`](https://package.elm-lang.org/packages/elm/browser/latest/Browser#document) application. (For more notes on this, see [Caveats - URL Routing / Navigation](#url-routing--navigation).)

This repo starts with a simple Elm app that only contains what's absolutely necessary - an `elm.json` file, a `src/Main.elm` file, and an `index.html` file to host the built JavaScript. In fact, if you check out the project and navigate to the Git hash that was merged in during [the Step 1 PR](https://github.com/jmpavlick/elm-todomvc-capacitor/pull/1), you can build the app just by navigating to the root of the project, and running:

```
elm make src/Main.elm --output=elm.js
```

Then opening `index.html` in a web browser.

## Step 2 - npm and a bundler

> [Pull Request](https://github.com/jmpavlick/elm-todomvc-capacitor/pull/2)

We'll need npm in order to install the dependencies we need to get going with Capacitor; and if we get set up with a bundler now, we can have nice things like build-on-save while we're working.

In this step, we installed the following npm packages:

* `vite`
* `vite-plugin-elm`

Then, we refactored the little bit of JavaScript in `index.html` that hosts our `elm.js` file into a module called `index.mjs`, which will make it easier to integrate with our bundler, Vite, as well as with some of the other Capacitor packages we'll need.

We added `vite-plugin-elm`, because it lets you import your `src/Main.elm` file directly into your `index.mjs` file, which Vite automatically picks up on build. We configured the `vite.config.js` file to run `vite-plugin-elm` during our build step.

Finally, we added a simple npm script, `start`. It sets the `NODE_ENV` environment variable to `DEV` and runs `vite --host`. Our `vite.config.js` uses the `NODE_ENV` value to set a JSON object that it passes to the `elmPlugin` function from `vite-plugin-elm`, which sets the `--debug` and `--optimize` flags from `elm make`. (We want to se the debugger when we're in our development environment, but we don't want to see it when we do a release build.)

## Step 3 - Install Capacitor and make it runnable on Android and iOS

> [Pull Request](https://github.com/jmpavlick/elm-todomvc-capacitor/pull/3)

Now that we have npm and a bundler, we can add Capacitor to our project. This is remarkably simple - the docs are [here](https://capacitorjs.com/docs/getting-started#add-capacitor-to-your-web-app), but I'll summarize:

### Install Capacitor

* `npm install @capacitor/core`
* `npm install -D @capacitor/cli`

### Initialize Capacitor

* `npx cap init`, and follow the prompts. This creates `capacitor.config.json`.

### Install the Android and iOS platform plugins

* `npm install @capacitor/android @capacitor/ios`

### Create the Android and iOS projects

* `npx cap add android`
* `npx cap add ios`

This will create Android and / or iOS projects (depending on what platform plugins you have installed, and which of these commands you run), at `android/` and `ios/` respectively.

The iOS project has a dependency on [CocoaPods](https://cocoapods.org/), so you'll need to install that. My preferred method is to install it via [Homebrew](https://brew.sh/). I've added a `Brewfile` to this project; if you have Homebrew installed already, simply run

```
brew bundle
```

from the root directory, before you run `npx cap add ios`.

### Sync

Here's where we diverge slightly from the docs.

If you run `npx cap sync`, Capacitor will:

* Copy whatever's in the folder specified in the `webDir` value of `capacitor.config.json` - for us, that's `dist` - into those projects

Right now, our `dist` folder contains whatever Vite bundled the last time it ran - if it even ran at all (i.e., if your project is building in a CI pipeline, or if a friend is helping you and they just pulled this repo down on their computer). When we finish our app and want to release it to the App Store, we'll need to make sure that our built output doesn't include the Elm debugger; so it's helpful to wrap the call to `npx cap sync` in another npm script so that we can specify the environment that our Elm app is building in.

So to enable this, we've added two more npm scripts:

* `sync-dev`: Runs the Vite build with `NODE_ENV=DEV`, then runs `npx cap sync`
* `sync`: Same as `sync-dev`, but without `NODE_ENV=DEV` so that our built output is optimized and has the Elm debugger removed

### Opening Your Project

You can run `npx cap open android` to open your Android project in [Android Studio](https://developer.android.com/studio); you can run `npx cap open ios` to open your iOS project in [Xcode](https://developer.apple.com/xcode/).

Because I hate remembering commands, I've added these as npm scripts - `open-android` and `open-ios`, respectively. Adding them to my `package.json` ensures that all of the commands that I need to run in order to work on this application are _written down somewhere_ as part of my project.

> Note: Capacitor doesn't actually build binaries of your mobile apps for their respective platforms; it just maintains a project directory for each platform, and copies your web artifacts over when you run `npx cap sync`.

Now that your project is open, you can build and run it in the simulator of your choice! You'll notice that the app isn't drawing correctly in the viewport - depending on the simulator you run with, perhaps a "notch" is covering part of the content; perhaps the content is sized poorly or off-center; and when you tap a text input to enter a "todo" item, the display may zoom in on the field while the keyboard opens.

All of these are very un-app-y behaviors; the bulk of the work that we have left to do concerns making it so that our web application behaves like a native mobile application.

### A Note On Source Control

On one hand, the `android/` and `ios/` folders are a sort of build artifact, in that they are auto-generated by `npx cap sync`; but on the other hand, you _can_ edit some of the config files in those directories, and those changes will be persisted across repeated runs of `npx cap sync` - so in practice, for me, it's much easier to have them included in source control.

## Caveats

### URL Routing / Navigation

Due to limitations with Elm's URL routing and due to constraints on web views in iOS, you can't give your Elm application full control of the DOM, so you can't create your app as a [`Browser.application`](https://package.elm-lang.org/packages/elm/browser/latest/Browser#application). The biggest limitation here is that you can't use `elm/url` routes or browser navigation - but that's really not a big deal!

URL routing only really matters when the URL bar should be available to the user as a means of input. Since the URL bar in the web viewer is hidden for an Ionic Capacitor app, you don't need to worry about it at all! You can simply store a value on your `Model` that tracks your user's location in the app, and you can retrieve that value from local storage when your app loads, through your flags.

For this reason, I strongly recommend using a [`Browser.element`](https://package.elm-lang.org/packages/elm/browser/latest/Browser#element) - so that you can use flags to send input parameters to your application, and so that you can use ports to set and retrieve values from the web viewer's local storage (which is persisted on the mobile filesystem). You can also use a [`Browser.document`](https://package.elm-lang.org/packages/elm/browser/latest/Browser#document), but since your users will never see the `<title>` of the page, there's not really any reason to.