var compileUtils = {
    _getVmValue: function (vm, exp) {
        var value = vm;
        var exps = exp.split('.');
        exps.forEach(function (key) {
            key = key.trim();
            value = value[key];
        });
        return value;
    },
    eventCompile: function ($node, vm, dir, exp) {
        var eventType = dir.split(":")[1];
        // 消除首尾空格
        exp = exp.trim();
        var fn = vm._options.methods && vm._options.methods[exp];
        if (eventType && fn) {
            $node.addEventListener(eventType, fn.bind(vm), false);
        }
    },
    text: function ($node, vm, dir, exp) {
        var updateFn = updater.textUpdater;
        var value = this._getVmValue(vm, exp);
        updateFn($node, value);
        this.bindWatch($node, vm, exp, updateFn);
    },
    html: function ($node, vm, dir, exp) {
        var updateFn = updater.htmlUpdater;
        var value = this._getVmValue(vm, exp);
        updateFn($node, value);
        this.bindWatch($node, vm, exp, updateFn);
    },
    bind: function ($node, vm, dir, exp) {
        var updateFn = updater.attrUpdater;
        var attrName = dir.split(":")[1];
        var value = this._getVmValue(vm, exp);
        updateFn($node, attrName, value);
        this.bindAttrWatch($node, vm, exp, attrName, updateFn);
    },
    model: function ($node, vm, dir, exp) {
        var updateFn = updater.modelUpdater;
        var value = this._getVmValue(vm, exp);
        updateFn($node, value);
        this.bindWatch($node, vm, exp, updateFn);
        $node.addEventListener('input', function (e) {
            var newValue = e.target.value;
            if (value !== newValue) {
                vm[exp] = newValue;
            }
        }, false);
    },
    bindWatch: function ($node, vm, exp, cb) {
        new Watcher(vm, exp, function (value) {
            cb && cb($node, value);
        });
    },
    bindAttrWatch: function ($node, vm, exp, attrName, cb) {
        new Watcher(vm, exp, function (value) {
            cb && cb($node, attrName, value);
        });
    }
}

var updater = {
    htmlUpdater: function (node, value) {
        node.innerHTML = typeof value === 'undefined' ? '' : value;
    },
    textUpdater: function (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value;
    },
    attrUpdater: function (node, attrName, value) {
        if (typeof attrName === 'undefined') {
            return;
        }
        if (typeof value === 'undefined') {
            value = '';
        }
        node.setAttribute(attrName, value);
    },
    modelUpdater: function (node, value) {
        node.value = typeof value === 'undefined' ? '' : value;
    }
}