function observe (data) {
    if (!data || typeof data !== 'object') {
        return;
    }
    Object.keys(data).forEach(key => {
        observeProperty(data, key, data[key])
    })
}

function observeProperty(data, key, val) {
    var dep = new Dep();
    // 监听子属性
    observe(val);
    Object.defineProperty(data, key, {
        // 可枚举
        enumerable: true,
        // 不能再define
        configurable: false,
        get: function () {
            if (Dep.target) {
                dep.addSub(Dep.target);
            }
            return val;
        },
        set: function (newVal) {
            if (newVal === val || (newVal !== newVal && val !== val)) {
                return
            }
            val = newVal;
            dep.notify();
        }
    });
}