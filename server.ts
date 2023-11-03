import { createRouter } from '@triment/sweet.js'
import { existsSync, watch } from 'fs';
import { resolve } from 'path';
import { compileToReadableStream } from './compiler/server';
import { BuildSourceJsx } from './build';



//渲染字符串，引入hydrate脚本url，添加css文件url，返回整体html
async function renderReactComponent(req: Request,path:string){
    const url = resolve('./', 'pages', `${path}.tsx`);
    if(existsSync(url)) {
        return await compileToReadableStream({ req, path });
    }
    return `${path} Not Found`
}

const ContentType: Record<string, string> = {
    "js": "text/javascript",
    "css": "text/css",
    "txt": "text/plain",
    "png": "image/png",
    "jpg": "image/jpeg",
    "html": "text/html"
}

function parseContentType(ext: string){
    let cType = ContentType[ext];

    if(!cType) {
        if(ext.endsWith('.js')) return "application/javascript;charset=UTF-8";
        cType = "application/octet-stream";
    }
    return cType + ";charset=UTF-8";
}
const router = createRouter();
router.GET("/assets/*file", async (context) => {
    const path = context.params['file']
    if(path){
        const absPath = resolve('./','dist', path)
        if(existsSync(absPath)){
            const content = Bun.file(absPath).stream();
            return new Response(content, {
                headers: {
                    "Content-Type": parseContentType(path)
                }
            })
        }
    }
    return new Response("Not Found", {
        status: 404
    })
})

router.GET("/modules/*file", async (context) => {
    const path = context.params['file']
    if(!!path){
        const absPath = resolve('./','node_modules', path)
        if(existsSync(absPath)){
            const content = Bun.file(absPath).stream();
            return new Response(content, {
                headers: {
                    "Content-Type": parseContentType(path)
                }
            })
        }
    }
    return new Response("Not Found 没找到", {
        status: 404
    })
})

router.GET("/*main", async (context) =>{
    //此处根据url访问对应路由下的tsx，然后返回renderToString
    const path = context.params['main'];
    if(!path){
        console.log("/")
    }
    const Html = await renderReactComponent(context.req,path);
    return new Response(Html, {
        headers: {
            "Content-Type": parseContentType('html')
        }
    })
})

const fetch = async(req: Request)=> await router.matchRoute(req);

Bun.serve({
    port: 3000,
    fetch
})

const watchPages = watch(resolve('./pages'), { recursive: true }, (event, filename)=>{
    console.log(`${filename} 更新`)
    Bun.build({
        entrypoints: BuildSourceJsx(),
        outdir: 'dist/pages',
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
})

process.on('SIGINT', ()=>{
    watchPages.close();
    process.exit(0);
})

