/**
 * Step I: The createElement Function
  Step II: The render Function
  Step III: Concurrent Mode(并发模式)
  Step IV: Fibers（fiber架构）
  Step V: Render and Commit Phases（重新渲染和提交）
  Step VI: Reconciliation（调和）
  Step VII: Function Components
  Step VIII: Hooks
 */
const element_1 = <h1 title="foo"></h1>; //创建一个React Element，本质是调用createElement
const container = document.getElementById("root"); //获得一个容器来挂载整个React程序
ReactDOM.render(element, container); //渲染

// 以上是最简单的启动一个React程序，在传统的React项目中，通常在根目录index.js,index.ts中配置

// 在JSX或者TSX文件中可以写标签，也就是React Element，通常是借助Babel来完成转换，调用createElement函数
const element_2 = React.createElement("h1", { title: "foo" }, "hello");
// 最终结果
const element_3 = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
};

// ReactDOM.render就是把React Element转为真正的DOM节点
const node = document.createElement(element_3.type);
node["title"] = element_3.props.title;

// 接下来是子节点 “Hello”
const text = document.createTextNode("");
text["nodeValue"] = element_3.props.children;

// 接下来将他们挂载到容器上(就完成了简单的React代码 -> JS代码)
container.appendChild(node);
node.appendChild(text);

// 接下来依次体验整个构建过程
// 1.createElement函数（他有三个参数，type、props、children）

// 它看起来是这样的
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
}

// 来创建一下
const element_4 = createElement(
  "div",
  { id: "foo" },
  React.createElement("a", null, "bar"),
  React.createElement("b")
);

// 最终将会转换为React Element对象
// {
//   type: "div",
//   props: {
//     id: "foo",
//     children: [
//       {
//         type: "a",
//         props: {
//           chilren: {
//             type: "bar",
//           },
//         },
//       },
//       {
//         type: "b",
//       },
//     ],
//   },
// };

// 对于元素里面的文字，react是单独做了文字Element
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 所以children数组里面的需要筛选,方便后面去构建实际DOM时，使用文字渲染
children: children.map((child) =>
  typeof children === "object" ? child : createTextElement(child)
);

// 2.render函数
function render(element, container) {
  // 真实dom渲染
  const dom =
    element.type !== "TEXT_ELEMENT"
      ? document.createElement(element.type)
      : document.createTextNode("");
  // 为dom添加属性
  Object.keys(element.props)
    .filter((key) => key !== "children")
    .forEach((key) => (dom[key] = element.props[key]));
  // 递归添加子元素（此时出现的问题是，如果React Element树超级庞大，这将花费大量的时间，而且存在性能问题）
  element.props.children.forEach((child) => render(child, dom));
  container.appendChild(dom);
}

// 3.并发模式
// 现在出现的问题是，如果DOM树足够大，会阻塞线程很长的时间，如果浏览器需要执行高优先级的操作，
// 例如处理用户输入或保持动画流畅，则必须等到渲染完成，我们需要把工作分为小的单元，随时可以停止

// let nextUnitOfWork = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // requestIdleCallback浏览器API
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(nextUnitOfWork) {
  //todo
}

// 现在我们将改变之前的render函数，在一开始我们创建fiber，并将其设置为nextUnitOfWork,performUnitWork做三件事
/**
 * 1. 将元素添加到真实DOM中
 * 2. 为元素的子元素创建fiber
 * 3. 选择下一个工作单元
 */

/**
 * fiber树的数据结构是:
 * 从挂载react程序那个节点开始（root），指向孩子节点，孩子指向父节点、指向兄弟节点，兄弟节点也指向同兄弟的父节点
 * fiber树把每个节点（fiber）当作一个工作单元，也就是每一个React Element,有如下规则：
 * 从根root节点开始，首先把它的child作为下一个工作单元要完成的任务，依次往下，首先走完一个最深的第一个节点fiber树
 * 再从fiber最深的那个子节点，把他兄弟节点设置为下一个工作单元，直到没有下一个兄弟节点和孩子节点
 * 这时候又往上，找到这个节点的'uncle',再往下设置'uncle'的兄弟节点为下一个工作单元
 * 重复上面的内容，直到回到root节点，代表本次渲染结束
 *
 */

// 接下来重写render(code time)
// 不能采取刚刚那种递归遍历来构建DOM树

// 添加真实的dom节点
function createDom(fiber) {}

function commitRoot() {
  commitWork(wipRoot.child);
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
  // 每个工作单元都进行添加真实dom会导致如果浏览器在完成其它任务中断了工作单元，就没有完整的UI了
  // if(fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }

  // 渲染到整个dom
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  // create new fiber
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  // 为每一个孩子创建fiber
  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    // 将他们添加到fiber中
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

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
