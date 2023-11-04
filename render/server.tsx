import { renderToString } from "react-dom/server";
import { PageContext } from "./types";
import { PageShell } from "./PageShell";


/**
 * 返回后的对象一部分给到浏览器渲染另一部分水合的时候使用
 * @param pageContext 
 * @returns 
 */
export async function render(pageContext: PageContext) {
  const { Page, PageProps, ...context } = pageContext
  let pageHtml
  if (!Page) {
    // SPA
    pageHtml = ''
  } else {
    // SSR / HTML-only
    pageHtml = renderToString(
      <PageShell pageContext={pageContext}>
        <Page {...PageProps} />
      </PageShell>
    )
  }
  let scripts = []
   //build
   
  /**
   * 引入打包后的reactjs， reactdomjs，注入代码调用客户端的render
   */
  return {
    html: `<!DOCTYPE html>
        <html>
          <body>
            <div id="root">${pageHtml}</div>
          </body>
        </html>`,
    pageContext: context
  }
}

//调用renderBefore得到props传入组件
// const props = await (await import(resolve('./', 'pages', `${pageContext.path}.tsx`))).getProps(pageContext);
// return await renderToReadableStream((await import(resolve('./', 'pages', `${pageContext.path}.tsx`))).default(props), {
//     bootstrapScriptContent: "",
//     bootstrapScripts: [
//         '/modules/react/umd/react.development.js',
//         '/modules/react-dom/umd/react-dom.development.js'
//     ],
//     bootstrapModules: ['/assets/index.js'],//module
//     onError(error, errorInfo) {
//         console.log(errorInfo)
//         console.log(error)
//     },
// }); 