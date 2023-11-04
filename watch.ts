import { rmdirSync, watch } from "fs";
import { resolve } from "path";
import { BuildSourceJsx } from "./build";
import { BuildArtifact } from "bun";

let files: Record<string, BuildArtifact | undefined > = {}
async function buildPages(){
    console.log("\x1b[92m%s\x1b[0m\x1b[35m%s\x1b[0m", new Date(Date.now()).toLocaleString()," ","编译中....")
    rmdirSync(resolve('./dist'), { recursive: true })
    files = {};
    const jsxs = BuildSourceJsx();
    let outdir = 'dist/pages';
    for (const file of jsxs){
        const {outputs} = await Bun.build({
            entrypoints: [file],
            outdir,
            sourcemap: 'external',
            splitting: true,
            external: ['react'],
            naming: "[dir]/[name]-[hash].[ext]",
            minify: {
                whitespace: true,
                identifiers: true,
                syntax: true
            }
        })
        files[file] = outputs[0]
    }
    console.log(files)
}
buildPages();
watch(resolve('./pages'), buildPages)