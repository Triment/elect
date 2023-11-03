import { ReactNode } from 'react'
import{ PageContext } from './types'
import { PageContextProvider } from './PageContext'


export type PageShell = {
    pageContext: PageContext,
    children: ReactNode
}
/**
 * shell组件，服务端客户端都将使用该组件，通过该组件将context传入page
 * @param param0 
 * @returns 
 */
export function PageShell({ pageContext, children }: PageShell){
    return <div id="shell">
        <PageContextProvider pageContext={pageContext}>
            {children}
        </PageContextProvider>
    </div>
}