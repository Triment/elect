/**
 * 组件渲染上下文类型定义
 */
import { HTMLAttributes } from "react"

type PageType = (pageProps: PagePropsType) => React.ReactElement
type PagePropsType = HTMLAttributes<HTMLElement>

export type PageContext = {
    Page: PageType,
    PageProps: PagePropsType,
    isHydration: boolean,
    [key: string]: any
}
