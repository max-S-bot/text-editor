import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: ['frontend/script.js'],
    bundle: true,
    // minify: true,
    outfile: 'frontend/bundle.js',
})