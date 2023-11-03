import { ServerPageContext } from "../compiler/server";

export default function (props: any) {
    return <>{props.url}</>
}

export async function getProps(context: ServerPageContext){
    return {
        url: new URL(context.req.url).hostname
    }
}