import { createRouter } from '@triment/sweet.js'
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { renderToString } from 'react-dom/server';



async function renderReactComponent(path:string){
    const url = resolve('./', 'pages', path, '.tsx')
    if(existsSync(url)) {
        return renderToString((await import(url)).default)
    }
}


const router = createRouter();

router.GET("/*assetPath", async (context) =>{
    //此处根据url访问对应路由下的tsx，然后返回renderToString
    const path = context.params['assetPath'];
    if(!path){
        console.log("/")
    }

    const homeHtml = readFileSync('./index.html', 'utf8')
    const componentString = await renderReactComponent(path);
    const resText = homeHtml.replace('anything', componentString!)
    return new Response()
})

const fetch = async(req: Request)=> await router.matchRoute(req);

Bun.serve({
    port: 3000,
    fetch
})