// 下面是Reconciliation(调和阶段，意味着我们代码必须重新写，来满足更新和删除)
// 添加真实的dom节点
function createDom(fiber) {}

function commitRoot() {
  commitWork(wipRoot.child);
  currentRoot = wipRoot; //记录当前的fiber树
  wipRoot = null;
}

// 提交每一次任务,渲染真实DOM
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container) {
  //正在工作的根
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot, //记录更新之前的fiber树
  };

  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;

function performUnitOfWork(fiber) {
  //做三个事情
  // 1.add dom node
  // 2.create new fiber
  // return next unit of work

  // create dom node
  // fiber初始化一个dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.chidren;
  reconcileChildren(fiber, elements);
  // 渲染到整个dom
  // if(!nextUnitOfWork && wipRoot) {
  //   commitRoot()
  // }

  // reutrn next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

// 调和
function reconcileChildren(wipFiber, elements) {
  // create new fiber
  const elements = fiber.props.children;
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  // 创建新的element
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;
  }

  // 为每一个孩子创建fiber
  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      // parent: fiber,
      dom: null,
    };

    // 将他们添加到fiber中
    if (index === 0) {
      // fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
