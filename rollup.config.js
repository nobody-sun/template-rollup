import path from 'path'
import nodeResolve from 'rollup-plugin-node-resolve' // 依赖引用插件
import babel from 'rollup-plugin-babel'
import pkg from './package.json'
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
const extensions = ['.js', '.ts']
const resolve = function (...args) {
    return path.resolve(__dirname, ...args)
}
const input = resolve('src/index.ts')
const external = (id) => {
    return /@babel\/runtime/.test(id) || /node-utils/.test(id)
}
const watchOptions = {
    include: ['src/**'],
    exclude: 'node_modules/**',
}
// 通用插件list
const commonPlugin = [
    nodeResolve({
        modulesOnly: true,
        extensions,
    }),
    babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true,
        plugins: [
            [
                '@babel/plugin-transform-runtime',
                {
                    regenerate: true,
                },
            ],
            // '@babel/plugin-proposal-class-properties',
        ],
        extensions,
    }),
    terser()
]
// 需导出文件listMap
const outputMap = [
    // index.js
    {
        output: {
            file: resolve(pkg.main),
            exports: 'auto',
            format: "cjs",
        },
        plugins: [...commonPlugin],
    },
    {
        output: {
            file: resolve(pkg.module),
            exports: 'auto',
            format: "esm",
        },
        plugins: [...commonPlugin],
    },
    // index.d.ts
    {
        output: {
            file: resolve(pkg.types), // 为了项目的统一性，这里读取 package.json 中的配置项
        },
        plugins: [dts()],
    },
]
export default outputMap.map((item) => ({ input, external, watch: watchOptions, ...item }))
