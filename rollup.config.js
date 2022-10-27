//import { terser } from 'rollup-plugin-terser';
import versionInjector from 'rollup-plugin-version-injector';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const versionConfig = {
    injectInComments: {
        fileRegexp: /\.(js|html|css)$/,
        tag: 'Extml, version: {version} - {date}',
        dateFormat: 'mmmm d, yyyy HH:MM:ss'
    }
}

export default {
    input: 'index.js',
    output: [
        {
            name: 'extml',
            file: 'dist/extml.es.js',
            format: 'es'
        },
        {
            name: 'extml',
            file: 'dist/extml.umd.js',
            format: 'umd'
        }
    ],
    plugins: [
        versionInjector(versionConfig),
        nodeResolve()
    ]
}

// import { nodeResolve } from '@rollup/plugin-node-resolve';
//
// const versionConfig = {
//     injectInComments: {
//         fileRegexp: /\.(js|html|css)$/,
//         tag: 'Extml, version: {version} - {date}',
//         dateFormat: 'mmmm d, yyyy HH:MM:ss'
//     }
// }
//
// export default {
//     input: 'index.js',
//     external: ['htm'],
//     output: [
//         {
//             file: 'dist/extml.es.js',
//             format: 'es',
//             name: 'Extml',
//             plugins: [
//                 //versionInjector(versionConfig),
//                 nodeResolve()
//             ],
//             globals: {
//                 htm: 'htm'
//             }
//         },
//         {
//             file: 'dist/extml.umd.js',
//             format: 'umd',
//             name: 'Extml',
//             plugins: [
//                 //versionInjector(versionConfig),
//                 nodeResolve()
//             ],
//             globals: {
//                 htm: 'htm'
//             }
//         }
//     ]
//}