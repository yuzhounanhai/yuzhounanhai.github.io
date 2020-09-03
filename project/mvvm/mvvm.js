function MVVM (options) {
    this._options = options || {};
    var data = this._data = this._options.data || {};
    var self = this;
    Object.keys(data).forEach(function (key) {
        self._proxyData(key);
    });
    observe(data);
    this._compile = new Compile(this._options.el || document.body, this);
}

MVVM.prototype = {
    _proxyData: function (key) {
        var self = this;
        Object.defineProperty(self, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return self._data[key];
            },
            set: function proxySetter(newValue) {
                self._data[key] = newValue;
            }
        })
    }
}