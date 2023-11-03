import { resolve } from "path"
import { existsSync } from "fs"

export type ParseUrlToFilePathType = {
    url: string,
    distDir: string
}
/**
 * 用于解析url到文件路径
 * @param param0 
 * @returns 
 */
export function parseUrlToFilePath({url, distDir}: ParseUrlToFilePathType){
    let filePath
    if(existsSync(resolve(distDir, url))){
        filePath = resolve(distDir, url)
    } 
    if(existsSync(resolve(distDir, url, 'index.js'))){
        filePath = resolve(distDir, url, 'index.js')
    }
    return filePath
}