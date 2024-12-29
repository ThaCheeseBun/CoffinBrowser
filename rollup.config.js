import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import polyfillNode from "rollup-plugin-polyfill-node";
import { minify } from "rollup-plugin-esbuild-minify";

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
            }),
            minify()
        ]
    }
];
