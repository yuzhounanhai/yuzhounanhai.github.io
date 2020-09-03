const patchHelper = {
    Index: 0
}

function patch(node, patches) {
    dfsPatch(node, patches);
}

function dfsPatch(node, patches) {
    let currentPatch = patches[patchHelper.Index++];
    node.childNodes.forEach(child => {
        dfsPatch(child, patches);
    });
    if (currentPatch) {
        doPatch(node, currentPatch);
    }
}

function doPatch(node, patches) {
    patches.forEach(patch => {
        switch (patch.type) {
            case PATCHES_TYPE.ATTRS:
                for (let key in patch.attrs) {
                    if (patch.attrs[key] !== undefined) {
                        setAttr(node, key, patch.attrs[key]);
                    } else {
                        node.removeAttribute(key);
                    }
                }
                break;
            case PATCHES_TYPE.TEXT:
                node.textContent = patch.text;
                break;
            case PATCHES_TYPE.REPLACE:
                let newNode = patch.node instanceof Element ? render(patch.node) : document.createTextNode(patch.node);
                node.parentNode.replaceChild(newNode, node);
                break;
            case PATCHES_TYPE.REMOVE:
                node.parentNode.removeChild(node);
                break;
            case PATCHES_TYPE.ADD:
                patch.nodeList.forEach(newNode => {
                    let n = newNode instanceof Element ? render(newNode) : document.createTextNode(newNode);
                    node.appendChild(n);
                });
                break;
            default:
                break;
        }
    })
}