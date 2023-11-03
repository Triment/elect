/**
 * 组件上下文包装器定义
 */

import { createContext, useContext } from "react"
import { PageContext } from "./types";


const PageShellContext = createContext<PageContext>(undefined as any)

/**
 * 提供服务端客户端统一渲染组件
 * @param param0 
 * @returns 
 */
export function PageContextProvider({
    pageContext,
    children
}: { pageContext: PageContext, children: React.ReactNode }) {
    return <PageShellContext.Provider
        value={pageContext}>{children}</PageShellContext.Provider>
}

export function usePageShellContext(){
    const pageContext = useContext(PageShellContext);
    return pageContext;
}