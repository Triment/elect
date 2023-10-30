/**
 * 核心任务
 */

type PropsType = Record<string, any>

type TEXT_ELEMENT = 'TEXT_ELEMENT'

type EffectTagType = {
    PLACEMENT: 'PLACEMENT',
    UPDATE: 'UPDATE',
    DELETION: 'DELETION'
}
//被处理单元类型
type FiberType = {
    dom: HTMLElement,
    type: Object | TEXT_ELEMENT,
    props: PropsType,
    alternate: FiberType,
    effectTag: EffectTagType,
    child?: FiberType,//左子树
    sibling?: FiberType,//右子树
    parent: FiberType//父节点
}


export function workLoop(nextUnitOfWork: FiberType | undefined, deadline: IdleDeadline) {//工作循环
    let shouldYield = false//中断标识
    while (nextUnitOfWork && !shouldYield) {//不需要中断并且还有单元任务待处理
      nextUnitOfWork = performUnitOfWork(
        nextUnitOfWork
      )
      shouldYield = deadline.timeRemaining() < 1
    }
  
    if (!nextUnitOfWork && wipRoot) {//没有单元任务就提交渲染树
      commitRoot()
    }
  
    requestIdleCallback(workLoop)
  }

//后续遍历fiber
export  function performUnitOfWork(fiber: FiberType) {
    const isFunctionComponent =
      fiber.type instanceof Function
    if (isFunctionComponent) {
      updateFunctionComponent(fiber)
    } else {
      updateHostComponent(fiber)
    }
    if (fiber.child) {
      return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling
      }
      nextFiber = nextFiber.parent
    }
  }

  function loop(deadline){
    while(1){
      if(deadline.timeRemaining() < 1){
        break;
      }
      console.warn(`线程占用`);
    }
    requestIdleCallback(loop);
  }

  requestIdleCallback(loop);