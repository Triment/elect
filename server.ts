import { createRouter } from '@triment/sweet.js'

const router = createRouter();

router.GET("/*assetPath", (context)=>{
    return new Response()
})

const fetch = (req: Request)=> router.matchRoute(req);

Bun.serve({
    port: 3000,
    fetch
})