import { PageContext } from "../render/types";
import { parseUrlToFilePath } from "./parseUrlToFile";
import { join } from "./pathJoinInBrowser";

export type CreatePageContextFromPageType = {
    req?: Request,
    url: string,
    [key: string]: any
}

/**
 * 将页面，页面的props，以及后台传过来的context一并组合
 * 有可能将其作为客户端调用
 * @returns 
 */

export async function createPageContextFromPage({ req, url, ...context }: CreatePageContextFromPageType): Promise<PageContext> {
    let pageObject;
    let page;
    let pageProps;
    if(req){//客户端是没有req的
        let jsFilePath = parseUrlToFilePath({url, distDir: './dist/pages'});
        if(jsFilePath){
            pageObject = await import(jsFilePath);
        }
    } else {
        let jsFilePath = join(window.location.origin, url, '.js');
        // http options 检测文件是否存在
        pageObject = await import(jsFilePath);
    }
    if(pageObject){
        page = pageObject.Page;//取出页面的对应函数
        if(pageObject.getProps)
        pageProps = await pageObject.getProps(context);//后台的context会传给该函数
    }
    return {
        Page: page,
        PageProps: pageProps,
        isHydration: !req
    }
}