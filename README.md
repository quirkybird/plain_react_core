- 在我们的React中，我们在渲染阶段遍历整个树。相反，React 遵循一些提示和启发法来跳过没有任何变化的整个子树。
- 我们还在提交阶段遍历整个树。React 保留一个仅包含有效果的纤程的链表，并且只访问这些纤程。
- 每次我们构建一个新的正在进行的工作树时，我们都会为每个纤程创建新的对象。React 回收之前树中的纤维。
- 当我们的React中在渲染阶段收到新的更新时，它会丢弃正在进行的工作树并从根重新开始。React 用过期时间戳标记每个更新，并使用它来决定哪个更新具有更高的优先级。


  - Fiber树通过beginWork同时进行创建和"向下"遍历
- 创建过程也是current(旧)、workInProgress（新）两棵树Diffing的过程，决定哪些旧节点需要复用、删除、移动、哪些新节点需要创建
- 只有父节点相互复用，才会触发子节点Diffing，所以跨父节点的移动是Diffing做不到的
- 复用的条件是key和type都相同，所以key可以提升复用率
- 子节点间的Diffing是一个“先做简单题”的过程，假设优先级为：新子节点只有一个 -> 子节点只发生末尾的增删 -> 其他情况
- 对应的，Diffing策略也分为：单节点Diffing -> 一轮循环 -> 二轮循环
- Diffing过程中会把结果（操作）以Effect的形式挂载到节点上

总的来说整个fiber协调过程：

从协调过程出发，讨论 Fiber 树在构建过程中表现出的遍历方式、Diffing 理念、副作用收集方式。

- Fiber 树由链表构成，节点间通过 return（父节点）、child（第一个子节点）、sibling（下一个兄弟节点）相连。
- 当前视图对应的 Fiber 树称为 current 树，每次协调发起，都会构建新的 workInProgress 树，并在结束时替换 current 树。
- Fiber 树的遍历方式是深度优先遍历，向下的过程由 beginWork 发起，向上的过程由 completeUnitOfWork 发起。beginWork 每次只向下一步，completeUnitOfWork 则每次向上若干步（由其内部若干个一步循环达成）。
- Fiber 树是边构建边遍历的，构建在 beginWork 向下过程中发起。
Fiber 树的 Diffing 策略体现在构建过程中：父节点已复用、key 和 type 相同是节点复用的基本条件；子节点 Diffing 从易向难，单节点 Diffing —> 多节点末尾增删（一轮循环） —> 多节点其他情况（二轮循环）。
- Diffing 的结果，诸如节点的删除、新增、移动，称为 effect，以 effectTag 的形式挂在节点上。
- completeUnitOfWork 的内部循环会自底向上收集 effect，不断把有 effectTag 的子节点和自身向上合并到父节点的 effectList 中，直至根节点。effectList 是个链表。
- 宿主相关组件节点会把宿主实例挂到 stateNode 上，间接调用宿主方法对其完成创建、更新，由此也会产生 effectTag。
