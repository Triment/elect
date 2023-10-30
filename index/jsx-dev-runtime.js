//创建虚拟节点
function createElement(type, props, ...children) {//创建虚拟节点
    return {
      type,
      props: {
        ...props,
        children: children.map(child =>
          typeof child === "object"
            ? child
            : createTextElement(child)//文字创建
        ),
      },
    }
  }
  //创建文字节点
  function createTextElement(text) {//文字节点创建
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: [],
      },
    }
  }
  //创建dom
  function createDom(fiber) {//从fiber创建dom
    const dom =
      fiber.type == "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(fiber.type)
  
    updateDom(dom, {}, fiber.props)
  
    return dom
  }
  
  const isEvent = key => key.startsWith("on")
  const isProperty = key =>
    key !== "children" && !isEvent(key)//不是子节点也不是事件，那就是属性
  const isNew = (prev, next) => key =>
    prev[key] !== next[key]//isNew(prev, next)(key)比较节点的key
  const isGone = (prev, next) => key => !(key in next)//key不在下个节点，表示可以删除这个key

  //更新和创建dom
  function updateDom(dom, prevProps, nextProps) {//更新虚拟dom
    //Remove old or changed event listeners
    Object.keys(prevProps)
      .filter(isEvent)//筛选事件
      .filter(
        key =>
          !(key in nextProps) ||//筛选需要添加的key
          isNew(prevProps, nextProps)(key)//筛选需要更新的key
      )
      .forEach(name => {
        const eventType = name
          .toLowerCase()
          .substring(2)//事件名称转小写方便下面添加
        dom.removeEventListener(
          eventType,
          prevProps[name]
        )
      })
  
    // Remove old properties
    Object.keys(prevProps)
      .filter(isProperty)
      .filter(isGone(prevProps, nextProps))
      .forEach(name => {
        dom[name] = ""
      })
  
    // Set new or changed properties
    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(prevProps, nextProps))//新key才需要更新
      .forEach(name => {
        dom[name] = nextProps[name]//直接更新
      })
  
    // Add event listeners
    Object.keys(nextProps)
      .filter(isEvent)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        const eventType = name
          .toLowerCase()
          .substring(2)
        dom.addEventListener(//与55行相反操作
          eventType,
          nextProps[name]
        )
      })
  }
  /**
   * 提交工作单元
   */
  function commitRoot() {
    deletions.forEach(commitWork)//删除待删除的fiber
    commitWork(wipRoot.child)//递归更新节点
    currentRoot = wipRoot//更新当前更新节点
    wipRoot = null//清空根
  }
  /**
   * 根据fiber更新或生产dom
   * @param {any} fiber 
   * @returns 
   */
  function commitWork(fiber) {
    if (!fiber) {
      return
    }
  
    let domParentFiber = fiber.parent//获取当前节点的父节点
    while (!domParentFiber.dom) {//向上追溯找到一个有dom的父节点
      domParentFiber = domParentFiber.parent
    }
    const domParent = domParentFiber.dom//获取父节点的dom
//此处为数据（fiber）流逻辑
    if (
      fiber.effectTag === "PLACEMENT" &&//添加dom的情况
      fiber.dom != null
    ) {
      domParent.appendChild(fiber.dom)//108行获取的
    } else if (
      fiber.effectTag === "UPDATE" &&//更新
      fiber.dom != null
    ) {
      updateDom(//更新dom
        fiber.dom,
        fiber.alternate.props,
        fiber.props
      )
    } else if (fiber.effectTag === "DELETION") {
      commitDeletion(fiber, domParent)//删除父节点上的指定fiber.dom,没有dom就删除fiber的子代的dom
    }
  
    commitWork(fiber.child)//更新左子树
    commitWork(fiber.sibling)//更新右子树
  }
  /**
   * 移除fiber树上待删除的节点
   * @param {any} fiber 
   * @param {any} domParent 
   */
  function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
      domParent.removeChild(fiber.dom)
    } else {
      commitDeletion(fiber.child, domParent)
    }
  }
  /**
   * 将渲染数据放进nextUnitOfWork以便下一个workLoop处理
   * @param {any} element 
   * @param {HTMLElement} container 
   */
  function render(element, container) {//准备下一个单元任务
    wipRoot = {
      dom: container,
      props: {
        children: [element],
      },
      alternate: currentRoot,
    }
    deletions = []
    nextUnitOfWork = wipRoot
  }
  
  let nextUnitOfWork = null
  let currentRoot = null
  let wipRoot = null
  let deletions = null
  
  /**
   * 主工作循环，占用浏览器空闲时不停循环，相当于优先级较低的任务，主要负责diff树的更新和渲染
   * @param {IdleDeadline} deadline 
   */
  function workLoop(deadline) {//工作循环
    let shouldYield = false//中断标识
    //更新diff树
    while (nextUnitOfWork && !shouldYield) {//不需要中断并且还有单元任务待处理
      nextUnitOfWork = performUnitOfWork(
        nextUnitOfWork
      )
      shouldYield = deadline.timeRemaining() < 1
    }
    //渲染
    if (!nextUnitOfWork && wipRoot) {//没有单元任务就提交渲染
      commitRoot()
    }
    requestIdleCallback(workLoop)
  }
  
  requestIdleCallback(workLoop)
  /**
   * 更新diff树，遍历顺序为（左递归下降到最后一层）当前节点--子--兄弟节点--当前节点父节点的sibling子兄弟节点
   * @param {any} fiber 
   * @returns 
   */
  function performUnitOfWork(fiber) {
    const isFunctionComponent =
      fiber.type instanceof Function
    if (isFunctionComponent) {
      updateFunctionComponent(fiber)
    } else {
      updateHostComponent(fiber)
    }
    if (fiber.child) {
      return fiber.child//左子树
    }
    let nextFiber = fiber
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling//右子树
      }
      nextFiber = nextFiber.parent
    }
  }
  
  let wipFiber = null
  let hookIndex = null
  /**
   * 更新wipFiber， hook索引置0， hooks置空
   * @param {any} fiber 
   */
  function updateFunctionComponent(fiber) {//更新函数组件
    wipFiber = fiber
    hookIndex = 0
    wipFiber.hooks = []
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children)
  }
  
  function useState(initial) {
    const oldHook =
      wipFiber.alternate &&
      wipFiber.alternate.hooks &&
      wipFiber.alternate.hooks[hookIndex]
    const hook = {
      state: oldHook ? oldHook.state : initial,
      queue: [],
    }
  
    const actions = oldHook ? oldHook.queue : []
    actions.forEach(action => {
      hook.state = action(hook.state)
    })//更新state
  
    const setState = action => {//更新操作
      hook.queue.push(action)//推入事件队列
      wipRoot = {
        dom: currentRoot.dom,
        props: currentRoot.props,
        alternate: currentRoot,
      }
      nextUnitOfWork = wipRoot
      deletions = []
    }
  
    wipFiber.hooks.push(hook)
    hookIndex++
    return [hook.state, setState]
  }
  
  function updateHostComponent(fiber) {
    if (!fiber.dom) {
      fiber.dom = createDom(fiber)
    }
    reconcileChildren(fiber, fiber.props.children)
  }
  //
  function reconcileChildren(wipFiber, elements) {
    let index = 0
    let oldFiber =
      wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null
  
    while (
      index < elements.length ||
      oldFiber != null
    ) {
      const element = elements[index]
      let newFiber = null
  
      const sameType =
        oldFiber &&
        element &&
        element.type == oldFiber.type
  
      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: "UPDATE",
        }
      }
      if (element && !sameType) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "PLACEMENT",
        }
      }
      if (oldFiber && !sameType) {
        oldFiber.effectTag = "DELETION"
        deletions.push(oldFiber)
      }
  
      if (oldFiber) {
        oldFiber = oldFiber.sibling
      }
  
      if (index === 0) {
        wipFiber.child = newFiber
      } else if (element) {
        prevSibling.sibling = newFiber
      }
  
      prevSibling = newFiber
      index++
    }
  }
  
  const Didact = {
    createElement,
    render,
    useState,
  }
  export default Didact
  /** @jsx Didact.createElement */
  function Counter() {
    const [state, setState] = Didact.useState(1)
    return (
      <h1 onClick={() => setState(c => c + 1)}>
        Count: {state}
      </h1>
    )
  }
  const element = <Counter />
  const container = document.getElementById("root")
  Didact.render(element, container)