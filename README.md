# CoffinBrowser
Ever wanted to play The Coffin of Andy and Leyley in your browser? No? Well now you can!

## How?
Install deps and build like any other Node project. Copy the output `dist/CoffinBrowser.js` file into `<GAME>/www/` (where `<GAME>` is the games root folder).
```js
<script src="CoffinBrowser.js"></script>
```
Add above code under `<body style="background-color: black">` in `<GAME>/www/index.html`. Spin up any HTTP server in the `<GAME>/www` folder and you're good to go.

Not heavily tested at the moment but I successfully managed a full playthrough.

## Why?
Boredom.

## What?
After spending a whole day reverse engineering and deobfuscating the game by hand I realised it just needs some Node polyfills (and a fake filesystem in localStorage) to work in the browser, so that's exactly what this does. I also switched Node's zlib library for [UZIP.js](https://github.com/photopea/UZIP.js) cuz it's like a third of the size.
