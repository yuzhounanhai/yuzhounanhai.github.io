// Watcher订阅者作为Observer和Compile之间通信的桥梁，主要做的事情是:
// 1、在自身实例化时往属性订阅器(dep)里面添加自己
// 2、dep.notify()通知时，能调用自身的update()方法。
function Watcher (vm, exp, cb) {
    this._vm = vm;
    this._exp = exp.trim();
    this._cb = cb;
    // 通过读数据，添加到dep中去
    this.value = this.get();
}

Watcher.prototype = {
    update: function () {
        var value = this._vm[this._exp];
        if (value !== this.value) {
            this.value = value;
            this._cb.call(this._vm, value);
        }
    },
    get: function () {
        Dep.target = this;
        var value = this._vm[this._exp];
        Dep.target = null;
        return value;
    }
}