function Element(type, config, children) {
    this.type = type;
    this.props = config;
    this.children = children;
}

function setAttr(node, key, value) {
    switch(key) {
        case "value":
            if (node.tagName.toUpperCase === 'INPUT' || node.tagName.toUpperCase === "TEXTAREA") {
                node.value = value;
            } else {
                node.setAttribute(key, value);
            }
            break;
        case "style":
            node.style.cssText = value;
            break;
        default:
            node.setAttribute(key, value);
            break;
    }
}

function createElement(type, config, children) {
    return new Element(type, config, children);
}

function render(eleObj) {
    let el = document.createElement(eleObj.type);

    for (let key in eleObj.props) {
        setAttr(el, key, eleObj.props[key]);
    }

    eleObj.children.forEach(child => {
        if (child instanceof Element) {
            child = render(child);
        } else {
            child = document.createTextNode(child);
        }
        el.appendChild(child);
    });

    return el;
}