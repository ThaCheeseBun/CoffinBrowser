import {
    extname,
    join,
    dirname,
    basename,
    relative,
    resolve
} from "path";
import { hrtime } from "process";
import {
    networkInterfaces,
    hostname
} from "os";
import { Buffer as realBuffer } from "buffer";
import { inflate } from "uzip";

export const process = {
    hrtime,
    mainModule: {
        filename: "/www/index.html"
    },
    execPath: "/www/",
    env: {
        APPDATA: "/AppData"
    }
}

export const Buffer = realBuffer;

function existsSync(path) {
    let resolved = resolve(path);
    console.debug(`fs.existsSync("${path}"), res="${resolved}"`);
    // Languages bypass
    if (resolved.startsWith("/www/languages")) {
        return true;
    }
    return localStorage.getItem(resolved) !== null;
}

function unlinkSync(path) {
    let resolved = resolve(path);
    console.debug(`fs.unlinkSync("${path}"), res="${resolved}"`);
    localStorage.removeItem(resolved);
}

function readdirSync(path) {
    let resolved = resolve(path);
    console.debug(`fs.readdirSync("${path}"), res="${resolved}"`);
    // ugly workaround for reading lang folders
    if (resolved === "/www/languages") {
        return ["english"];
    }
    if (resolved === "/www/languages/english") {
        return ["dialogue.loc"];
    }
    let out = [];
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (dirname(key) === resolved) {
            out.push(basename(key));
        }
    }
    return out;
}

function statSync(path) {
    let resolved = resolve(path);
    console.debug(`fs.statSync("${path}"), res="${resolved}"`);
    // return dummies for assets
    if (resolved.startsWith("/www")) {
        return {
            isFile: () => true,
            isDirectory: () => true
        }
    }
    let item = localStorage.getItem(resolved);
    if (item === null) {
        throw new Error("File does not exist");
    }
    return {
        isFile: () => item !== "_DIR",
        isDirectory: () => item === "_DIR"
    }
}

function readFileSync(path) {
    let resolved = resolve(path);
    console.debug(`fs.readFileSync("${path}"), res="${resolved}"`);
    // special case: passthrough requests for assets
    // horrible solution, but it sure is blocking
    if (resolved.startsWith("/www")) {
        const req = new XMLHttpRequest();
        req.open("GET", resolved.slice(4), false);
        req.send(null);
        return req.responseText;
    }
    return localStorage.getItem(resolved);
}

function writeFileSync(path, data) {
    let resolved = resolve(path);
    console.debug(`fs.writeFileSync("${path}", "${data}"), res="${resolved}"`);
    // throw logs into the void, don't need em
    if (path.startsWith("/AppData/CoffinAndyLeyley/Logs")) {
        return;
    }
    localStorage.setItem(resolved, data);
}

function copyFileSync(from, to) {
    let resolved_from = resolve(from);
    let resolved_to = resolve(to);
    console.debug(`fs.copyFileSync("${from}", "${to}"), res0="${resolved_from}", res1="${resolved_to}"`);
    localStorage.setItem(resolved_to, localStorage.getItem(resolved_from));
}

function appendFileSync(path, data) {
    let resolved = resolve(path);
    console.debug(`fs.appendFileSync("${path}", "${data}"), res="${resolved}"`);
    // throw logs into the void, don't need em
    if (path.startsWith("/AppData/CoffinAndyLeyley/Logs")) {
        return;
    }
    localStorage.setItem(resolved, localStorage.getItem(resolved) + data);
}

function mkdirSync(path, opts) {
    let resolved = resolve(path);
    console.debug(`fs.mkdirSync("${path}", ${JSON.stringify(opts)}), res="${resolved}"`);

    let parts = resolved.split("/");
    for (let i = 0; i < parts.length; i++) {
        let part = parts.slice(0, i + 1).join("/");
        if (part === "") {
            part = "/";
        }
        let item = localStorage.getItem(part);
        if (item === null) {
            localStorage.setItem(part, "_DIR");
        } else if (item !== "_DIR") {
            throw new Error("File exists");
        }
    }
}

function accessSync(path) {
    // dummy
    console.debug(`fs.accessSync("${path}")`);
}

const modules = {
    // Filesystem "emulation" using localstorage and requests
    fs: {
        existsSync,
        unlinkSync,
        readdirSync,
        statSync,
        readFileSync,
        writeFileSync,
        copyFileSync,
        appendFileSync,
        mkdirSync,
        accessSync
    },
    // Re-exports for path module
    path: {
        extname,
        join,
        dirname,
        basename,
        relative,
        resolve
    },
    // Some dummies and re-exports for os
    os: {
        networkInterfaces,
        hostname,
        userInfo: () => {
            // dummy
            console.debug("os.userInfo()");
            return {
                username: ""
            }
        }
    },
    // Zlib decompression used for obfuscated code
    // A bit of a hack but it's only used for that
    zlib: {
        inflateSync: data => new TextDecoder().decode(inflate(data))
    },
    // NW.js things
    "nw.gui": {
        App: {
            argv: []
        },
        Window: {
            get: () => {
                return {
                    close: (code) => {
                        // dummy
                        console.debug(`'nw.gui'.Window.get().close(${code})`);
                    },
                    showDevTools: () => {
                        // dummy
                        console.debug("'nw.gui'.Window.get().showDevTools()");
                    }
                }
            }
        }
    },
    // Greenworks for Steam shenanigans
    "./greenworks/greenworks": {
        isSteamRunning: () => {
            // dummy
            console.debug("greenworks.isSteamRunning()");
            return true;
        },
        init: () => {
            // dummy
            console.debug("greenworks.init()");
            return true;
        },
        getSteamId: () => {
            // dummy
            console.debug("greenworks.getSteamId()");
            return 0;
        },
        getCurrentGameLanguage: () => {
            // dummy
            console.debug("greenworks.getCurrentGameLanguage()");
            return "english"
        },
        activateAchievement: (name, callback) => {
            // dummy
            console.debug(`greenworks.activateAchievement("${name}")`);
            callback();
        },
        clearAchievement: (name, callback) => {
            // dummy
            console.debug(`greenworks.clearAchievement("${name}")`);
            callback();
        },
        getAchievementNames: () => {
            // dummy
            console.debug("greenworks.getAchievementNames()");
            return [];
        },
    }
}
// Redirect all require requests here
export function require(module) {
    return modules[module];
}
