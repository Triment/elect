import { Root, createRoot, hydrateRoot } from "react-dom/client";
import { PageContext } from "./types";

let root: Root
/**
 * 客户端渲染函数
 * @param param0 
 */
export function render({ Page, PageProps, isHydration }: PageContext){
    const page = <Page {...PageProps}/>;
    const container = document.getElementById('#root')
    
    if(container?.innerHTML === '' || !isHydration ){
        if(!root){
            root = createRoot(container!)
        }
        root.render(page)
    } else {
        root = hydrateRoot(container!, page)
    }
}