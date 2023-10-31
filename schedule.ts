
type VNode = {
    type: Function | string,
    child?: VNode,
    sibling?: VNode,
    dom?: HTMLElement,
    parent?: VNode,
    effectTag: VNodeEffectTag,
    old: VNode,
    props: PropsType
}

enum VNodeEffectTag {
    VNODE_PLACEMENT = 'PLACEMENT',
    VNODE_UPDATE = 'UPDATE',
    VNODE_DELETION = 'DELETION'
}

type PropsType = Record<any, any>


type OriginGlobalObject = {
    wipRoot: VNode | undefined | null,
    wipFiber: any,
    currentRoot: VNode | undefined | null,
    deletions: VNode[],
    nextUnitWork: VNode | undefined | null
}

const originX: OriginGlobalObject = {
    wipRoot: null,
    currentRoot: null,
    deletions: [],
    nextUnitWork: null
}

function flushDom() {
    originX.deletions.forEach(commitWork);
    commitWork(originX.wipRoot!.child);
    originX.currentRoot = originX.wipRoot;
    originX.wipRoot = null;
}

function commitWork(vnode: VNode | undefined) {
    if (!vnode) {
        return;
    }
    let parent = vnode.parent!;
    if (!parent.dom) {
        parent = parent.parent!;
    }
    if (vnode.effectTag === VNodeEffectTag.VNODE_PLACEMENT && !!vnode.dom) {
        parent.dom?.appendChild(vnode.dom);
    } else if (
        vnode.effectTag === VNodeEffectTag.VNODE_UPDATE && !!vnode.dom
    ) {
        updateDom(vnode.dom, vnode.old.props, vnode.props);
    } else if (vnode.effectTag === VNodeEffectTag.VNODE_DELETION && !!vnode.dom) {
        commitDeletion(vnode, parent);
    }
}


const isEvent = (key: string) => key.startsWith("on")
const isProperty = (key: string) =>
    key !== "children" && !isEvent(key)//不是子节点也不是事件，那就是属性
const isNew = (prev: PropsType, next: PropsType) => (key: string) =>
    prev[key] !== next[key]//isNew(prev, next)(key)比较节点的key
const isGone = (prev: PropsType, next: PropsType) => (key: string) => !(key in next)//key不在下个节点，表示可以删除这个key

function updateDom(dom: HTMLElement, oldProps: PropsType, newProps: PropsType) {
    //移除dom事件
    Object.keys(oldProps)
        .filter(isEvent)
        .filter(
            key =>
                !(key in newProps) ||
                isNew(oldProps, newProps)(key)
        )
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.removeEventListener(
                eventType,
                oldProps[name]
            )
        })
    //移除属性
    Object.keys(oldProps)
        .filter(isProperty)
        .filter(isGone(oldProps, oldProps))
        .forEach(name => {
            (dom as any)[name] = ""
        })
    //添加属性
    Object.keys(newProps)
        .filter(isProperty)
        .filter(isGone(oldProps, oldProps))
        .forEach(name => {
            (dom as any)[name] = newProps[name]
        })
    //添加事件
    Object.keys(newProps)
        .filter(isEvent)
        .filter(isNew(oldProps, newProps))
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.addEventListener(
                eventType,
                newProps[name]
            )
        })
}
/**
 * 提交删除节点
 * @param vnode 待删除节点
 * @param parent 待删除节点的父节点
 */
function commitDeletion(vnode: VNode, parent: VNode) {
    // let target = vnode;//迭代版本
    // while(!target.dom){
    //     target = target.child!;
    // }
    // parent.dom?.removeChild(target.dom)
    if (vnode.dom) {
        parent.dom?.removeChild(vnode.dom);
    } else {
        commitDeletion(vnode.child!, parent);
    }
}

function loop(deadline: IdleDeadline) {
    while (1) {
        if (deadline.timeRemaining() < 1 || !originX.nextUnitWork) {
            break;
        }
        originX.nextUnitWork = performUnitOfWork(originX.nextUnitWork);
    }
    if (!originX.nextUnitWork && originX.wipRoot) {
        commitRoot();
    }
    requestIdleCallback(loop);
}

function commitRoot(){
    originX.deletions.forEach(commitWork);//把删除的节点丢进处理流程处理
    commitWork(originX.wipRoot!.child);//把待处理的树丢进处理流程处理
    originX.currentRoot = originX.wipRoot;//把处理后的树赋值给当前树
    originX.wipRoot = null;//清空操作树
}


function performUnitOfWork(vnode: VNode) {
    if (vnode.type instanceof Function) {
        updateFunctionComponent(vnode);//更新组件树
    } else {
        updateHostComponent(vnode);
    }
    if (vnode.child) {
        return vnode.child//左子树
    }
    let nextFiber = vnode
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling//右子树
        }
        nextFiber = nextFiber.parent!
    }
}

requestIdleCallback(loop);