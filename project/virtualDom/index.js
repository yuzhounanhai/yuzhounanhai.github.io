let virtualDom1 = createElement("ul", { class: "lists" }, [
    createElement("li", {}, ["1"]),
    createElement("li", { class: "item" }, ["2"]),
    createElement("li", { style: "color: red;" }, ["3"])
]);

console.log(virtualDom1);

let dom = render(virtualDom1);

console.log(dom);

document.body.appendChild(dom);

let virtualDom2 = createElement("ul", {}, [
    createElement("div", {}, ["1"]),
    createElement("li", { class: "item" }, ["这里变了"]),
    createElement("li", { style: "color: blue;" }, [
        createElement("li", {}, ["3-1"]),
    ]),
    createElement("li", {}, ["1"]),
]);

let patches = diff(virtualDom1, virtualDom2);

console.log(patches);

patch(dom, patches);