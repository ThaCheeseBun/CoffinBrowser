import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import polyfillNode from "rollup-plugin-polyfill-node";

export default [
    {
        input: "index.js",
        output: {
            name: "window",
            extend: true,
            file: "dist/CoffinBrowser.js",
            format: "iife"
        },
        plugins: [
            commonjs({
                strictRequires: false
            }),
            nodeResolve(),
            polyfillNode({
                include: null
            })
        ]
    }
];
