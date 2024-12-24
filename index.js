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
    console.debug(`existsSync("${path}"), res="${resolved}"`);
    // Languages bypass
    if (resolved.startsWith("/www/languages")) {
        return true;
    }
    return localStorage.getItem(resolved) !== null;
}

function unlinkSync(path) {
    let resolved = resolve(path);
    console.debug(`unlinkSync("${path}"), res="${resolved}"`);
    localStorage.removeItem(resolved);
}

function readdirSync(path) {
    let resolved = resolve(path);
    console.debug(`readdirSync("${path}"), res="${resolved}"`);
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
    console.debug(`statSync("${path}"), res="${resolved}"`);
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
    console.debug(`readFileSync("${path}"), res="${resolved}"`);
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
    console.debug(`writeFileSync("${path}", "${data}"), res="${resolved}"`);
    localStorage.setItem(resolved, data);
}

function copyFileSync(from, to) {
    let resolved_from = resolve(from);
    let resolved_to = resolve(to);
    console.debug(`copyFileSync("${from}", "${to}"), res0="${resolved_from}", res1="${resolved_to}"`);
    localStorage.setItem(resolved_to, localStorage.getItem(resolved_from));
}

function appendFileSync(path, data) {
    let resolved = resolve(path);
    console.debug(`appendFileSync("${path}", "${data}"), res="${resolved}"`);
    localStorage.setItem(resolved, localStorage.getItem(resolved) + data);
}

function mkdirSync(path, opts) {
    let resolved = resolve(path);
    console.debug(`mkdirSync("${path}", ${JSON.stringify(opts)}), res="${resolved}"`);

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
    console.debug(`accessSync("${path}")`);
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
            return {
                username: ''
            }
        }
    },
    // Zlib decompression used for obfuscated code
    // A bit of a hack but it's only used for that
    zlib: {
        inflateSync: data => new TextDecoder().decode(inflate(data))
    },
    // NW.js things
    'nw.gui': {
        App: {
            argv: []
        },
        Window: {
            get: () => {
                return {
                    close: (a) => {
                        // dummy
                        console.debug(`Window.close(${a})`);
                    },
                    showDevTools: () => {
                        // dummy
                        console.debug("Window.showDevTools()");
                    }
                }
            }
        }
    },
    // Greenworks for Steam shenanigans
    './greenworks/greenworks': {
        isSteamRunning: () => true,
        init: () => true,
        getSteamId: () => 0,
        getCurrentGameLanguage: () => "english"
    }
}
// Redirect all require requests here
export function require(module) {
    return modules[module];
}
