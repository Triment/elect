import { resolve } from "path"

export type ServerPageContext = {
    req: Request,
    path: string,
    [key: string]: any
}

export async function compileToReadableStream({req, path}:ServerPageContext){
    return await (await import(resolve('./render/server.tsx'))).render({req, path})
}