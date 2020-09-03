const STATUS = {
  pending: 'pending',
  fulfilled: 'fulfilled',
  rejected: 'rejected',
}

class Promise {
  constructor(excutor) {
    this.status = STATUS.pending;
    this.onFinishCb = [];
    const resolve = (value) => {
      if (value instanceof Promise) {
        return value.then(resolve, reject);
      }
      // When pending, a promise may transition to either the fulfilled or rejected state.
      if (this.status === STATUS.pending) {
        this.status = STATUS.fulfilled;
        this.value = value;
        // f/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then
        this.onFinishCb.forEach(cbObj => cbObj.onFullfilled(this.value));
      }
    };
    const reject = (reason) => {
      // When pending, a promise may transition to either the fulfilled or rejected state.
      if (this.status === STATUS.pending) {
        this.status = STATUS.rejected;
        this.reason = reason;
        // If/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then
        this.onFinishCb.forEach(cbObj => cbObj.onRejected(this.reason));
      }
    };
    try {
      excutor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  let isCalled = false;
  // If promise and x refer to the same object, reject promise with a TypeError as the reason.
  if (promise2 === x) {
    return reject(new TypeError('循环引用'));
    // If x is a promise, adopt its state 走else分支 交给resolve函数处理
    // Otherwise, if x is an object or function
  } else if (typeof x === 'function' || (x && typeof x === 'object')) {
    // If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
    try {
      // Let then be x.then
      let then = x.then;
      // If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise
      if (typeof then === 'function') {
        // If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
        const resolvePromiseFn = function (y) {
          // If both resolvePromise and rejectPromise are called,
          // or multiple calls to the same argument are made,
          // the first call takes precedence,
          // and any further calls are ignored.
          if (isCalled) {
            return;
          }
          isCalled = true;
          resolvePromise(promise2, y, resolve, reject);
        };
        // If/when rejectPromise is called with a reason r, reject promise with r.
        const rejectPromiseFn = function (r) {
          // If both resolvePromise and rejectPromise are called,
          // or multiple calls to the same argument are made,
          // the first call takes precedence,
          // and any further calls are ignored.
          if (isCalled) {
            return;
          }
          isCalled = true;
          reject(r);
        };
        then.call(x, resolvePromiseFn, rejectPromiseFn);
      } else {
        // If then is not a function, fulfill promise with x.
        resolve(x);
      }
    } catch (e) {
      // If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
      // If calling then throws an exception e, If resolvePromise or rejectPromise have been called, ignore it. Otherwise, reject promise with e as the reason.
      if (!isCalled) {
        reject(e);
      }
      isCalled = true;
    }
  } else {
    // If x is not an object or function, fulfill promise with x.
    resolve(x);
  }
}

Promise.prototype.then = function (onFullfilled, onRejected) {
  let promise2;
  let _this = this;
  // If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
  onFullfilled = typeof onFullfilled === 'function' ? onFullfilled : value => value;
  // If onRejected is not a function, promise2 must be rejected with the same reason as promise1.
  onRejected = typeof onRejected === 'function' ? onRejected : reason => {
    throw reason;
  };
  if (this.status === STATUS.fulfilled) {
    // onFullfilled(this.value);
    // onFulfilled and onRejected must be called as functions (i.e. with no this value).
    promise2 = new Promise(function (resolve, reject) {
      // onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
      /**
       * Here “platform code” means engine, environment,
       * and promise implementation code. In practice,
       * this requirement ensures that onFulfilled and onRejected execute asynchronously,
       * after the event loop turn in which then is called, and with a fresh stack.
       * This can be implemented with either a “macro-task” mechanism such as setTimeout or setImmediate,
       * or with a “micro-task” mechanism such as MutationObserver or process.nextTick.
       * Since the promise implementation is considered platform code,
       * it may itself contain a task-scheduling queue or “trampoline” in which the handlers are called.
       */
      setTimeout(function () {
        // If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
        try {
          // If either onFulfilled or onRejected returns a value x,
          const x = onFullfilled(_this.value);
          // run the Promise Resolution Procedure [[Resolve]](promise2, x).
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }, 0);
    });
  } else if (this.status === STATUS.rejected) {
    // onRejected(this.reason);
    // onFulfilled and onRejected must be called as functions (i.e. with no this value).
    promise2 = new Promise(function (resolve, reject) {
      // onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
      setTimeout(function () {
        // If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
        try {
          // promise1 is rejected, promise2 must be rejected with the same reason as promise1.
          // If either onFulfilled or onRejected returns a value x,
          const x = onRejected(_this.reason);
          // run the Promise Resolution Procedure [[Resolve]](promise2, x).
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }, 0);
    });
  } else if (this.status === STATUS.pending) {
    // onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
    // 因此仍在pending时需要封装一个回调
    // this.onFinishCb.push({
    //   onFullfilled,
    //   onRejected,
    // });
    // onFulfilled and onRejected must be called as functions (i.e. with no this value).
    promise2 = new Promise(function (resolve, reject) {
      _this.onFinishCb.push({
        onFullfilled: function (value) {
          // onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
          setTimeout(() => {
            // If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
            try {
              const x = onFullfilled(value);
              // run the Promise Resolution Procedure [[Resolve]](promise2, x).
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        },
        onRejected: function (reason) {
          // onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
          setTimeout(() => {
            // If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
            try {
              const x = onRejected(reason);
              // run the Promise Resolution Procedure [[Resolve]](promise2, x).
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        },
      });
    });
  }
  // then must return a promise. promise2 = promise1.then(onFulfilled, onRejected);
  return promise2;
};

Promise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

Promise.resolve = function (v) {
  if (v instanceof Promise) {
    return v;
  }
  return new Promise(function (resolve) {
    resolve(v);
  });
};

Promise.reject = function (v) {
  return new Promise(function (_, reject) {
    reject(v);
  });
};

Promise.all = function (iterable) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(iterable)) {
      return reject(new TypeError('Promise.all accepts an array'));
    }
    var arrs = [...iterable];
    var results = new Array(arrs.length);
    var handlingCount = arrs.length;
    if (!handlingCount) {
      resolve(results);
    } else {
      function resolvePromise(i, val) {
        if (val && val.then && typeof val.then === 'function') {
          let then = val.then;
          then.call(
            arrs[i],
            function (v) {
              // 如果回来的v仍然是个promise
              resolvePromise(i, v)
            },
            reject,
          )
        } else {
          results[i] = val;
          if (--handlingCount === 0) {
            resolve(results);
          }
        }
      }
      arrs.forEach((arr, i) => {
        resolvePromise(i, arr);
      });
    }
  });
};

Promise.race = function (iterable) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(iterable)) {
      return reject(new TypeError('Promise.all accepts an array'));
    }
    iterable.forEach(eachMember => {
      Promise.resolve(eachMember).then(resolve, reject);
    });
  });
}