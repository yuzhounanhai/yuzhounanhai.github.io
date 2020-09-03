// Dep 充当属性订阅器(事件处理中心)
// Dep 中存储着订阅者(Watcher的实例)，所以会拥有一个添加订阅者的方法
// 当有数据发生变化（即劫持到数据变化）时去通知订阅者数据发生了变化

function Dep () {
    this.subs = [];
}

Dep.target = null;

Dep.prototype.addSub = function addSub (sub) {
    this.subs.push(sub);
}

Dep.prototype.notify = function notify () {
    this.subs.forEach(function (sub) {
        sub.update();
    })
}