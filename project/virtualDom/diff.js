const diffHelper = {
    Index: 0,
    isTextNode: (eleObj) => {
        return !(eleObj instanceof Element);
    },
    diffAttr: (oldAttr, newAttr) => {
        let patches = {}
        for (let key in oldAttr) {
            if (oldAttr[key] !== newAttr[key]) {
                // 可能产生了更改 或者 新属性为undefined，也就是该属性被删除
                patches[key] = newAttr[key];
            }
        }

        for (let key in newAttr) {
            // 新增属性
            if (!oldAttr.hasOwnProperty(key)) {
                patches[key] = newAttr[key];
            }
        }

        return patches;
    },
    diffChildren: (oldChild, newChild, patches) => {
        if (newChild.length > oldChild.length) {
            // 有新节点产生
            patches[diffHelper.Index] = patches[diffHelper.Index] || [];
            patches[diffHelper.Index].push({
                type: PATCHES_TYPE.ADD,
                nodeList: newChild.slice(oldChild.length)
            });
        }
        oldChild.forEach((children, index) => {
            dfsWalk(children, newChild[index], ++diffHelper.Index, patches);
        });
    },
    dfsChildren: (oldChild) => {
        if (!diffHelper.isTextNode(oldChild)) {
            oldChild.children.forEach(children => {
                ++diffHelper.Index;
                diffHelper.dfsChildren(children);
            });
        }
    }
}

const PATCHES_TYPE = {
    ATTRS: 'ATTRS',
    REPLACE: 'REPLACE',
    TEXT: 'TEXT',
    REMOVE: 'REMOVE',
    ADD: 'ADD'
}

function diff(oldTree, newTree) {
    // 当前节点的标志 每次调用Diff，从0重新计数
    diffHelper.Index = 0;
    let patches = {};

    // 进行深度优先遍历
    dfsWalk(oldTree, newTree, diffHelper.Index, patches);

    // 返回补丁对象
    return patches;
}

function dfsWalk(oldNode, newNode, index, patches) {
    let currentPatches = [];
    if (!newNode) {
        // 如果不存在新节点，发生了移除，产生一个关于 Remove 的 patch 补丁
        currentPatches.push({
            type: PATCHES_TYPE.REMOVE
        });

        // 删除了但依旧要遍历旧树的节点确保 Index 正确
        diffHelper.dfsChildren(oldNode);
    } else if (diffHelper.isTextNode(oldNode) && diffHelper.isTextNode(newNode)) {
        // 都是纯文本节点 如果内容不同，产生一个关于 textContent 的 patch
        if (oldNode !== newNode) {
            currentPatches.push({
                type: PATCHES_TYPE.TEXT,
                text: newNode
            });
        }
    } else if (oldNode.type === newNode.type) {
        // 如果节点类型相同，比较属性差异，如若属性不同，产生一个关于属性的 patch 补丁
        let attrs = diffHelper.diffAttr(oldNode.props, newNode.props);

        // 有attr差异
        if(Object.keys(attrs).length > 0) {
            currentPatches.push({
                type: PATCHES_TYPE.ATTRS,
                attrs: attrs
            });
        }

        // 如果存在孩子节点，处理孩子节点
        diffHelper.diffChildren(oldNode.children, newNode.children, patches);
    } else {
        // 如果节点类型不同，说明发生了替换
        currentPatches.push({
            type: PATCHES_TYPE.REPLACE,
            node: newNode
        });
        // 替换了但依旧要遍历旧树的节点确保 Index 正确
        diffHelper.dfsChildren(oldNode);
    }

    // 如果当前节点存在补丁，则将该补丁信息填入传入的patches对象中
    if(currentPatches.length) {
        patches[index] = patches[index] ? patches[index].concat(currentPatches) : currentPatches;
    }
}