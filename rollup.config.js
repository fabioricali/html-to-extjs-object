import versionInjector from 'rollup-plugin-version-injector';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from "@el3um4s/rollup-plugin-terser";

const versionConfig = {
    injectInComments: {
        fileRegexp: /\.(js|html|css)$/,
        tag: 'Extml, version: {version} - {date}',
        dateFormat: 'mmmm d, yyyy HH:MM:ss'
    }
}

export default {
    input: 'src/index.js',
    output: [
        {
            name: 'extml',
            file: 'dist/extml.es.js',
            format: 'es',
            compact: true
        },
        {
            name: 'extml',
            file: 'dist/extml.umd.js',
            format: 'umd',
            compact: true
        },
        {
            name: 'extml',
            file: 'dist/extml.es.min.js',
            format: 'es',
            plugins: [terser()]
        },
        {
            name: 'extml',
            file: 'dist/extml.umd.min.js',
            format: 'umd',
            plugins: [terser()]
        }
    ],
    plugins: [
        versionInjector(versionConfig),
        nodeResolve()
    ]
}