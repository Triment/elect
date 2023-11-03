import { exec } from "child_process";
import { watch } from "fs";


function restartServer(){
    console.log("重启")
    exec('bun run server.ts')
}

watch('./server.ts', ()=>{
    restartServer();
})